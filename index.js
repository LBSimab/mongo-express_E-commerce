require("dotenv").config();
require("./config/passport");
const express = require("express");
const productsRoutes = require("./routes/products");
const app = express();
const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/category");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const winston = require("winston");

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
//lets create some logger with winston package
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({ level: "debug" }),
    new winston.transports.File({
      filename: "logs/errors.log",
      level: "error",
    }),
  ],
});
//using built-in middleware for requests and responses
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
///static files i.e images
app.use("/upload/categories", express.static("upload/category"));

app.use("/upload/products", express.static("upload/products"));
//routes
app.use("/api/users", userRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/auth", authRoutes);

//addin error logger middleware
app.use((error, req, res, next) => {
  console.log("error middleware is running ");
  //log the error in file or database   // cheeky logger
  logger.error(error.message, {
    method: req.method,
    path: req.originalUrl,
    stack: error.stack,
  });
  return res.status(500).json({ message: "internal server error!" });
});

try {
  app.listen(PORT, logger.info("server is running on port:", PORT));
} catch (error) {
  console.log(error);
}
