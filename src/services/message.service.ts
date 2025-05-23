import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import Wallet from '../models/wallet.model.js';
import validator from 'validator';

export const getAllMessages = async (senderId: any, recepientId: any) => {
  const updateMessagesViewedByRecepientField = Message.updateMany(
    {
      recepient: recepientId,
      sender: senderId,
    },
    {
      $set: { viewedByRecepient: true },
    },
  );

  const getMessages = Message.find({
    $or: [
      {
        sender: senderId,
        recepient: recepientId,
      },
      {
        sender: recepientId,
        recepient: senderId,
      },
    ],
  })
    .sort({
      createdAt: 1,
    })
    .populate('sender', 'name email _id')
    .populate('recepient', 'name email _id');

  const [messages] = await Promise.all([getMessages, updateMessagesViewedByRecepientField]);

  return messages;
};

const canSendMessage = async (userId: string): Promise<boolean> => {
  const userWallet = await Wallet.findOne({ userId: userId });

  if (userWallet) {
    const messagesAmount = userWallet.messagesAmount;

    return messagesAmount > 0 ? true : false;
  }

  return false;
};

export const sendMessage = async (senderId: string, recepientId: string, text: string) => {
  const trimedText = validator.trim(text);
  const safeText = validator.escape(trimedText);
  const allowedToSendSMS = await canSendMessage(senderId);

  if (allowedToSendSMS) {
    const addMessage = Message.insertOne({
      recepient: recepientId,
      sender: senderId,
      content: {
        text: safeText,
      },
    });
    const updateMessageAmount = Wallet.findOneAndUpdate(
      {
        userId: senderId,
      },
      {
        $inc: {
          messagesAmount: -1,
        },
      },
    );

    Promise.all([addMessage, updateMessageAmount]);
  }

  return await getAllMessages(senderId, recepientId);
};
