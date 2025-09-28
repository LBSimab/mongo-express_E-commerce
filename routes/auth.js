const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/users");
const jwt = require("jsonwebtoken");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login",
  }),
  async (req, res) => {
    //check user if it exist or not using googleId or email
    const profile = req.user;
    let user = await User.findOne({
      $or: [{ googleId: profile.id }, { email: profile.emails[0].value }],
    });

    //if user available - update the googleid and generate the token and send it to response
    if (user) {
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
    }

    //user is not available so we create user with googleid and generate the token and send it to response
    else {
      user = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
      });
      await user.save();
    }
    const token = jwt.sign(
      { _id: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.redirect(`http://localhost:5173/dashboard?token=${token}`);
  }
);

module.exports = router;
