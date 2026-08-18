const db = require('../db/models')
const SurveyDataDBApi = require('../db/api/surveyData');
const CompanyActiveUserStatsDBApi = require('../db/api/companyActiveUserStats');
const { ValidationError: ApiValidationError } = require('../common/errors');
const { getRoleHierarchy } = require('../utils/roleHierarchy');
const {getQuarterDates, getPreviousQuarters, calculateStatisticsByRatings} = require('../utils/surveyData');


module.exports = class SurveyDataService {
    static async create(data, currentUser) {
        const transaction = await db.sequelize.transaction()
        try {
            if (!data.ratings || data.ratings.length === 0) {
                throw new ApiValidationError("Ratings of questions must be provided");
            }
            let surveyData = await SurveyDataDBApi.create(data, {currentUser, transaction})
            for (const questionRating of data.ratings) {
                if (questionRating.rating < 0 || questionRating.rating >10) {
                    throw new ApiValidationError("Ratings must be between 0-10");
                }
                let r = await SurveyDataDBApi.addRatingForQuestion({
                    surveyQuestionId: questionRating.id,
                    surveyDataId: surveyData.dataValues.id,
                    rating: questionRating.rating
                }, {transaction})
            }
            await transaction.commit()
            return surveyData
        } catch (error) {
            await transaction.rollback()
            throw error;
        }
    }

    static async getLastSurveyOfUser(userId) {
        const survey = await SurveyDataDBApi.getLastSurveyOfUser(userId)
        return survey
    }

    static async getActiveQuestions() {
        const questions = await SurveyDataDBApi.getActiveQuestions()
        return questions
    }

    static async getSurveyList(filter) {
        const surveyList = await SurveyDataDBApi.getSurveyList(filter);
        let result = []
        const companyRoles = new Map()
        for (const survey of surveyList) {
            if (!companyRoles.has(survey.user.company.id)) {
                const roleHierarchy = await getRoleHierarchy(survey.user.company.id);
                let employeeRoleList = []
                let clientRoleList = []
                Object.entries(roleHierarchy).map((t) => {
                    const [key, value] = t;
                    if (value.includes('Client')) {
                        clientRoleList.push(key);
                    }

                    if (value.includes('Employee')) {
                        employeeRoleList.push(key);
                    }
                })
                companyRoles.set(survey.user.company.id, {employeeRoleList, clientRoleList})
            }

            const isClient = survey.user.roles.some((role) =>
                companyRoles.get(survey.user.company.id).clientRoleList.includes(role.name),
            )
            const isEmployee = !isClient && survey.user.roles.some((role) =>
                companyRoles.get(survey.user.company.id).employeeRoleList.includes(role.name),
            )
            let rating = 0
            if (survey.questionRatings.length > 0){
                const ratingSum = survey.questionRatings.reduce((total, item)=> total + item.rating, 0)
                rating = ratingSum / survey.questionRatings.length
            }
            
            result.push({
                id: survey.id,
                firstName: survey.user.firstName,
                lastName: survey.user.lastName,
                email: survey.user.email,
                company: survey.user.company,
                roles: survey.user.roles,
                feedback: survey?.feedback || "",
                createdAt: survey?.createdAt || null,
                rating: rating,
                userType: isClient ? 'Client' : isEmployee ? 'Employee': ''
            })
        }
        delete filter.limit
        delete filter.page
        delete filter.offset
        const allSurveys = await SurveyDataDBApi.getSurveyList(filter);
        return {
            totalCount: allSurveys.length,
            result: result
        }
    }

    static async getSurveyStatistics(filter) {
        const currentQuarter = filter.currentQuarter
        const surveyList = await SurveyDataDBApi.getSurveyList(filter);
        const activeUsersCount = await CompanyActiveUserStatsDBApi.getActiveUsersCount({
            startDate: filter.startDate,
            endDate: filter.endDate,
            companyId: filter.companyId || null,
        });
        const result = {}
        result.npsTotalResponses = surveyList.length;
        result.npsResponseRate = activeUsersCount > 0 ? +((surveyList.length / activeUsersCount) * 100).toFixed(2): 0;
        const standardRolesRatings = new Map();
        const currentQuarterRatings = []
        for (const survey of surveyList) {
            if (!standardRolesRatings.has(survey.user.roles[0].standardRoles)){
                standardRolesRatings.set(survey.user.roles[0].standardRoles, []);
            }

            let rating = 0
            if (survey.questionRatings.length > 0){
                const ratingSum = survey.questionRatings.reduce((total, item)=> total + item.rating, 0)
                rating = ratingSum / survey.questionRatings.length
            }
            standardRolesRatings.get(survey.user.roles[0].standardRoles).push(rating);
            currentQuarterRatings.push(rating)
        }
        const statistics = calculateStatisticsByRatings(currentQuarterRatings);
        result.npsScore = [
            {
                quarter: currentQuarter,
                score: statistics.nps,
            }
        ]
        result.npsRatingStatistics = {
            mean: statistics.mean,
            median: statistics.median,
            deviation: statistics.stdDev,
        }
        result.npsRatingDistribution = {
            promoters: statistics.promoters,
            passives: statistics.passives,
            detractors: statistics.detractors,
        }
        result.npsResponseTrends = [{
            quarter: currentQuarter,
            totalResponses: surveyList.length,
        }]

        result.npsDistributionByRole = {};

        standardRolesRatings.forEach((ratings, role) => {
            const stats = calculateStatisticsByRatings(ratings);
            result.npsDistributionByRole[role] = {
                npsScore: stats.nps,
                totalResponses: stats.total,
            }
        })

        const previousQuarters = getPreviousQuarters(currentQuarter);
        for (const quarter of previousQuarters) {
            const quarterDates = getQuarterDates(quarter);
            filter.startDate = quarterDates.startDate;
            filter.endDate = quarterDates.endDate;
            const surveyList = await SurveyDataDBApi.getSurveyList(filter);
            const ratings = [];
            for (const survey of surveyList) {
                let rating = 0
                if (survey.questionRatings.length > 0){
                    const ratingSum = survey.questionRatings.reduce((total, item)=> total + item.rating, 0)
                    rating = ratingSum / survey.questionRatings.length
                }
                ratings.push(rating);
            }

            const statistics = calculateStatisticsByRatings(ratings);
            result.npsScore.push({
                quarter: quarter,
                score: statistics.nps,
            });
            result.npsResponseTrends.push({
                quarter: quarter,
                totalResponses: surveyList.length,
            });
        }

        return result;
    }

}