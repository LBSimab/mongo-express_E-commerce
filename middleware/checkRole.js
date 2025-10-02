const checkRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ message: `access denied: ${role} only!` });
  }
  next();
};

module.exports = checkRole;
