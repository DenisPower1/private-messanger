import mongoose from "mongoose";

interface conversationInterface extends mongoose.Document {
  participants: string[];
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [String],
      required: true,
    },
    conversationId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<conversationInterface>("Conversation", conversationSchema);
