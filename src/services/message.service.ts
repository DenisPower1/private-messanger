import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import Wallet from '../models/wallet.model.js';
import validator from 'validator';
import {
  GetConvoIdWithGivenUsers,
  createConversation,
  isThereConvoWithGivenUsers,
} from './conversation.service.js';

export const getAllMessages = async (conversationId: unknown, requesterId: string) => {
  const updateMessagesViewedByRecepientField = Message.updateMany(
    {
      recepient: requesterId,
    },
    {
      $set: { viewedByRecepient: true },
    },
  );

  const getMessages = Message.find({ conversationId })
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
  let conversationId;
  const trimedText = validator.trim(text);
  const safeText = validator.escape(trimedText);
  const participantIds = [senderId, recepientId];
  const allowedToSendSMS = await canSendMessage(senderId);
  const conversationExist = await isThereConvoWithGivenUsers(participantIds);

  if (!conversationExist) {
    const newlyCreatedConvo = await createConversation(participantIds);
    conversationId = newlyCreatedConvo.conversationId;
  }

  if (allowedToSendSMS) {
    if (conversationExist) conversationId = await GetConvoIdWithGivenUsers(participantIds);

    const addMessage = Message.insertOne({
      recepient: recepientId,
      sender: senderId,
      content: {
        text: safeText,
      },
      conversationId,
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

  return await getAllMessages(conversationId, senderId);
};

export const deleteAllMessages = async (conversationId: string) => {
  await Message.deleteMany({ conversationId });
};
