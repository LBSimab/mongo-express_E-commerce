const express = require("express");
const authMiddleWare = require("../middleware/auth");
const Product = require("../models/products");
const Cart = require("../models/cart");
const router = express.Router();
//adding products to the user cart
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

//my cart by the user
router.get("/myCart", authMiddleWare, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: "user has no cart" });
  }
  res.status(200).json(cart);
});
//incrrease the products in cart
router.patch("/increase/:productId", authMiddleWare, async (req, res) => {
  const productId = req.params.productId;

  const product = await Product.findById(productId);
  //find the current user cart

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: "cart not found" });
  }
  //find the product in cart's products array
  const index = cart.products.findIndex(
    (product) => product.productId.toString() === productId
  );
  if (index === -1) {
    return res.status(404).json({ message: "product not found in the cart" });
  }

  if (cart.products[index].quantity === product.stock) {
    return res.status(400).json({
      message: "product ran out of stock , can't increase it anymore",
    });
  }
  //increase the product quantity
  cart.products[index].quantity += 1;
  //update totalproducts and totalcartPrice
  cart.totalproducts += 1;
  cart.totalCartPrice += product.price;
  //save the updated cart

  await cart.save();
  res.json({ message: "product succesfully increased ", cart: cart });
});
//decrease the products in cart
router.patch("/decrease/:productId", authMiddleWare, async (req, res) => {
  const productId = req.params.productId;

  const product = await Product.findById(productId);
  //find the current user cart

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: "cart not found" });
  }
  //find the product in cart's products array
  const index = cart.products.findIndex(
    (product) => product.productId.toString() === productId
  );
  if (index === -1) {
    return res.status(404).json({ message: "product not found in the cart" });
  }

  //check for quantity 1 condition
  if (cart.products[index].quantity > 1) {
    //decrease the product quantity
    cart.products[index].quantity -= 1;
  } else {
    cart.products.splice(index, 1);
  }
  //update totalproducts and totalcartPrice
  cart.totalproducts -= 1;
  cart.totalCartPrice -= product.price;
  //save the updated cart

  await cart.save();
  res.json({ message: "product succesfully decreased ", cart: cart });
});

router.patch("/remove/:productId", authMiddleWare, async (req, res) => {
  const productId = req.params.productId;

  const product = await Product.findById(productId);
  //find the current user cart

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: "cart not found" });
  }
  //find the product in cart's products array
  const index = cart.products.findIndex(
    (product) => product.productId.toString() === productId
  );
  if (index === -1) {
    return res.status(404).json({ message: "product not found in the cart" });
  }
  if (
    cart.products.length === 1 &&
    cart.products[index].productId.toString() === productId
  ) {
    await Cart.findByIdAndDelete(cart._id);
    return res.json({ message: "cart removed succesfully" });
  }
  cart.totalproducts -= cart.products[index].quantity;
  cart.totalCartPrice -=
    cart.products[index].quantity * cart.products[index].price;
  cart.products.splice(index, 1);

  await cart.save();
  res.json({ message: "product removed succesfully", cart: cart });
});
module.exports = router;
