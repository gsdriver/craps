//
// Utility functions
//

'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
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
        winningRolls: {7: 1},
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
  betsMatch: function(bet1, bet2) {
    // Bets match if the types match - for now
    return (bet1.type === bet2.type);
  },
  setEvent: function(event) {
    globalEvent = event;
  },
  readLeaderBoard: function(locale, attributes, callback) {
    const res = require('./' + locale + '/resources');
    const game = attributes[attributes.currentGame];

    getTopScoresFromS3(attributes, (err, scores) => {
      let speech = '';

      // OK, read up to five high scores
      if (!scores || (scores.length === 0)) {
        // No scores to read
        speech = res.strings.LEADER_NO_SCORES;
      } else {
        // What is your ranking - assuming you've played a round
        if (game.rounds > 0) {
          const ranking = scores.indexOf(game.bankroll) + 1;

          speech += res.strings.LEADER_RANKING
            .replace('{0}', game.bankroll)
            .replace('{1}', ranking)
            .replace('{2}', scores.length);
        }

        // And what is the leader board?
        const toRead = (scores.length > 5) ? 5 : scores.length;
        const topScores = scores.slice(0, toRead).map((x) => {
          if (x.name) {
            return res.strings.LEADER_FORMAT_NAME
                .replace('{0}', x.name)
                .replace('{1}', x.bankroll);
          } else {
            return res.strings.LEADER_FORMAT.replace('{0}', x.bankroll);
          }
        });
        speech += res.strings.LEADER_TOP_SCORES.replace('{0}', toRead);
        speech += speechUtils.and(topScores, {locale: locale, pause: '300ms'});
      }

      callback(speech);
    });
  },
};

function getTopScoresFromS3(attributes, callback) {
  // Read the S3 buckets that has everyone's scores
  const scoreSet = attributes.currentGame + 'Scores';
  const myScore = attributes[attributes.currentGame].bankroll;

  s3.getObject({Bucket: 'garrett-alexa-usage', Key: 'CrapsScores.txt'}, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      callback(err, null);
    } else {
      const ranking = JSON.parse(data.Body.toString('ascii'));
      const scores = ranking[scoreSet];
      const bankroll = scores.map((a) => a.bankroll);

      // If their current high score isn't in the list, add it
      if (bankroll.indexOf(myScore) < 0) {
        scores.push({name: attributes.firstName, bankroll: myScore});
      }

      callback(null, scores.sort((a, b) => (b.bankroll - a.bankroll)));
    }
  });
}
