const config = require('../config');
const logger = require('./infrastructure/logging/logger');
const createApp = require('./interfaces/http/server');

const { connectToMongo, disconnectMongo } = require('./infrastructure/database/mongoConnection');
const { startConsumer, disconnectConsumer } = require('./infrastructure/messaging/consumer');
const { disconnectProducer } = require('./infrastructure/messaging/producer');

const ProcessActivityLog = require('./application/useCases/ProcessActivityLog');
const MongoActivityLogRepository = require('./infrastructure/repositories/MongoActivityLogRepository');

// Application entry point
//   1. Connect to MongoDB
//   2. Start the Kafka consumer
//   3. Start the HTTP server

async function main() {
   try {
      // 1. Database
      await connectToMongo();

      // 2. Kafka consumer
      const repository = new MongoActivityLogRepository();
      const processLog = new ProcessActivityLog(repository);
      await startConsumer((message) => processLog.execute(message));

      // 3. HTTP server
      const app = createApp();
      const port = config.server.port;

      const server = app.listen(port, () => {
         logger.info(
            `Activity Tracker service listening on port ${port} (env=${config.server.env})`,
         );
      });

      // Graceful shutdown
      const shutdown = async (signal) => {
         logger.info(`Received ${signal} shutting down gracefully`);

         server.close(async () => {
            await disconnectConsumer();
            await disconnectProducer();
            await disconnectMongo();
            logger.info('All connections closed');
            process.exit(0);
         });

         // Force kill if graceful shutdown takes too long
         setTimeout(() => {
            logger.warn('Forceful shutdown after timeout');
            process.exit(1);
         }, 10000);
      };

      process.on('SIGTERM', () => shutdown('SIGTERM'));
      process.on('SIGINT', () => shutdown('SIGINT'));
   } catch (err) {
      logger.error(`Fatal startup error: ${err.message}`);
      process.exit(1);
   }
}

main();


