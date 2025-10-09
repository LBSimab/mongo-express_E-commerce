const mongoose = require("mongoose");
const orderSchema = mongoose.Schema({
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
    },
  ],
  totalproducts: { type: Number, default: 0 },
  totalCartPrice: { type: Number, default: 0 },
  shippingAdress: { type: String, required: true },
  paymentId: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  ordertStatus: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now() },
  deliveredAt: { type: Date },
});
const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
