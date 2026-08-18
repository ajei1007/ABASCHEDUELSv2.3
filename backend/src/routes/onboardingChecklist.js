const Joi = require('joi');

const OnboardingChecklistService = require('../services/onboardingChecklist');
const validateRequest = require('../middlewares/validation');
const router = require('../utils/createRouter')();

const toggleTaskSchema = Joi.object({
  checklistItemId: Joi.string().uuid().required(),
});

/**
 * @swagger
 * tags:
 *   name: OnboardingChecklist
 *   description: API endpoints for managing onboarding checklist
 */

/**
 * @swagger
 * /api/onboardingChecklist:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [OnboardingChecklist]
 *     summary: Get company onboarding checklists
 *     description: Retrieve all onboarding checklists for the current user's company
 *     responses:
 *       200:
 *         description: Checklists successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   checklist:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Template ID
 *                       title:
 *                         type: string
 *                         description: Template title
 *                       description:
 *                         type: string
 *                         description: Template description
 *                       order:
 *                         type: integer
 *                         description: Template order
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             title:
 *                               type: string
 *                             content:
 *                               type: string
 *                             order:
 *                               type: integer
 *                             isCompleted:
 *                               type: boolean
 *                             completedAt:
 *                               type: string
 *                               format: date-time
 *                               nullable: true
 *                               description: Completion timestamp
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - viewOnboardingChecklist permission required
 *       404:
 *         description: Checklist item not found for this company
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  const payload = await OnboardingChecklistService.getCompanyChecklist(
    req.currentUser
  );

  res.status(200).send(payload);
});

/**
 * @swagger
 * /api/onboardingChecklist/toggle-complete:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags: [OnboardingChecklist]
 *     summary: Toggle a checklist task completion
 *     description: Toggle a checklist item completion state (superAdmin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               checklistItemId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the checklist item to toggle
 *     responses:
 *       200:
 *         description: Task completion state successfully toggled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isCompleted:
 *                   type: boolean
 *                   description: New completion state (true for completed, false for not completed)
 *                 completedAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   description: Completion timestamp (null if task is not completed)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only superAdmin can toggle tasks or viewOnboardingChecklist permission required
 *       404:
 *         description: Checklist item not found
 *       500:
 *         description: Internal server error
 */
router.post('/toggle-complete', validateRequest(toggleTaskSchema), async (req, res) => {
  const { checklistItemId } = req.body;
  
  const payload = await OnboardingChecklistService.toggleTask(
    checklistItemId,
    req.currentUser,
  );

  res.status(200).send(payload);
});

module.exports = router; 