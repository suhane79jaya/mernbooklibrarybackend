import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: "visitor" },
});

export const UserModel = new mongoose.model("User", userSchema);
