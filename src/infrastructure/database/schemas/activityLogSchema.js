const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
          userId: {
             type: String,
             required: true,
             index: true,
          },
          action: {
             type: String,
             required: true,
             index: true,
          },
          timestamp: {
             type: Date,
             default: Date.now,
          },
          processedAt: {
             type: Date,
             default: null,
             index: true,
          },
          status: {
             type: String,
             enum: ['pending', 'processed', 'failed'],
             default: 'pending',
             index: true,
          },
          failureReason: {
             type: String,
             default: null,
          },
          },
 {
          timestamps: true, 
          collection: 'activitylogs',
 },
);


activityLogSchema.index({ userId: 1, action: 1, processedAt: -1 });

const ActivityLogModel = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLogModel;
