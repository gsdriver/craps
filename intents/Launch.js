//
// Launches the skill
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // Tell them the rules, their bankroll and offer a few things they can do
    const res = require('../' + this.event.request.locale + '/resources');
    const reprompt = res.strings.LAUNCH_REPROMPT;
    let speech;
    let linQ;

    if (this.attributes.firstName) {
      speech = res.strings.LAUNCH_WELCOME_NAME.replace('{0}', this.attributes.firstName);
    } else {
      speech = res.strings.LAUNCH_WELCOME;
    }

    const game = this.attributes[this.attributes.currentGame];

    // If they aren't registered users, tell them about that option
    if (!this.event.session.user.accessToken && process.env.ALLOWREGISTER) {
      speech += res.strings.LAUNCH_REGISTER;
      linQ = true;
    }

    speech += reprompt;
    this.handler.state = 'NOPOINT';
      if (linQ) {
        utils.emitResponse(this.emit, this.event.request.locale, null, null,
              null, reprompt, null, null, speech);
      } else {
        utils.emitResponse(this.emit, this.event.request.locale, null, null,
              speech, reprompt);
      }
  },
};
