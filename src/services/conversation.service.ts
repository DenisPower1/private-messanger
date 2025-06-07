import Conversation from '../models/conversation.model';
import { deleteAllMessages } from './message.service';

export const createConversation = async (userIds: any[]) => {
  const alreadyExist = await isThereConvoWithGivenUsers(userIds);

  if (alreadyExist) {
    const conversationArray = await getConvoWithGivenUsers(userIds);

    return conversationArray[0];
  }

  const convo = new Conversation({ participants: userIds });

  return await convo.save();
};

export const getAllUserConversation = async (userId: string) => {
  const conversations = await Conversation.find({ participants: userId })
    .sort({ createdAt: -1 })
    .populate('participants', 'name _id');
  return conversations;
};

export const deleteConversation = async (conversationId: string) => {
  const deletedConvo = await Conversation.findOneAndDelete({ conversationId });

  if (deletedConvo) await deleteAllMessages(conversationId);
};

export const isThereConvoWithGivenUsers = async (userIds: any[]) => {
  const convo = await getConvoWithGivenUsers(userIds);

  return convo.length == 1 ? true : false;
};

export const GetConvoIdWithGivenUsers = async (userIds: any[]) => {
  const convo = await getConvoWithGivenUsers(userIds);

  return convo[0]?.conversationId;
};

const getConvoWithGivenUsers = async (userIds: any[]) => {
  const convo = await Conversation.find({
    participants: {
      $all: userIds,
    },
  });

  return convo;
};
