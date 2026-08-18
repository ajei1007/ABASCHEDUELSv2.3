const express = require('express');
const Joi = require('joi');

const SurveyDataService = require('../services/surveyData')
const validateRequest = require('../middlewares/validation');

const { wrapAsync } = require('../helpers');
const requireRole = require('../middlewares/requireRole');
const router = require('../utils/createRouter')();
const {getQuarterDates} = require('../utils/surveyData')


const surveyDataSchema = Joi.object({
    feedback: Joi.string(),
    ratings: Joi.array().items(
        Joi.object({
            id: Joi.string().uuid().required(),
            rating: Joi.number().integer().min(0).max(10).required()
        })
    ).min(1).required() 
  }).unknown(true);

const createSurveyDataSchema = Joi.object({
    data: surveyDataSchema.required()
})

const surveyListSchema = Joi.object({
    companyId: Joi.string().optional(),
    questionId: Joi.string().optional(),
    quarter: Joi.string()
      .pattern(/^(\d{4})_q([1-4])$/i)
      .required(),
  
    limit: Joi.string()
      .pattern(/^[1-9]\d*$/)
      .optional()
      .default(10),
  
    page: Joi.string()
      .pattern(/^[1-9]\d*$/)
      .optional()
      .default(1)
  });

const surveyStatisticsSchema = Joi.object({
    companyId: Joi.string().optional(),
    questionId: Joi.string().optional(),
    quarter: Joi.string()
      .pattern(/^(\d{4})_q([1-4])$/i)
      .required(),
})

router.post('/', validateRequest(createSurveyDataSchema), wrapAsync(async (req, res) => {
    await SurveyDataService.create(req.body.data, req.currentUser)
    const payload = true
    res.status(200).send(payload)
}))

router.get('/questions', wrapAsync(async (req, res) => {
    const payload = await SurveyDataService.getActiveQuestions()
    res.status(200).send(payload)
}))

router.get('/last', wrapAsync(async (req, res) => {
    const payload = await SurveyDataService.getLastSurveyOfUser(req.currentUser.id)
    if (!payload) {
        res.status(200).json(null)
    }
    res.status(200).send(payload)
}))

router.get('/', requireRole('superAdmin'), validateRequest(surveyListSchema, 'query'), wrapAsync(async (req, res) => {
    const quarter = req.query.quarter
    const filter = getQuarterDates(quarter)
    filter.questionId = req.query.questionId || null
    filter.companyId = req.query.companyId || null
    filter.limit = req.query.limit || 10
    filter.page = req.query.page || 1
    res.status(200).send(await SurveyDataService.getSurveyList(filter))
}))

router.get('/statistics', requireRole('superAdmin'), validateRequest(surveyStatisticsSchema, 'query'), wrapAsync(async (req, res) => {
    const quarter = req.query.quarter
    const filter = getQuarterDates(quarter)
    filter.questionId = req.query.questionId || null
    filter.companyId = req.query.companyId || null
    filter.currentQuarter = quarter
    res.status(200).send(await SurveyDataService.getSurveyStatistics(filter))
}))

module.exports = router;