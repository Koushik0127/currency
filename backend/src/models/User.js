// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
//     },
//     password: {
//       type: String,
//       required: true,
//       minlength: 6,
//     },
//     // 👇 New fields for bank + currency setup
//     bankAccount: {
//       type: String,
//       default: null, // user sets this later
//     },
//     ifsc: {
//       type: String,
//       default: null,
//     },
//     currency: {
//       type: String,
//       default: "INR", // 👈 default wallet currency for new users
//       enum: ["INR", "USD", "EUR", "GBP"], // you can add more later
//     },

//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { timestamps: true }
// );

// const User = mongoose.model("User", userSchema);

// export default User;

// backend/src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // validated bank + currency fields
    bankAccount: {
      type: String,
      default: null,
      match: [/^\d{9,18}$/, "Bank account must be 9–18 digits"],
    },
    ifsc: {
      type: String,
      default: null,
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/i, "IFSC must match format (e.g. ABCD0XXXXXX)"],
    },
    currency: {
      type: String,
      default: "INR",
      enum: ["INR", "USD", "EUR", "GBP"],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
