import { ObjectId } from 'mongodb';
import User from '../models/user.model.js';
import { encryptPassword } from '../utils/password.js';

export const findByEmail = async (email: string) => {
  return await User.findOne({ email: email });
};

export const create = async (userData: any) => {
  const data = {
    email: userData.email,
    password: userData.password,
    name: userData.name,
    id: new ObjectId(),
    isOnline: false,
  };

  data.password = await encryptPassword(data.password);

  const user = new User(data);
  return await user.save();
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

export const findAllUsers = async () => {
  /**
   * As I'm using this app for work related stuff
   * and we're no more than 10 people, I'll limit the number
   * of users registered, we will set a limit of 100 users.
   *
   * As I open-sourced it do whatever you like.
   *
   *
   */

  const users = await User.find().limit(100);

  return users;
};

export const setOnlineStatus = async (id: string, isOnline: boolean) => {
  await User.findOneAndUpdate(
    {
      id: id,
    },
    {
      isOnline: isOnline,
    },
  );
};
