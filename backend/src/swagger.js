const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const config = require('./config');
const { generateAllSwaggerSchemas } = require('./utils/generateSwaggerSchemas');


const allSchemas = generateAllSwaggerSchemas();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      version: '1.0',
      title: 'ABA Schedules | API Integrations',
      description:
        'ABA Schedules REST APIs for Integration.',
    },
    servers: [
      {
        url: config.swagger.url,
        description: config.isProduction ? 'Production server' : 'Development server',
      },
    ],
    components: {
      schemas: {
        ...allSchemas,
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiErrorResponse'
              }
            }
          }
        },
        ValidationError: {
          description: 'Invalid input data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiErrorResponse'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiErrorResponse'
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiErrorResponse'
              }
            }
          }
        }
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.js',
    './src/routes/integrations/*.js',
    './src/swagger/*.yaml'
  ],
};
const swaggerSpecs = swaggerJsDoc(options);

const swaggerInit = (req, _, next) => {
  swaggerUI.host = req.get('host');
  next();
};

module.exports = {
  swaggerInit,
  swaggerSpecs,
};
