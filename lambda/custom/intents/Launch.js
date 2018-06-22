//
// Launches the skill
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // Tell them the rules, their bankroll and offer a few things they can do
    const res = require('../' + this.event.request.locale + '/resources');
    let speech;
    let linQ;
    const game = this.attributes[this.attributes.currentGame];
    const reprompt = (game.lineBet)
      ? res.strings.LAUNCH_REPROMPT_ROLL
      : res.strings.LAUNCH_REPROMPT;

    if (this.attributes.firstName) {
      speech = res.strings.LAUNCH_WELCOME_NAME.replace('{0}', this.attributes.firstName);
    } else {
      speech = res.strings.LAUNCH_WELCOME;
    }

    // Add the bankroll
    speech += res.strings.READ_BANKROLL.replace('{0}', game.bankroll);
    speech += utils.readBets(this);

    // If they aren't registered users, tell them about that option
    if (!this.event.session.user.accessToken && process.env.ALLOWREGISTER) {
      speech += res.strings.LAUNCH_REGISTER;
      linQ = true;
    }

    speech += reprompt;

    if (!this.attributes.STATE) {
      this.handler.state = 'NOPOINT';
    }

    if (linQ) {
      utils.emitResponse(this, null, null,
            null, reprompt, null, null, speech);
    } else {
      utils.emitResponse(this, null, null,
            speech, reprompt);
    }
  },
};
