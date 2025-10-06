const express = require("express");
const authMiddleWare = require("../middleware/auth");
const multer = require("multer");
const router = express.Router();
const fs = require("fs/promises");
const path = require("path  ");
const checkRole = require("../middleware/checkRole");
const Product = require("../models/products");
const Category = require("../models/category");
const fileFilter = (req, file, cb) => {
  const allowedTypes = [`image/jpeg`, `image/png`, `image/gif`];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("inavlid file type. Only JPEG,PNG,GIF are allowed!"), false);
  }
};

//suggestion api for getting products only by title and id

//also we have to put this suggestion api above /:id api because if we dont
//the system will not concider suggestion api and goes to /:id and think the "suggestion"in the api is a id string
router.get("/suggestions", async (req, res) => {
  const search = req.query.search;
  const products = Product.find({ title: { $regex: search, $options: "i" } })
    .select("_id title")
    .limit(10);

  if (!products) {
    res.status(404).json({ message: "product not found!" });
  }
  res.status(200).json(products);
});
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
//create products
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
//get all products
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perpage = parseInt(req.query.perpage) || 8;
  const querycategory = req.query.category || null;
  const querysearch = req.query.search || null;
  let query = {};
  if (querycategory) {
    const category = await Category.findOne({ name: querycategory });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    query.category = category._id;
  }
  if (querysearch) {
    query.title = { $regex: querysearch, $options: "i" };
  }

  const products = await Product.find(query)
    .select("-description -seller -category -__v")
    .skip((page - 1) * perpage)
    .limit(perpage)
    .lean();

  //we dont have reviews yet because of incompleted project so....
  //we're going to add the logic of average rating here but its going to be 0 all the time
  const updatedProducts = products.map((product) => {
    const numberofReviews = product.review.length;
    const sumOfRatings = product.review.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const averageRating = sumOfRatings / (numberofReviews || 1);
    return {
      ...product,
      images: product.images[0],
      review: { numberofReviews, averageRating },
    };
  });

  const totalproducts = await Product.countDocuments(query);
  const totalpage = Math.ceil(totalproducts / perpage);

  res.json({
    products: updatedProducts,
    totalproducts,
    totalpage,
    currentpage: page,
    postperpage: perpage,
  });
});
//get products  by id
router.get("/:id", async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId)
    .populate("seller", "_id name email")
    .populate("review.user", "_id name email")
    .select("-category -__v");

  if (!product) {
    return res.status(404).json({ message: "product not found!!" });
  }

  res.json(product);
});

//delete products
router.delete("/:id", authMiddleWare, async (req, res) => {
  const productId = req.params.id;
  const product = Product.findById(productId).select("seller");
  if (!product) {
    res.status(404).json({ message: "product not found!" });
  }
  if (
    req.user.role === "admin" ||
    req.user._id.toString() === product.seller.toString()
  ) {
    await product.deleteOne();
    if (product.images && product.images.length > 0) {
      product.images.forEach(async (imagename) => {
        const fullpath = path.join(__dirname, "../upload/products", imagename);
        try {
          await fs.unlink(fullpath);
        } catch (error) {
          console.error(`error deleting file:${fullpath}`, error);
        }
      });
    }
    return res
      .status(200)
      .json({ message: "product deleted succesful", product: product });
  }

  return res.status(403).json({
    message: "access denied | you must be admin or the product seller",
  });
});
module.exports = router;
