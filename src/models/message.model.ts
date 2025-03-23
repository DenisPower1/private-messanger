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
      attachment: {
        url: String,
        fileType: String,
      },
    },
    viewedByRecepient: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Message', messageSchema);
