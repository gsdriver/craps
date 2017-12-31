//
// Utility functions
//

'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const speechUtils = require('alexa-speech-utils')();
const request = require('request');

// Global session ID
let globalEvent;

module.exports = {
  emitResponse: function(emit, locale, error, response, speech,
                        reprompt, cardTitle, cardText, linQ) {
    const formData = {};

    // Async call to save state and logs if necessary
    if (process.env.SAVELOG) {
      const result = ((linQ) ? linQ : (error) ? error : ((response) ? response : speech));
      formData.savelog = JSON.stringify({
        event: globalEvent,
        result: result,
      });
    }
    if (response) {
      formData.savedb = JSON.stringify({
        userId: globalEvent.session.user.userId,
        attributes: globalEvent.session.attributes,
      });
    }

    if (formData.savelog || formData.savedb) {
      const params = {
        url: process.env.SERVICEURL + 'craps/saveState',
        formData: formData,
      };

      request.post(params, (err, res, body) => {
        if (err) {
          console.log(err);
        }
      });
    }

    if (!process.env.NOLOG) {
      console.log(JSON.stringify(globalEvent));
    }

    if (error) {
      const res = require('./' + locale + '/resources');
      console.log('Speech error: ' + error);
      emit(':ask', error, res.ERROR_REPROMPT);
    } else if (response) {
      emit(':tell', response);
    } else if (cardTitle) {
      emit(':askWithCard', speech, reprompt, cardTitle, cardText);
    } else if (linQ) {
      emit(':askWithLinkAccountCard', linQ, reprompt);
    } else {
      emit(':ask', speech, reprompt);
    }
  },
  betAmount: function(intent, game) {
    let amount = game.minBet;

    if (intent.slots.Amount && intent.slots.Amount.value) {
      // If the bet amount isn't an integer, we'll use the default value (5 units)
      const val = parseInt(intent.slots.Amount.value);
      if (!isNaN(val)) {
        amount = val;
      }
    } else {
      // Check if they have a previous bet amount and reuse that
      if (game.bets && (game.bets.length > 0)) {
        amount = game.bets[0].amount;
      } else if (game.lineBet) {
        amount = game.lineBet;
      }
    }

    return amount;
  },
  createLineBet: function(amount, pass) {
    let bet;

    if (pass) {
      bet = {
        type: 'PassBet',
        amount: amount,
        winningRolls: {7: 1, 11: 1},
        losingRolls: [2, 3, 12],
      };
    } else {
      bet = {
        type: 'DontPassBet',
        amount: amount,
        winningRolls: {2: 1, 3: 1, 12: 0},
        losingRolls: [7, 11],
      };
    }

    return bet;
  },
  getLineBet: function(bets) {
    let linebet;

    if (bets) {
      bets.forEach((bet) => {
        if ((bet.type === 'PassBet') ||
            (bet.type === 'DontPassBet')) {
          linebet = bet;
        }
      });
    }

    return linebet;
  },
  getBaseBet: function(game) {
    let i;
    let baseBet;

    if (game.bets) {
      for (i = game.bets.length - 1; i >= 0; i--) {
        if ((game.bets[i].type === 'ComeBet')
          || (game.bets[i].type === 'DontComeBet')) {
          // You can only place this bet if there is a point
          if (game.bets[i].state === 'POINT') {
            baseBet = game.bets[i];
            break;
          }
        } else if ((game.bets[i].type === 'PassBet')
          || (game.bets[i].type === 'DontPassBet')) {
          if (game.point) {
            baseBet = game.bets[i];
            break;
          }
        }
      }
    }

    return baseBet;
  },
  betsMatch: function(bet1, bet2) {
    // Bets match if the types match
    // and numbers for Place or Hardway bets
    let match = false;

    if (bet1.type === bet2.type) {
      if ((bet1.type === 'PlaceBet') || (bet1.type === 'HardwayBet')) {
        let bet1Number;
        let bet2Number;
        let roll;

        for (roll in bet1.winningRolls) {
          if (roll) {
            bet1Number = roll;
          }
        }
        for (roll in bet2.winningRolls) {
          if (roll) {
            bet2Number = roll;
          }
        }
        match = (bet1Number === bet2Number);
      } else {
        match = true;
      }
    }
    return match;
  },
  setEvent: function(event) {
    globalEvent = event;
  },
  readLeaderBoard: function(locale, userId, attributes, callback) {
    const res = require('./' + locale + '/resources');
    const game = attributes[attributes.currentGame];
    let leaderURL = process.env.SERVICEURL + 'craps/leaders?game=' + attributes.currentGame;
    let speech = '';

    if (game.rounds > 0) {
      leaderURL += '&userId=' + userId + '&score=' + game.bankroll;
    }

    request(
      {
        uri: leaderURL,
        method: 'GET',
        timeout: 1000,
      }, (err, response, body) => {
      if (err) {
        // No scores to read
        speech = res.strings.LEADER_NO_SCORES;
      } else {
        const leaders = JSON.parse(body);

        if (!leaders.count || !leaders.top) {
          // Something went wrong
          speech = res.strings.LEADER_NO_SCORES;
        } else {
          // What is your ranking - assuming you've played a round
          if (leaders.rank) {
            speech += res.strings.LEADER_RANKING
              .replace('{0}', game.bankroll)
              .replace('{1}', leaders.rank)
              .replace('{2}', leaders.count);
          }

          // And what is the leader board?
          const topScores = leaders.top.map((x) => res.strings.LEADER_FORMAT.replace('{0}', x));
          speech += res.strings.LEADER_TOP_SCORES.replace('{0}', topScores.length);
          speech += speechUtils.and(topScores, {locale: locale, pause: '300ms'});
        }
      }

      callback(speech);
    });
  },
};
