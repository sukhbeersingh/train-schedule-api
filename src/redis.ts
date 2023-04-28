import { createClient } from 'redis';

let client;

const initializeRedis = async () => {
  try {
    client = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: 6379
      }
    });
    await client.connect();
  } catch (err) {
    console.log('error while initializing redis client', err);
  }
  client.on('error', err => console.log('Redis client error', err));
};

initializeRedis();

export { client };