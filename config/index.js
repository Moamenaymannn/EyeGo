const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const config = {
   server: {
      port: parseInt(process.env.PORT, 10) || 3000,
      env: process.env.NODE_ENV || 'development',
   },
   mongo: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/activity_tracker',
   },
   kafka: {
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      clientId: process.env.KAFKA_CLIENT_ID || 'activity-tracker-service',
      groupId: process.env.KAFKA_GROUP_ID || 'activity-log-processors',
      topic: process.env.KAFKA_TOPIC || 'user-activity-logs',
   },
};

module.exports = config;
