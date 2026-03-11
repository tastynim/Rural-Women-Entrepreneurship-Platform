const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/product');
const Order = require('../models/Order');

const getBasicAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalEntrepreneurs = await User.countDocuments({ role: 'Entrepreneur' });
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalSalesAggregate = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } }
        ]);

        const totalSales = totalSalesAggregate.length > 0 ? totalSalesAggregate[0].totalSales : 0;

        res.json({
            users: totalUsers,
            entrepreneurs: totalEntrepreneurs,
            products: totalProducts,
            orders: totalOrders,
            salesVolume: totalSales
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
            res.json({ message: 'User approved' });
        } else {
            res.status(404).json({ message: 'User not found' });
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
            res.json({ message: 'Product approved' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getBasicAnalytics, approveUser, approveProduct };