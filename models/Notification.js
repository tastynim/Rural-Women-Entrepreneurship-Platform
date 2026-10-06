const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["order", "payment", "admin", "general"],
      default: "general",
    },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: "" }, // optional deep-link (e.g. /orders)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
