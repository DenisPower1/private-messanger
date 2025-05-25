import { RateLimiterRedis } from 'rate-limiter-flexible';
import redisClient from '../../config/redis.js';

export const loginLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  duration: 5 * 60,
  points: 3,
  blockDuration: 60,
  keyPrefix: 'loginAttempt',
});
