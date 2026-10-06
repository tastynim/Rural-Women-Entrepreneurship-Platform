const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "secret123", {
    expiresIn: "30d",
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, isRural, location, skills } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if this is the very first user in the database
    const userCount = await User.countDocuments();
    let assignedRole;
    let isApproved = false;
    if (userCount === 0) {
      // First user is always admin
      assignedRole = 'admin';
      isApproved = true;
    } else {
      // Subsequent users cannot self-assign admin role
      if (role === 'admin') {
        return res.status(403).json({ message: "You cannot self-register as admin. An existing admin must assign that role." });
      }
      assignedRole = role || 'customer';
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
      isRural,
      location,
      skills,
      isApproved,
    });

    if (user) {
      if (!user.isApproved) {
        return res.status(201).json({
          message: "Registration successful. Your account is pending admin approval.",
          requiresApproval: true,
          user: {
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isApproved: user.isApproved,
          },
        });
      }

      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        token: generateToken(user._id, user.role),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.isApproved) {
        return res.status(403).json({
          message: "Your account is pending admin approval.",
        });
      }

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update name and location
    if (req.body.name) user.name = req.body.name;
    if (req.body.location) user.location = req.body.location;

    // Handle skills — may arrive as JSON string (FormData) or plain array (JSON body)
    if (req.body.skills !== undefined) {
      if (Array.isArray(req.body.skills)) {
        user.skills = req.body.skills;
      } else if (typeof req.body.skills === "string") {
        // Try parsing as JSON array first (sent via FormData as JSON string)
        try {
          const parsed = JSON.parse(req.body.skills);
          user.skills = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          // Fall back to comma-separated string
          user.skills = req.body.skills
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        }
      }
    }

    // Handle photo upload if a file is present (via multer)
    if (req.file) {
      user.photo = req.file.filename;
    }

    // Handle password change if provided
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      location: updatedUser.location,
      skills: updatedUser.skills,
      photo: updatedUser.photo,
      isApproved: updatedUser.isApproved,
      token: generateToken(updatedUser._id, updatedUser.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
