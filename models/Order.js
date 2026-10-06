const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional, for order tracking
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    productName: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
