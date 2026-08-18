const express = require('express');
const passport = require('passport');
const wrapAsync = require('../../helpers').wrapAsync;
const AvailabilitiesDBApi = require('../../db/api/availabilities');
const AvailabilitiesService = require('../../services/availabilities');
const dayIds = require('../../constants/days')

const router = require('../../utils/createRouter')();

const daysOfWeek = [
  {
    id: dayIds.sunday_id,
    name:'Sunday',
  },
  {
    id: dayIds.monday_id,
    name:'Monday',
  },
  {
    id: dayIds.tuesday_id,
    name:'Tuesday',
  },
  {
    id: dayIds.wednesday_id,
    name:'Wednesday',
  },
  {
    id: dayIds.thursday_id,
    name:'Thursday',
  },
  {
    id: dayIds.friday_id,
    name:'Friday',
  },
  {
    id: dayIds.saturday_id,
    name:'Saturday',
  },
];

const getDays = (data) => {
  const days = [];
  if (data.U == 1) {
    days.push(daysOfWeek[0]);
  }
  if (data.M == 1) {
    days.push(daysOfWeek[1]);
  }
  if (data.T == 1) {
    days.push(daysOfWeek[2]);
  }
  if (data.W == 1) {
    days.push(daysOfWeek[3]);
  }
  if (data.R == 1) {
    days.push(daysOfWeek[4]);
  }
  if (data.F == 1) {
    days.push(daysOfWeek[5]);
  }
  if (data.S == 1) {
    days.push(daysOfWeek[6]);
  }
  return days;
}

/**
 *  @swagger
 * tags:
 *   name: Availabilities
 *   description: The Branches managing API
 */

/**
 *  @swagger
 *  components:
 *    schemas:
 *      Availabilities for integartion:
 *        type: object
 *        required: [id, startRange, endRange, startTime, endTime, userId, disabled, available, location, days]
 *        properties:
 *          id:
 *            type: string
 *            default: 00000000-00000000-00000000-00000000
 *          startRange:
 *            type: string
 *            default: 2023-01-01
 *          endRange:
 *            type: string
 *            default: 2023-12-31
 *          startTime:
 *            type: string
 *            default: 2023-01-01T13:00:00Z
 *          endTime:
 *            type: string
 *            default: 2023-01-01T14:00:00Z
 *          userId:
 *            type: string
 *            default: 00000000-00000000-00000000-00000000
 *          disabled:
 *            type: boolean
 *            default: false
 *          timezone:
 *            type: string
 *            default: Asia/Ashgabat
 *          available:
 *            type: boolean
 *            default: true
 *          location:
 *            type: array
 *            items:
 *              type: object
 *            example: [{'id':'1472b8a6-9435-444d-aa02-c3f1a2c8d44d', 'name':'location1'}, {'id':'2dd63a97-f856-4df9-b08e-3d7ace1b3f37', 'name':'location1'}]
 *          days:
 *            type: array
 *            items:
 *              type: object
 *            example: [{'id':'1472b8a6-9435-444d-aa02-c3f1a2c8d44d', 'name':'Monday'}, {'id':'2dd63a97-f856-4df9-b08e-3d7ace1b3f37', 'name':'Thursday'}]
 */

/**
 *  @swagger
 *  components:
 *    schemas:
 *      AvailabilityCreateUpdate:
 *        type: object
 *        required: [startTime, endTime, days, startRange, endRange, user]
 *        properties:
 *          startTime:
 *            type: string
 *            format: date-time
 *            default: 2022-02-28T15:00:00+05:00
 *          endTime:
 *            type: string
 *            format: date-time
 *            default: 2022-02-28T20:00:00+05:00
 *          days:
 *            type: array
 *            items:
 *              type: string
 *            example: ['day_id' , 'day_id']
 *          timezone:
 *            type: string
 *            default: America/New_York
 *          location2:
 *            type: string
 *            default: location_id
 *          user:
 *            type: string
 *            default: user_id
 *          startRange:
 *            type: string
 *            format: date
 *            default: 2022-11-27
 *          endRange:
 *            type: string
 *            format: date
 *            default: 2023-12-30
 *          available:
 *            type: boolean
 *            default: true
 */

/**
 * @swagger
 *  /api/integrations/availabilities:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      tags: [Availabilities]
 *      summary: Get Availabilities
 *      description: Get Availabilities list for integration purpose.
 *      responses:
 *        200:
 *          description: Selected item successfully received
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  count:
 *                    type: integer
 *                  rows:
 *                    type: array
 *                    items:
 *                      $ref: "#/components/schemas/Availabilities for integartion"
 *        400:
 *          description: Invalid ID supplied
 *        401:
 *          $ref: "#/components/responses/UnauthorizedError"
 *        404:
 *          description: Item not found
 *        500:
 *          description: Some server error
 */
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    delete req.query.limit;
    delete req.query.page;

    const payload = await AvailabilitiesDBApi.findAll({
      ...req.query,
      companyId: req.currentUser.companyId,
    });

    for (let i = 0; i < payload.count; i++) {
      let obj = payload.rows[i];
      let newObj = {};
      newObj.id = obj.id;
      newObj.startRange = obj.startRange;
      newObj.endRange = obj.endRange;
      newObj.startTime = obj.startTime;
      newObj.endTime = obj.endTime;
      newObj.userId = obj.userId;
      newObj.timezone = '';
      newObj.disabled = obj.disabled;
      newObj.available = obj.available;
      newObj.location = new Array();
      newObj.days = getDays(obj);
      if (obj.location2) {
        for (let j = 0; j < obj.location2.length; j++) {
          newObj.location.push({
            id: obj.location2[j].id,
            name: obj.location2[j].firstName,
          });
        }
      }
      payload.rows[i] = newObj;
    }

    res.status(200).send(payload);
  }),
);

