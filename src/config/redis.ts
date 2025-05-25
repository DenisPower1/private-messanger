import ioRedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const username = process.env.redisUserName;
const password = process.env.redisPassWord;
const port = Number(process.env.redisPort);
const host = process.env.reidsHost || '';

const redis = new ioRedis(port, host, { username, password });

export default redis;
