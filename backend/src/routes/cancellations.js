const express = require('express');

const CancellationsService = require('../services/cancellations');
const CancellationsDBApi = require('../db/api/cancellations');
const EventsDBApi = require('../db/api/events');
const BranchesDBApi = require('../db/api/branches');
const { getRoleHierarchy } = require('../utils/roleHierarchy');

const AvailabilitiesService = require('../services/availabilities');
const passport = require('passport');
const wrapAsync = require('../helpers').wrapAsync;
const moment = require('moment');
const router = require('../utils/createRouter')();

/**
 *  * @swagger
 *  components:
 *    schemas:
 *      Cancellations:
 *        type: object
 *        properties:

 */

/**
 *  * @swagger
 * tags:
 *   name: Cancellations
 *   description: The Cancellations managing API
 */

/**
 *  * @swagger
 *  /api/cancellations:
 *    post:
 *      security:
 *        - bearerAuth: []
 *      tags: [Cancellations]
 *      summary: Add new item
 *      description: Add new item
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *                data:
 *                  description: Data of the updated item
 *                  type: object
 *                  $ref: "#/components/schemas/Cancellations"
 *      responses:
 *        200:
 *          description: The item was successfully added
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/Cancellations"
 *        401:
 *          $ref: "#/components/responses/UnauthorizedError"
 *        405:
 *          description: Invalid input data
 *        500:
 *          description: Some server error
 */

router.post('/', async (req, res) => {
  await CancellationsService.create(
    req.body.data,
    req.currentUser,
    true,
    req.headers.referer,
  );
  const payload = true;
  res.status(200).send(payload);
});

router.post(
  '/create/multiple',
  wrapAsync(async (req, res) => {
    const cancellations = req.body.arr;
    let cancellationArray = [];
    for (const obj of cancellations) {
      cancellationArray.push({
        id: obj.data.id || undefined,
        date: obj.data.date || null,
        rescheduled: obj.data.rescheduled || false,
        partialRescheduled: obj.data.partialRescheduled || false,
        importHash: obj.data.importHash || null,
        eventId: obj.data.event || null,
        userId: obj.data.user || null,
        reasonId: obj.data.reason || null,
        createdById: req.currentUser.id,
        updatedById: req.currentUser.id,
      });
    }
    await CancellationsService.createBulk(
      cancellationArray,
      req.currentUser,
      true,
      req.headers.referer,
    );

    res.status(200).send(true);
  }),
);

/**
 *  * @swagger
 *  /api/cancellations/{id}:
 *    put:
 *      security:
 *        - bearerAuth: []
 *      tags: [Cancellations]
 *      summary: Update the data of the selected item
 *      description: Update the data of the selected item
 *      parameters:
 *        - in: path
 *          name: id
 *          description: Item ID to update
 *          required: true
 *          schema:
 *            type: string
 *      requestBody:
 *        description: Set new item data
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
 *                  $ref: "#/components/schemas/Cancellations"
 *              required:
 *                - id
 *      responses:
 *        200:
 *          description: The item data was successfully updated
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/Cancellations"
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
    const payload = await CancellationsService.update(
      req.body.data,
      req.body.id,
      req.currentUser,
    );
    res.status(200).send(payload);
  }),
);

router.put(
  '/update/multiple',
  wrapAsync(async (req, res) => {
    const cancellations = req.body.arr;
    let responseBody = [];
    // TODO optimize
    for (const cancellation of cancellations) {
      const payload = await CancellationsService.update(
        cancellation.data,
        cancellation.id,
        req.currentUser,
      );
      responseBody = [...responseBody, payload];
    }
    res.status(200).send(responseBody);
  }),
);

/**
 * * @swagger
 *  /api/cancellations/{id}:
 *    delete:
 *      security:
 *        - bearerAuth: []
 *      tags: [Cancellations]
 *      summary: Delete the selected item
 *      description: Delete the selected item
 *      parameters:
 *        - in: path
 *          name: id
 *          description: Item ID to delete
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: The item was successfully deleted
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/Cancellations"
 *        400:
 *          description: Invalid ID supplied
 *        401:
 *          $ref: "#/components/responses/UnauthorizedError"
 *        404:
 *          description: Item not found
 *        500:
 *          description: Some server error
 */

router.post(
  '/remove/multiple',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    ids = [];
    for (const cancellationId of req.body.toBeDeletedIds) {
      ids.push(cancellationId);
    }
    await CancellationsService.removeBulk(ids, req.currentUser);
    res.status(200).send(true);
  }),
);

router.delete(
  '/:id',
  wrapAsync(async (req, res) => {
    await CancellationsService.remove(req.params.id, req.currentUser);
    const payload = true;
    res.status(200).send(payload);
  }),
);

