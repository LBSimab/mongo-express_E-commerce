const checkSeller = (req, res, next) => {
  if (!req.user || req.user.role !== "seller") {
    return res.status(403).json({ message: "access denied: sellers only" });
  }
  next();
};

module.exports = checkSeller;
