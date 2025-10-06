// backend/src/routes/userRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ------------------- UTILS -------------------

// 🔹 Token generator
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// 🔹 Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded should have shape { id: "...", iat: ..., exp: ... }
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ------------------- ROUTES -------------------

// 🔹 Quick test route
router.get("/ping", (req, res) => {
  res.json({ ok: true, route: "/api/users/ping" });
});

// 🔹 Signup
router.post("/signup", async (req, res) => {
  try {
    // accept optional name (frontend may send it), but primary required fields are email + password
    const { name, email, password } = req.body;

    // basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user — bankAccount/ifsc/currency remain null/default until setup
    const newUser = new User({
      ...(name ? { name } : {}), // optional if your schema includes name
      email,
      password: hashedPassword,
      // bankAccount, ifsc, currency default are handled by the User model schema
    });

    await newUser.save();

    res.status(201).json({
      _id: newUser._id,
      email: newUser.email,
      bankAccount: newUser.bankAccount || null,
      ifsc: newUser.ifsc || null,
      currency: newUser.currency || "INR",
      token: generateToken(newUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🔹 Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      _id: user._id,
      email: user.email,
      bankAccount: user.bankAccount || null,
      ifsc: user.ifsc || null,
      currency: user.currency || "INR",
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ------------------- WALLET SETUP -------------------

// 🔹 Setup Wallet (bank + currency) – protected
// router.post("/setup-wallet", authMiddleware, async (req, res) => {
//   try {
//     const { bankAccount, ifsc, currency } = req.body;

//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     user.bankAccount = bankAccount;
//     user.ifsc = ifsc;
//     user.currency = currency || "INR";

//     await user.save();

//     res.json({
//       message: "Wallet setup complete ✅",
//       user: {
//         _id: user._id,
//         email: user.email,
//         bankAccount: user.bankAccount,
//         ifsc: user.ifsc,
//         currency: user.currency,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });


// ------------------- WALLET SETUP -------------------
router.post("/setup-wallet", authMiddleware, async (req, res) => {
  try {
    const { bankAccount, ifsc, currency } = req.body;

    // ✅ Manual validations before saving
    if (!/^\d{9,18}$/.test(bankAccount)) {
      return res.status(400).json({
        message: "Bank account must be 9–18 digits",
      });
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc)) {
      return res.status(400).json({
        message: "Invalid IFSC format. Must be like ABCD0XXXXXX",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Normalize values
    user.bankAccount = bankAccount;
    user.ifsc = ifsc.toUpperCase(); // 👈 force uppercase
    user.currency = currency || "INR";

    await user.save();

    res.json({
      message: "Wallet setup complete ✅",
      user: {
        _id: user._id,
        email: user.email,
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
