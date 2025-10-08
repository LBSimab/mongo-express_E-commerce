const express = require("express");
const authMiddleWare = require("../middleware/auth");
const Product = require("../models/products");
const Cart = require("../models/cart");
const router = express.Router();
router.post("/:productId", authMiddleWare, async (req, res) => {
  const { quantity } = req.body;
  const productId = req.params.productId;
  const userId = req.user._id;
  if (!productId || !quantity) {
    return res.status(400).json({ message: "missing required fields" });
  }
  //check if the product exist

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "product not found" });
  }
  //chec for stocks in product
  if (product.stock < quantity) {
    return res.status(400).json({ message: "stock is not enough" });
  }

  //find the cart if exist if it doesnt we create the cart;
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({
      user: userId,
      products: [],
      totalproducts: 0,
      totaCartPrice: 0,
    });
  }
  //check if product is already exist in cart so we dodge duplication
  const existingProductIndex = cart.products.findIndex(
    (product) => product.productId.toString() === productId.toString()
  );
  //if it doesnt it brings back -1 so we check if its -1which mean it exist
  //then we check for quantity so we make sure we have enough in stock
  if (existingProductIndex !== -1) {
    if (
      cart.products[existingProductIndex].quantity + quantity >=
      product.stock
    ) {
      return res.status(400).json({ message: "stock is not enough" });
    }
    //if we do have stock we sum the quantities
    cart.products[existingProductIndex].quantity += quantity;
  }

  //well since we have not the product in the cart we simply just add it
  else {
    cart.products.push({
      productId: productId,
      quantity: quantity,
      title: product.title,
      price: product.price,
      image: product.images[0],
    });
  }
  //suming up the total products
  cart.totalproducts = cart.products.reduce((total, product) => {
    return total + product.quantity;
  }, 0);
  //suming up total cart price
  cart.totalCartPrice = cart.products.reduce((total, product) => {
    return total + product.price * product.quantity;
  }, 0);
  //saving the cart in database if everything went smoothly and return it to the front
  await cart.save();
  res.status(200).json({ message: "cart created successfully", cart });
});

module.exports = router;
