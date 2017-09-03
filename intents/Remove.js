//
// Handles removing a bet
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    const res = require('../' + this.event.request.locale + '/resources');
    let speech;
    const reprompt = res.strings.REMOVE_REPROMPT;
    const game = this.attributes[this.attributes.currentGame];

    // Do they have any bets to remove?
    if (!game.bets) {
      speech = res.strings.REMOVE_NOBETS;
    } else {
      let removeBet;

      // Which bet do they want to remove?
      if (this.event.request.intent.slots
        && this.event.request.intent.slots.Bet
        && this.event.request.intent.slots.Bet.value) {
        const betMapping = {'field': 'FieldBet', 'craps': 'CrapsBet',
          'pass': 'PassBet', 'don\'t pass': 'DontPassBet',
          'odds': 'OddsBet',
          'hard': 'HardwayBet', 'hardway': 'HardwayBet', 'hard way': 'HardwayBet'};
        const bet = this.event.request.intent.slots.Bet.value.toLowerCase();

        if (betMapping[bet]) {
          let i;
          const betType = betMapping[bet];

          for (i = 0; i < game.bets.length; i++) {
            if (game.bets[i].type === betType) {
              removeBet = i;
              break;
            }
          }

          if (removeBet === undefined) {
            speech = res.strings.REMOVE_BETNOTPLACED.replace('{0}', res.sayBetType(betType));
          }
        } else if (bet === 'last') {
          removeBet = game.bets.length - 1;
        } else if (bet === 'first') {
          removeBet = 0;
        } else {
          speech = res.strings.REMOVE_UNKNOWN_BETTYPE.replace('{0}', bet);
        }
      } else {
        // Default is last bet
        removeBet = game.bets.length - 1;
      }

      // Did we find a bet?
      if (!speech) {
        // Can't remove line bets after point
        if ((this.handler.state === 'POINT') &&
          ((game.bets[removeBet].type === 'PassBet') ||
           (game.bets[removeBet].type === 'DontPassBet'))) {
          speech = res.strings.REMOVE_CANTREMOVE_PASSBET;
        } else {
          speech = res.strings.REMOVE_BET.replace('{0}', res.sayBet(game.bets[removeBet]));
          game.bankroll += game.bets[removeBet].amount;
          game.bets.splice(removeBet, 1);
          if (game.bets.length === 0) {
            game.bets = undefined;
          }
        }
      }
    }

    speech += reprompt;
    utils.emitResponse(this.emit, this.event.request.locale, null, null, speech, reprompt);
  },
};
