const jwt = require("jsonwebtoken");

const authMiddleWare = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "bearer token required" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decodeduser = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodeduser;
    next();
  } catch (error) {
    return res.status(400).json({ message: "invalid token" });
  }
};

module.exports = authMiddleWare;
