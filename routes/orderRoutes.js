const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  getUserOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const {
  protect,
  optionalProtect,
  restrictTo,
} = require("../Middleware/authMiddleware");

// GET all orders (admin)
router.get("/", protect, restrictTo("admin"), getOrders);

// GET logged-in user's own orders
router.get("/my-orders", protect, getUserOrders);

// POST create new order (user reference saved if logged in)
router.post("/create", optionalProtect, createOrder);

// PUT update order status (admin only)
router.put("/:id/status", protect, restrictTo("admin"), updateOrderStatus);

module.exports = router;
