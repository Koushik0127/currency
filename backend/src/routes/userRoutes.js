// backend/routes/userRoutes.jsx
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ------------------- UTILS -------------------

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ------------------- ROUTES -------------------

// Ping
router.get("/ping", (req, res) => {
  res.json({ ok: true, route: "/api/users/ping" });
});

// 🔹 Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!email || !phone || !password) {
      return res.status(400).json({ message: "Email, phone, and password are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email or phone already exists" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      ...(name ? { name } : {}),
      email,
      phone,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      _id: newUser._id,
      email: newUser.email,
      phone: newUser.phone,
      bankAccount: newUser.bankAccount,
      ifsc: newUser.ifsc,
      currency: newUser.currency,
      token: generateToken(newUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🔹 Login (email OR phone)
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Email/Phone and password are required" });
    }

    // Detect if identifier is email or phone
    let user;
    const isEmail = /^\S+@\S+\.\S+$/.test(identifier);
    if (isEmail) {
      user = await User.findOne({ email: identifier });
    } else {
      // clean phone number
      const cleanPhone = identifier.replace(/\D/g, "");
      user = await User.findOne({ phone: cleanPhone });
    }

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      _id: user._id,
      email: user.email,
      phone: user.phone,
      bankAccount: user.bankAccount,
      ifsc: user.ifsc,
      currency: user.currency,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🔹 Setup Wallet
router.post("/setup-wallet", authMiddleware, async (req, res) => {
  try {
    const { bankAccount, ifsc, currency } = req.body;

    if (!/^\d{9,18}$/.test(bankAccount)) {
      return res.status(400).json({ message: "Bank account must be 9–18 digits" });
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc)) {
      return res.status(400).json({ message: "Invalid IFSC format" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.bankAccount = bankAccount;
    user.ifsc = ifsc.toUpperCase();
    user.currency = currency || "INR";
    await user.save();

    res.json({
      message: "Wallet setup complete ✅",
      user: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        bankAccount: user.bankAccount,
        ifsc: user.ifsc,
        currency: user.currency,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
