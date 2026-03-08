const logger = require('../../infrastructure/logging/logger');

// Fetch processed activity logs with pagination and filtering

class FetchActivityLogs {
  constructor(activityLogRepository) {
    this.repository = activityLogRepository;
  }

  async execute(queryParams = {}) {
    const filters = {
      userId: queryParams.userId || undefined,
      action: queryParams.action || undefined,
      status: queryParams.status || undefined,
      startDate: queryParams.startDate || undefined,
      endDate: queryParams.endDate || undefined,
    };

    // Strip out undefined keys to keep the query clean
    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const pagination = {
      page: queryParams.page || 1,
      limit: queryParams.limit || 20,
      sortBy: queryParams.sortBy || 'processedAt',
      sortOrder: queryParams.sortOrder || 'desc',
    };

    const [logs, totalCount] = await Promise.all([
      this.repository.findAll(filters, pagination),
      this.repository.countAll(filters),
    ]);

    const totalPages = Math.ceil(totalCount / pagination.limit);

    logger.debug(
      `Fetched ${logs.length} logs page ${pagination.page}/${totalPages}`,
    );

    return {
      data: logs,
      pagination: {
        currentPage: parseInt(pagination.page, 10),
        perPage: parseInt(pagination.limit, 10),
        totalItems: totalCount,
        totalPages,
      },
    };
  }
}

module.exports = FetchActivityLogs;
