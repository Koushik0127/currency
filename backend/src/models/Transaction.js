import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // owner of transaction
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // sender (for received money)
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },   // recipient
    type: { type: String, enum: ["deposit", "withdraw", "transfer", "receive"] },
    amount: Number,
    currency: String,
    targetCurrency: String,
    convertedAmount: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
