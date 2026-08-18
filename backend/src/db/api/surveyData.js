const db = require('../models');
const Sequelize = require('sequelize');

const Utils = require('../utils')

const { ValidationError: ApiValidationError } = require('../../common/errors');

module.exports = class SurveyDataDBApi {
    static async create(data, options) {
        const transaction = (options && options.transaction) || undefined
        
        if (!options || !options.currentUser) {
            throw new ApiValidationError('Missing current user information for creating survey');
          }
          
        const currentUser = options.currentUser;

        const surveyData = await db.surveyData.create(
            {
                userId : currentUser.id,
                feedback: data.feedback,
            },
            { transaction },
        );

        return surveyData;
    }

    static async addRatingForQuestion(rating, options) {
        const transaction = (options && options.transaction) || undefined

        const questionRating = await db.surveyQuestionRatings.create(
            {
                surveyQuestionId: rating.surveyQuestionId,
                surveyDataId: rating.surveyDataId,
                rating: rating.rating
            },
            {transaction}
        );

        return questionRating
    }

    static async getLastSurveyOfUser(userId) {
        if (!userId) {
            throw new ApiValidationError("User ID is required to get surveys");
        }
    
        const where = {
            userId: userId
        };
    
        const survey = await db.surveyData.findOne({
            where,
            order: [['createdAt', 'DESC']],
        });
    
        return survey;
    }
    
    static async getActiveQuestions() {
        const where = {
            isActive: true
        }

        const questions = await db.surveyQuestions.findAll({
            where
        });

        return questions
    }

    static async getSurveyList(filter) {
        if (!filter.startDate || !filter.endDate) {
            throw new ApiValidationError("startDate and endDate are required");
        }

        if (filter.limit && filter.page) {
            const pagination = Utils.getLimitOffset(filter.limit, filter.page)
            filter.offset = pagination.off
            filter.limit = pagination.lim
        }
        const latestSurveyRows = await db.sequelize.query(
            `
            SELECT sd.id
              FROM surveyData sd
        INNER JOIN (
                SELECT userId,
                   MAX (createdAt) as latestCreated
                  FROM surveyData
                 WHERE createdAt BETWEEN :startDate AND :endDate
              GROUP BY userId
            ) latest 
                ON latest.userId = sd.userId AND latest.latestCreated = sd.createdAt
            `,
            {
                replacements: filter,
                type: db.Sequelize.QueryTypes.SELECT,
            }
        );
        
        const surveyIds = latestSurveyRows.map(row => row.id);
        if (surveyIds.length === 0) return [];

        const results = await db.surveyData.findAll({
            where: {
                id: { [db.Sequelize.Op.in]: surveyIds },
            },
            limit: filter.limit || null,
            offset: filter.offset || null,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: db.users,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    required: true,
                    include: [
                        {
                            model: db.companies,
                            as: 'company',
                            attributes: ['id', 'name'],
                            ...(filter.companyId ? { where: { id: filter.companyId } } : {}),
                            required: true,
                        },
                        {
                            model: db.roles,
                            as: 'roles',
                            attributes: ['id', 'name', 'standardRoles'],
                            required: true,
                        },
                    ],
                },
                {
                    model: db.surveyQuestionRatings,
                    as: 'questionRatings',
                    attributes: ['rating'],
                    required: true,
                    ...(filter.questionId ? { where: { surveyQuestionId: filter.questionId } } : {}),
                },
            ],
        });
    
        return results.map(row => row.get({ plain: true }));
    }
}