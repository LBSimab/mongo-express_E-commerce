const express = require("express");
const passport = require("passport");
const router = express.Router();

app.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

module.exports = router;
