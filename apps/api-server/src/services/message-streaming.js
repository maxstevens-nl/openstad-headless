const config = require('config');
const redis = require('redis');

async function getClient() {
  let client;

  try {
    client = await redis.createClient(config.messageStreaming.redis).connect();
  } catch(err) {
    console.error("Failed to initialize redis", err);
  }

  return client;
}

module.exports = {
  getPublisher: getClient,
  getSubscriber: getClient,
};
