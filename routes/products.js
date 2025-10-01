const express = require("express");
const authMiddleWare = require("../middleware/auth");
const checkSeller = require("../middleware/checkseller");
const router = express.Router();

router.post("/", authMiddleWare, checkSeller, async (req, res) => {
  res.send("seller is here");
});
module.exports = router;
