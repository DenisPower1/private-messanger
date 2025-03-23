import mongoose from 'mongoose';

interface modelInterface {
  token: string;
  createdAt: object;
}

const tokenModel = new mongoose.Schema<modelInterface>({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    required: true,
    expires: 60 * 45,
  },
});

export default mongoose.model('Token', tokenModel);
