import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import { sendNewMessageNotificationEmail } from '../utils/emailSender.js';
import validator from 'validator';

export const getAllMessages = async (senderId: any, recepientId: any) => {
  const messages = await Message.find({
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
  const lastMessage = messages[messages.length - 1];

  if (lastMessage) {
    if (lastMessage.recepient._id == recepientId) {
      lastMessage.viewedByRecepient = true;
      await Message.updateOne(
        {
          _id: lastMessage._id,
        },
        {
          viewedByRecepient: true,
        },
      );
    }
  }

  return messages;
};

export const sendMessage = async (senderId: string, recepientId: string, text: string) => {
  const trimedText = validator.trim(text);
  const safeText = validator.escape(trimedText);
  await Message.insertOne({
    recepient: recepientId,
    sender: senderId,
    content: {
      text: safeText,
    },
  });

  const recepientUser = await User.findById(recepientId);
  const senderUser = await User.findById(senderId);

  if (recepientUser && !recepientUser.isOnline && senderUser) {
    sendNewMessageNotificationEmail(
      { email: recepientUser.email, name: recepientUser.name },
      senderUser.name,
    );
  }

  return await getAllMessages(senderId, recepientId);
};
