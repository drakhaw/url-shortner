const express = require('express');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const prisma = req.app.get('prisma');

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        mustUpdate: user.mustUpdate
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /auth/change-password
 * Change password for users who must update
 */
router.post('/change-password', authenticateToken, async (req, res) => {
  const { newEmail, newPassword } = req.body;
  const prisma = req.app.get('prisma');

  try {
    // Validate input
    if (!newEmail || !newPassword) {
      return res.status(400).json({ error: 'New email and password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail.toLowerCase() }
    });

    if (existingUser && existingUser.id !== req.user.userId) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        email: newEmail.toLowerCase(),
        password: hashedPassword,
        mustUpdate: false
      },
      select: {
        id: true,
        email: true,
        mustUpdate: true
      }
    });

    // Generate new token with updated email
    const token = generateToken({
      userId: updatedUser.id,
      email: updatedUser.email
    });

    res.json({
      message: 'Password updated successfully',
      token,
      user: updatedUser
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /auth/me
 * Get current user information
 */
router.get('/me', authenticateToken, async (req, res) => {
  const prisma = req.app.get('prisma');

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        mustUpdate: true,
        createdAt: true
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

module.exports = router;