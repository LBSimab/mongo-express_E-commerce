const express = require("express");
const router = express.Router();

const authMiddleWare = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
};
