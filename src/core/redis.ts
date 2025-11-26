import { Redis } from 'ioredis';
import { redisConfig } from './config.js';

const redis=new Redis(redisConfig);

export default redis;
