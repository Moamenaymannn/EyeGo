// ActivityLog domain entity
// Represents a single user activity event after it has been processed   
// The constructor enforces the shape we expect from every log record 
 

class ActivityLog {
          constructor({ userId, action,timestamp }) {
          if (!userId || !action) {
          throw new Error('userId and action are required to create an ActivityLog');
          }

          this.userId = userId;
          this.action = action;
          this.timestamp = timestamp || new Date();

          // Filled after processing
          this.processedAt = null;
          this.status = 'pending';
          }

          
          // Mark this log as successfully processed.
           
          markProcessed() {
          this.processedAt = new Date();
          this.status = 'processed';
          }

          
          // Mark this log as failed during processing.
           
          markFailed(reason) {
          this.processedAt = new Date();
          this.status = 'failed';
          this.failureReason = reason || 'unknown error';
          }

          
          // Returns a plain object that is safe for Kafka
           
          toJSON() {
          return {
          userId: this.userId,
          action: this.action,
          timestamp: this.timestamp,
          processedAt: this.processedAt,
          status: this.status,
          failureReason: this.failureReason || undefined,
          };
          }
}

module.exports = ActivityLog;
