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


// Role-based access control middleware
const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    const prisma = req.app.get('prisma');
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, role: true, isActive: true }
      });

      if (!user || !user.isActive) {
        return res.status(403).json({ error: 'Account is inactive' });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.user.role = user.role;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

module.exports = {
  authenticateToken,
  requireRole
};
