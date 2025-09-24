const express = require('express');
const { authenticateToken, checkMustUpdate } = require('../middleware/auth');
const { generateSlug, isValidSlug } = require('../utils/slug');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateToken);
router.use(checkMustUpdate);

/**
 * POST /urls
 * Create a new short URL
 */
router.post('/', async (req, res) => {
  const { destination, customSlug } = req.body;
  const prisma = req.app.get('prisma');

  try {
    // Validate input
    if (!destination) {
      return res.status(400).json({ error: 'Destination URL is required' });
    }

    // Validate URL format
    try {
      new URL(destination);
    } catch {
      return res.status(400).json({ error: 'Invalid destination URL format' });
    }

    let slug;

    if (customSlug) {
      // Validate custom slug
      if (!isValidSlug(customSlug)) {
        return res.status(400).json({ 
          error: 'Invalid slug. Use only letters, numbers, hyphens, and underscores (3-50 characters)' 
        });
      }

      // Check if custom slug is available
      const existingUrl = await prisma.shortUrl.findUnique({
        where: { slug: customSlug }
      });

      if (existingUrl) {
        return res.status(409).json({ error: 'Slug already exists' });
      }

      slug = customSlug;
    } else {
      // Generate unique slug
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        slug = generateSlug(6);
        
        const existingUrl = await prisma.shortUrl.findUnique({
          where: { slug }
        });

        if (!existingUrl) {
          break;
        }

        attempts++;
      }

      if (attempts === maxAttempts) {
        return res.status(500).json({ error: 'Failed to generate unique slug' });
      }
    }

    // Create short URL
    const shortUrl = await prisma.shortUrl.create({
      data: {
        slug,
        destination,
        createdBy: req.user.userId
      },
      include: {
        _count: {
          select: { clicks: true }
        }
      }
    });

    // Fetch the created URL with creator information
    const urlWithCreator = await prisma.shortUrl.findUnique({
      where: { id: shortUrl.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true
          }
        },
        _count: {
          select: { clicks: true }
        }
      }
    });

    res.status(201).json({
      id: urlWithCreator.id,
      slug: urlWithCreator.slug,
      destination: urlWithCreator.destination,
      createdAt: urlWithCreator.createdAt,
      clickCount: urlWithCreator._count.clicks,
      shortUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/${urlWithCreator.slug}`,
      creator: {
        id: urlWithCreator.user.id,
        email: urlWithCreator.user.email,
        name: urlWithCreator.user.name,
        avatar: urlWithCreator.user.avatar
      }
    });
  } catch (error) {
    console.error('Create URL error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /urls
 * List all URLs with summary analytics
 */
router.get('/', async (req, res) => {
  const prisma = req.app.get('prisma');
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';

  try {
    // Build search conditions
    const whereConditions = search.trim() ? {
      OR: [
        {
          slug: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          destination: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    } : {};

    const [urls, totalCount] = await Promise.all([
      prisma.shortUrl.findMany({
        where: whereConditions,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true
            }
          },
          _count: {
            select: { clicks: true }
          },
          clicks: {
            orderBy: { clickedAt: 'desc' },
            take: 1,
            select: { clickedAt: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.shortUrl.count({
        where: whereConditions
      })
    ]);

    const formattedUrls = urls.map(url => ({
      id: url.id,
      slug: url.slug,
      destination: url.destination,
      createdAt: url.createdAt,
      clickCount: url._count.clicks,
      lastClickAt: url.clicks[0]?.clickedAt || null,
      shortUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/${url.slug}`,
      creator: {
        id: url.user.id,
        email: url.user.email,
        name: url.user.name,
        avatar: url.user.avatar
      }
    }));

    res.json({
      urls: formattedUrls,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('List URLs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /urls/:id
 * Get detailed URL analytics
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const prisma = req.app.get('prisma');

  try {
    const url = await prisma.shortUrl.findUnique({
      where: {
        id
      },
      include: {
        _count: {
          select: { clicks: true }
        },
        clicks: {
          orderBy: { clickedAt: 'desc' },
          take: 100 // Last 100 clicks
        }
      }
    });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Analytics calculations
    const clicksByDay = {};
    const referrerCounts = {};

    url.clicks.forEach(click => {
      // Group by day
      const day = click.clickedAt.toISOString().split('T')[0];
      clicksByDay[day] = (clicksByDay[day] || 0) + 1;

      // Count referrers
      const referrer = click.referrer || 'Direct';
      referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
    });

    // Convert to arrays for charting
    const dailyClicks = Object.entries(clicksByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const topReferrers = Object.entries(referrerCounts)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      id: url.id,
      slug: url.slug,
      destination: url.destination,
      createdAt: url.createdAt,
      shortUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/${url.slug}`,
      analytics: {
        totalClicks: url._count.clicks,
        dailyClicks,
        topReferrers,
        recentClicks: url.clicks.slice(0, 20).map(click => ({
          clickedAt: click.clickedAt,
          referrer: click.referrer || 'Direct'
        }))
      }
    });
  } catch (error) {
    console.error('Get URL analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /urls/:id
 * Update URL destination
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { destination } = req.body;
  const prisma = req.app.get('prisma');

  try {
    // Validate input
    if (!destination) {
      return res.status(400).json({ error: 'Destination URL is required' });
    }

    // Validate URL format
    try {
      new URL(destination);
    } catch {
      return res.status(400).json({ error: 'Invalid destination URL format' });
    }

    // Check if URL exists and if user has permission to edit it
    const url = await prisma.shortUrl.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Allow creator or admin roles to edit
    const canEdit = url.createdBy === req.user.userId || 
                   ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role);
    
    if (!canEdit) {
      return res.status(403).json({ error: 'Permission denied. You can only edit URLs you created.' });
    }

    // Update URL
    const updatedUrl = await prisma.shortUrl.update({
      where: { id },
      data: { destination }
    });

    // Return the updated URL with analytics
    const urlWithCount = await prisma.shortUrl.findUnique({
      where: { id },
      include: {
        _count: {
          select: { clicks: true }
        }
      }
    });

    res.json({
      id: urlWithCount.id,
      slug: urlWithCount.slug,
      destination: urlWithCount.destination,
      createdAt: urlWithCount.createdAt,
      clickCount: urlWithCount._count.clicks,
      shortUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/${urlWithCount.slug}`
    });
  } catch (error) {
    console.error('Update URL error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /urls/:id
 * Delete a short URL
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const prisma = req.app.get('prisma');

  try {
    // Check if URL exists and if user has permission to delete it
    const url = await prisma.shortUrl.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Allow creator or admin roles to delete
    const canDelete = url.createdBy === req.user.userId || 
                     ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role);
    
    if (!canDelete) {
      return res.status(403).json({ error: 'Permission denied. You can only delete URLs you created.' });
    }

    await prisma.shortUrl.delete({
      where: { id }
    });

    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Delete URL error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;