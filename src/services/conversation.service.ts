import Conversation from '../models/conversation.model';
import { deleteAllMessages } from './message.service';

export const createConversation = async (userIds: any[]) => {
  const convo = new Conversation({ participants: userIds });

  return await convo.save();
};

export const getAllUserConversation = async (userId: string) => {
  const conversations = await Conversation.find({ participants: userId }).populate(
    'participants',
    'name _id',
  );
  return conversations;
};

export const deleteConversation = async (conversationId: string) => {
  const deletedConvo = await Conversation.findOneAndDelete({ conversationId });

  if (deletedConvo) await deleteAllMessages(conversationId);
};

export const isThereConvoWithGivenUsers = async (userIds: any[]) => {
  const convo = await Conversation.find({
    participants: {
      $all: userIds,
    },
    $expr: {
      $eq: [{ $size: 'participants' }, 2],
    },
  });

  return convo ? true : false;
};
