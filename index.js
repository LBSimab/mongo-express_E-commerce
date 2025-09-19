require("dotenv").config();
const express = require("express");
const app = express();
const userRoutes = require("./routes/users");

PORT = process.env.PORT || 5001;
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
mongoose
  .connect("mongodb://localhost:27017/cartwish")
  .then(() => {
    console.log("connection was success");
  })
  .catch((e) => {
    console.log(e);
  });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);

try {
  app.listen(PORT, console.log("server is running on port:", PORT));
} catch (error) {
  console.log(error);
}
