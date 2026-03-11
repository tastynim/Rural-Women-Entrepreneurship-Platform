
const Order = require('../models/Order');
const User = require('../models/User');

const getDashboardStats = async (req, res) => {
    try {
        // 1. Count Total Users
        const totalUsers = await User.countDocuments();

        // 2. Count Total Orders
        const totalOrders = await Order.countDocuments();

        // 3. Calculate Total Sales (Revenue)
        // This tells MongoDB to group all orders together and sum up the 'totalPrice' fields
        const salesData = await Order.aggregate([
            {
                $group: {
                    _id: null, // We group everything into one big pile
                    totalSales: { $sum: "$totalPrice" } // Add up the totalPrice column
                }
            }
        ]);

        
        const totalRevenue = salesData.length > 0 ? salesData[0].totalSales : 0;

       
        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

        
        res.status(200).json({
            success: true,
            statistics: {
                totalUsers,
                totalOrders,
                totalRevenue
            },
            recentOrders
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch analytics data' });
    }
};

module.exports = { getDashboardStats };
