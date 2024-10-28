const redis = require('redis');

/** @type {redis.RedisClientType|null} */
let client = null;

async function getClient() {
  if (client) {
    return client.duplicate();
  }

  try {
    client = await redis.createClient({ url: process.env.REDIS_URL })
      .connect();
  } catch(err) {
    console.log(err);
  }

  return client;

}

module.exports = {
  getPublisher: getClient,
  getSubscriber: getClient,
};
