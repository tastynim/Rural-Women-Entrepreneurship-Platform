const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");

// GET /api/chat/users — list all entrepreneurs (for customers to start a chat)
const listChatUsers = async (req, res) => {
  try {
    const role = req.user.role;
    // Customers see entrepreneurs; entrepreneurs see customers; admins see all
    let filter = { isApproved: true };
    if (role === "customer") filter.role = "entrepreneur";
    else if (role === "entrepreneur") filter.role = "customer";

    const users = await User.find(filter).select("name photo location role").sort({ name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// POST /api/chat/conversations — get or create a conversation between two users
const getOrCreateConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    if (!recipientId) return res.status(400).json({ message: "recipientId is required" });

    const me = req.user.id;

    // Find existing conversation with both participants
    let conversation = await Conversation.findOne({
      participants: { $all: [me, recipientId] },
    }).populate("participants", "name photo role");

    if (!conversation) {
      conversation = await Conversation.create({ participants: [me, recipientId] });
      conversation = await Conversation.findById(conversation._id).populate("participants", "name photo role");
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: "Failed to get/create conversation" });
  }
};

// GET /api/chat/conversations — list all conversations for the logged-in user
const listConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate("participants", "name photo role")
      .sort({ lastMessageAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

// GET /api/chat/conversations/:conversationId/messages — get messages in a conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Ensure user is a participant
    const conv = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id,
    });
    if (!conv) return res.status(403).json({ message: "Access denied" });

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name photo")
      .sort({ createdAt: 1 });

    // Mark all as read for this user
    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: req.user.id }, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// POST /api/chat/conversations/:conversationId/messages — send a message (REST fallback)
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "text is required" });

    const conv = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id,
    });
    if (!conv) return res.status(403).json({ message: "Access denied" });

    const msg = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      text,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      lastMessageAt: new Date(),
    });

    const populated = await msg.populate("sender", "name photo");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to send message" });
  }
};

module.exports = {
  listChatUsers,
  getOrCreateConversation,
  listConversations,
  getMessages,
  sendMessage,
};
