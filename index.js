const express = require("express");
const app = express();
PORT = process.env.PORT || 5001;

try {
  app.listen(PORT, console.log("server is running on port:", PORT));
} catch (error) {
  console.log(error);
}
