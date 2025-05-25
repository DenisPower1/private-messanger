import mongoose from 'mongoose';

interface schemaInterface {
  name: string;
  email: string;
  password: string;
  id: string;
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
      minLength: 4,
    },
    id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model('User', userschema);
