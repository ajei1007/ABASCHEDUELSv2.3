const atatus = require('atatus-nodejs');
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const path = require('path');
const fs = require('fs');
const http = require('http');
const bodyParser = require('body-parser');
const { socketInit } = require('./socket');
// Swagger
const swaggerUI = require('swagger-ui-express');
const { swaggerInit, swaggerSpecs } = require('./swagger');
// Monitoring Services
const config = require('./config');

if (config.sentry.dsn) {
  const Sentry = require('@sentry/node');
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.sentry.environment,
    tracesSampleRate: config.sentry.tracesSampleRate,
    integrations: [
      Sentry.consoleIntegration({
        levels: ['error'],
      }),
    ],
  });
}
// Crons
const {
  sendReminderPushNotificationsDirectly,
  sendReminderPushNotificationsToUsers
} = require('./services/cron/remindernotification');
const {
  collectActiveUserNumberPerCompany,
} = require('./services/cron/collectActiveUserNumber');

// Rate Limiter
const { applyRateLimiterByRoute } = require('./middlewares/rateLimiter');

// App initialization
const app = express();

// Error Handler Middleware
const errorHandler = require('./middlewares/errorHandler');

// Monitoring Config
if (config.enableMonitoring && config.atatus.licenseKey) {
  // Atatus
  atatus.start(config.atatus);
  
  if (config.atatus.enabled) {
    console.log(`[ ${config.atatus.appName} ] APM service is running!`);
  } else {
    console.log(`[ ${config.atatus.appName} ] APM service is disabled for this instance`);
  }
}

// run the cron task for filling the cache with push notifications
if (
  config.mobileAppEnabled &&
  (config.isDevelopment || config.nodeAppInstance === '0')
) {
  sendReminderPushNotificationsDirectly();
}

sendReminderPushNotificationsToUsers();

collectActiveUserNumberPerCompany();

const integrationRoutes = require('./routes/integrations');
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/file');
const eventpairRoutes = require('./routes/eventpair');
const schedulerRoutes = require('./routes/scheduler');
const statisticsRoutes = require('./routes/statistics');
const statiscsServiceRoutes = require('./routes/statisticsService');
const settingsRoutes = require('./routes/settings');
const prioritiesRoutes = require('./routes/priorities');
const usersRoutes = require('./routes/users');
const groupingsRoutes = require('./routes/groupings');
const cancellationtypesRoutes = require('./routes/cancellationtypes');
const rolesRoutes = require('./routes/roles');
const branchesRoutes = require('./routes/branches');
const availabilitiesRoutes = require('./routes/availabilities');
const eventsRoutes = require('./routes/events');
const subgroupsRoutes = require('./routes/subgroups');
const capacityconstraintsRoutes = require('./routes/capacityconstraints');
const cancellationsRoutes = require('./routes/cancellations');
const statuseventsRoutes = require('./routes/statusevents');
const timeofftypesRoutes = require('./routes/timeofftypes');
const timeoffRoutes = require('./routes/timeoff');
const settingscompanyRoutes = require('./routes/settingscompany');
const mobiletokensRoutes = require('./routes/mobiletokens');
const nogapsconstraintRoutes = require('./routes/nogapsconstraint');
const branchtypeRoutes = require('./routes/branchtype');
const totaltypesRoutes = require('./routes/totaltypes');
const optimizerRoutes = require('./routes/optimizer');
const companiesRoutes = require('./routes/companies');
const pushnotificationsRoutes = require('./routes/pushnotifications');
const newconstraintgeneratorRoutes = require('./routes/newconstraintgenerator');
const drivetimelocationRoutes = require('./routes/drivetimelocation');
const locationstypesRoutes = require('./routes/locationstypes');
const drivetimebranchRoutes = require('./routes/drivetimebranch');
const constraintPlacementRoutes = require('./routes/constraintPlacement');
const industriesRoutes = require('./routes/industries');
const distancematrixRoutes = require('./routes/distancematrix');
const solutionGeneratorRoutes = require('./routes/solutionGenerator');
const emailSentPendingConfirmationRoutes = require('./routes/emailSentPendingConfirmations');
const authIntegrations = require('./routes/authIntegrations');
const solution_generator_routes = require('./routes/external/solution_generator');
const optimizer_routes = require('./routes/external/optimizer');
const createPortalSessionRouter = require('./routes/stripe/createPortalSession');
const eventClockTimerRouter = require('./routes/eventClockTimer');
const ticketsRouter = require('./routes/tickets');
const onboardingChecklistRouter = require('./routes/onboardingChecklist');
const surveyDataRouter = require('./routes/surveyData');
const optimizerActionLogsRouter = require('./routes/optimizerActionLogs');
const chatRouter = require('./routes/chat');

