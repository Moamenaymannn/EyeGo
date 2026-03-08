const kafka = require('./kafkaClient');
const config = require('../../../config');
const logger = require('../logging/logger');

const consumer = kafka.consumer({ groupId: config.kafka.groupId });

// Start consuming messages from the activity log topic
// Function handler async called for each record
// The handler is typically an application layer use case
async function startConsumer(handler) {
  await consumer.connect();
  logger.info(`Kafka consumer connected (group=${config.kafka.groupId})`);

  await consumer.subscribe({
    topic: config.kafka.topic,
    fromBeginning: false,
  });

  await consumer.run({

    // Process one message at a time so failures are easy to reason about

    eachMessage: async ({ topic, partition, message }) => {
      const rawValue = message.value.toString();
      logger.debug(`Consumed message from topic=${topic} partition=${partition} offset=${message.offset}`);

      try {
        const parsed = JSON.parse(rawValue);
        await handler(parsed);
      } catch (err) {
        // Log and continue we don't want a single bad record to
        // block the entire consumer
        logger.error(`Failed to process message at offset ${message.offset}: ${err.message}`);
      }
    },
  });
}

// Disconnect the consumer called during graceful shutdown
async function disconnectConsumer() {
  await consumer.disconnect();
  logger.info('Kafka consumer disconnected');
}

module.exports = { startConsumer, disconnectConsumer };
