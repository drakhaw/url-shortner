const express = require('express');
const passport = require('../config/passport');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
  async (req, res) => {
    try {
      if (!req.user) {
        console.error('No user found in OAuth callback');
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user_found`);
      }

      // Check if user is active
      if (!req.user.isActive) {
        console.error('User account is inactive:', req.user.email);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=account_inactive`);
      }

      // Generate JWT for the user
      const token = generateToken({
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role
      });

      // Update last login
      const prisma = req.app.get('prisma');
      await prisma.user.update({
        where: { id: req.user.id },
        data: { lastLoginAt: new Date() }
      });

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
    }
  }
);

// Legacy login for super admin (will be removed later)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const prisma = req.app.get('prisma');

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user - only allow super admin to use legacy login
    const user = await prisma.user.findUnique({
      where: { 
        email: email.toLowerCase(),
        role: 'SUPER_ADMIN'
      }
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials or account requires Google login' });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mustUpdate: user.mustUpdate
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  const prisma = req.app.get('prisma');

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        mustUpdate: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes for user management
router.post('/invite-user', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req, res) => {
  const { email, role = 'USER' } = req.body;
  const prisma = req.app.get('prisma');

  try {
    // Validate input
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Only super admin can create other admins
    if (role === 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only super admin can create admin users' });
    }

    // Create invited user
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        role: role,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    res.json({
      message: 'User invited successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List users (admin only)
router.get('/users', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req, res) => {
  const prisma = req.app.get('prisma');
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: { shortUrls: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count();

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle user active status
router.patch('/users/:id/toggle-active', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req, res) => {
  const { id } = req.params;
  const prisma = req.app.get('prisma');

  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deactivating yourself
    if (user.id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    // Only super admin can deactivate other admins
    if (user.role !== 'USER' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only super admin can manage admin accounts' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    res.json({
      message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Toggle user active error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req, res) => {
  const { id } = req.params;
  const prisma = req.app.get('prisma');

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        shortUrls: {
          select: { id: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting yourself
    if (user.id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Only super admin can delete other admins
    if (user.role !== 'USER' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only super admin can delete admin accounts' });
    }

    // Check if user has created URLs
    if (user.shortUrls.length > 0) {
      return res.status(400).json({ 
        error: `Cannot delete user who has created ${user.shortUrls.length} URL(s). Please transfer or delete their URLs first.`,
        hasUrls: true,
        urlCount: user.shortUrls.length
      });
    }

    // Delete the user
    await prisma.user.delete({
      where: { id }
    });

    res.json({
      message: 'User deleted successfully',
      deletedUser: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;