const compression = require('compression');

const db = require('./db/models');
const configs = require('./db/db.config');

app.use(cors({ origin: true }));
app.use(db.tenantMiddleware);

app.get('/', (_, res) =>
  res.json({ msg: 'ABA SCHEDULES V2 Backend server is running successfully!' }),
);
app.get('/api', (_, res) =>
  res.json({ msg: 'ABA SCHEDULES V2 Backend server is running successfully!' }),
);
app.use(
  '/api-docs',
  swaggerInit,
  swaggerUI.serve,
  swaggerUI.setup(swaggerSpecs),
);
app.use(bodyParser.json({ limit: '200mb' }));

app.use(compression());

// Apply rate limiting
app.use(applyRateLimiterByRoute);

require('./auth/auth');
app.use('/api/auth', authRoutes);
app.use('/api/file', fileRoutes);
app.use(
  '/api/eventpair',
  passport.authenticate('jwt', { session: false }),
  eventpairRoutes,
);

app.use(
  '/api/chat',
  passport.authenticate('jwt', { session: false }),
  chatRouter,
);

app.use(
  '/api/scheduler',
  passport.authenticate('jwt', { session: false }),
  schedulerRoutes,
);
app.use(
  '/api/statistics',
  passport.authenticate('jwt', { session: false }),
  statisticsRoutes,
);

app.use(
  '/api/integrations',
  passport.authenticate('jwt', { session: false }),
  integrationRoutes,
);

app.use(
  '/api/locationstypes',
  passport.authenticate('jwt', { session: false }),
  locationstypesRoutes,
);

app.use(
  '/api/auth/integrations',
  passport.authenticate('jwt', { session: false }),
  authIntegrations,
);

app.use('/api/statistics-service', statiscsServiceRoutes);

app.use(
  '/api/settings',
  passport.authenticate('jwt', { session: false }),
  settingsRoutes,
);

app.use(
  '/api/priorities',
  passport.authenticate('jwt', { session: false }),
  prioritiesRoutes,
);
app.use(
  '/api/users',
  passport.authenticate('jwt', { session: false }),
  usersRoutes,
);

app.use(
  '/api/groupings',
  passport.authenticate('jwt', { session: false }),
  groupingsRoutes,
);
app.use(
  '/api/cancellationtypes',
  passport.authenticate('jwt', { session: false }),
  cancellationtypesRoutes,
);
app.use(
  '/api/roles',
  passport.authenticate('jwt', { session: false }),
  rolesRoutes,
);
app.use(
  '/api/branches',
  passport.authenticate('jwt', { session: false }),
  branchesRoutes,
);
app.use(
  '/api/availabilities',
  passport.authenticate('jwt', { session: false }),
  availabilitiesRoutes,
);
app.use(
  '/api/events',
  passport.authenticate('jwt', { session: false }),
  eventsRoutes,
);
app.use(
  '/api/subgroups',
  passport.authenticate('jwt', { session: false }),
  subgroupsRoutes,
);

app.use(
  '/api/capacityconstraints',
  passport.authenticate('jwt', { session: false }),
  capacityconstraintsRoutes,
);
app.use(
  '/api/cancellations',
  passport.authenticate('jwt', { session: false }),
  cancellationsRoutes,
);
app.use(
  '/api/statusevents',
  passport.authenticate('jwt', { session: false }),
  statuseventsRoutes,
);

app.use(
  '/api/timeoff',
  passport.authenticate('jwt', { session: false }),
  timeoffRoutes,
);

app.use(
  '/api/timeofftypes',
  passport.authenticate('jwt', { session: false }),
  timeofftypesRoutes,
);
app.use(
  '/api/settingscompany',
  passport.authenticate('jwt', { session: false }),
  settingscompanyRoutes,
);
app.use(
  '/api/companies',
  passport.authenticate('jwt', { session: false }),
  companiesRoutes,
);
app.use(
  '/api/mobiletokens',
  passport.authenticate('jwt', { session: false }),
  mobiletokensRoutes,
);
app.use(
  '/api/nogapsconstraint',
  passport.authenticate('jwt', { session: false }),
  nogapsconstraintRoutes,
);
app.use(
  '/api/branchtype',
  passport.authenticate('jwt', { session: false }),
  branchtypeRoutes,
);
app.use(
  '/api/totaltypes',
  passport.authenticate('jwt', { session: false }),
  totaltypesRoutes,
);

