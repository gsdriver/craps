//
// Handles repeat, which reads all bets and game state
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    const res = require('../' + this.event.request.locale + '/resources');
    let speech = '';
    const reprompt = res.strings.READ_REPROMPT;
    const game = this.attributes[this.attributes.currentGame];

    speech += res.strings.READ_BANKROLL.replace('{0}', game.bankroll);
    speech += utils.readBets(this);
    speech += reprompt;
    utils.emitResponse(this.emit, this.event.request.locale,
        null, null, speech, reprompt);
  },
};