/**
 *  @swagger
 *  /api/integrations/availabilities:
 *    post:
 *      security:
 *        - bearerAuth: []
 *      tags: [Availabilities]
 *      summary: Add new availability
 *      description: Add new availability
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *                data:
 *                  description: Data of the updated item
 *                  type: object
 *                  $ref: "#/components/schemas/AvailabilityCreateUpdate"
 *      responses:
 *        200:
 *          description: The item was successfully added
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/Availabilities for integartion"
 *        401:
 *          $ref: "#/components/responses/UnauthorizedError"
 *        405:
 *          description: Invalid input data
 *        500:
 *          description: Some server error
 */

router.post('/', async (req, res) => {
  let availability = await AvailabilitiesService.create(
    req.body.data,
    req.currentUser,
    true,
    req.headers.referer,
  );
  
  const payload = await AvailabilitiesDBApi.findBy({ id: availability.id });

  if (!payload) {
    res.status(404).send("not found");
    return
  }


  let newObj = {};
  newObj.id = payload.id;
  newObj.startRange = payload.startRange;
  newObj.endRange = payload.endRange;
  newObj.startTime = payload.startTime;
  newObj.endTime = payload.endTime;
  newObj.userId = payload.userId;
  newObj.timezone = '';
  newObj.disabled = payload.disabled;
  newObj.available = payload.available;
  newObj.location = new Array();
  newObj.days = getDays(payload);
  if (payload.location2) {
    for (let j = 0; j < payload.location2.length; j++) {
      newObj.location.push({
        id: payload.location2[j].id,
        name: payload.location2[j].firstName,
      });
    }
  }

  res.status(200).send(newObj);
});

/**
 *  @swagger
 *  /api/integrations/availabilities/{id}:
 *    put:
 *      security:
 *        - bearerAuth: []
 *      tags: [Availabilities]
 *      summary: Update the data of the selected availability
 *      description: Update the data of the selected availability
 *      parameters:
 *        - in: path
 *          name: id
 *          description: availability ID to update
 *          required: true
 *          schema:
 *            type: string
 *      requestBody:
 *        description: Set new availability data
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *                id:
 *                  description: ID of the updated item
 *                  type: string
 *                data:
 *                  description: Data of the updated item
 *                  type: object
 *                  $ref: "#/components/schemas/AvailabilityCreateUpdate"
 *              required: [id, data]
 *      responses:
 *        200:
 *          description: The item data was successfully updated
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/Availabilities for integartion"
 *        400:
 *          description: Invalid ID supplied
 *        401:
 *          $ref: "#/components/responses/UnauthorizedError"
 *        404:
 *          description: Item not found
 *        500:
 *          description: Some server error
 */

router.put(
  '/:id',
  wrapAsync(async (req, res) => {
    await AvailabilitiesService.update(
      req.body.data,
      req.body.id,
      req.currentUser,
    );
    const payload = await AvailabilitiesDBApi.findBy({ id: req.params.id });

    if (!payload) {
      res.status(404).send("not found");
      return
    }


    let newObj = {};
    newObj.id = payload.id;
    newObj.startRange = payload.startRange;
    newObj.endRange = payload.endRange;
    newObj.startTime = payload.startTime;
    newObj.endTime = payload.endTime;
    newObj.userId = payload.userId;
    newObj.timezone = '';
    newObj.disabled = payload.disabled;
    newObj.available = payload.available;
    newObj.location = new Array();
    newObj.days = getDays(payload);
    if (payload.location2) {
      for (let j = 0; j < payload.location2.length; j++) {
        newObj.location.push({
          id: payload.location2[j].id,
          name: payload.location2[j].firstName,
        });
      }
    }

    res.status(200).send(newObj);
  }),
);

/**
 *  @swagger
 *  /api/integrations/availabilities/{id}:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      tags: [Availabilities]
 *      summary: Get the availability by id
 *      description: Get the availability by id
 *      parameters:
 *        - in: path
 *          name: id
 *          description: availability ID to get
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: The item data was successfully updated
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/Availabilities for integartion"
 *        400:
 *          description: Invalid ID supplied
 *        401:
 *          $ref: "#/components/responses/UnauthorizedError"
 *        404:
 *          description: Item not found
 *        500:
 *          description: Some server error
 */

router.get(
  '/:id',
  wrapAsync(async (req, res) => {
    const payload = await AvailabilitiesDBApi.findBy({ id: req.params.id });

    if (!payload) {
      res.status(404).send("not found");
      return
    }

    let newObj = {};
    newObj.id = payload.id;
    newObj.startRange = payload.startRange;
    newObj.endRange = payload.endRange;
    newObj.startTime = payload.startTime;
    newObj.endTime = payload.endTime;
    newObj.userId = payload.userId;
    newObj.timezone = '';
    newObj.disabled = payload.disabled;
    newObj.available = payload.available;
    newObj.location = new Array();
    newObj.days = getDays(payload);
    if (payload.location2) {
      for (let j = 0; j < payload.location2.length; j++) {
        newObj.location.push({
          id: payload.location2[j].id,
          name: payload.location2[j].firstName,
        });
      }
    }
    
    res.status(200).send(newObj);
  }),
);

router.use('/', require('../../helpers').commonErrorHandler);

module.exports = router;
