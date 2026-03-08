const { Kafka, logLevel } = require('kafkajs');
const config = require('../../../config');

// Shared Kafka client instance
// Every producer and consumer in this service reuses the same
// connection pool via this singleton

const kafka = new Kafka({
          clientId: config.kafka.clientId,
          brokers: config.kafka.brokers,
          logLevel: logLevel.WARN,

          // Retry settings tuned for container startup scenarios
          retry: {
                    initialRetryTime: 300,
                    retries: 10,
          },
});

module.exports = kafka;
