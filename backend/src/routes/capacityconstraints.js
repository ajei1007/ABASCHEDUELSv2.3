
const express = require('express');

const CapacityconstraintsService = require('../services/capacityconstraints');
const CapacityconstraintsDBApi = require('../db/api/capacityconstraints');
const wrapAsync = require('../helpers').wrapAsync;

const router = require('../utils/createRouter')();

/**
 *  * @swagger
 *  components:
 *    schemas:
 *      Capacityconstraints:
 *        type: object
 *        properties:

 *          min1:
 *            type: integer
 *            format: int64
 *          max1:
 *            type: integer
 *            format: int64
 *          min2:
 *            type: integer
 *            format: int64
 *          max2:
 *            type: integer
 *            format: int64
 *          min3:
 *            type: integer
 *            format: int64
 *          max3:
 *            type: integer
 *            format: int64
 *          min4:
 *            type: integer
 *            format: int64
 *          max4:
 *            type: integer
 *            format: int64
 *          priority:
 *            type: integer
 *            format: int64
 *          min5:
 *            type: integer
 *            format: int64
 *          max5:
 *            type: integer
 *            format: int64

 */

/**
 *  * @swagger
 * tags:
 *   name: Capacityconstraints
 *   description: The Capacityconstraints managing API
 */

  /**
  *  * @swagger
  *  /api/capacityconstraints:
  *    post:
  *      security:
  *        - bearerAuth: []
  *      tags: [Capacityconstraints]
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
  *                  $ref: "#/components/schemas/Capacityconstraints"
  *      responses:
  *        200:
  *          description: The item was successfully added
  *          content:
  *            application/json:
  *              schema:
  *                $ref: "#/components/schemas/Capacityconstraints"
  *        401:
  *          $ref: "#/components/responses/UnauthorizedError"
  *        405:
  *          description: Invalid input data
  *        500:
  *          description: Some server error
  */

router.post('/', async (req, res) => {
    await CapacityconstraintsService.create(req.body.data, req.currentUser, true, req.headers.referer);
    const payload = true;
    res.status(200).send(payload);
});

  /**
  *  * @swagger
  *  /api/capacityconstraints/{id}:
  *    put:
  *      security:
  *        - bearerAuth: []
  *      tags: [Capacityconstraints]
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
  *                  $ref: "#/components/schemas/Capacityconstraints"
  *              required:
  *                - id
  *      responses:
  *        200:
  *          description: The item data was successfully updated
  *          content:
  *            application/json:
  *              schema:
  *                $ref: "#/components/schemas/Capacityconstraints"
  *        400:
  *          description: Invalid ID supplied
  *        401:
  *          $ref: "#/components/responses/UnauthorizedError"
  *        404:
  *          description: Item not found
  *        500:
  *          description: Some server error
  */

router.put('/:id', wrapAsync(async (req, res) => {
  await CapacityconstraintsService.update(req.body.data, req.body.id, req.currentUser);
  const payload = true;
  res.status(200).send(payload);
}));

  /**
  * * @swagger
  *  /api/capacityconstraints/{id}:
  *    delete:
  *      security:
  *        - bearerAuth: []
  *      tags: [Capacityconstraints]
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
  *                $ref: "#/components/schemas/Capacityconstraints"
  *        400:
  *          description: Invalid ID supplied
  *        401:
  *          $ref: "#/components/responses/UnauthorizedError"
  *        404:
  *          description: Item not found
  *        500:
  *          description: Some server error
  */

router.delete('/:id', wrapAsync(async (req, res) => {
  await CapacityconstraintsService.remove(req.params.id, req.currentUser);
  const payload = true;
  res.status(200).send(payload);
}));

  /**
  *  * @swagger
  *  /api/capacityconstraints:
  *    get:
  *      security:
  *        - bearerAuth: []
  *      tags: [Capacityconstraints]
  *      summary: Get all capacityconstraints
  *      description: Get all capacityconstraints
  *      responses:
  *        200:
  *          description: Capacityconstraints list successfully received
  *          content:
  *            application/json:
  *              schema:
  *                type: array
  *                items:
  *                  $ref: "#/components/schemas/Capacityconstraints"
  *        401:
  *          $ref: "#/components/responses/UnauthorizedError"
  *        404:
  *          description: Data not found
  *        500:
  *          description: Some server error
  */

router.get('/', wrapAsync(async (req, res) => {
  const payload = await CapacityconstraintsDBApi.findAll(
    {...req.query, companyId: req.currentUser.companyId}
  );

  res.status(200).send(payload);
}));

router.get('/autocomplete', async (req, res) => {
  const payload = await CapacityconstraintsDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,{companyId: req.currentUser.companyId}
  );

  res.status(200).send(payload);
});

  /**
  * * @swagger
  *  /api/capacityconstraints/{id}:
  *    get:
  *      security:
  *        - bearerAuth: []
  *      tags: [Capacityconstraints]
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
  *                $ref: "#/components/schemas/Capacityconstraints"
  *        400:
  *          description: Invalid ID supplied
  *        401:
  *          $ref: "#/components/responses/UnauthorizedError"
  *        404:
  *          description: Item not found
  *        500:
  *          description: Some server error
  */

router.get('/:id', wrapAsync(async (req, res) => {
  const payload = await CapacityconstraintsDBApi.findBy(
    { id: req.params.id },
  );

  res.status(200).send(payload);
}));

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
