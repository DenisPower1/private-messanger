import { ObjectId } from 'mongodb';
import User from '../models/user.model.js';
import { checkPassword, encryptPassword } from '../utils/password.js';
import * as walletServices from '../services/wallet.service.js';
import { decodeToken } from '../utils/tokenGeneration.js';
import { GetTokenFromDatabase, deleteTokenFromDatabase } from './token.service.js';
import { checkAuthNoSocket } from '../utils/helpers.js';

export const findByEmail = async (email: string) => {
  return await User.findOne({ email });
};

export const create = async (userData: any) => {
  const data = {
    email: userData.email,
    password: userData.password,
    name: userData.name,
  };

  data.password = await encryptPassword(data.password);
  const user = await new User(data).save();
  await walletServices.create(user._id);

  return user;
};

export const deleteUser = async (token: string, userId: string, password: string) => {
  const auth = checkAuthNoSocket(token, userId);
  if (auth.success) {
    const userEmail = String(decodeToken(token)?.email);

    if (userEmail) {
      const userToDelete = await findByEmail(userEmail);
      const isSamePassWord = await checkPassword(password, userToDelete?.password);

      if (isSamePassWord) {
        await User.findOneAndDelete({ email: userEmail });

        return {
          success: true,
          message: 'You account was deleted successfuly you can create it any time',
        };
      }

      return { success: false, message: 'Error: check your credentials!' };
    }
  }

  return {
    success: false,
    message: 'Oh!!! Authorization Error.',
  };
};

export const findUserById = async (id: string) => {
  return await User.aggregate([
    {
      $match: {
        _id: id,
      },
      $project: {
        password: 0,
      },
    },
  ]);
};

export const findAllUsers = async (skip: number, limit: number, userId: unknown) => {
  /**
   * As I'm using this app for work related stuff
   * and we're no more than 10 people, I'll limit the number
   * of users registered, we will set a limit of 100 users.
   *
   * As I open-sourced it do whatever you like.
   *
   *
   */

  const users = await User.aggregate([
    {
      $match: {
        _id: {
          $ne: userId,
        },
      },
    },
    {
      $project: {
        password: 0,
        email: 0,
      },
    },
  ])
    .skip(skip)
    .limit(limit);

  return users;
};

export const getUserMessageAmount = async (userId: string) => {
  const userWallet = await walletServices.findWallet(userId);

  return userWallet?.messagesAmount;
};

export const logOut = async (token: string, userId: string) => {
  const decodedToken = decodeToken(token);
  const tokenInDB = await GetTokenFromDatabase(token);

  if (tokenInDB && decodedToken?.id == userId) {
    deleteTokenFromDatabase(token);

    return {
      success: true,
      message: 'User logged out successfully!',
    };
  }

  return {
    success: false,
    message: 'Invalid token',
  };
};
