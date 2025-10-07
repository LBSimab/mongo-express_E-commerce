const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true, min: 1, default: 1 },
      title: { type: String, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      totalprice: { type: Number, required: true }, //price*quantity
    },
  ],
  totalproducts: { type: Number, default: 0 },
  totaCartPrice: { type: Number, default: 0 },
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
