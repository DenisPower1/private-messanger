import redis from '../config/redis.js';

const setKey = 'onlineUsers';

export const addOnlineUser = async (userId: string) => {
  const addToSet = redis.sadd(setKey, userId);
  const addToKey = redis.set(`online:${userId}`, 'true', 'EX', 60);
  Promise.all([addToSet, addToKey]);
};

export const removeOnlineUser = async (userId: string) => {
  await redis.srem(setKey, userId);
};

export const isOnline = async (userId: string): Promise<number> => {
  return await redis.exists(`online:${userId}`);
};

export const getAllOnlineUsers = async () => {
  return await redis.smembers(setKey);
};
