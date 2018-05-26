//
// Handles help
//

'use strict';

const utils = require('../utils');
const speechUtils = require('alexa-speech-utils')();

module.exports = {
  handleIntent: function() {
    const res = require('../' + this.event.request.locale + '/resources');
    let speech = '';
    let helpText;
    const reprompt = res.strings.HELP_REPROMPT;
    const game = this.attributes[this.attributes.currentGame];

    speech += res.strings.READ_BANKROLL.replace('{0}', game.bankroll);
    if (this.handler.state === 'POINT') {
      speech += res.strings.READ_POINT.replace('{0}', game.point);
    }
    if (game.bets) {
      const betNames = [];

      game.bets.forEach((bet) => {
        if (!bet.notWorking) {
          betNames.push(res.sayBet(bet));
        }
      });

      if (betNames.length) {
        speech += res.strings.READ_BETS.replace('{0}', speechUtils.and(betNames));
      }
    }

    helpText = speech;
    helpText += res.strings.HELP_CARD_TEXT.replace('{0}', res.betRange(game));
    speech += reprompt;

    utils.emitResponse(this, null, null,
            speech, reprompt, res.strings.HELP_CARD_TITLE, helpText);
  },
};
