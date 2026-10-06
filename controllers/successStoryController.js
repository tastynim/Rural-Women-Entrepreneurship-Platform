const SuccessStory = require("../models/SuccessStory");

// GET /api/success-stories — list approved stories (public)
const listStories = async (req, res) => {
  try {
    const stories = await SuccessStory.find({ isApproved: true })
      .populate("entrepreneur", "name photo location")
      .sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    console.error("listStories error:", err);
    res.status(500).json({ message: "Failed to fetch stories" });
  }
};

// GET /api/success-stories/all — list ALL stories (admin only)
const listAllStories = async (req, res) => {
  try {
    const stories = await SuccessStory.find()
      .populate("entrepreneur", "name photo location")
      .sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    console.error("listAllStories error:", err);
    res.status(500).json({ message: "Failed to fetch stories" });
  }
};

// GET /api/success-stories/:id
const getStory = async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id).populate(
      "entrepreneur",
      "name photo location skills"
    );
    if (!story) return res.status(404).json({ message: "Story not found" });
    const canViewUnapproved =
      req.user &&
      (req.user.role === "admin" ||
        story.entrepreneur?._id?.toString() === req.user.id ||
        story.entrepreneur?.toString?.() === req.user.id);
    if (!story.isApproved && !canViewUnapproved) {
      return res
        .status(404)
        .json({ message: "Story not found or pending admin approval" });
    }
    res.json(story);
  } catch (err) {
    console.error("getStory error:", err);
    res.status(500).json({ message: "Failed to fetch story" });
  }
};

// POST /api/success-stories — entrepreneur submits a story
const createStory = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content)
      return res.status(400).json({ message: "title and content are required" });

    const images = req.files ? req.files.map((f) => f.filename) : [];

    const story = new SuccessStory({
      title,
      content,
      images,
      entrepreneur: req.user.id,
      isApproved: false,
    });
    await story.save();
    await story.populate("entrepreneur", "name photo location");
    res.status(201).json({ message: "Story submitted for admin approval", story });
  } catch (err) {
    console.error("createStory error:", err);
    res.status(500).json({ message: "Failed to create story" });
  }
};

// PATCH /api/success-stories/:id/approve — admin approves
const approveStory = async (req, res) => {
  try {
    const story = await SuccessStory.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!story) return res.status(404).json({ message: "Story not found" });
    res.json({ message: "Story approved", story });
  } catch (err) {
    res.status(500).json({ message: "Failed to approve story" });
  }
};

// DELETE /api/success-stories/:id — admin or owner deletes
const deleteStory = async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "Story not found" });

    if (
      story.entrepreneur.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await SuccessStory.findByIdAndDelete(req.params.id);
    res.json({ message: "Story deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete story" });
  }
};

module.exports = {
  listStories,
  listAllStories,
  getStory,
  createStory,
  approveStory,
  deleteStory,
};
