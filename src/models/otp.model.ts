import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  otp: {
    type: String,
  },
  createdAt: {
    type: Date,
    Default: Date.now,
    expires: 60 * 4,
  },
  tries: {
    type: Number,
    default: 3,
  },
});

export default mongoose.model("Otp", otpSchema);
