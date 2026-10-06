// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db.js");
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");

// Routes
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const productRoutes = require("./routes/productRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const adminRoutes = require("./routes/adminRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const skillCertRoutes = require("./routes/skillCertRoutes");
const forumRoutes = require("./routes/forumRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const successStoryRoutes = require("./routes/successStoryRoutes");
const chatRoutes = require("./routes/chatRoutes");

dotenv.config();
connectDB();

const app = express();
const httpServer = http.createServer(app);

// ── Socket.io setup ──────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Authenticate socket connections using JWT
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication error: no token"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    socket.user = decoded; // { id, role }
    next();
  } catch {
    next(new Error("Authentication error: invalid token"));
  }
});

// Track which users are online: userId -> socketId
const onlineUsers = new Map();

io.on("connection", (socket) => {
  const userId = socket.user.id;
  onlineUsers.set(userId, socket.id);
  io.emit("online-users", Array.from(onlineUsers.keys()));

  console.log(`Socket connected: user ${userId}`);

  // Join a conversation room
  socket.on("join-conversation", (conversationId) => {
    socket.join(conversationId);
  });

  // Send a message
  socket.on("send-message", async ({ conversationId, text }) => {
    try {
      if (!conversationId || !text) return;

      // Verify sender is a participant
      const conv = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      });
      if (!conv) return;

      // Save to DB
      const msg = await Message.create({
        conversation: conversationId,
        sender: userId,
        text,
      });

      // Update conversation lastMessage
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: text,
        lastMessageAt: new Date(),
      });

      // Populate sender info
      const populated = await msg.populate("sender", "name photo");

      // Emit to everyone in the room
      io.to(conversationId).emit("new-message", populated);
    } catch (err) {
      console.error("send-message error:", err.message);
    }
  });

  // Typing indicator
  socket.on("typing", ({ conversationId, isTyping }) => {
    socket.to(conversationId).emit("typing", { userId, isTyping });
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    io.emit("online-users", Array.from(onlineUsers.keys()));
    console.log(`Socket disconnected: user ${userId}`);
  });
});

// ── Express middleware ───────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  console.log(`Incoming ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "Server running successfully", status: "online" });
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/products", productRoutes);
app.use("/api", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/skill-certs", skillCertRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/mentorship", mentorRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/success-stories", successStoryRoutes);
app.use("/api/chat", chatRoutes);

// ── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server + Socket.io running on port ${PORT}`);
});
