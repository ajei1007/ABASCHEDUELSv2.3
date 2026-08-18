const express = require('express');

const DistancematrixService = require('../services/distancematrix');
const DistancematrixDBApi = require('../db/api/distancematrix');
const wrapAsync = require('../helpers').wrapAsync;
const { getUserAndRole } = require('../utils/getUserRole');

const router = require('../utils/createRouter')();

/**
 *  * @swagger
 *  components:
 *    schemas:
 *      Distancematrix:
 *        type: object
 *        properties:

 *          address1:
 *            type: string
 *            default: address1
 *          address2:
 *            type: string
 *            default: address2

 *          distance:
 *            type: integer
 *            format: int64
 *          duration:
 *            type: integer
 *            format: int64

 */

/**
 *  * @swagger
 * tags:
 *   name: Distancematrix
 *   description: The Distancematrix managing API
 */

/**
 *  * @swagger
 *  /api/distancematrix:
 *    post:
 *      security:
 *        - bearerAuth: []
 *      tags: [Distancematrix]
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
 *                  $ref: "#/components/schemas/Distancematrix"
 *      responses:
 *        200:
 *          description: The item was successfully added
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/Distancematrix"
 *        401:
 *          $ref: "#/components/responses/UnauthorizedError"
 *        405:
 *          description: Invalid input data
 *        500:
 *          description: Some server error
 */

router.post('/', async (req, res) => {
  await DistancematrixService.create(
    req.body.data,
    req.currentUser,
    true,
    req.headers.referer,
  );
  const payload = true;
  res.status(200).send(payload);
});

/**
 *  * @swagger
 *  /api/distancematrix/{id}:
 *    put:
 *      security:
 *        - bearerAuth: []
 *      tags: [Distancematrix]
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
 *                  $ref: "#/components/schemas/Distancematrix"
 *              required:
 *                - id
 *      responses:
 *        200:
 *          description: The item data was successfully updated
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/Distancematrix"
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
    await DistancematrixService.update(
      req.body.data,
      req.body.id,
      req.currentUser,
    );
    const payload = true;
    res.status(200).send(payload);
  }),
);

/**
 * * @swagger
 *  /api/distancematrix/{id}:
 *    delete:
 *      security:
 *        - bearerAuth: []
 *      tags: [Distancematrix]
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
 *                $ref: "#/components/schemas/Distancematrix"
 *        400:
 *          description: Invalid ID supplied
 *        401:
 *          $ref: "#/components/responses/UnauthorizedError"
 *        404:
 *          description: Item not found
 *        500:
 *          description: Some server error
 */

router.delete(
  '/:id',
  wrapAsync(async (req, res) => {
    await DistancematrixService.remove(req.params.id, req.currentUser);
    const payload = true;
    res.status(200).send(payload);
  }),
);

/**
 *  * @swagger
 *  /api/distancematrix:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      tags: [Distancematrix]
 *      summary: Get all distancematrix
 *      description: Get all distancematrix
 *      responses:
 *        200:
 *          description: Distancematrix list successfully received
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: "#/components/schemas/Distancematrix"
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
    const payload = await DistancematrixDBApi.findAll({
      ...req.query,
      companyId: req.currentUser.companyId,
    });

    res.status(200).send(payload);
  }),
);

router.get(
  '/calculator',
  wrapAsync(async (req, res) => {
    const calculatorParameters = {
      address1: req.query.address1,
      address2: req.query.address2,
      currentUserId: req.currentUser.id,
    };
    const payload = await DistancematrixDBApi.calculator(calculatorParameters);

    res.status(200).send(payload);
  }),
);

router.get('/autocomplete', async (req, res) => {
  const payload = await DistancematrixDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
    { companyId: req.currentUser.companyId },
  );

  res.status(200).send(payload);
});

/**
 * * @swagger
 *  /api/distancematrix/{id}:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      tags: [Distancematrix]
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
 *                $ref: "#/components/schemas/Distancematrix"
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
    const payload = await DistancematrixDBApi.findBy({ id: req.params.id });

    res.status(200).send(payload);
  }),
);

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
