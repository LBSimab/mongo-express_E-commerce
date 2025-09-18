const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const joi = require("joi");
const jwt = require("jsonwebtoken");

const User = require("../models/users");
const createuserschema = joi.object({
  name: joi.string().min(3).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  adress: joi.string().min(5).required(),
});
router.post("/", async (req, res) => {
  const { name, email, password, adress } = req.body;
  //JoI VALIDATION

  const joinvalidation = createuserschema.validate(req.body);

  if (joinvalidation.error) {
    return res.status(400).json(joinvalidation.error.details[0].message);
  }

  const user = await User.findOne({ email: email });

  if (user) {
    return res.status(400).json({ message: "the user already exist" });
  }
  const hashedPass = await bcrypt.hash(password, 10);

  const newUser = new User({ name, email, password: hashedPass, adress });
  const userData = await newUser.save();

  const token = generateToken({ _id: user._id, name: user.name });

  res.status(201).json(token, userData);
});
router.post("/login", async (req, res) => {
  const cred = req.body;
  const user = await User.findOne({ email: cred.email });
  if (!user) {
    return res.status(401).json({ message: "wrong credentials " });
  }
  const validcred = await bcrypt.compare(cred.password, user.password);
  if (!validcred) {
    return res.status(401).json({ message: "wrong credentials" });
  }
  const token = generateToken({ _id: user._id, name: user.name });

  res.status(200).json(token);
});

const generateToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "2h" });
};

module.exports = router;
