import { createClient } from 'redis';

export let redisClient;

export const initRedis = async () => {
  redisClient = createClient();

  redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
  });

  await redisClient.connect();

  console.log('✅ Redis connected!');
};
