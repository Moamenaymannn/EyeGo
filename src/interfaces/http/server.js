const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const activityRoutes = require('./routes/activityRoutes');
const errorHandler = require('./middleware/errorHandler');

// Build and return a fully configured Express application
// Splitting this into its own module makes it easier to test

function createApp() {
   const app = express();

   // Security & parsing
   app.use(helmet());
   app.use(cors());
   app.use(express.json());
   app.use(express.urlencoded({ extended: false }));

   // Request logging
   app.use(morgan('short'));

   // Health check
   app.get('/health', (req, res) => {
      res.json({ status: 'ok', uptime: process.uptime() });
   });

   // API routes
   app.use('/api/activities', activityRoutes);

   // 404 catch all
   app.use((req, res) => {
      res.status(404).json({
         success: false,
         error: { message: 'Resource not found' },
      });
   });

   // Error handler
   app.use(errorHandler);

   return app;
}

module.exports = createApp;
