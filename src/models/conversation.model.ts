import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

interface conversationModelInterface {
  participants: string[];
  conversationId: unknown;
}

const objIdClass = mongoose.Schema.Types.ObjectId;

const conversationSchema = new mongoose.Schema<conversationModelInterface>(
  {
    participants: [{ type: objIdClass, ref: 'User' }],
    conversationId: {
      type: String,
      required: true,
      default: new ObjectId(),
    },
  },
  { timestamps: true },
);

export default mongoose.model('Conversation', conversationSchema);
