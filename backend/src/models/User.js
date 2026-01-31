 import mongoose from "mongoose";

 const userSchema = mongoose.Schema({
   name: { type: String },
   email: { type: String, unique: true, sparse: true },
   phone: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  bankAccount: { type: String },
   ifsc: { type: String },
   currency: { type: String, default: "USD" },
}, { timestamps: true });

 export default mongoose.model("User", userSchema);

