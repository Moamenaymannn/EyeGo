const { Router } = require('express');

const IngestActivityLog = require('../../../application/useCases/IngestActivityLog');
const FetchActivityLogs = require('../../../application/useCases/FetchActivityLogs');
const MongoActivityLogRepository = require('../../../infrastructure/repositories/MongoActivityLogRepository');

const { activityValidationRules,handleValidationErrors} 
      = require('../middleware/validation');

const router = Router();
const repository = new MongoActivityLogRepository();

// POST /api/activities
// Accept a new activity log and produce it to Kafka

router.post('/',activityValidationRules,handleValidationErrors,
   async (req, res, next) => {
      try {
            const ingest = new IngestActivityLog();
            const result = await ingest.execute(req.body);

            res.status(201).json({ success: true, data: result });
      } catch (err) {
            next(err);
      }
   },
);

// GET /api/activities
// Fetch processed logs with pagination + filtering.

router.get('/', async (req, res, next) => {
      try {
            const fetchLogs = new FetchActivityLogs(repository);
            const result = await fetchLogs.execute(req.query);
            res.json({ success: true, ...result });
      } catch (err) {
            next(err);
      }
});

// GET /api/activities/:id
// Fetch a single processed log by (_id)
router.get('/:id', async (req, res, next) => {
      try {
            const doc = await repository.findById(req.params.id);
            if (!doc) {
                  return res.status(404).json({
                        success: false,
                        error: { message: 'Activity log not found' },
                  });
            }
            res.json({ success: true, data: doc });
      } catch (err) {
            next(err);
      }
});

module.exports = router;