/**
 *  * @swagger
 *  /api/cancellations:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      tags: [Cancellations]
 *      summary: Get all cancellations
 *      description: Get all cancellations
 *      responses:
 *        200:
 *          description: Cancellations list successfully received
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: "#/components/schemas/Cancellations"
 *        401:
 *          $ref: "#/components/responses/UnauthorizedError"
 *        404:
 *          description: Data not found
 *        500:
 *          description: Some server error
 */

router.get(
  '/',
  wrapAsync(async (req, res) => {
    if (req.query.branches) {
      req.query.branches = await BranchesDBApi.getDescendentBranches({
        branchIds: req.query.branches,
      });
    } else {
      res.status(200).send({ rows: [], count: 0 });
      return;
    }

    if (!req.query.companyId) {
      req.query.companyId = req.currentUser.companyId;
    }

    const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);

    let roleList = [];
    if (req.query.role) {
      let mainRole = req.query.role;
      Object.entries(roleHierarchy).map((t) => {
        const [key, value] = t;
        if (value.includes(mainRole)) {
          roleList.push(key);
        }
      });
    }

    req.query.roles = roleList

    if (req.query.start) {
      req.query.start = moment.utc(req.query.start).format('YYYY-MM-DD HH:mm:ss');
    }
  
    if (req.query.end) {
      req.query.end = moment.utc(req.query.end).format('YYYY-MM-DD HH:mm:ss');
    }

    // If cancelledByUserRole is provided, filter roles based on hierarchy
    // populate req.query.cancelledByUserRoles 
    // with all roles that are equal or higher in the hierarchy
    req.query.cancelledByUserRoles = (() => {
      const { cancelledByUserRole } = req.query;
      if (!cancelledByUserRole) {
        return [];
      }
      return Object.entries(roleHierarchy)
        .filter(([_, value]) => value.includes(cancelledByUserRole))
        .map(([key]) => key);
    })();
  
    const payload = await EventsDBApi.findAllForCancellationTable({
      ...req.query,
      companyId: req.currentUser.companyId,
    });

    const getUserRole = (roles = []) => {
      const roleNames = roles.map((r) => r.name);
      const allRoles = Array.from(
        new Set(
          roleNames.flatMap((role) => [role, ...(roleHierarchy[role] || [])]),
        ),
      );

      if (allRoles.includes('Employee')) {
        return 'Employee';
      }
      if (allRoles.includes('Client')) {
        return 'Client';
      }

      return 'Person';
    };

    let cancellation = new Array();
    for (let i = 0; i < payload.rows.length; i++) {
      let c = {};

      c.event = {
        id: payload.rows[i].id,
        start: payload.rows[i].start,
        end: payload.rows[i].end,
        activity0: {
          id: payload.rows[i].activity0.id,
          firstName: payload.rows[i].activity0.firstName,
        },
        F: payload.rows[i].F,
        M: payload.rows[i].M,
        R: payload.rows[i].R,
        S: payload.rows[i].S,
        T: payload.rows[i].T,
        U: payload.rows[i].U,
        W: payload.rows[i].W,
        startRecur: payload.rows[i].startRecur,
        endRecur: payload.rows[i].endRecur,
        description: payload.rows[i].description,
        users : payload.rows[i].users,
        timezone: payload.rows[i].timezone,
        location0: payload.rows[i].location0,
      };
      c.date = payload.rows[i].startRecur,

      c.reason = {
        id: payload.rows[i].cancellationReason?.id,
        name: payload.rows[i].cancellationReason?.name,
      };
      c.user = {
        id: payload.rows[i].cancelledByUser?.id,
        firstName: payload.rows[i].cancelledByUser?.firstName,
        lastName: payload.rows[i].cancelledByUser?.lastName,
        mainRole: getUserRole(payload.rows[i].cancelledByUser?.roles || []),
      };

      cancellation.push(c);
    }

    res.status(200).send({ rows: cancellation, count: payload.count });
  }),
);

router.get('/autocomplete', async (req, res) => {
  const payload = await CancellationsDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
    { companyId: req.currentUser.companyId },
  );

  res.status(200).send(payload);
});

/**
 * * @swagger
 *  /api/cancellations/{id}:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      tags: [Cancellations]
 *      summary: Get selected item
 *      description: Get selected item
 *      parameters:
 *        - in: path
 *          name: id
 *          description: ID of item to get
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Selected item successfully received
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/Cancellations"
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
    const payload = await CancellationsDBApi.findBy({ id: req.params.id });

    res.status(200).send(payload);
  }),
);

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
