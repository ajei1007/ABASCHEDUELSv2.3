const UsersDBApi = require('../db/api/users');
const ValidationError = require('./notifications/errors/validation');
const ForbiddenError = require('./notifications/errors/forbidden');
const bcrypt = require('bcrypt');
const EmailAddressVerificationEmail = require('./email/list/addressVerification');
const PasswordResetEmail = require('./email/list/passwordReset');
const EmailSender = require('./email');
const config = require('../config');
const helpers = require('../helpers');
const WelcomeEmail = require('./email/list/welcome');
const CompaniesDBApi = require('../db/api/companies');

class Auth {
  static async signup(email, password, firstName, lastName, options = {}, host) {
    const user = await UsersDBApi.findBy({ email });

    let newUser = null;
    if (user) {
      if (!user.company) {
        newUser = await UsersDBApi.updateUnverified(
         user.id,
          {
            firstName,
            lastName,
            email,
            password,
          },
          options,
        );
      } else {
        throw new ValidationError(
          'auth.emailAlreadyInUse',
        );
      }
    } else {
      newUser = await UsersDBApi.createFromAuth(
        {
          firstName,
          lastName,
          email,
          password,
        },
        options,
      );
    }

    if (EmailSender.isConfigured) {
      await this.sendEmailAddressVerificationEmail(
        newUser,
        options.body,
        host,
      );
    }

    const data = {
      user: {
        id: newUser.id,
        email: newUser.email
      }
    };

    return helpers.jwtSign(data);
  }

  static async signin(email, password, options = {}) {
    const user = await UsersDBApi.findBy({ email });

    if (!user) {
      throw new ValidationError(
        'auth.userNotFound',
      );
    }

    if (user.disabled) {
      throw new ValidationError(
        'auth.userDisabled',
      );
    }

    if (!user.password) {
      throw new ValidationError(
        'auth.wrongPassword',
      );
    }

    if (!EmailSender.isConfigured) {
      user.emailVerified = true;
    }

    if (!user.emailVerified) {
      throw new ValidationError(
        'auth.userNotVerified',
      );
    }

    const passwordsMatch = await bcrypt.compare(
      password,
      user.password,
    );

    if (!passwordsMatch) {
      throw new ValidationError(
        'auth.wrongPassword',
      );
    }

    const data = {
      user: {
        id: user.id,
        email: user.email
      }
    };

    return helpers.jwtSign(data);
  }

  static async switchUser(id, options = {}) {
    const user = await UsersDBApi.findBy({ id });

    if (!user) {
      throw new ValidationError(
        'auth.userNotFound',
      );
    }

    if (user.disabled) {
      throw new ValidationError(
        'auth.userDisabled',
      );
    }

    if (!user.password) {
      throw new ValidationError(
        'auth.wrongPassword',
      );
    }

    if (!EmailSender.isConfigured) {
      user.emailVerified = true;
    }

    if (!user.emailVerified) {
      throw new ValidationError(
        'auth.userNotVerified',
      );
    }

    const data = {
      user: {
        id: user.id,
        email: user.email
      }
    };

    return helpers.jwtSign(data);
  }

  static async switchCompanyAdmin(companyId, req) {
    // Fetch the company by ID
    const company = await CompaniesDBApi.findBy({ id: companyId });
    if (!company) {
      throw new ValidationError('auth.companyNotFound');
    }
  
    // Find the Super Admin for the company
    const adminUser = await UsersDBApi.findOneAdminOfCompany(
      { companyId },
      null, // Options (e.g., transaction, if needed)
      'Super Admin' // Role name to filter for
    );
    if (!adminUser) {
      throw new ValidationError('auth.superAdminNotFound');
    }
    
    // Generate a JWT for the Super Admin
    const data = {
      user: {
        id: adminUser.id,
        email: adminUser.email,
      },
    };
    
    return helpers.jwtSign(data);
  }
  
  

