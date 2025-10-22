const express = require("express");
const router = express.Router();
const Cart = require("../models/cart.js");
const User = require("../models/users.js");
const authMiddleWare = require("../middleware/auth");
const zarinpal = require("../config/zarinpal.js");

router.post("/zarinpal/pay", authMiddleWare, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  const user = await User.findById(req.user._id);
  console.log(user);

  if (!cart) {
    return res.status(404).json({
      message: "no cart found for the user so ther is no payment to be done",
    });
  }
  console.log(cart);
  try {
    const response = await zarinpal.payments.create({
      amount: cart.totalCartPrice,
      callback_url: "http://localhost:5000/api/orders/zarinpal/callback",
      description: `payment for order ${user.email}`,
      mobile: "09123456789",
      email: user.email,
      cardPan: ["6219861034529007", "5022291073776543"],
      referrer_id: "affiliate123",
    });
    console.log(response);
    const url = await zarinpal.payments.getRedirectUrl(
      response.data.authority.toString()
    );
    cart.authority = response.data.authority.toString();

    res.status(200).redirect(url);
    const addedAuthority = await cart.save();
    console.log(url);
    console.log(addedAuthority);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "paymenet went wrong try again later" });
  }
});
router.get("/zarinpal/callback", async (req, res) => {
  const status = req.query.Status;
  const authority = req.query.Authority;
  console.log("damn");
  res
    .status(200)
    .json({ message: "lets see the id", status: status, authoirty: authority });
});

module.exports = router;
