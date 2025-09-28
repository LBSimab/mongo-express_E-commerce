const express = require("express");
const router = express.Router();
const Category = require("../models/category");
const multer = require("multer");

const upload = multer({
  dest: "upload/category/",
});

router.post("/", upload.single("icon"), async (req, res) => {
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
});
module.exports = router;
