const Order = require("../models/Order");
const nodemailer = require("nodemailer");
const { createNotification } = require("./notificationController");

// 1. Configure your Email Sender
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 2. Create a new order (user reference saved if authenticated)
const createOrder = async (req, res) => {
  try {
    const { customerName, customerEmail, productName, totalPrice } = req.body;

    const newOrder = new Order({
      customerName,
      customerEmail,
      productName,
      totalPrice,
      user: req.user ? req.user.id : null,
    });

    await newOrder.save();

    // 🔔 In-app notification for the logged-in user
    if (req.user) {
      await createNotification(
        req.user.id,
        "Order Placed Successfully! 🎉",
        `Your order for "${productName}" worth ৳${totalPrice} has been placed. We will process it shortly.`,
        "order",
        "/orders"
      );
    }

    // 📧 Email confirmation
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: "Order Confirmation - Rural Women Empowerment",
      html: `
        <h3>Thank you for your order, ${customerName}!</h3>
        <p>You have successfully ordered <strong>${productName}</strong>.</p>
        <p>Total: ৳${totalPrice}</p>
        <p>Your support helps rural women entrepreneurs thrive!</p>
        <p>You can track your order status by logging into your account.</p>
      `,
    };

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await transporter.sendMail(mailOptions);
        res.status(201).json({
          message: "Order created and confirmation email sent!",
          order: newOrder,
        });
      } catch (emailErr) {
        console.error("Failed to send email:", emailErr);
        res.status(201).json({
          message: "Order created but failed to send email",
          order: newOrder,
          emailError: emailErr.message || emailErr,
        });
      }
    } else {
      console.warn("Email credentials not configured, skipping sendMail");
      res.status(201).json({
        message: "Order created (email not configured)",
        order: newOrder,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong while creating the order" });
  }
};

// 3. Get all orders (admin use)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// 4. Get orders for the currently logged-in user
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch your orders" });
  }
};

// 5. Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    // 🔔 In-app notification for the customer
    if (order.user) {
      const statusEmoji = {
        Processing: "⚙️",
        Shipped: "🚚",
        Delivered: "✅",
        Cancelled: "❌",
        Pending: "⏳",
      };
      await createNotification(
        order.user,
        `Order ${statusEmoji[status] || ""} ${status}`,
        `Your order for "${order.productName}" is now "${status}".`,
        "order",
        "/orders"
      );
    }

    // 📧 Status update email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: order.customerEmail,
        subject: `Order Update - Your order is now ${status}`,
        html: `
          <h3>Hello ${order.customerName},</h3>
          <p>Your order for <strong>${order.productName}</strong> has been updated.</p>
          <p>New Status: <strong>${status}</strong></p>
          <p>Thank you for shopping with Rural Women Empowerment!</p>
        `,
      };
      try {
        await transporter.sendMail(mailOptions);
      } catch (emailErr) {
        console.error("Status update email failed:", emailErr.message);
      }
    }

    res.status(200).json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

module.exports = { createOrder, getOrders, getUserOrders, updateOrderStatus };
