require("dotenv").config();
require("./config/passport");
const express = require("express");
const app = express();
const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/category");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
PORT = process.env.PORT || 5001;
//database connection
mongoose
  .connect("mongodb://localhost:27017/cartwish")
  .then(() => {
    console.log("connection was success");
  })
  .catch((err) => {
    console.log(err);
  });

//using built-in middleware for requests and responses
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
///static files i.e images
app.use("/upload/categories", express.static("upload/category"));
//routes
app.use("/api/users", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/auth", authRoutes);

try {
  app.listen(PORT, console.log("server is running on port:", PORT));
} catch (error) {
  console.log(error);
}
