const { body, validationResult } = require('express-validator');

// Validation rules for POST /api/activities
const activityValidationRules = [
  body('userId')
    .notEmpty()
    .withMessage('userId is required')
    .isString()
    .withMessage('userId must be a string')
    .trim(),
  body('action')
    .notEmpty()
    .withMessage('action is required')
    .isString()
    .withMessage('action must be a string')
    .trim(),
];

// Middleware that checks validation results and returns

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
}

module.exports = { activityValidationRules, handleValidationErrors };
