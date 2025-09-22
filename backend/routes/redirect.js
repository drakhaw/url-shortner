const express = require('express');
const { hashIP } = require('../utils/slug');

const router = express.Router();

/**
 * GET /:slug
 * Redirect to original destination and log click
 */
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  const prisma = req.app.get('prisma');

  try {
    // Find the short URL
    const shortUrl = await prisma.shortUrl.findUnique({
      where: { slug },
      select: {
        id: true,
        destination: true
      }
    });

    if (!shortUrl) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Get client IP
    const clientIP = req.ip || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress ||
                    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                    req.headers['x-forwarded-for']?.split(',')[0] ||
                    'unknown';

    // Get referrer
    const referrer = req.get('referer') || null;

    // Log the click (async, don't wait for it)
    prisma.click.create({
      data: {
        shortUrlId: shortUrl.id,
        ipHash: hashIP(clientIP),
        referrer: referrer
      }
    }).catch(error => {
      console.error('Error logging click:', error);
    });

    // Redirect to destination
    res.redirect(302, shortUrl.destination);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;