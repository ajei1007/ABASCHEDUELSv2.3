
const express = require('express');

const BranchtypeService = require('../services/branchtype');
const BranchtypeDBApi = require('../db/api/branchtype');
const wrapAsync = require('../helpers').wrapAsync;
const ValidationError = require('../services/notifications/errors/validation');
const { requireInternalAdmin } = require('../middlewares/requireInternalAdmin');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

const router = require('../utils/createRouter')();

/**
 *  * @swagger
 *  components:
 *    schemas:
 *      Branchtype:
 *        type: object
 *        properties:

 *          name:
 *            type: string
 *            default: name

 */

/**
 *  * @swagger
 * tags:
 *   name: Branchtype
 *   description: The Branchtype managing API
 */

  /**
  *  * @swagger
  *  /api/branchtype:
  *    post:
  *      security:
  *        - bearerAuth: []
  *      tags: [Branchtype]
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
  *                  $ref: "#/components/schemas/Branchtype"
  *      responses:
  *        200:
  *          description: The item was successfully added
  *          content:
  *            application/json:
  *              schema:
  *                $ref: "#/components/schemas/Branchtype"
  *        401:
  *          $ref: "#/components/responses/UnauthorizedError"
  *        405:
  *          description: Invalid input data
  *        500:
  *          description: Some server error
  */

router.post('/', requireInternalAdmin, wrapAsync(async (req, res) => {
    if (!isUserRoleOrHigher(req?.currentUser?.role, 'admin')) {
      throw new ValidationError('errors.forbidden.message');
    }
    await BranchtypeService.create(req.body.data, req.currentUser, true, req.headers.referer);
    const payload = true;
    res.status(200).send(payload);
}));

  /**
  *  * @swagger
  *  /api/branchtype/{id}:
  *    put:
  *      security:
  *        - bearerAuth: []
  *      tags: [Branchtype]
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
  *                  $ref: "#/components/schemas/Branchtype"
  *              required:
  *                - id
  *      responses:
  *        200:
  *          description: The item data was successfully updated
  *          content:
  *            application/json:
  *              schema:
  *                $ref: "#/components/schemas/Branchtype"
  *        400:
  *          description: Invalid ID supplied
  *        401:
  *          $ref: "#/components/responses/UnauthorizedError"
  *        404:
  *          description: Item not found
  *        500:
  *          description: Some server error
  */

router.put('/:id', requireInternalAdmin, wrapAsync(async (req, res) => {
  if (!isUserRoleOrHigher(req?.currentUser?.role, 'admin')) {
    throw new ValidationError('errors.forbidden.message');
  }
  await BranchtypeService.update(req.body.data, req.body.id, req.currentUser);
  const payload = true;
  res.status(200).send(payload);
}));

  /**
  * * @swagger
  *  /api/branchtype/{id}:
  *    delete:
  *      security:
  *        - bearerAuth: []
  *      tags: [Branchtype]
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
  *                $ref: "#/components/schemas/Branchtype"
  *        400:
  *          description: Invalid ID supplied
  *        401:
  *          $ref: "#/components/responses/UnauthorizedError"
  *        404:
  *          description: Item not found
  *        500:
  *          description: Some server error
  */

router.delete('/:id', requireInternalAdmin, wrapAsync(async (req, res) => {
  if (!isUserRoleOrHigher(req?.currentUser?.role, 'admin')) {
    throw new ValidationError('errors.forbidden.message');
  }
  await BranchtypeService.remove(req.params.id, req.currentUser);
  const payload = true;
  res.status(200).send(payload);
}));

  /**
  *  * @swagger
  *  /api/branchtype:
  *    get:
  *      security:
  *        - bearerAuth: []
  *      tags: [Branchtype]
  *      summary: Get all branchtype
  *      description: Get all branchtype
  *      responses:
  *        200:
  *          description: Branchtype list successfully received
  *          content:
  *            application/json:
  *              schema:
  *                type: array
  *                items:
  *                  $ref: "#/components/schemas/Branchtype"
  *        401:
  *          $ref: "#/components/responses/UnauthorizedError"
  *        404:
  *          description: Data not found
  *        500:
  *          description: Some server error
  */

router.get('/', wrapAsync(async (req, res) => {
  const payload = await BranchtypeDBApi.findAll(
    {...req.query, companyId: req.currentUser.companyId}
  );

  res.status(200).send(payload);
}));

router.get('/autocomplete', async (req, res) => {
  const payload = await BranchtypeDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
    {companyId: req.currentUser.companyId}
  );

  res.status(200).send(payload);
});

  /**
  * * @swagger
  *  /api/branchtype/{id}:
  *    get:
  *      security:
  *        - bearerAuth: []
  *      tags: [Branchtype]
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
  *                $ref: "#/components/schemas/Branchtype"
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
  const payload = await BranchtypeDBApi.findBy(
    { id: req.params.id },
  );

  res.status(200).send(payload);
}));

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
