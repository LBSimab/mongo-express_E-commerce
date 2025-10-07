const express = require("express");
const authMiddleWare = require("../middleware/auth");
const router = express.Router();
router.post("/:productId", authMiddleWare, (req, res) => {});
module.exports = router;
