// Repository interface for ActivityLog 
// Concrete implementations live in the infrastructure layer
// and must honour every method listed here.

class ActivityLogRepository {
          async save(activityLog) {
          throw new Error('save() must be implemented by a concrete repository');
          }

          async findById(id) {
          throw new Error('findById() must be implemented by a concrete repository');
          }

          async findAll(filters, pagination) {
          throw new Error('findAll() must be implemented by a concrete repository');
          }

          async countAll(filters) {
          throw new Error('countAll() must be implemented by a concrete repository');
          }
}

module.exports = ActivityLogRepository;
