// controllers/productController.js
const Product = require("../models/product");

const canAccessUnapprovedProduct = (req, product) => {
  if (!req.user) return false;
  return (
    req.user.role === "admin" || product.createdBy?.toString() === req.user.id
  );
};

// 1. Add a new product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, images } = req.body;

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      images: images || [],
      createdBy: req.user.id,
      isApproved: req.user.role === "admin",
    });

    await newProduct.save();
    res
      .status(201)
      .json({
        message:
          req.user.role === "admin"
            ? "Product added successfully!"
            : "Product submitted for admin approval.",
        product: newProduct,
      });
  } catch (error) {
    console.error("MONGODB ERROR:", error.message);
    res.status(500).json({ message: "Failed to add product" });
  }
};

// 2. Get all products
const getAllProducts = async (req, res) => {
  try {
    const filter = req.user?.role === "admin" ? {} : { isApproved: true };
    const products = await Product.find(filter).populate("createdBy", "name email");
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

// 3. Search and filter products
const searchProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort } = req.query;
    let filter = req.user?.role === "admin" ? {} : { isApproved: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { "name.en": { $regex: search, $options: "i" } },
        { "name.bn": { $regex: search, $options: "i" } },
        { "description.en": { $regex: search, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let query = Product.find(filter).populate("createdBy", "name email");

    if (sort) {
      const sortOrder = sort.startsWith("-") ? -1 : 1;
      const sortField = sort.replace("-", "");
      query = query.sort({ [sortField]: sortOrder });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const products = await query;
    res.json({ count: products.length, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 4. Get a single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "createdBy",
      "name email location",
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (!product.isApproved && !canAccessUnapprovedProduct(req, product)) {
      return res
        .status(404)
        .json({ message: "Product not found or pending admin approval" });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 5. Update a product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, images } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (images) product.images = images;
    if (req.user.role !== "admin") {
      product.isApproved = false;
    }

    const updatedProduct = await product.save();
    res
      .status(200)
      .json({
        message:
          req.user.role === "admin"
            ? "Product updated successfully!"
            : "Product updated and sent for admin approval.",
        product: updatedProduct,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update product" });
  }
};

// 6. Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
