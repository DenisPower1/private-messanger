import mongoose from 'mongoose';

interface schemaInterface {
  name: string;
  email: string;
  password: string;
}

const userschema = new mongoose.Schema<schemaInterface>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
  },
  { timestamps: true },
);

export default mongoose.model('User', userschema);
