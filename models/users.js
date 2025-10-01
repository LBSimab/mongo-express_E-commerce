const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true, minglength: 3 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  adress: { type: String, required: true, minglength: 5 },
  role: { type: String, enum: ["user", "seller", "admin"], default: "user" },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
