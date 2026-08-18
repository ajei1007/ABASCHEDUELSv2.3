const express = require('express');
const BranchesDBApi = require('../../db/api/branches');
const BranchesService = require('../../services/branches');
const wrapAsync = require('../../helpers').wrapAsync;

const router = require('../../utils/createRouter')();

/**
 *  @swagger
 * tags:
 *   name: Branches
 *   description: The Branches managing API
 */

/**
 *  @swagger
 *  components:
 *    schemas:
 *      Branches:
 *        type: object
 *        required: [id, name, parent, branchType]
 *        properties:
 *          id:
 *            type: string
 *            default: 00000000-00000000-00000000-00000000
 *          name:
 *            type: string
 *            default: name
 *          branchType:
 *            type: object
 *            required: [id, name]
 *            properties:
 *              id:
 *                type: string
 *                default: 00000000-00000000-00000000-00000000
 *              name:
 *                type: string
 *                default: name
 *          parent:
 *            type: object
 *            required: [id, name, branchTypeId]
 *            properties:
 *              id:
 *                type: string
 *                default: 00000000-00000000-00000000-00000000
 *              name:
 *                type: string
 *                default: name
 *              branchTypeId:
 *                type: string
 *                default: 00000000-00000000-00000000-00000000
 */

/**
 * @swagger
 *  /api/integrations/branches:
 *    post:
 *      security:
 *        - bearerAuth: []
 *      tags: [Branches]
 *      summary: Create a branch
 *      description: Creating branch. You need to provide name, parent, branchType . The parent and branchType refers to ID.
 *      requestBody:
 *        description: Set new item data
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *                name:
 *                  description: Name of the created branch
 *                  type: string
 *                  default : branch1
 *                parent:
 *                  description: The ID of parent branch
 *                  type: string
 *                  default : 00000000-00000000-00000000-00000000
 *                branchType:
 *                  description: The ID of branch type
 *                  type: string
 *                  default : 00000000-00000000-00000000-00000000
 *              required: [name, parent, branchType]
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
 *                      $ref: "#/components/schemas/Branches"
 *        400:
 *          description: Invalid data supplied
 *        401:
 *          $ref: "#/components/responses/UnauthorizedError"
 *        500:
 *          description: Some server error
 */

/**
 * @swagger
 *  /api/integrations/branches:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      tags: [Branches]
 *      summary: Get Branches - Highly recommend to use Postman to make this GET request
 *      description: Get Branches list for integration purpose.
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
 *                      $ref: "#/components/schemas/Branches"
 *        400:
 *          description: Invalid ID supplied
 *        401:
 *          $ref: "#/components/responses/UnauthorizedError"
 *        404:
 *          description: Item not found
 *        500:
 *          description: Some server error
 */

/**
 * @swagger
 *  /api/integrations/branches/{id}:
 *    put:
 *      security:
 *        - bearerAuth: []
 *      tags: [Branches]
 *      summary: Update a branch
 *      description: Update branch. You must put ID of being updated branch on the URL. You need to provide new name, parent, branchType. The parent and branchType refers to ID.
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
 *                name:
 *                  description: Name of the created branch
 *                  type: string
 *                  default : branch1
 *                parent:
 *                  description: The ID of parent branch
 *                  type: string
 *                  default : 00000000-00000000-00000000-00000000
 *                branchType:
 *                  description: The ID of branch type
 *                  type: string
 *                  default : 00000000-00000000-00000000-00000000
 *              required: [name, parent, branchType]
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
 *                      $ref: "#/components/schemas/Branches"
 *        400:
 *          description: Invalid data supplied
 *        401:
 *          $ref: "#/components/responses/UnauthorizedError"
 *        404:
 *          description: Item not found
 *        500:
 *          description: Some server error
 */

/**
 * @swagger
 *  /api/integrations/branches/{id}:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      tags: [Branches]
 *      summary: Get a branch by ID
 *      description: Get branch. You must put ID of requested branch on the URL
 *      parameters:
 *        - in: path
 *          name: id
 *          description: Item ID to update
 *          required: true
 *          schema:
 *            type: string
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
 *                      $ref: "#/components/schemas/Branches"
 *        400:
 *          description: Invalid data supplied
 *        401:
 *          $ref: "#/components/responses/UnauthorizedError"
 *        404:
 *          description: Item not found
 *        500:
 *          description: Some server error
 */


router.get(
  '/',
  wrapAsync(async (req, res) => {
    let query_now = { ...req.query, companyId: req.currentUser.companyId };
    delete query_now.limit;
    delete query_now.page;
    const payload = await BranchesDBApi.findAll(query_now);

    for (let i = 0; i < payload.count; i++) {
      let obj = payload.rows[i];
      let newObj = {};

      newObj.id = obj.id;
      newObj.name = obj.name;
      newObj.parent = obj.parent;
      newObj.branchType = null;
      if (obj.branchType) {
        newObj.branchType = {};
        newObj.branchType.id = obj.branchType.id;
        newObj.branchType.name = obj.branchType.name;
      }
      payload.rows[i] = newObj;
    }
    res.status(200).send(payload);
  }),
);

router.post('/', async (req, res) => {
  let createdBranch = await BranchesService.create(
    req.body.data,
    req.currentUser,
    true,
    req.headers.referer,
  );

  let resp = {};
  resp.id = createdBranch.id;
  resp.name = createdBranch.name;
  resp.parent = {
    id: createdBranch.parent.id,
    name: createdBranch.parent.name,
    branchTypeId: createdBranch.parent.branchTypeId,
  };
  resp.branchType = {
    id: createdBranch.branchType.id,
    name: createdBranch.branchType.name,
  };

  res.status(200).send(resp);
});

router.put(
  '/:id',
  wrapAsync(async (req, res) => {
    await BranchesService.update(req.body.data, req.body.id, req.currentUser);
    let updatedBranch = await BranchesDBApi.findBy({ id: req.body.id });
    let resp = {};
    resp.id = updatedBranch.id;
    resp.name = updatedBranch.name;
    resp.parent = {
      id: updatedBranch.parent.id,
      name: updatedBranch.parent.name,
      branchTypeId: updatedBranch.parent.branchTypeId,
    };
    resp.branchType = null;
    if (updatedBranch.branchType) {
      resp.branchType = {
        id: updatedBranch.branchType.id,
        name: updatedBranch.branchType.name,
      };
    }
    res.status(200).send(resp);
  }),
);

router.get(
  '/:id',
  wrapAsync(async (req, res) => {
    const payload = await BranchesDBApi.findBy({ id: req.params.id });
    let resp = {};
    resp.id = payload.id;
    resp.name = payload.name;
    resp.parent = {
      id: payload.parent.id,
      name: payload.parent.name,
      branchTypeId: payload.parent.branchTypeId,
    };
    resp.branchType = null;
    if (payload.branchType) {
      resp.branchType = {
        id: payload.branchType.id,
        name: payload.branchType.name,
      };
    }
    res.status(200).send(resp);
  }),
);

module.exports = router;
