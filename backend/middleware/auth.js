const { verifyToken } = require('../utils/jwt');

/**
 * Authentication middleware to verify JWT tokens
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware to check if user must update their password
 */
async function checkMustUpdate(req, res, next) {
  const prisma = req.app.get('prisma');
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { mustUpdate: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.mustUpdate && req.path !== '/change-password') {
      return res.status(403).json({ 
        error: 'Password update required',
        mustUpdate: true
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  authenticateToken,
  checkMustUpdate
};