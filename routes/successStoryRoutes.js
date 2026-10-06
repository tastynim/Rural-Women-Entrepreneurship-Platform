const express = require("express");
const router = express.Router();
const {
  listStories,
  listAllStories,
  getStory,
  createStory,
  approveStory,
  deleteStory,
} = require("../controllers/successStoryController");
const { protect, optionalProtect, restrictTo } = require("../Middleware/authMiddleware");
const upload = require("../utils/fileUpload");

// Public
router.get("/", listStories);

// Admin only — view all + approve
router.get("/admin/all", protect, restrictTo("admin"), listAllStories);
router.patch("/:id/approve", protect, restrictTo("admin"), approveStory);

// Public approved story, or admin/owner for pending story
router.get("/:id", optionalProtect, getStory);

// Entrepreneur submits a story (with optional images)
router.post(
  "/",
  protect,
  restrictTo("entrepreneur", "admin"),
  (req, res, next) => {
    upload.array("images", 5)(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  },
  createStory
);

// Owner or admin deletes
router.delete("/:id", protect, deleteStory);

module.exports = router;
