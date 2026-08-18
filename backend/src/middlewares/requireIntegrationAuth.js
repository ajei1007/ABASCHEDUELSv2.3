

// middlewares/requireIntegrationAuth.js
const { checkLoginCredentialOfUser } = require('../db/api/authIntegrations');
const { loginToRethink } = require('../integration/actions/rethink');
const { loginToTherapyPMS } = require('../integration/actions/therapypms');

const loginHandlers = {
  rethink: loginToRethink,
  therapypms: loginToTherapyPMS,
};

async function requireIntegrationAuth(req, res, next) {
  const software = req.params.software;
  const loginFn = loginHandlers[software];

  if (!loginFn) {
    return res.status(400).send({ result: `Unsupported software: ${software}` });
  }

  // STEP 0: Get token from already provided credentials
  const userCreds = await checkLoginCredentialOfUser({
    userId: req.currentUser.id,
    companyId: req.currentUser.companyId,
    integratingSoftware: software,
  });

  if (!userCreds.length) {
    return res.status(409).send({ result: 'Credentials not found' });
  }

  // STEP 1: Authenticate user/company with the credentials
  const token = await loginFn(userCreds[0].credentials, req.currentUser);
  if (!token) {
    return res.status(400).send({ result: 'Invalid credentials' });
  }

  // STEP 2: Attach token to the request object
  req.integrationToken = token;
  next();
}

module.exports = requireIntegrationAuth;
