const express = require("express");
const router = express.Router();
const {
  getBasicAnalytics,
  approveUser,
  rejectUser,
  approveProduct,
  rejectProduct,
  getPendingUsers,
  getPendingProducts,
  getAllUsers,
  getPendingCertifications,
  approveCertification,
  rejectCertification,
  updateUserRole,
} = require("../controllers/adminController");
const { protect, restrictTo } = require("../Middleware/authMiddleware");

// All admin routes require authentication and admin role
router.use(protect, restrictTo("admin"));

// Analytics
router.get("/analytics", getBasicAnalytics);

// User management
router.get("/users", getAllUsers);
router.get("/pending/users", getPendingUsers);
router.put("/approve/user/:id", approveUser);
router.delete("/reject/user/:id", rejectUser);
router.put("/users/:id/role", updateUserRole);

// Product management
router.get("/pending/products", getPendingProducts);
router.put("/approve/product/:id", approveProduct);
router.delete("/reject/product/:id", rejectProduct);

// Skill certification management
router.get("/pending/certifications", getPendingCertifications);
router.put("/approve/certification/:id", approveCertification);
router.put("/reject/certification/:id", rejectCertification);

module.exports = router;
