const ActivityLog = require('../../domain/entities/ActivityLog');
const logger = require('../../infrastructure/logging/logger');

// Process a raw activity log consumed from Kafka.
// Transforms the raw JSON into a domain entity, marks it as processed

class ProcessActivityLog {
  constructor(activityLogRepository) {
    this.repository = activityLogRepository;
  }

  async execute(rawMessage) {
    const logEntry = new ActivityLog({
      userId: rawMessage.userId,
      action: rawMessage.action,
      timestamp: rawMessage.timestamp ? new Date(rawMessage.timestamp) : new Date(),
    });

    try {
      logEntry.markProcessed();
      const saved = await this.repository.save(logEntry);

      logger.info(`Processed and stored activity log id=${saved._id} user=${logEntry.userId} action=${logEntry.action}`);

      return saved;
    } catch (err) {
      logEntry.markFailed(err.message);

      // Still try to persist the failed record for observability
      try {
        await this.repository.save(logEntry);
      } catch (saveErr) {
        logger.error(`Could not persist failed log: ${saveErr.message}`);
      }

      throw err;
    }
  }
}

module.exports = ProcessActivityLog;
