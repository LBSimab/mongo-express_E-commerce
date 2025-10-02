const express = require("express");
const router = express.Router();
const Category = require("../models/category");
const multer = require("multer");
const checkRole = require("../middleware/checkRole");

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
    cb(null, "upload/category/");
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
  checkRole("admin"),
  upload.single("icon"),
  async (req, res) => {
    if (!req.file || !req.body.name) {
      return res.status(400).json({ message: "name and icon is required!" });
    }
    console.log(req.file);
    const newCategory = new Category({
      name: req.body.name,
      image: req.file.filename,
    });

    await newCategory.save();

    res.status(201).json({
      message: "Category succesfully added!",
      category: newCategory,
    });
  }
);

router.get("/", async (req, res) => {
  const categories = await Category.find().sort("name");
  res.json(categories);
});
module.exports = router;
