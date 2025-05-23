import mongoose from 'mongoose';

interface schemaInterface {
  sender: {
    name: string;
    isOnline: boolean;
    _id: string;
  };
  recepient: {
    name: string;
    isOnline: boolean;
    _id: string;
  };
  content: {
    text: string;
  };
  attchament: {
    url: string;
    fileType: string;
  };

  createdAt: Date;

  viewedByRecepient: boolean;
}

const messageSchema = new mongoose.Schema<schemaInterface>(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    recepient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    content: {
      text: { type: String, required: true },
    },
    viewedByRecepient: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      expires: 60 * 20,
    },
  },

  {
    timestamps: true,
  },
);

export default mongoose.model('Message', messageSchema);
