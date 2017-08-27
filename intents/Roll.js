//
// Rolls the dice
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // When you roll, you have to at least have a line bet placed
    let speechError;
    let speech = '';
    const res = require('../' + this.event.request.locale + '/resources');
    const game = this.attributes[this.attributes.currentGame];
    let reprompt = res.strings.ROLL_REPROMPT;

    // If they have a line bet but no bet array - it means they want to reuse
    // the same bet from last time - let's make sure they can cover it
    if (game.lineBet && !game.bets) {
      if (game.lineBet < game.bankroll) {
        speechError = res.strings.ROLL_CANTBET_LASTBETS.replace('{0}', game.bankroll);
        reprompt = res.strings.ROLL_INVALID_REPROMPT;
        utils.emitResponse(this.emit, this.event.request.locale,
              speechError, null, speech, reprompt);
        return;
      } else {
        game.bankroll -= game.lineBet;
        game.bets = {type: 'PassBet', amount: game.lineBet};
      }
    }

    if (!game.lineBet) {
      speechError = res.strings.ROLL_NOBETS;
      reprompt = res.strings.ROLL_INVALID_REPROMPT;
      utils.emitResponse(this.emit, this.event.request.locale, speechError, null, speech, reprompt);
      return;
    }

    // Pick two random dice rolls
    game.dice = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
    const total = game.dice[0] + game.dice[1];

    // Let's see if the dice fell off the table

    speech += res.strings.ROLL_RESULT.replace('{0}', res.sayRoll(game.dice));

    // Figure out payouts
    let won = 0;
    let lost = 0;
    game.bets.forEach((bet) => {
      switch (bet.type) {
        case 'PassBet':
          if (this.handler.state === 'NOPOINT') {
            if ([2, 3, 12].indexOf(total) !== -1) {
              lost += bet.amount;
            } else if ([7, 11].indexOf(total) !== -1) {
              won += bet.amount;
            }
          } else {
            if (total === game.point) {
              won += bet.amount;
            } else if (total === 7) {
              lost += bet.amount;
            }
          }
          break;
        case 'OddsBet':
          // Only pays after point
          if ((this.handler.state === 'POINT') && (total === game.point)) {
            const payout = {4: 2, 5: 1.5, 6: 1.2, 8: 1.2, 9: 1.5, 10: 2};
            won += payout[total] * bet.amount;
          } else if ((this.handler.state === 'POINT') && (total === 7)) {
            lost += bet.amount;
          }
          break;
        default:
          break;
      }
    });

    if (won > lost) {
      speech += res.strings.ROLL_NET_WIN.replace('{0}', won - lost);
    } else if (lost < won) {
      speech += res.strings.ROLL_NET_LOSE.replace('{0}', lost - won);
    } else if (won > 0) {
      speech += res.strings.ROLL_NET_PUSH;
    }

    // Transition game state if necessary
    if (this.handler.state === 'NOPOINT') {
      // Transitions to point if not 2, 3, 7, 11, or 12
      if ([2, 3, 7, 11, 12].indexOf(total) === -1) {
        this.handler.state = 'POINT';
        game.point = total;
      }
    } else {
      // Transitions to nopoint if 7 or point was hit
      if ((total === 7) || (total === game.point)) {
        game.point = undefined;
        game.bets = undefined;
        this.handler.state = 'NOPOINT';
        game.rounds++;
      }
    }

    // OK, let's see if they are out of money
    // Remember we already deducted bets from their bankroll (for a loss)
    game.bankroll += won;

    // If they have no units left, reset the bankroll
    if (game.bankroll < game.minBet) {
      if (game.canReset) {
        game.bankroll = 1000;
        speech += res.strings.ROLL_BUSTED;
        reprompt = res.strings.ROLL_BUSTED_REPROMPT;
      }
    }

    // Now let's update the scores
    game.timestamp = Date.now();
    if (game.bankroll > game.high) {
      game.high = game.bankroll;
    }

    // And reprompt
    speech += reprompt;
    utils.emitResponse(this.emit, this.event.request.locale,
                          speechError, null, speech, reprompt);
  },
};