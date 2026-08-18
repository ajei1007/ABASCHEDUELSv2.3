const { getNotification } = require('../../notifications/helpers');

module.exports = class WelcomeEmail {
  constructor(to, link) {
    this.to = to;
    this.link = link;
  }

  get subject() {
    return getNotification(
      'emails.welcome.subject',
      getNotification('app.title'),
    );
  }

  get html() {
    return getNotification(
      'emails.welcome.body',
      getNotification('app.title'),
      this.to,
      this.link,
    );
  }
};
