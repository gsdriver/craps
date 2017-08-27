//
// Handles repeat, which reads all bets and game state
//

'use strict';

const utils = require('../utils');
const speechUtils = require('alexa-speech-utils')();

module.exports = {
  handleIntent: function() {
    const res = require('../' + this.event.request.locale + '/resources');
    let speech = '';
    const reprompt = res.strings.READ_REPROMPT;
    const game = this.attributes[this.attributes.currentGame];

    speech += res.strings.READ_BANKROLL.replace('{0}', game.bankroll);
    if (this.handler.state === 'POINT') {
      speech += res.strings.READ_POINT.replace('{0}', game.point);
    }
    if (game.bets) {
      const betNames = [];

      game.bets.forEach((bet) => {
        betNames.push(res.sayBet(bet));
      });
      speech += res.strings.READ_BETS.replace('{0}', speechUtils.and(betNames));
    }

    speech += reprompt;
    utils.emitResponse(this.emit, this.event.request.locale,
        null, null, speech, reprompt);
  },
};
