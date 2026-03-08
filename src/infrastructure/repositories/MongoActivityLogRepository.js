const ActivityLogModel = require('../database/schemas/activityLogSchema');
const ActivityLogRepository = require('../../domain/repositories/ActivityLogRepository');

// Here implementation of the ActivityLogRepository contract
// This is the only class in the codebase that talks directly to Mongoose
// for activity logs every other layer goes through the repository interface

class MongoActivityLogRepository extends ActivityLogRepository {
  async save(activityLog) {
    const doc = new ActivityLogModel(activityLog.toJSON());
    const saved = await doc.save();
    return saved.toObject();
  }

  async findById(id) {
    const doc = await ActivityLogModel.findById(id).lean();
    return doc || null;
  }

   //  List activity logs with optional filters and pagination
   //  filters { userId, action, startDate, endDate, status }
   //  pagination { page, limit, sortBy, sortOrder }

  async findAll(filters = {}, pagination = {}) {
    const query = this.buildQuery(filters);

    const page = Math.max(parseInt(pagination.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(pagination.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const sortField = pagination.sortBy || 'processedAt';
    const sortDir = pagination.sortOrder === 'asc' ? 1 : -1;

    const docs = await ActivityLogModel
      .find(query)
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(limit)
      .lean();

    return docs;
  }

  async countAll(filters = {}) {
    const query = this.buildQuery(filters);
    return ActivityLogModel.countDocuments(query);
  }

  // private helpers

  buildQuery(filters) {
    const query = {};

    if (filters.userId) {
      query.userId = filters.userId;
    }
    if (filters.action) {
      query.action = filters.action;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.startDate || filters.endDate) {
      query.processedAt = {};
      if (filters.startDate) {
        query.processedAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.processedAt.$lte = new Date(filters.endDate);
      }
    }

    return query;
  }
}

module.exports = MongoActivityLogRepository;
