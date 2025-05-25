import ioRedis from 'ioredis';
import envConfig from '../config/env.js';

const username = envConfig.redisUserName;
const password = envConfig.redisPassWord;
const port = envConfig.redisPort;
const host = envConfig.redisHost;

const redis = new ioRedis(port, host, { username, password });

export default redis;
