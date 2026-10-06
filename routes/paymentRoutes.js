const express = require('express');
const router = express.Router();
const {
    bankPayment,
    bkashInitiate,
    bkashConfirm,
    rocketInitiate,
    rocketConfirm,
    paymentWebhook,
    listPayments,
    getPaymentByOrder
} = require('../controllers/paymentController');
const { protect, restrictTo } = require('../Middleware/authMiddleware');

// POST /api/payments/bank — create a bank transfer payment record
router.post('/bank', protect, bankPayment);

// POST /api/payments/bkash/initiate — initiate a bKash payment
router.post('/bkash/initiate', protect, bkashInitiate);

// POST /api/payments/bkash/confirm — confirm a bKash payment
router.post('/bkash/confirm', protect, bkashConfirm);

// POST /api/payments/rocket/initiate — initiate a Rocket payment
router.post('/rocket/initiate', protect, rocketInitiate);

// POST /api/payments/rocket/confirm — confirm a Rocket payment
router.post('/rocket/confirm', protect, rocketConfirm);

// POST /api/payments/webhook — called by external gateways (no auth)
router.post('/webhook', paymentWebhook);

// GET /api/payments/order/:orderId — get payment for a specific order
router.get('/order/:orderId', protect, getPaymentByOrder);

// GET /api/payments — list all payments (admin only)
router.get('/', protect, restrictTo('admin'), listPayments);

module.exports = router;
