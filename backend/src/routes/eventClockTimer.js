// /routes/eventClockTimer.js
const router = require('../utils/createRouter')();
const EventClockTimerService = require('../services/eventClockTimer'); 
const EventClockTimerDBApi = require('../db/api/eventClockTimer');
const Joi = require('joi');
const validateRequest = require('../middlewares/validation');

// Validation schemas
const clockInSchema = Joi.object({
  event_id: Joi.string().uuid().required(),
  start_time: Joi.date().iso().required(),
  lat_start: Joi.number().optional(),
  lon_start: Joi.number().optional()
});

const clockOutSchema = Joi.object({
  end_time: Joi.date().iso().required(),
  lat_end: Joi.number().optional(),
  lon_end: Joi.number().optional(),
  note: Joi.string().max(1000).optional()
});

/**
 * @swagger
 * tags:
 *   name: EventClockTimer
 *   description: Event time tracking API
 */

/**
 * @swagger
 * /api/eventClockTimer/clock-in:
 *   post:
 *     tags: [EventClockTimer]
 *     summary: Start time tracking
 *     security: [{bearerAuth: []}]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event_id:
 *                 type: string
 *                 format: uuid
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               lat_start:
 *                 type: number
 *               lon_start:
 *                 type: number
 *             required: [event_id, start_time]
 *     responses:
 *       201:
 *         description: Success
 *       400:
 *         description: Invalid input
 */
router.post('/clock-in', validateRequest(clockInSchema), async (req, res) => {
    const clockRecord = await EventClockTimerService.create(req.body, req.currentUser);
    
    return res.status(201).json({
      id: clockRecord.id,
      event_id: clockRecord.event_id,
      start_time: clockRecord.start_time,
      lat_start: clockRecord.lat_start,
      lon_start: clockRecord.lon_start,
      createdAt: clockRecord.createdAt,
    });
  } 
);

/**
 * @swagger
 * /api/eventClockTimer/clock-out/{id}:
 *   put:
 *     tags: [EventClockTimer]
 *     summary: End time tracking
 *     security: [{bearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               lat_end:
 *                 type: number
 *               lon_end:
 *                 type: number
 *               note:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Optional note explaining why the user is clocking out early
 *             required: [end_time]
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid input
 */
router.put('/clock-out/:id', validateRequest(clockOutSchema), async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    
    const updatedRecord = await EventClockTimerService.update(id, data, req.currentUser);

    return res.status(200).json({
      id: updatedRecord.id,
      event_id: updatedRecord.event_id,
      user_id: updatedRecord.user_id,
      start_time: updatedRecord.start_time,
      end_time: updatedRecord.end_time,
      duration_seconds: updatedRecord.duration_seconds,
      lat_start: updatedRecord.lat_start,
      lon_start: updatedRecord.lon_start,
      lat_end: updatedRecord.lat_end,
      lon_end: updatedRecord.lon_end,
      note: updatedRecord.note,
      updatedAt: updatedRecord.updatedAt,
    });
});

/**
 * @swagger
 * /api/eventClockTimer/{eventId}/clock-logs:
 *   get:
 *     tags: [EventClockTimer]
 *     summary: Get event clock logs
 *     security: [{bearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: start_time
 *         schema:
 *           type: string
 *       - in: query
 *         name: end_time
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:eventId/clock-logs', async (req, res) => {
    const { eventId } = req.params;
    const filters = req.query;
    
    const result = await EventClockTimerService.getClockLogs(eventId, filters, req.currentUser);
    
    return res.status(200).json(result);
});

/**
 * @swagger
 * /api/eventClockTimer/{id}:
 *   delete:
 *     tags: [EventClockTimer]
 *     summary: Delete clock record
 *     security: [{bearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Success
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    await EventClockTimerService.remove(id, req.currentUser);
    
    return res.status(204).send();
});

/**
 * @swagger
 * /api/eventClockTimer/active-log/user/{userId}:
 *   get:
 *     tags: [EventClockTimer]
 *     summary: Get user's active log
 *     security: [{bearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: No active log found
 */
router.get('/active-log/user/:userId', async (req, res) => {
    const { userId } = req.params;
    
    const activeLog = await EventClockTimerDBApi.getLastActiveLogForUser(userId);
    
    if (!activeLog) {
      return res.status(404).json({ message: 'No active log found for this user' });
    }
    
    return res.status(200).json(activeLog);
});

module.exports = router;