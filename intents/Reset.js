//
// Resets your bankroll and clears all bets
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // We will ask them if they want to reset
    const res = require('../' + this.event.request.locale + '/resources');
    let speech;
    let reprompt;
    const game = this.attributes[this.attributes.currentGame];

    if (game.canReset) {
      speech = res.strings.RESET_CONFIRM;
      reprompt = res.strings.RESET_CONFIRM;
      this.attributes.savedState = this.handler.state;
      this.handler.state = 'CONFIRMRESET';
    } else {
      speech = res.strings.RESET_NORESET;
      reprompt = res.strings.RESET_INVALIDACTION_REPROMPT;
    }

    utils.emitResponse(this, null, null, speech, reprompt);
  },
  handleYesReset: function() {
    // Confirmed - let's reset
    const res = require('../' + this.event.request.locale + '/resources');
    const game = this.attributes[this.attributes.currentGame];

    // Reset the bankroll and bets
    game.bankroll = 1000;
    game.high = 1000;
    game.bets = undefined;
    game.lineBet = undefined;

    this.handler.state = this.attributes.savedState;
    this.attributes.savedState = undefined;
    utils.emitResponse(this, null, null,
          res.strings.RESET_COMPLETED, res.strings.RESET_REPROMPT);
  },
  handleNoReset: function() {
    // Nope, they are not going to reset - so go back to start a new game
    const res = require('../' + this.event.request.locale + '/resources');

    this.handler.state = this.attributes.savedState;
    this.attributes.savedState = undefined;
    utils.emitResponse(this, null, null,
          res.strings.RESET_ABORTED, res.strings.RESET_REPROMPT);
  },
};