  static async sendEmailAddressVerificationEmail(
    currentUser,
    payload,
    host,
  ) {
    const { email } = currentUser;

    if (!EmailSender.isConfigured) {
      throw new Error(
        `Email provider is not configured. Please configure it at backend/config/<environment>.json.`,
      );
    }

    let link;
    try {
      const token = await UsersDBApi.generateEmailVerificationToken(
        email,
      );
      if (!token) {
        throw new ValidationError(
          'auth.emailAddressVerificationEmail.error',
        );
      }
      link = `${host}/create-company?token=${token}`;
    } catch (error) {
      throw new ValidationError(
        'auth.emailAddressVerificationEmail.error',
      );
    }

    const emailAddressVerificationEmail = new EmailAddressVerificationEmail(
      email,
      link,
    );

    return new EmailSender().send({
      email: emailAddressVerificationEmail,
      companyId: currentUser?.companyId || '',
      payload,
    });
  }

  static async sendPasswordResetEmail(payload, type = 'register', host, currentUser) {
    const { email } = payload;

    if (!EmailSender.isConfigured) {
      throw new Error(
        `Email provider is not configured. Please configure it at backend/config/<environment>.json.`,
      );
    }

    let link;

    try {
      const token = await UsersDBApi.generatePasswordResetToken(
        email,
      );
      if (!token) {
        throw new ValidationError(
          'auth.passwordReset.error',
        );
      }
      link = `${host}/password-reset?token=${token}`;
    } catch (error) {
      throw new ValidationError(
        'auth.passwordReset.error',
      );
    }

    let passwordResetEmail;
    if (type === 'register') {
      passwordResetEmail = new PasswordResetEmail(
        email,
        link,
      );
    }

    return new EmailSender().send({
      email: passwordResetEmail,
      companyId: currentUser?.companyId || '',
      payload,
    });
  }

  static async sendWelcomeEmail(email, host, currentUser, payload) {
    if (!EmailSender.isConfigured) {
      throw new Error(
        `Email provider is not configured!`,
      );
    }

    const link = `${host}/admin/scheduler`;

    let welcomeEmail;
    welcomeEmail = new WelcomeEmail(
      email,
      link,
    );

    return new EmailSender().send({
      email: welcomeEmail,
      companyId: currentUser?.companyId || '',
      payload,
    });
  }

  static async verifyEmail(token, options = {}) {
    const user = await UsersDBApi.findByEmailVerificationToken(
      token,
      options,
    );

    if (!user) {
      throw new ValidationError(
        'auth.emailAddressVerificationEmail.invalidToken',
      );
    }

    return UsersDBApi.markEmailVerified(
      user.id,
      options,
    );
  }

  static async passwordUpdate(currentPassword, newPassword, options) {
    const currentUser = options.currentUser || null;
    if (!currentUser) {
      throw new ForbiddenError();
    }

    const currentPasswordMatch = await bcrypt.compare(
      currentPassword,
      currentUser.password,
    );

    if (!currentPasswordMatch) {
      throw new ValidationError(
        'auth.wrongPassword'
      )
    }

    const newPasswordMatch = await bcrypt.compare(
      newPassword,
      currentUser.password,
    );

    if (newPasswordMatch) {
      throw new ValidationError(
        'auth.passwordUpdate.samePassword'
      )
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      config.bcrypt.saltRounds,
    );

    return UsersDBApi.updatePassword(
      currentUser.id,
      hashedPassword,
      options,
    );
  }

  static async passwordReset(
    token,
    password,
    options = {},
  ) {
    const user = await UsersDBApi.findByPasswordResetToken(
      token,
      options,
    );

    if (!user) {
      throw new ValidationError(
        'auth.passwordReset.invalidToken',
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      config.bcrypt.saltRounds,
    );

    return UsersDBApi.updatePassword(
      user.id,
      hashedPassword,
      options,
    );
  }

  static async updateProfile(data, currentUser) {
    let transaction = await db.sequelize.transaction();

    try {
      await UsersDBApi.findBy(
        {id: currentUser.id},
        {transaction},
      );

      await UsersDBApi.update(
        currentUser.id,
        data,
        {
          currentUser,
          transaction
        },
      );


      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async updatePushNotificationToken(userId, expoPushToken, options = {}) {
    if (!userId) throw new ForbiddenError();
    try {
      const newUser = await UsersDBApi.updatePushToken( userId, expoPushToken, options);
      return newUser;
    } catch (error) {
      throw error;
    }
  }

  static async validateToken(token, options) {
    const user = await UsersDBApi.findByEmailVerificationToken(
      token,
      options,
    );

    if (!user) {
      throw new ValidationError(
        'auth.emailAddressVerificationEmail.invalidToken',
      );
    }
    return user;
  }
}

module.exports = Auth;
