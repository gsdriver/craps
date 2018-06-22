//
// Rolls the dice
//

'use strict';

const utils = require('../utils');
const seedrandom = require('seedrandom');

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
    if (game.lineBet && !utils.getLineBet(game.bets)) {
      if (game.lineBet > game.bankroll) {
        speechError = res.strings.ROLL_CANTBET_LASTBETS.replace('{0}', game.bankroll);
        reprompt = res.strings.ROLL_INVALID_REPROMPT;
        utils.emitResponse(this, speechError, null, speech, reprompt);
        return;
      } else {
        game.bankroll -= game.lineBet;
        if (!game.bets) {
          game.bets = [];
        }
        game.bets.push(utils.createLineBet(game.lineBet, game.passPlayer));
      }
    }

    if (!game.lineBet) {
      // Place a bet for them if the bankroll can afford it
      // Should be edge case that they
      if (game.bankroll >= game.minBet) {
        speech = res.strings.ROLL_PASSBET_PLACED.replace('{0}', game.minBet);
        game.bankroll -= game.minBet;
        game.lineBet = game.minBet;
        game.passPlayer = true;
        const bet = utils.createLineBet(game.minBet, game.passPlayer);
        if (game.bets) {
          game.bets.push(bet);
        } else {
          game.bets = [bet];
        }
      } else {
        speechError = res.strings.ROLL_NOBETS;
        reprompt = res.strings.ROLL_INVALID_REPROMPT;
        utils.emitResponse(this, speechError, null, speech, reprompt);
        return;
      }
    }

    // Pick two random dice rolls
    const randomValue1 = seedrandom('1' + this.event.session.user.userId + (game.timestamp ? game.timestamp : ''))();
    const randomValue2 = seedrandom('2' + this.event.session.user.userId + (game.timestamp ? game.timestamp : ''))();
    const die1 = Math.floor(randomValue1 * 6) + 1;
    const die2 = Math.floor(randomValue2 * 6) + 1;
    if (die1 == 7) {
      die1--;
    }
    if (die2 == 7) {
      die2--;
    }
    game.dice = [die1, die2];
    game.rolls++;
    const total = game.dice[0] + game.dice[1];

    speech += '<audio src=\"https://s3-us-west-2.amazonaws.com/alexasoundclips/dice.mp3\"/> ';

    // Let's see if the dice fell off the table
    let offTable;
    if (game.rolls >= 4) {
      // Roll can be off table starting with fourth roll
      const randomValue = seedrandom(this.event.session.user.userId + (game.timestamp ? game.timestamp : ''))();
      if (Math.floor(randomValue * Math.sqrt(9 * (game.rolls - 4) + 1)) === 0) {
        offTable = true;
      }
    }
    if (offTable) {
      speech += res.strings.ROLL_OFF_TABLE;
      speech += '<audio src=\"https://s3-us-west-2.amazonaws.com/alexasoundclips/dice.mp3\"/> ';
    }

    speech += res.strings.ROLL_RESULT.replace('{0}', res.sayRoll(game.dice));

    // Figure out payouts
    let won = 0;
    let winningBets = 0;
    let lost = 0;
    game.bets.forEach((bet) => {
      if (!bet.notWorking) {
        // Wait- hardway bet is special!
        if ((bet.type === 'HardwayBet') || (bet.type === 'HardwaysBet')) {
          // If this is an easy roll where the dice don't match
          // then remove this value from the winningRoll array
          if (!(total % 2) && (game.dice[0] !== game.dice[1])) {
            if (bet.winningRolls[total]) {
              // Nope, you're going to lose
              bet.winningRolls[total] = undefined;
            }
          }

          // If this is the point mark this bet for removal
          // But don't forget to add back their bets!
          if (total === game.point) {
            const rollsDown = (bet.winningRolls[total]) ?
                bet.losingRolls.length - 2 :
                bet.losingRolls.length - 1;
            game.bankroll += (rollsDown * bet.amount) / 4;
            bet.remove = true;
          }
        }

        // Hardways is a special case because it's actually four bets in one
        if (bet.type === 'HardwaysBet') {
          let removeRoll;

          if (bet.winningRolls[total]) {
            won += Math.floor(bet.amount * bet.winningRolls[total]);
            winningBets += bet.amount;
            removeRoll = true;
          } else if (bet.losingRolls.indexOf(total) !== -1) {
            if (total === 7) {
              lost += (bet.losingRolls.length - 1) * bet.amount / 4;
              bet.remove = true;
            } else {
              lost += bet.amount / 4;
              removeRoll = true;
            }
          }

          if (removeRoll) {
            const i = bet.losingRolls.indexOf(total);
            bet.losingRolls.splice(i, 1);
            if (bet.losingRolls.length === 1) {
              // You've lost all hardway bets, so just remove it
              bet.remove = true;
            }
            bet.winningRolls[total] = undefined;
          }
        } else {
          if (bet.winningRolls[total]) {
            won += Math.floor(bet.amount * bet.winningRolls[total]);
            winningBets += bet.amount;

            if (bet.odds) {
              won += Math.floor(bet.odds * bet.oddsPayout);
              winningBets += bet.odds;
            }
            bet.remove = true;
          } else if (bet.losingRolls.indexOf(total) !== -1) {
            lost += bet.amount;
            if (bet.odds) {
              lost += bet.odds;
            }
            bet.remove = true;
          }
        }
      }
    });

    // Transition game state if necessary
    let newState = this.handler.state;
    if (this.handler.state === 'NOPOINT') {
      // Transitions to point if not 2, 3, 7, 11, or 12
      if ([2, 3, 7, 11, 12].indexOf(total) === -1) {
        newState = 'POINT';
        game.point = total;
        utils.getLineBet(game.bets).point = total;
        speech += res.strings.ROLL_POINT_ESTABLISHED;
      }
    } else {
      // Transitions to nopoint if 7 or point was hit
      if ((total === 7) || (total === game.point)) {
        newState = 'NOPOINT';
        game.point = undefined;
        game.rounds = (game.rounds + 1) || 1;
        if (total === 7) {
          speech += res.strings.ROLL_SEVEN_CRAPS;
        } else {
          speech += res.strings.ROLL_GOT_POINT;
        }
        reprompt = res.strings.ROLL_COME_REPROMPT;
      }
    }

    // Any come bets need to be transitioned separately
    if (game.bets) {
      game.bets.forEach((bet) => {
        if (bet.state === 'NOPOINT') {
          if ([2, 3, 7, 11, 12].indexOf(total) === -1) {
            bet.state = 'POINT';
            bet.point = total;
            if (bet.type === 'ComeBet') {
              bet.winningRolls = {};
              bet.winningRolls[bet.point] = 1;
              bet.losingRolls = [7];
            } else if (bet.type === 'DontComeBet') {
              bet.winningRolls = {7: 1};
              bet.losingRolls = [bet.point];
            }
          }
        } else if (bet.state === 'POINT') {
          if ((total === 7) || (total === bet.point)) {
            bet.state = 'NOPOINT';
            bet.point = undefined;
          }
        }
      });
    }

    // Go through and update bets (remove one-time bets
    // or change winning numbers for the line bet)
    if (game.bets) {
      let newbets;
      game.bets.forEach((bet) => {
        if (bet.type === 'PassBet') {
          if ((this.handler.state === 'NOPOINT')
            && (newState === 'POINT')) {
            bet.winningRolls = {};
            bet.winningRolls[game.point] = 1;
            bet.losingRolls = [7];
          }
        }
        if (bet.type === 'DontPassBet') {
          if ((this.handler.state === 'NOPOINT')
            && (newState === 'POINT')) {
            bet.winningRolls = {7: 1};
            bet.losingRolls = [game.point];
          }
        }
        if (!bet.remove) {
          if (!newbets) {
            newbets = [];
          }
          newbets.push(bet);
        }
      });
      game.bets = newbets;
    }

    // If we transitioned state, we need to either mark
    // some bets as not working, or put them back to working
    if (game.bets) {
      if ((this.handler.state === 'POINT') &&
        (newState === 'NOPOINT')) {
        game.bets.forEach((bet) => {
          if (bet.type === 'PlaceBet') {
            bet.notWorking = true;
          }
        });
      } else if ((this.handler.state === 'NOPOINT') &&
        (newState === 'POINT')) {
        game.bets.forEach((bet) => {
          bet.notWorking = undefined;
        });
      }
    }

    if (won > lost) {
      speech += res.strings.ROLL_NET_WIN.replace('{0}', won - lost);
    } else if (lost > won) {
      speech += res.strings.ROLL_NET_LOSE.replace('{0}', lost - won);
    } else if (won > 0) {
      speech += res.strings.ROLL_NET_PUSH;
    }

    // OK, let's see if they are out of money
    // Remember we already deducted bets from their bankroll (for a loss)
    game.bankroll += (won + winningBets);
    this.handler.state = newState;

    // If they have no units left, and they no longer have any
    // bets in play, then reset the bankroll
    if ((game.bankroll < game.minBet) &&
      (!game.bets || (game.bets.length == 0))) {
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
    utils.emitResponse(this, speechError, null, speech, reprompt);
  },
};
