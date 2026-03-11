const express = require('express');
const router = express.Router();
const { createOrder, getOrders } = require('../controllers/orderController');

// GET all orders
router.get('/', getOrders);

// POST create new order
router.post('/create', createOrder);

module.exports = router;
