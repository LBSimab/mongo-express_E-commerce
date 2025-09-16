const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/users");

router.post("/", async (req, res) => {
  const { name, email, password, adress } = req.body;
  const user = await User.findOne({ email: email });

  if (user) {
    return res.status(400).json({ message: "the user already exist" });
  }
  const hashedPass = await bcrypt.hash(password, 10);

  const newUser = new User({ name, email, password: hashedPass, adress });
  const userData = await newUser.save();

  res.status(201).json(userData);
});

module.exports = router;
