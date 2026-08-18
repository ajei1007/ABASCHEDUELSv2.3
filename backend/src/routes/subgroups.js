const express = require('express');
const Joi = require('joi');

const SubgroupsService = require('../services/subgroups');
const SubgroupsDBApi = require('../db/api/subgroups');
const GroupingsDBApi = require('../db/api/groupings');
const wrapAsync = require('../helpers').wrapAsync;
const validateRequest = require('../middlewares/validation');
const { ValidationError: ApiValidationError } = require('../common/errors');

const router = require('../utils/createRouter')();

const subgroupDataSchema = Joi.object({
  name: Joi.string().required(),
  groupingName: Joi.string().required().invalid("Funder", "Matching").messages({
    'any.invalid': `You cannot change/create tags from Funder or Matching`
  })
}).unknown(true)

const createSubgroupSchema = Joi.object({
  data: subgroupDataSchema.required()
}).unknown(true)

const updateSubgroupSchema = Joi.object({
  data: subgroupDataSchema.required()
}).unknown(true)


router.post('/', validateRequest(createSubgroupSchema), wrapAsync(async (req, res) => {
  const groupings = await GroupingsDBApi.findAllAutocomplete(
    null,
    { companyId: req.currentUser.companyId },
  );
  if (groupings && groupings.length) {
    const findGrouping = groupings.find(
      (gr) => gr.label === req.body.data.groupingName,
    );
    if (findGrouping) {
      req.body.data.group = findGrouping.id;
    }else{
      throw new ApiValidationError('Grouping not found');
    }
  }

  await SubgroupsService.create(
    req.body.data,
    req.currentUser,
    true,
    req.headers.referer,
  );
  const payload = true;
  res.status(200).send(payload);
}));


router.put(
  '/:id',
  validateRequest(updateSubgroupSchema),
  wrapAsync(async (req, res) => {
    const groupings = await GroupingsDBApi.findAllAutocomplete(
      null,
      { companyId: req.currentUser.companyId },
    );
    if (groupings && groupings.length) {
      const findGrouping = groupings.find(
        (gr) => gr.label === req.body.data.groupingName,
      );
      if (findGrouping) {
        req.body.data.group = findGrouping.id;
      }else{
        throw new ApiValidationError('Grouping not found');
      }
    }

    await SubgroupsService.update(req.body.data, req.params.id, req.currentUser);
    const payload = true;
    res.status(200).send(payload);
  }),
);


router.delete(
  '/:id',
  wrapAsync(async (req, res) => {
    await SubgroupsService.remove(req.params.id, req.currentUser);
    const payload = true;
    res.status(200).send(payload);
  }),
);


router.get(
  '/',
  wrapAsync(async (req, res) => {
    const payload = await SubgroupsDBApi.findAll({
      ...req.query,
      companyId: req.currentUser.companyId,
    });

    res.status(200).send(payload);
  }),
);

router.get(
  '/groupings/:groups',
  wrapAsync(async (req, res) => {
    const payload = await SubgroupsDBApi.findAllTable({
      ...req.query,
      companyId: req.currentUser.companyId,
      group_name: req.params.groups,
    });

    res.status(200).send(payload);
  }),
);

router.get('/autocomplete', async (req, res) => {
  const payload = await SubgroupsDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
    { companyId: req.currentUser.companyId },
  );

  res.status(200).send(payload);
});


router.get(
  '/:id',
  wrapAsync(async (req, res) => {
    const payload = await SubgroupsDBApi.findBy({ id: req.params.id, companyId: req.currentUser.companyId });

    res.status(200).send(payload);
  }),
);

module.exports = router;
