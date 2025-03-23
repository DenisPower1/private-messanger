import mongoose from 'mongoose';

interface schemaInterface {
  email: string;
  otp: string;
  createdAt: object;
  tries: number;
}

const otpSchema = new mongoose.Schema<schemaInterface>({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
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

export default mongoose.model('Otp', otpSchema);
