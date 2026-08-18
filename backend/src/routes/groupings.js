
const express = require('express');

const GroupingsService = require('../services/groupings');
const GroupingsDBApi = require('../db/api/groupings');
const wrapAsync = require('../helpers').wrapAsync;

const router = require('../utils/createRouter')();

/**
 *  * @swagger
 *  components:
 *    schemas:
 *      Groupings:
 *        type: object
 *        properties:

 *          name:
 *            type: string
 *            default: name

 *          min:
 *            type: integer
 *            format: int64
 *          max:
 *            type: integer
 *            format: int64

 */

/**
 *  * @swagger
 * tags:
 *   name: Groupings
 *   description: The Groupings managing API
 */

  /**
  *  * @swagger
  *  /api/groupings:
  *    post:
  *      security:
  *        - bearerAuth: []
  *      tags: [Groupings]
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
  *                  $ref: "#/components/schemas/Groupings"
  *      responses:
  *        200:
  *          description: The item was successfully added
  *          content:
  *            application/json:
  *              schema:
  *                $ref: "#/components/schemas/Groupings"
  *        401:
  *          $ref: "#/components/responses/UnauthorizedError"
  *        405:
  *          description: Invalid input data
  *        500:
  *          description: Some server error
  */

router.post('/', wrapAsync(async (req, res) => {
    await GroupingsService.create(req.body.data, req.currentUser, true, req.headers.referer);
    const payload = true;
    res.status(200).send(payload);
}));

  /**
  *  * @swagger
  *  /api/groupings/{id}:
  *    put:
  *      security:
  *        - bearerAuth: []
  *      tags: [Groupings]
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
  *                  $ref: "#/components/schemas/Groupings"
  *              required:
  *                - id
  *      responses:
  *        200:
  *          description: The item data was successfully updated
  *          content:
  *            application/json:
  *              schema:
  *                $ref: "#/components/schemas/Groupings"
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
  await GroupingsService.update(req.body.data, req.body.id, req.currentUser);
  const payload = true;
  res.status(200).send(payload);
}));

  /**
  * * @swagger
  *  /api/groupings/{id}:
  *    delete:
  *      security:
  *        - bearerAuth: []
  *      tags: [Groupings]
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
  *                $ref: "#/components/schemas/Groupings"
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
  await GroupingsService.remove(req.params.id, req.currentUser);
  const payload = true;
  res.status(200).send(payload);
}));

  /**
  *  * @swagger
  *  /api/groupings:
  *    get:
  *      security:
  *        - bearerAuth: []
  *      tags: [Groupings]
  *      summary: Get all groupings
  *      description: Get all groupings
  *      responses:
  *        200:
  *          description: Groupings list successfully received
  *          content:
  *            application/json:
  *              schema:
  *                type: array
  *                items:
  *                  $ref: "#/components/schemas/Groupings"
  *        401:
  *          $ref: "#/components/responses/UnauthorizedError"
  *        404:
  *          description: Data not found
  *        500:
  *          description: Some server error
  */

router.get('/', wrapAsync(async (req, res) => {
  const payload = await GroupingsDBApi.findAll(
    {...req.query, companyId: req.currentUser.companyId}
  );

  res.status(200).send(payload);
}));

router.get('/autocomplete', async (req, res) => {
  const payload = await GroupingsDBApi.findAllAutocomplete(
    req.query.query,
    {companyId: req.currentUser.companyId}
  );

  res.status(200).send(payload);
});

  /**
  * * @swagger
  *  /api/groupings/{id}:
  *    get:
  *      security:
  *        - bearerAuth: []
  *      tags: [Groupings]
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
  *                $ref: "#/components/schemas/Groupings"
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
  const payload = await GroupingsDBApi.findBy(
    { id: req.params.id },
  );

  res.status(200).send(payload);
}));

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
