require('dotenv').config();
const os = require('os');
const { Transaction } = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

const atatusEnableProbability = (() => {
  const probability = parseInt(process.env.ATATUS_ENABLE_PROBABILITY, 10);
  if (isNaN(probability) || probability < 0) {
    return 0;
  }

  if (probability > 100) {
    return 100;
  }

  return probability;
})();

const config = {
  /** App Core Settings */
  env: process.env.NODE_ENV,
  appEnv: process.env.APP_ENV || 'dev',
  port: isProduction ? '' : '8080',
  secretKey: process.env.SECRET_KEY || 'HUEyqESqgQ1yTwzVlO6wprC9Kf1J1xuA',
  uploadDir: os.tmpdir(),
  enableMonitoring: process.env.ENABLE_MONITORING === 'true' || false,
  frontendUrl: {
    dev: 'http://localhost:3000',
    beta: 'https://beta.abaschedules.com',
    jbk: 'https://jbk.abaschedules.com',
    pedsplus: 'https://pedsplus.abaschedules.com',
    app: 'https://app.abaschedules.com',
    abc: 'https://abc.abaschedules.com',
  },
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  googleDistanceMatrixApiKey: process.env.GOOGLE_DISTANCEMATRIX_API_KEY || '',

  /** App Instance Settings */
  nodeAppInstance: process.env.NODE_APP_INSTANCE || '0',
  mobileAppEnabled: process.env.MOBILE_APP_ENABLED === 'true' || false,

  /** Database Configuration */
  database: {
    // RDS Configurations
    rds: {
      /* Development DB */
      dev: {
        read: [{
          username: process.env.DB_USER,
          password: process.env.DB_PASS,
          port: process.env.DB_PORT,
          database: process.env.DB_NAME,
          host: process.env.DB_HOST,
        }],
        write: {
          username: process.env.DB_USER,
          password: process.env.DB_PASS,
          port: process.env.DB_PORT,
          database: process.env.DB_NAME,
          host: process.env.DB_HOST,
        },
      },
      /* Beta DB */
      beta: {
        read: [{
          host: process.env.BETA_DB_HOST_READ,
          username: process.env.BETA_DB_USER,
          password: process.env.BETA_DB_PASS,
          database: process.env.BETA_DB_NAME,
          port: process.env.BETA_DB_PORT,
        }],
        write: {
          host: process.env.BETA_DB_HOST_WRITE,
          username: process.env.BETA_DB_USER,
          password: process.env.BETA_DB_PASS,
          database: process.env.BETA_DB_NAME,
          port: process.env.BETA_DB_PORT,
        },
      },
      /* JBK RDS */
      jbk: {
        read: [{
          host: process.env.JBK_DB_HOST_READ,
          username: process.env.JBK_DB_USER,
          password: process.env.JBK_DB_PASS,
          database: process.env.JBK_DB_NAME,
          port: process.env.JBK_DB_PORT,
        }],
        write: {
          host: process.env.JBK_DB_HOST_WRITE,
          username: process.env.JBK_DB_USER,
          password: process.env.JBK_DB_PASS,
          database: process.env.JBK_DB_NAME,
          port: process.env.JBK_DB_PORT,
        },
      },
      /* PEDSPLUS RDS */
      pedsplus: {
        read: [{
          host: process.env.PEDSPLUS_DB_HOST_READ,
          username: process.env.PEDSPLUS_DB_USER,
          password: process.env.PEDSPLUS_DB_PASS,
          database: process.env.PEDSPLUS_DB_NAME,
          port: process.env.PEDSPLUS_DB_PORT,
        }],
        write: {
          host: process.env.PEDSPLUS_DB_HOST_WRITE,
          username: process.env.PEDSPLUS_DB_USER,
          password: process.env.PEDSPLUS_DB_PASS,
          database: process.env.PEDSPLUS_DB_NAME,
          port: process.env.PEDSPLUS_DB_PORT,
        },
      },
      /* APP RDS */
      app: {
        read: [{
          host: process.env.APP_DB_HOST_READ,
          username: process.env.APP_DB_USER,
          password: process.env.APP_DB_PASS,
          database: process.env.APP_DB_NAME,
          port: process.env.APP_DB_PORT,
        }],
        write: {
          host: process.env.APP_DB_HOST_WRITE,
          username: process.env.APP_DB_USER,
          password: process.env.APP_DB_PASS,
          database: process.env.APP_DB_NAME,
          port: process.env.APP_DB_PORT,
        },
      },
      /* APP RDS */
      abc: {
        read: [{
          host: process.env.ABC_DB_HOST_READ,
          username: process.env.ABC_DB_USER,
          password: process.env.ABC_DB_PASS,
          database: process.env.ABC_DB_NAME,
          port: process.env.ABC_DB_PORT,
        }],
        write: {
          host: process.env.ABC_DB_HOST_WRITE,
          username: process.env.ABC_DB_USER,
          password: process.env.ABC_DB_PASS,
          database: process.env.ABC_DB_NAME,
          port: process.env.ABC_DB_PORT,
        },
      },
    },
    generalDevConfig: {
      dialect: 'mysql',
      seederStorage: 'sequelize',
      pool: {
        max: 8,
        min: 0,
        idle: 10000,
        acquire: 30000,
      },
      dialectOptions: {
        decimalNumbers: true,
        connectTimeout: 50000,
      },
      isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
      logging: false,
    },
    generalProdConfig: {
      dialect: 'mysql',
      seederStorage: 'sequelize',
      pool: {
        max: 16,
        min: 0,
        idle: 10000,
        acquire: 30000,
      },
      dialectOptions: {
        decimalNumbers: true,
        connectTimeout: 50000,
      },
      isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
      logging: false,
    }
  },

  /** Bcrypt Settings */
  bcrypt: {
    saltRounds: 12,
  },

  /** Admin Credentials */
  admin: {
    email: process.env.ADMIN_EMAIL || 'silver.inventor@gmail.com',
    password: process.env.ADMIN_PASS || 'password',
    superAdminPassword: process.env.SUPER_ADMIN_PASS || 'superadmin123',
  },

  /** Optimizer Configuration */
  optimizer: {
    dev: {
      url: 'https://csfo3el5yrxkrrvdehxh4t2whu0uwwqo.lambda-url.us-east-1.on.aws',
    },
    beta: {
      url: 'https://zs5zfeczm2ecw3bjhg2jfsscxq0ktnha.lambda-url.us-east-1.on.aws',
    },
    beta: {
      url: 'https://zs5zfeczm2ecw3bjhg2jfsscxq0ktnha.lambda-url.us-east-1.on.aws',
    },
    jbk: {
      url: 'https://csfo3el5yrxkrrvdehxh4t2whu0uwwqo.lambda-url.us-east-1.on.aws',
    },
    pedsplus: {
      url: 'https://csfo3el5yrxkrrvdehxh4t2whu0uwwqo.lambda-url.us-east-1.on.aws',
    },
    app: {
      url: 'https://csfo3el5yrxkrrvdehxh4t2whu0uwwqo.lambda-url.us-east-1.on.aws',
    },
    abc: {
      url: 'https://csfo3el5yrxkrrvdehxh4t2whu0uwwqo.lambda-url.us-east-1.on.aws',
    },
  },

  /** Auth Providers */
  providers: {
    local: 'local',
    google: 'google',
    microsoft: 'microsoft',
  },

  /** OAuth Credentials */
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '671001533244-xyz.apps.googleusercontent.com',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'Yo4qbKZniqvojzUQ60iKlxqR',
    },
    microsoft: {
      clientId: process.env.MS_CLIENT_ID || '4696f457-xxxx-xxxx-xxxx-e00d7d4cff73',
      clientSecret: process.env.MS_CLIENT_SECRET || 'm8jzZ.5UpHF3=-dXzyxiZ4e[F8OF54@p',
    },
  },

  /** Email Configuration */
  email: {
    from: process.env.EMAIL_FROM || '"ABA Schedules" <schedules@abaschedules.com>',
    host: process.env.EMAIL_HOST || 'email-smtp.us-east-1.amazonaws.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER || 'AKIAZAVJD56GS7MMYLGY',
      pass: process.env.EMAIL_PASS || 'BLBKvAJT/8hRMgKJlNgAonVpKFujONdFF9k1RLT2SdRT',
    },
    tls: {
      rejectUnauthorized: false,
    },
  },

  /** Jira Integration */
  jira: {
    domain: process.env.JIRA_DOMAIN,
    email: process.env.JIRA_EMAIL,
    apiToken: process.env.JIRA_API_TOKEN,
    projectKey: {
      bugs: process.env.JIRA_PROJECT_KEY,
    }
  },

  slack: {
    webhookUrls: {
      bugsChannel : process.env.SLACK_BUGS_WEBHOOK_URL,
      featureRequestsChannel : process.env.SLACK_FEATURE_REQUESTS_WEBHOOK_URL,
      adminTasksChannel : process.env.SLACK_ADMIN_TASKS_WEBHOOK_URL,
    }
  },

  /** Atatus Monitoring */
  atatus: {
    licenseKey: process.env.ATATUS_API_KEY,
    appName: process.env.ATATUS_PROJECT_NAME || 'Backend',
    captureBody: 'all',

    // Enable Atatus based on atatusEnableProbability, BUGS-413
    enabled: Math.random() * 100 < atatusEnableProbability,
  },

  /** Sentry Monitoring */
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.APP_ENV || 'dev',
    tracesSampleRate: 0,
  },

  /** Redis Configuration */
  redis: {
    isDisabled: process.env.REDIS_DISABLED === 'true' || false,
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    options: {}
  },

  /** Swagger Configuration */
  swagger: {
    url: process.env.SWAGGER_URL || 'http://localhost:8080',
  },

  /** AWS Configuration */
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
  },

  /** Stripe Configuration */
  stripe: {
    secretKey: process.env.STRIPE_SECRET,
  },

  /** Mattermost Configuration */
  mattermost: {
    apiUrl: process.env.MATTERMOST_API_URL,
    token: process.env.MATTERMOST_TOKEN,
    encryptionKey: process.env.MATTERMOST_ENCRYPTION_KEY,
  },
  
  /** 2Captcha Configuration */
  twoCaptcha: {
    apiKey: process.env.TWO_CAPTCHA_API_KEY || 'f86f3f0592660f8d6519951b3737d50a',
  },
};

// Computed URLs
config.isProduction = isProduction;
config.isDevelopment = isDevelopment;

module.exports = config;
