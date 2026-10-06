const express = require("express");
const router = express.Router();
const {
  listChatUsers,
  getOrCreateConversation,
  listConversations,
  getMessages,
  sendMessage,
} = require("../controllers/chatController");
const { protect } = require("../Middleware/authMiddleware");

router.use(protect);

router.get("/users", listChatUsers);
router.get("/conversations", listConversations);
router.post("/conversations", getOrCreateConversation);
router.get("/conversations/:conversationId/messages", getMessages);
router.post("/conversations/:conversationId/messages", sendMessage);

module.exports = router;
