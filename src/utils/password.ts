import { hash, compare } from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
const salLength = String(process.env.get_salt_length);

export const encryptPassword = async (plainPassword: string) => {
  return await hash(plainPassword, 10);
};

export const checkPassword = async (plainPassword: string, hashedPassWord: string) => {
  return await compare(plainPassword, hashedPassWord);
};
