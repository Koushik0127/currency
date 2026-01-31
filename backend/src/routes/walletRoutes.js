// backend/routes/walletRoutes.jsx
import express from "express";
import Wallet from "../models/wallet.js";
import Transaction from "../models/Transaction.js";
import protect from "../middleware/authMiddleware.js";
import { convertCurrency } from "../utils/currencyConverter.js";
import User from "../models/User.js";

const router = express.Router();

// Helper: Get or create wallet
const getWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = new Wallet({ userId, balance: 0, currency: "USD" });
    await wallet.save();
  }
  return wallet;
};

// 🔹 Convert Preview
router.post("/convert-preview", protect, async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    if (!from || !to || !amount || isNaN(amount) || amount <= 0)
      return res.status(400).json({ message: "Missing or invalid fields" });

    const convertedAmount = await convertCurrency(from, to, Number(amount));
    if (isNaN(convertedAmount)) return res.status(500).json({ message: "Currency conversion failed" });

    res.json({ convertedAmount });
  } catch (err) {
    res.status(500).json({ message: "Conversion preview failed", error: err.message });
  }
});

// ✅ Deposit
router.post("/deposit", protect, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) return res.status(400).json({ message: "Invalid deposit amount" });

    const wallet = await getWallet(req.user._id);
    wallet.balance += Number(amount);
    await wallet.save();

    await Transaction.create({
      userId: req.user._id,
      type: "deposit",
      amount,
      currency: wallet.currency,
      fromUser: req.user._id,
    });

    res.json({ message: "Deposit successful", balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ message: "Deposit failed", error: err.message });
  }
});

// ✅ Withdraw
router.post("/withdraw", protect, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) return res.status(400).json({ message: "Invalid withdraw amount" });

    const wallet = await getWallet(req.user._id);
    if (wallet.balance < Number(amount)) return res.status(400).json({ message: "Insufficient balance" });

    wallet.balance -= Number(amount);
    await wallet.save();

    await Transaction.create({
      userId: req.user._id,
      type: "withdraw",
      amount,
      currency: wallet.currency,
      fromUser: req.user._id,
    });

    res.json({ message: "Withdrawal successful", balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ message: "Withdrawal failed", error: err.message });
  }
});

// ✅ Transfer — Email or Phone
router.post("/transfer", protect, async (req, res) => {
  try {
    let { recipient, transferMethod, amount, currency, targetCurrency } = req.body;

    if (!recipient || !transferMethod || !amount || isNaN(amount) || amount <= 0 || !currency || !targetCurrency) {
      return res.status(400).json({ message: "Missing or invalid fields" });
    }

    const sender = await User.findById(req.user._id);
    if (!sender.bankAccount || !sender.ifsc) return res.status(400).json({ message: "Set up your wallet first" });

    // 🔹 Clean and normalize recipient
    let recipientUser;
    if (transferMethod === "email") {
      recipientUser = await User.findOne({ email: recipient.trim().toLowerCase() });
    } else if (transferMethod === "phone") {
      const cleanPhone = recipient.replace(/\D/g, "");
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        return res.status(400).json({ message: "Invalid Indian phone number" });
      }
      recipientUser = await User.findOne({ phone: cleanPhone });
    } else {
      return res.status(400).json({ message: "Invalid transfer method" });
    }

    if (!recipientUser) return res.status(404).json({ message: "Recipient not found" });
    if (!recipientUser.bankAccount || !recipientUser.ifsc) return res.status(400).json({ message: "Recipient wallet not set up" });
    if (recipientUser._id.toString() === req.user._id.toString()) return res.status(400).json({ message: "Cannot transfer to yourself" });

    const fromWallet = await getWallet(req.user._id);
    const toWallet = await getWallet(recipientUser._id);

    if (fromWallet.balance < Number(amount)) return res.status(400).json({ message: "Insufficient balance" });

    // 🔹 Currency conversion
    let receivedAmount = Number(amount);
    if (currency !== targetCurrency) {
      receivedAmount = await convertCurrency(currency, targetCurrency, Number(amount));
      if (isNaN(receivedAmount)) return res.status(500).json({ message: "Currency conversion failed" });
    }

    // 🔹 Perform transfer
    fromWallet.balance -= Number(amount);
    toWallet.balance += receivedAmount;
    await fromWallet.save();
    await toWallet.save();

    // 🔹 Log transactions
    await Transaction.create({
      userId: req.user._id,
      fromUser: req.user._id,         // sender
      toUser: recipientUser._id,      // recipient
      type: "transfer",
      amount: Number(amount),
      currency,
      targetCurrency,
      convertedAmount: receivedAmount,
    });

    await Transaction.create({
      userId: recipientUser._id,
      fromUser: req.user._id,         // sender
      toUser: recipientUser._id,      // recipient
      type: "receive",
      amount: receivedAmount,
      currency: targetCurrency,
      convertedAmount: receivedAmount,
    });

    res.json({
      message: "✅ Transfer successful",
      sent: `${amount} ${currency}`,
      received: `${receivedAmount.toFixed(2)} ${targetCurrency}`,
      fromBalance: fromWallet.balance,
    });
  } catch (err) {
    res.status(500).json({ message: "Transfer failed", error: err.message });
  }
});

// ✅ Transaction History
router.get("/history", protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .populate("toUser", "email phone")
      .populate("fromUser", "email phone")  // 🔹 populate sender
      .sort({ createdAt: -1 });

    const formatted = transactions.map((tx) => ({
      ...tx.toObject(),
      fromUser: tx.fromUser?.email || tx.fromUser?.phone || null,
      toUser: tx.toUser?.email || tx.toUser?.phone || null,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch history", error: err.message });
  }
});

// ✅ Wallet balance
router.get("/balance", protect, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) return res.status(404).json({ message: "Wallet not found. Please set it up first." });
    res.json({ balance: wallet.balance, currency: wallet.currency });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
