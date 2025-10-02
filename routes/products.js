const express = require("express");
const authMiddleWare = require("../middleware/auth");
const multer = require("multer");
const router = express.Router();
const checkRole = require("../middleware/checkRole");
const Product = require("../models/products");
const fileFilter = (req, file, cb) => {
  const allowedTypes = [`image/jpeg`, `image/png`, `image/gif`];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("inavlid file type. Only JPEG,PNG,GIF are allowed!"), false);
  }
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/products/");
  },
  filename: (req, file, cb) => {
    const timestamps = Date.now();
    const originalName = file.originalname
      .replace(/\s+/g, `-`)
      .replace(/[^a-zA-Z0-9.-]/g, "");
    cb(null, `${timestamps}-${originalName}`);
  },
});
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

router.post(
  "/",
  authMiddleWare,
  checkRole("seller"),
  upload.array("images", 8),
  async (req, res) => {
    const { title, description, category, price, stock } = req.body;
    const images = req.files.map((image) => image.filename);
    if (images.length === 0) {
      return res.status(400).json({ message: "at least 1 image is required" });
    }

    const newProduct = new Product({
      title,
      description,
      category,
      price,
      stock,
      images,
      seller: req.user._id,
    });
    await newProduct.save();

    res.status(201).json(newProduct);
  }
);
module.exports = router;
