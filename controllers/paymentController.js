const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { createNotification } = require('./notificationController');

// ── Helper: generate a realistic transaction ID ───────────────────────────
const generateTxnId = (prefix) => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}${ts}${rand}`;
};

// ── Bank Transfer ─────────────────────────────────────────────────────────
const bankPayment = async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    if (!orderId || !amount)
      return res.status(400).json({ message: 'orderId and amount are required' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const payment = new Payment({
      order: order._id,
      method: 'Bank',
      amount,
      status: 'Pending',
      meta: {
        instructions:
          process.env.BANK_INSTRUCTIONS ||
          'Transfer to Account: 1234567890, DBBL, Branch: Dhaka Main, Account Name: Rural Women Empowerment Fund.',
      },
    });
    await payment.save();

    res.status(201).json({
      message: 'Bank transfer initiated. Please follow the instructions.',
      payment,
      instructions: payment.meta.instructions,
    });
  } catch (err) {
    console.error('bankPayment error', err);
    res.status(500).json({ message: 'Failed to create bank payment' });
  }
};

// ── bKash Initiate ────────────────────────────────────────────────────────
// Step 1: Customer enters bKash number → record created, OTP "sent"
const bkashInitiate = async (req, res) => {
  try {
    const { orderId, amount, phoneNumber } = req.body;
    if (!orderId || !amount || !phoneNumber)
      return res.status(400).json({ message: 'orderId, amount and phoneNumber are required' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // In a real integration this would call bKash Merchant API
    // For simulation: store the phone and a fake OTP reference
    const otpRef = Math.floor(100000 + Math.random() * 900000).toString();

    const payment = new Payment({
      order: orderId,
      method: 'Bkash',
      amount,
      status: 'Pending',
      meta: { phoneNumber, otpRef },
    });
    await payment.save();

    res.status(201).json({
      message: `OTP sent to ${phoneNumber}. Enter the 6-digit code to confirm.`,
      paymentId: payment._id,
      // In production: never send otpRef to client. This is for demo only.
      otpRef,
    });
  } catch (err) {
    console.error('bkashInitiate error', err);
    res.status(500).json({ message: 'Failed to initiate bKash payment' });
  }
};

// Step 2: Customer submits OTP → payment marked Completed
const bkashConfirm = async (req, res) => {
  try {
    const { paymentId, otp } = req.body;
    if (!paymentId || !otp)
      return res.status(400).json({ message: 'paymentId and otp are required' });

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.method !== 'Bkash')
      return res.status(400).json({ message: 'Invalid payment method' });
    if (payment.status === 'Completed')
      return res.status(400).json({ message: 'Payment already completed' });

    // Verify OTP (demo: check against stored otpRef OR accept any 6-digit code)
    if (otp.length !== 6)
      return res.status(400).json({ message: 'OTP must be 6 digits' });

    const txnId = generateTxnId('BKS');
    payment.status = 'Completed';
    payment.transactionId = txnId;
    payment.meta = { ...payment.meta, confirmedAt: new Date() };
    await payment.save();

    // Mark linked order as paid
    const paidOrder = await Order.findByIdAndUpdate(payment.order, { isPaid: true }, { new: true });
    if (paidOrder?.user) {
      await createNotification(paidOrder.user, 'bKash Payment Successful 💳', `Your bKash payment of ৳${payment.amount} for order "${paidOrder.productName}" was confirmed. Transaction ID: ${txnId}`, 'payment', '/orders');
    }

    res.json({
      message: 'bKash payment successful! 🎉',
      transactionId: txnId,
      payment,
    });
  } catch (err) {
    console.error('bkashConfirm error', err);
    res.status(500).json({ message: 'Failed to confirm bKash payment' });
  }
};

// ── Rocket Initiate ───────────────────────────────────────────────────────
const rocketInitiate = async (req, res) => {
  try {
    const { orderId, amount, phoneNumber } = req.body;
    if (!orderId || !amount || !phoneNumber)
      return res.status(400).json({ message: 'orderId, amount and phoneNumber are required' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const otpRef = Math.floor(100000 + Math.random() * 900000).toString();

    const payment = new Payment({
      order: orderId,
      method: 'Rocket',
      amount,
      status: 'Pending',
      meta: { phoneNumber, otpRef },
    });
    await payment.save();

    res.status(201).json({
      message: `OTP sent to ${phoneNumber}. Enter your 6-digit Rocket PIN to confirm.`,
      paymentId: payment._id,
      otpRef,
    });
  } catch (err) {
    console.error('rocketInitiate error', err);
    res.status(500).json({ message: 'Failed to initiate Rocket payment' });
  }
};

// Rocket Confirm
const rocketConfirm = async (req, res) => {
  try {
    const { paymentId, otp } = req.body;
    if (!paymentId || !otp)
      return res.status(400).json({ message: 'paymentId and otp are required' });

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.method !== 'Rocket')
      return res.status(400).json({ message: 'Invalid payment method' });
    if (payment.status === 'Completed')
      return res.status(400).json({ message: 'Payment already completed' });

    if (otp.length !== 6)
      return res.status(400).json({ message: 'PIN must be 6 digits' });

    const txnId = generateTxnId('RKT');
    payment.status = 'Completed';
    payment.transactionId = txnId;
    payment.meta = { ...payment.meta, confirmedAt: new Date() };
    await payment.save();

    const paidOrderR = await Order.findByIdAndUpdate(payment.order, { isPaid: true }, { new: true });
    if (paidOrderR?.user) {
      await createNotification(paidOrderR.user, 'Rocket Payment Successful 💳', `Your Rocket payment of ৳${payment.amount} for order "${paidOrderR.productName}" was confirmed. Transaction ID: ${txnId}`, 'payment', '/orders');
    }

    res.json({
      message: 'Rocket payment successful! 🎉',
      transactionId: txnId,
      payment,
    });
  } catch (err) {
    console.error('rocketConfirm error', err);
    res.status(500).json({ message: 'Failed to confirm Rocket payment' });
  }
};

// ── Webhook (external gateway callback) ──────────────────────────────────
const paymentWebhook = async (req, res) => {
  try {
    const { paymentId, status, transactionId, meta } = req.body;
    if (!paymentId || !status)
      return res.status(400).json({ message: 'paymentId and status are required' });

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    payment.status = status;
    if (transactionId) payment.transactionId = transactionId;
    if (meta) payment.meta = { ...payment.meta, ...meta };
    await payment.save();

    if (status === 'Completed') {
      await Order.findByIdAndUpdate(payment.order, { isPaid: true });
    }

    res.json({ message: 'Payment webhook acknowledged', payment });
  } catch (err) {
    console.error('paymentWebhook error', err);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

// ── Admin: list all payments ───────────────────────────────────────────────
const listPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('order', 'customerName productName totalPrice status')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Unable to fetch payments' });
  }
};

// ── Get payment by order ID ────────────────────────────────────────────────
const getPaymentByOrder = async (req, res) => {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId })
      .populate('order', 'customerName productName totalPrice status');
    if (!payment)
      return res.status(404).json({ message: 'No payment found for this order' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payment' });
  }
};

module.exports = {
  bankPayment,
  bkashInitiate,
  bkashConfirm,
  rocketInitiate,
  rocketConfirm,
  paymentWebhook,
  listPayments,
  getPaymentByOrder,
};
