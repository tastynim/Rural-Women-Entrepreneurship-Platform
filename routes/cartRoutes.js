const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");
const { protect } = require("../Middleware/authMiddleware");

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.delete("/remove/:productId", protect, removeFromCart);
router.delete("/clear", protect, clearCart);

module.exports = router;
