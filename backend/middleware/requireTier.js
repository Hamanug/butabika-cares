const requireTier = (allowedTiers) => {
  return (req, res, next) => {
    if (req.user && allowedTiers.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ error: 'Access denied.' });
    }
  };
};

module.exports = requireTier;
