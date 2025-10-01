const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const joi = require("joi");
const jwt = require("jsonwebtoken");

const User = require("../models/users");
const authMiddleWare = require("../middleware/auth");
const createuserschema = joi.object({
  name: joi.string().min(3).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  adress: joi.string().min(5).required(),
});

router.get("/", authMiddleWare, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
});

router.post("/register", async (req, res) => {
  const { name, email, password, adress } = req.body;
  //JoI VALIDATION

  const joinvalidation = createuserschema.validate(req.body);

  if (joinvalidation.error) {
    return res.status(400).json(joinvalidation.error.details[0].message);
  }
  //check if the user exist returns user already exist !!
  const user = await User.findOne({ email: email });

  if (user) {
    return res.status(400).json({ message: "the user already exist" });
  }

  //getting passwored hashed so no one except use knows it and saving it with other stuff
  const hashedPass = await bcrypt.hash(password, 10);

  const newUser = new User({ name, email, password: hashedPass, adress });
  await newUser.save();
  //creating json token with the proper data we need
  const token = generateToken({
    _id: newUser._id,
    name: newUser.name,
    role: newUser.role,
  });
  //returing the token and the data of the user
  // i realy shouldnt return the user data like this but its just dev checking
  res.status(201).json(token, newUser);
});
router.post("/login", async (req, res) => {
  //first we catch credentials and check email if it exist were gud if not we resend wrong cred
  const cred = req.body;
  const user = await User.findOne({ email: cred.email });
  if (!user) {
    return res.status(401).json({ message: "wrong credentials " });
  }
  const validcred = await bcrypt.compare(cred.password, user.password);
  if (!validcred) {
    return res.status(401).json({ message: "wrong credentials" });
  }

  //if everything went find we genrate token for the user with proper data
  const token = generateToken({
    _id: user._id,
    name: user.name,
    role: user.role,
  });

  res.status(200).json(token);
});

const generateToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "2h" });
};

module.exports = router;
