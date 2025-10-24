const express = require("express");
const router = express.Router();
const Cart = require("../models/cart.js");
const User = require("../models/users.js");
const Order = require("../models/order.js");
const authMiddleWare = require("../middleware/auth");
const zarinpal = require("../config/zarinpal.js");

router.post("/zarinpal/pay", authMiddleWare, async (req, res) => {
  //find user cart and find user
  const cart = await Cart.findOne({ user: req.user._id });
  const user = await User.findById(req.user._id).select("-password -__v");

  //if cart doesnt exist we dont have payment
  if (!cart) {
    return res.status(404).json({
      message: "no cart found for the user so there is no payment to be done",
    });
  }
  //if cart exist we intiate the payment and add authority to cart for future
  //we also use the totalprice as amount and the email or name for the description
  // that thing is optional you can put your website name on it(description is required field i meant the using users info or other stuff)
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

    //now that we have the authority and created payment
    //we can try to redirect the user to paypment Url
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
  //first we find the cart with the authority so there is no mismatch!
  const cart = await Cart.findOne({ authority: authority });
  if (!cart) {
    return res
      .status(404)
      .json({ message: "no cart with this purchase was available!" });
  }
  //first we check for the unsucessful payments if its not a success
  if (status === "NOK") {
    return res
      .status(400)
      .json({ message: `payment was unsuccesfull for Cart  ` });
  }
  if (status === "OK") {
    //for the adress of the user we need the user!
    const user = await User.findById(cart.user).select(
      "-password -_id -__v -role "
    );

    //lets see if the order exist with this authority so there is no duplication
    const existingorder = await Order.findOne({ paymentId: authority });
    if (existingorder) {
      return res.status(400).json({ message: "order already submitted!" });
    }
    //everything looks fine so we create the order with authority and status
    const newOrder = Order({
      user: cart.user,
      products: cart.products,
      totalproducts: cart.totalproducts,
      totalCartPrice: cart.totalCartPrice,
      shippingAdress: user.adress,
      paymentId: authority,
      paymentStatus: status,
    });
    const order = await newOrder.save();
    //so if the order succesfuly created and everything was fine we dont need the cart right?!
    //i put this part optional but i think after you pay the cart the cart should be deleted!
    if (order) {
      const result = await cart.delete();
      console.log("cart deleted succesfuly!", result);
    }
    return res.status(201).json(order);
  }
  //if in any case there is another status which is impossible unless something goes wrong
  //we just return internal error so everything goes smoothly!
  res.status(500).json({ message: "something went wrong" });
});

module.exports = router;
