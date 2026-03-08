const kafka = require('./kafkaClient');
const config = require('../../../config');
const logger = require('../logging/logger');

const producer = kafka.producer();
let connected = false;

// Ensure the producer is connected before sending

async function ensureConnected() {
  if (!connected) {
    await producer.connect();
    connected = true;
    logger.info('Kafka producer connected');
  }
}

// Publish a message to the activity log topic
// string key -> Partition key (userId)
// Object value -> The payload to serialize
 
async function sendMessage(key, value) {
  await ensureConnected();

  await producer.send({
    topic: config.kafka.topic,
    messages: [
      {
        key: String(key),
        value: JSON.stringify(value),
        headers: {
          'content-type': 'application/json',
          'produced-at': new Date().toISOString(),
        },
      },
    ],
  });

  logger.debug(`Produced message for key=${key} to topic=${config.kafka.topic}`);
}

// Disconnect the producer called during graceful shutdown

async function disconnectProducer() {
  if (connected) {
    await producer.disconnect();
    connected = false;
    logger.info('Kafka producer disconnected');
  }
}

module.exports = { sendMessage, disconnectProducer };