app.use(
  '/api/optimizer',
  passport.authenticate('jwt', { session: false }),
  optimizerRoutes,
);

app.use(
  '/api/pushnotifications',
  passport.authenticate('jwt', { session: false }),
  pushnotificationsRoutes,
);

app.use(
  '/api/newconstraintgenerator',
  passport.authenticate('jwt', { session: false }),
  newconstraintgeneratorRoutes,
);
app.use(
  '/api/drivetimelocation',
  passport.authenticate('jwt', { session: false }),
  drivetimelocationRoutes,
);
app.use(
  '/api/drivetimebranch',
  passport.authenticate('jwt', { session: false }),
  drivetimebranchRoutes,
);
app.use(
  '/api/constraintPlacement',
  passport.authenticate('jwt', { session: false }),
  constraintPlacementRoutes,
);
app.use(
  '/api/industries',
  passport.authenticate('jwt', { session: false }),
  industriesRoutes,
);
app.use(
  '/api/distancematrix',
  passport.authenticate('jwt', { session: false }),
  distancematrixRoutes,
);
app.use(
  '/api/solution-generator',
  passport.authenticate('jwt', { session: false }),
  solutionGeneratorRoutes,
);

app.use(
  '/api/create-portal-session',
  passport.authenticate('jwt', { session: false }),
  createPortalSessionRouter,
);

app.use(
  '/api/eventClockTimer',
  passport.authenticate('jwt', { session: false }),
  eventClockTimerRouter,
);

app.use('/api/email-confirmation', emailSentPendingConfirmationRoutes);

app.use(
  '/api/tickets',
  passport.authenticate('jwt', { session: false }),
  ticketsRouter,
);

app.use(
  '/api/surveydata',
  passport.authenticate('jwt', {session:false}),
  surveyDataRouter,
)

app.use(
  '/api/optimizer-action-logs',
  passport.authenticate('jwt', { session: false }),
  optimizerActionLogsRouter,
)

app.use(
  '/api/onboardingChecklist',
  passport.authenticate('jwt', { session: false }),
  onboardingChecklistRouter,
);

// External
app.use(
  '/api/lambda/solution_generator',
  passport.authenticate('jwt', { session: false }),
  solution_generator_routes,
);
app.use(
  '/api/lambda/optimizer',
  passport.authenticate('jwt', { session: false }),
  optimizer_routes,
);

/* Google Address autocomplete for Searching/Selecting address */
app.get(
  '/api/places/autocomplete',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const input = encodeURIComponent(req.query.input || '');
    if (!config.googleMapsApiKey) {
      return res.status(500).json({ error: 'Google Maps API key is not configured' });
    }
    if (!input) {
      return res.status(400).json({ error: 'Input query parameter is required' });
    }
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${config.googleMapsApiKey}`;
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  }
);

const publicDir = path.join(__dirname, '../public');

if (fs.existsSync(publicDir)) {
  app.use('/', express.static(publicDir));

  app.get('*', function (_, response) {
    response.sendFile(path.resolve(publicDir, 'index.html'));
  });
}

app.use(errorHandler);

const PORT = config.port || 8080;
const server = http.createServer(app);

// SOCKET CODE
(async () => {
  try {
    const io = await socketInit(server);
    app.set('socketio', io);
  } catch (error) {
    console.error('Failed to initialize socket.io:', error);
  }
})();

server.keepAliveTimeout = 903000; // 5 seconds for keep-alive

async function start() {
  try {
    // sync ALL tenants before listening
    await Promise.all(
      Object.keys(configs).map(tenantId => {
        const models = db.getModels(tenantId);        // <-- no proxy trap here
        return models.sequelize.sync();
      })
    );
    server.listen(PORT, () =>
      console.log(`Listening on port ${PORT}`)
    );
  } catch (err) {
    console.error('Failed to sync databases:', err);
    process.exit(1);
  }
}

start();

module.exports = server;
