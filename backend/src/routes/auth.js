const config = require('../config');
const express = require('express');
const passport = require('passport');

const AuthService = require('../services/auth');
const ForbiddenError = require('../services/notifications/errors/forbidden');
const EmailSender = require('../services/email');
const { getUsersRole } = require('../utils/getUserRole');
const wrapAsync = require('../helpers').wrapAsync;
const createCompany = require('../functions/createCompany');
const Helpers = require('../helpers');

const router = require('../utils/createRouter')();

/**
 *  @swagger
 *  components:
 *    schemas:
 *      Auth:
 *        type: object
 *        required:
 *          - email
 *          - password
 *        properties:
 *          email:
 *            type: string
 *            default: silver.inventor@gmail.com
 *            description: User email
 *          password:
 *            type: string
 *            default: password
 *            description: User password
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authorization operations
 */

/**
 * @swagger
 *  /api/auth/signin/local:
 *    post:
 *      tags: [Auth]
 *      summary: Logs user into the system
 *      description: Logs user into the system
 *      requestBody:
 *        description: Set valid user email and password
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Auth"
 *      responses:
 *        200:
 *          description: Successful login
 *        400:
 *          description: Invalid username/password supplied
 *      x-codegen-request-body-name: body
 */

router.post(
  '/signin/local',
  wrapAsync(async (req, res) => {
    const payload = await AuthService.signin(
      req.body.email,
      req.body.password,
      req,
    );
    res.status(200).send(payload);
  }),
);

router.post(
  '/switch-user',
  wrapAsync(async (req, res) => {
    const payload = await AuthService.switchUser(req.body.id, req);
    res.status(200).send(payload);
  }),
);
router.post(
  '/switch-company-admin',
  wrapAsync(async (req, res) => {
    const { id: companyId } = req.body;
    console.log(companyId);
    if (!companyId) {
      return res.status(400).send('Company ID is required.');
    }

    const payload = await AuthService.switchCompanyAdmin(companyId, req);
    res.status(200).send(payload);
  }),
);

/**
 * @swagger
 *  /api/auth/me:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      tags: [Auth]
 *      summary: Get current authorized user info
 *      description: Get current authorized user info
 *      responses:
 *        200:
 *          description: Successful retrieval of current authorized user data
 *        400:
 *          description: Invalid username/password supplied
 *      x-codegen-request-body-name: body
 */

router.get(
  '/me',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    if (!req.currentUser || !req.currentUser.id) {
      throw new ForbiddenError();
    }

    const { role } = await getUsersRole(req.currentUser);
    res.status(200).send({ ...req.currentUser, role_mobile: role });
  }),
);

router.put(
  '/password-reset',
  wrapAsync(async (req, res) => {
    const payload = await AuthService.passwordReset(
      req.body.token,
      req.body.password,
      req,
    );
    res.status(200).send(payload);
  }),
);

router.put(
  '/password-update',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const payload = await AuthService.passwordUpdate(
      req.body.currentPassword,
      req.body.newPassword,
      req,
    );
    res.status(200).send(payload);
  }),
);

router.put(
  '/update-push-notification-token',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const payload = await AuthService.updatePushNotificationToken(
      req.body.userId,
      req.body.expoPushToken,
      req,
    );
    res.status(200).send(payload);
  }),
);

router.post(
  '/send-email-address-verification-email',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    if (!req.currentUser) {
      throw new ForbiddenError();
    }

    const host = req.headers.origin;
    await AuthService.sendEmailAddressVerificationEmail(req.currentUser, req.body, host);
    const payload = true;
    res.status(200).send(payload);
  }),
);

router.post(
  '/send-password-reset-email',
  wrapAsync(async (req, res) => {
    const tenantId = req.get('X-Tenant-ID');
    if (!tenantId) return res.status(400).json({ error: 'Missing X-Tenant-ID header' });
    
    const host = config.frontendUrl[tenantId] ?? null;
    console.log('****** host', host)
    if (!host) throw new Error('Host is not defined!');

    await AuthService.sendPasswordResetEmail(
      req.body,
      'register',
      host,
      req.currentUser,
    );
    return res.status(200).send(true);
  }),
);

/**
 ** @swagger
 *  /api/auth/signup:
 *    post:
 *      tags: [Auth]
 *      summary: Register new user into the system
 *      description: Register new user into the system
 *      requestBody:
 *        description: Set valid user email and password
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Auth"
 *      responses:
 *        200:
 *          description: New user successfully signed up
 *        400:
 *          description: Invalid username/password supplied
 *        500:
 *          description: Some server error
 *      x-codegen-request-body-name: body
 */

const SECRET_CODE = 'iloveabaschedules';

router.post(
  '/signup',
  wrapAsync(async (req, res) => {
    if (req.body.secretCode !== SECRET_CODE) {
      throw new Error('Secret code is invalid!');
    }
    const payload = await AuthService.signup(
      req.body.email,
      req.body.password,
      req.body.firstName,
      req.body.lastName,
      req,
      req.headers.origin,
    );
    res.status(200).send(payload);
  }),
);

router.post(
  '/create-company',
  wrapAsync(async (req, res, next) => {
    const resigteredUser = await createCompany(req, next);

    if (resigteredUser) {
      const data = {
        user: {
          id: resigteredUser.id,
          email: resigteredUser.email,
        },
      };

      // Send welcome email
      const host = req.headers.origin;
      await AuthService.sendWelcomeEmail(resigteredUser.email, host, req.currentUser, req.body);

      const token = Helpers.jwtSign(data);
      return res.status(200).send(token);
    }
    return res.status(500).send('Something went wrong!');
  }),
);

router.put(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    if (!req.currentUser || !req.currentUser.id) {
      throw new ForbiddenError();
    }

    await AuthService.updateProfile(req.body.profile, req.currentUser);
    const payload = true;
    res.status(200).send(payload);
  }),
);

router.put(
  '/verify-email',
  wrapAsync(async (req, res) => {
    const payload = await AuthService.verifyEmail(
      req.body.token,
      req,
      req.headers.referer,
    );
    res.status(200).send(payload);
  }),
);

router.get('/email-configured', (req, res) => {
  const payload = EmailSender.isConfigured;
  res.status(200).send(payload);
});

router.get('/signin/google', (req, res, next) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: req.query.app,
  })(req, res, next);
});

router.get(
  '/signin/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false,
  }),

  function (req, res) {
    socialRedirect(res, req.query.state, req.user.token, config);
  },
);

router.get('/signin/microsoft', (req, res, next) => {
  passport.authenticate('microsoft', {
    scope: ['https://graph.microsoft.com/user.read openid'],
    state: req.query.app,
  })(req, res, next);
});

router.get(
  '/signin/microsoft/callback',
  passport.authenticate('microsoft', {
    failureRedirect: '/login',
    session: false,
  }),
  function (req, res) {
    socialRedirect(res, req.query.state, req.user.token, config);
  },
);

router.get(
  '/validate-token',
  wrapAsync(async (req, res) => {
    const payload = await AuthService.validateToken(
      req.query.token,
      req,
      req.headers.referer,
    );
    return res.status(200).send(payload);
  }),
);

router.use('/', require('../helpers').commonErrorHandler);

function socialRedirect(res, state, token, config) {
  res.redirect('/login?token=' + token);
}

module.exports = router;
