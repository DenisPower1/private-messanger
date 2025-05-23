import Wallet from '../models/wallet.model.js';
import { nodeCron } from 'node-cron';

export const updateOneWallet = async (userId: string, amount: number): Promise<boolean> => {
  await Wallet.updateOne(
    {
      userId,
    },
    {
      $inc: {
        messagesAmount: amount,
      },
    },
  );

  return true;
};

export const create = async (userId: any): Promise<boolean> => {
  await Wallet.insertOne({ userId });

  return true;
};

export const findWallet = async (userId: string) => {
  return await Wallet.findOne({ userId });
};
