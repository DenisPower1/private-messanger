import mongoose from "mongoose";

const userschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 4,
    },
    id: {
      type: String,
      required: true,
    },
    isOnline: {
      type: Boolean,
      required: true,
      lowercase: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userschema);
