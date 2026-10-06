const express = require("express");
const router = express.Router();
const {
  addProduct,
  getAllProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const {
  protect,
  optionalProtect,
  restrictTo,
  checkProductOwnership,
} = require("../Middleware/authMiddleware");
const upload = require("../utils/fileUpload");

// ── Image upload (must be before /:id to avoid conflict) ──────────────────────
// POST /api/products/upload — upload a single product image
router.post(
  "/upload",
  protect,
  restrictTo("entrepreneur", "admin"),
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        return res
          .status(400)
          .json({ message: err.message || "Image upload failed" });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }
    res.json({
      message: "Image uploaded successfully",
      filename: req.file.filename,
      imageUrl: `/uploads/${req.file.filename}`,
    });
  },
);

// ── Static / non-parameterised routes ─────────────────────────────────────────

// POST /api/products/add — add a new product (entrepreneur / admin only)
router.post("/add", protect, restrictTo("entrepreneur", "admin"), addProduct);

// GET /api/products/all — fetch every product (public)
router.get("/all", optionalProtect, getAllProducts);

// GET /api/products/search — search & filter products (public)
// Query params: search, category, minPrice, maxPrice, sort
router.get("/search", optionalProtect, searchProducts);

// ── Parameterised routes ───────────────────────────────────────────────────────

// GET /api/products/:id — get a single product by ID (public)
router.get("/:id", optionalProtect, getProductById);

// PUT /api/products/:id — update a product (owner entrepreneur or admin)
router.put(
  "/:id",
  protect,
  restrictTo("entrepreneur", "admin"),
  checkProductOwnership,
  updateProduct,
);

// DELETE /api/products/:id — delete a product (owner entrepreneur or admin)
router.delete(
  "/:id",
  protect,
  restrictTo("entrepreneur", "admin"),
  checkProductOwnership,
  deleteProduct,
);

module.exports = router;
