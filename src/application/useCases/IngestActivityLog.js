const { sendMessage } = require('../../infrastructure/messaging/producer');
const config = require('../../../config');
const logger = require('../../infrastructure/logging/logger');

// Ingest an incoming activity log
// Validates the minimum required fields
// and publishes it to Kafka so the
// consumer pipeline can handle heavy processing asynchronously

class IngestActivityLog {
  async execute(rawPayload) {
    const { userId, action } = rawPayload;

    if (!userId || !action) {
      const err = new Error('userId and action are required');
      err.statusCode = 400;
      throw err;
    }

    const enrichedPayload = {
      userId,
      action,
      timestamp: new Date().toISOString(),
    };

    await sendMessage(userId, enrichedPayload);

    logger.info(`Ingested activity log for user=${userId} action=${action}`);

    return {
      accepted: true,
      topic: config.kafka.topic,
      userId,
      action,
    };
  }
}

module.exports = IngestActivityLog;
