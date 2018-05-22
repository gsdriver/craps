//
// Handles removing a bet
//

'use strict';

const utils = require('../utils');
const ads = require('../ads');

module.exports = {
  handleIntent: function() {
    const res = require('../' + this.event.request.locale + '/resources');
    let speech;
    const reprompt = res.strings.REMOVE_REPROMPT;
    const game = this.attributes[this.attributes.currentGame];

    // Do they have any bets to remove?
    if (!game.bets && (this.event.request.intent.name !== 'RemoveIntent')) {
      ads.getAd(this.attributes, 'craps', this.event.request.locale, (adText) => {
        utils.emitResponse(this, null, res.strings.EXIT_GAME.replace('{0}', adText), null, null);
      });
    } else {
      // Do they have any bets to remove?
      if (!game.bets) {
        speech = res.strings.REMOVE_NOBETS;
      } else {
        let removeBet;
        let oddsBet;

        // Which bet do they want to remove?
        if (this.event.request.intent.slots
          && this.event.request.intent.slots.Bet
          && this.event.request.intent.slots.Bet.value) {
          const betMapping = {'field': 'FieldBet', 'craps': 'CrapsBet',
            'pass': 'PassBet', 'don\'t pass': 'DontPassBet',
            'odds': 'OddsBet',
            'hard': 'HardwayBet|HardwaysBet', 'hardway': 'HardwayBet|HardwaysBet',
            'hard way': 'HardwayBet|HardwaysBet',
            'yo': 'YoBet', 'yo eleven': 'YoBet', 'eleven': 'YoBet', '11': 'YoBet',
            'horn': 'HornBet', 'seven': 'SevenBet', 'big red': 'SevenBet',
            'come': 'ComeBet', 'don\'t come': 'DontComeBet',
            'place': 'PlaceBet', 'place bet': 'PlaceBet'};
          const bet = this.event.request.intent.slots.Bet.value.toLowerCase();

          if (betMapping[bet]) {
            let i;
            const betType = betMapping[bet].split('|');

            // Odds bet is a special case
            if (betType[0] === 'OddsBet') {
              // Go backwards and find a bet with odds
              for (i = game.bets.length - 1; i >= 0; i--) {
                if (game.bets[i].odds) {
                  oddsBet = i;
                  break;
                }
              }
            } else {
              for (i = 0; i < game.bets.length; i++) {
                if (betType.indexOf(game.bets[i].type) !== -1) {
                  removeBet = i;
                  break;
                }
              }
            }

            if ((removeBet === undefined) && (oddsBet === undefined)) {
              speech = res.strings.REMOVE_BETNOTPLACED.replace('{0}', res.sayBetType(betType[0]));
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
          if (oddsBet !== undefined) {
            game.bankroll += game.bets[oddsBet].odds;
            game.bets[oddsBet].odds = undefined;
            game.bets[oddsBet].oddsPayout = undefined;
            speech = res.strings.REMOVE_ODDS.replace('{0}', res.sayBetType(game.bets[oddsBet].type));
          } else if ((this.handler.state === 'POINT') &&
            ((game.bets[removeBet].type === 'PassBet') ||
             (game.bets[removeBet].type === 'DontPassBet'))) {
            // Can't remove line bets after point
            speech = res.strings.REMOVE_CANTREMOVE_PASSBET;
          } else if (game.bets[removeBet].state === 'POINT') {
            // Can't remove a come bet
            speech = res.strings.REMOVE_CANTREMOVE_COMEBET;
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
      utils.emitResponse(this, null, null, speech, reprompt);
    }
  },
};
