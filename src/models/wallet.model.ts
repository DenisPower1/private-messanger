import mongoose, { mongo } from 'mongoose';

interface walletModelInterface {
  messagesAmount: number;
  userId: string;
}

const walletSchema = new mongoose.Schema<walletModelInterface>({
  messagesAmount: {
    type: Number,
    required: true,
    default: 20,
  },
  userId: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.model('Wallet', walletSchema);
