const express = require("express");
const router = express.Router();
const authMiddleWare = require("../middleware/auth");
const zarinpal = require("../config/zarinpal.js");
router.post("/zarinpal/pay", authMiddleWare, async (req, res) => {
  let response;

  try {
    const response = await zarinpal.payments.create({
      amount: 10000,
      callback_url: "http://localhost:5000/api/orders/zarinpal/callback",
      description: "Payment for order 1234",
      mobile: "09123456789",
      email: "customer@example.com",
      cardPan: ["6219861034529007", "5022291073776543"],
      referrer_id: "affiliate123",
    });
    console.log(response);
    const url = await zarinpal.payments.getRedirectUrl(
      response.data.authority.toString()
    );
    console.log(url);
  } catch (error) {
    console.error(error);
  }

  res.status(200).json({ message: "payment intiated" });
});
router.get("/zarinpal/callback", async (req, res) => {
  console.log(req.body);
  console.log(req.headers);
  console.log(req.params);
  console.log("damn");
});

module.exports = router;
