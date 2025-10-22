const express = require("express");
const router = express.Router();
const Cart = require("../models/cart.js");
const User = require("../models/users.js");
const authMiddleWare = require("../middleware/auth");
const zarinpal = require("../config/zarinpal.js");

router.post("/zarinpal/pay", authMiddleWare, async (req, res) => {
  //find user cart and find user
  const cart = await Cart.findOne({ user: req.user._id });
  const user = await User.findById(req.user._id).select("-password");
  console.log(user);
  //if cart doesnt exist we dont have payment
  if (!cart) {
    return res.status(404).json({
      message: "no cart found for the user so there is no payment to be done",
    });
  }
  //if cart exist we intiate the payment and add authority to cart for future
  //we also use the totalprice as amount and the email or name for the description
  // that thing is optional you can put your website name on it
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
    //if anything goes wrong!!
    console.error(error);
    res.status(500).json({ message: "paymenet went wrong try again later" });
  }
});

//after the payment was intiated it returns the outcome of payment
//#1-payment wasnt success and it returs the authority and status NOK
//#2-payment was a sucess it returns authority and Status OK
//we define two outcomes if you want not to pay just reverse the conditions
//then you can get the both situtation tested without paying anything :) (im poor)
router.get("/zarinpal/callback", async (req, res) => {
  const status = req.query.Status;
  const authority = req.query.Authority;
  console.log("damn");
  res
    .status(200)
    .json({ message: "lets see the id", status: status, authoirty: authority });
});

module.exports = router;
