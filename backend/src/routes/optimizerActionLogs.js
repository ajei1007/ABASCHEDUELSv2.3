const Joi = require('joi');

const OptimizerActionLogsService = require('../services/optimizerActionLogs');
const validateRequest = require('../middlewares/validation');
const requireRole = require('../middlewares/requireRole');

const { wrapAsync } = require('../helpers');

const router = require('../utils/createRouter')();

// Validation schemas
const captureLogSchema = Joi.object({
  data: Joi.object({
    startTime: Joi.date().iso().optional(),
    endTime: Joi.date().iso().optional(),
    status: Joi.string().valid('success', 'failed').optional(),
    requestPayload: Joi.object().optional(),
    responsePayload: Joi.object().optional(),
  }).required(),
});

const getLogsQuerySchema = Joi.object({
  companyId: Joi.string().uuid().optional(),
  userId: Joi.string().uuid().optional(),
  triggerByUser: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  status: Joi.string().valid('success', 'failed').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const deleteLogSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

// Routes

// POST /api/optimizer-action-logs/capture
// Capture optimizer action log
router.post(
  '/capture',
  validateRequest(captureLogSchema),
  wrapAsync(async (req, res) => {
    // Check if user has optimizer feature permission
    const role = req.currentUser?.roles?.[0];
    if (!role || !role.optimizerFeature) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Optimizer feature permission required',
      });
    }

    const logId = await OptimizerActionLogsService.captureLog(
      req.body.data,
      req.currentUser,
    );

    res.status(200).json({
      success: true,
      message: 'Action log captured successfully',
      logId: logId,
    });
  }),
);

// GET /api/optimizer-action-logs
// Retrieve optimizer action logs with filtering and pagination
router.get(
  '/',
  requireRole('superAdmin'),
  wrapAsync(async (req, res) => {
    const { error, value } = getLogsQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: error.details,
      });
    }

    const result = await OptimizerActionLogsService.getLogs(
      value,
      req.currentUser,
    );

    res.status(200).json(result);
  }),
);

// DELETE /api/optimizer-action-logs/:id
// Soft delete a specific action log
router.delete(
  '/:id',
  requireRole('superAdmin'),
  wrapAsync(async (req, res) => {
    const { error, value } = deleteLogSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid log ID',
        errors: error.details,
      });
    }

    await OptimizerActionLogsService.deleteLog(value.id, req.currentUser);

    res.status(200).json({
      success: true,
      message: 'Action log deleted successfully',
    });
  }),
);

module.exports = router;
