import Token from '../models/tokens.model.js';

export const GetTokenFromDatabase = async (token: string) => {
  const query = await Token.findOne({ token: token });
  const _token = query?.token;
  return _token;
};

export const deleteTokenFromDatabase = async (token: string) => {
  await Token.deleteOne({ token: token });
  return true;
};

export const storeTokenInDatabase = async (token: string) => {
  await Token.insertOne({ token: token });
  return true;
};
