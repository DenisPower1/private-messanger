import { sign, verify, decode } from 'jsonwebtoken';
import envConfig from '../config/env.js';
import { GetTokenFromDatabase, storeTokenInDatabase } from '../services/token.service.js';

const jwtSecretKey = envConfig.jwtSecretKey;

export const generateToken = (payload: any) => {
  const token = sign(payload, jwtSecretKey, { expiresIn: '45m' });
  storeTokenInDatabase(token);
  return token;
};

export const verifyToken = (token: string) => {
  const tokenStoredInTheDatabase = GetTokenFromDatabase(token);
  const validToken = verify(token, jwtSecretKey);
  if (!tokenStoredInTheDatabase) return false;
  return validToken;
};

export const decodeToken = (token: string) => {
  return decode(token, { json: true });
};
