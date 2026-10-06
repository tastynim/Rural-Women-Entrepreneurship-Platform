const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/product");
const Order = require("../models/Order");
const SkillCertification = require("../models/SkillCertification");

const getBasicAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEntrepreneurs = await User.countDocuments({
      role: "entrepreneur",
    });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalSalesAggregate = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
    ]);

    const totalSales =
      totalSalesAggregate.length > 0 ? totalSalesAggregate[0].totalSales : 0;

    res.json({
      users: totalUsers,
      entrepreneurs: totalEntrepreneurs,
      products: totalProducts,
      orders: totalOrders,
      salesVolume: totalSales,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.isApproved = true;
      await user.save();
      res.json({ message: "User approved successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "User rejected and removed" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isApproved = true;
      await product.save();
      res.json({ message: "Product approved successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: "Product rejected and removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users pending approval (isApproved = false)
const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ isApproved: false })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all products pending approval (isApproved = false)
const getPendingProducts = async (req, res) => {
  try {
    const pendingProducts = await Product.find({ isApproved: false })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json(pendingProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users (for admin management)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all skill certifications pending approval
const getPendingCertifications = async (req, res) => {
  try {
    const certs = await SkillCertification.find({ status: "Pending" })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(certs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve a skill certification
const approveCertification = async (req, res) => {
  try {
    const cert = await SkillCertification.findByIdAndUpdate(
      req.params.id,
      { status: "Approved" },
      { new: true },
    );
    if (!cert)
      return res.status(404).json({ message: "Certification not found" });
    res.json({
      message: "Certification approved successfully",
      certification: cert,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject a skill certification
const rejectCertification = async (req, res) => {
  try {
    const cert = await SkillCertification.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected" },
      { new: true },
    );
    if (!cert)
      return res.status(404).json({ message: "Certification not found" });
    res.json({ message: "Certification rejected", certification: cert });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a user's role (admin only)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['admin', 'customer', 'entrepreneur'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }
    // Prevent admin from changing their own role
    if (req.params.id === req.user.id.toString()) {
      return res.status(403).json({ message: 'You cannot change your own role' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: `User role updated to ${role}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
