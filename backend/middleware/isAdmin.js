/**
 * Middleware to enforce administrator-level access.
 * Must be chained AFTER authenticateToken so that req.user is populated.
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
};

module.exports = isAdmin;
