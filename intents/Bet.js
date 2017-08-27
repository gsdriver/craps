//
// Handles different types of bets (regular, odds, field, etc)
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // The bet amount is optional - if not present we will use a default value
    // of either the last bet amount or 1 unit
    let reprompt;
    let speechError;
    let speech;
    let bet = {};
    const res = require('../' + this.event.request.locale + '/resources');
    const game = this.attributes[this.attributes.currentGame];
    const validBets = {
      'POINT': ['OddsBetIntent', 'FieldBetIntent', 'CrapsBetIntent'],
      'NOPOINT': ['PassBetIntent', 'DontPassBetIntent', 'FieldBetIntent', 'CrapsBetIntent'],
    };

    // Make sure this is a valid bet for the state
    if (this.handler.state === 'POINT') {
      if (validBets['POINT'].indexOf(this.event.request.intent.name) === -1) {
        speechError = res.strings.INVALID_BET_POINT;
        reprompt = res.strings.BET_INVALID_REPROMPT;
      }
    } else {
      if (validBets['NOPOINT'].indexOf(this.event.request.intent.name) === -1) {
        speechError = res.strings.INVALID_BET_NO_POINT;
        reprompt = res.strings.BET_INVALID_REPROMPT;
      }
    }

    // If this is pass or don't pass, make sure we don't already have a line bet
    if (((this.event.request.intent.name === 'PassBetIntent') ||
          (this.event.request.intent.name === 'DontPassBetIntent'))
        && utils.getLineBet(game.bets)) {
      speechError = res.strings.INVALID_BET_HAVE_LINEBET;
      reprompt = res.strings.BET_INVALID_REPROMPT;
    }

    // Keep validating input if we don't have an error yet
    if (!speechError) {
      bet.amount = utils.betAmount(this.event.request.intent, game);
      if (isNaN(bet.amount) || (bet.amount < game.minBet)) {
        speechError = res.strings.BET_INVALID_AMOUNT.replace('{0}', bet.amount);
        reprompt = res.strings.BET_INVALID_REPROMPT;
      } else if (game.maxBet && (bet.amount > game.maxBet)) {
        speechError = res.strings.BET_EXCEEDS_MAX.replace('{0}', game.maxBet);
        reprompt = res.strings.BET_INVALID_REPROMPT;
      } else if (bet.amount > game.bankroll) {
        // Oops, you can't bet this much
        speechError = res.strings.BET_EXCEEDS_BANKROLL.replace('{0}', game.bankroll);
        reprompt = res.strings.BET_INVALID_REPROMPT;
      } else if ((this.event.request.intent.name === 'OddsBetIntent') &&
          (game.maxOdds && (bet.amount > (game.maxOdds * game.lineBet)))) {
        speechError = res.strings.BET_EXCEEDS_ODDS.replace('{0}', game.maxOdds).replace('{1}', game.lineBet);
        reprompt = res.strings.BET_INVALID_REPROMPT;
      } else {
        // Place the bet
        game.bankroll -= bet.amount;
      }
    }

    if (!speechError) {
      // OK, we're good to bet - let's set up the numbers and type
      switch (this.event.request.intent.name) {
        case 'DontPassBetIntent':
          game.lineBet = bet.amount;
          game.passPlayer = false;
          bet = utils.createLineBet(bet.amount, game.passPlayer);
          speech = res.strings.DONTPASSBET_PLACED;
          break;
        case 'PassBetIntent':
          game.lineBet = bet.amount;
          game.passPlayer = true;
          bet = utils.createLineBet(bet.amount, game.passPlayer);
          speech = res.strings.PASSBET_PLACED;
          break;
        case 'OddsBetIntent':
          bet.type = 'OddsBet';
          speech = res.strings.ODDS_BET_PLACED;
          if (utils.getLineBet(game.bets).type === 'PassBet') {
            const payout = {4: 2, 5: 1.5, 6: 1.2, 8: 1.2, 9: 1.5, 10: 2};
            bet.winningRolls = {};
            bet.winningRolls[game.point] = payout[game.point];
            bet.losingRolls = [7];
          } else {
            const payout = {4: 0.5, 5: 0.6667, 6: 0.8334, 8: 0.8334, 9: 0.6667, 10: 0.5};
            bet.winningRolls = {7: payout[game.point]};
            bet.losingRolls = [game.point];
          }
          break;
        case 'FieldBetIntent':
          bet.type = 'FieldBet';
          bet.winningRolls = {2: 2, 3: 1, 4: 1, 9: 1, 10: 1, 11: 1, 12: 3};
          bet.losingRolls = [5, 6, 7, 8];
          bet.singleRoll = true;
          speech = res.strings.FIELD_BET_PLACED;
          break;
        case 'CrapsBetIntent':
          bet.type = 'CrapsBet';
          bet.winningRolls = {2: 7, 3: 7, 12: 7};
          bet.losingRolls = [4, 5, 6, 7, 8, 9, 10, 11];
          bet.singleRoll = true;
          speech = res.strings.CRAPS_BET_PLACED;
          break;
        default:
          // This shouldn't happen
          console.log('Invalid outside bet???');
          break;
      }

      // Check if they already have an identical bet and if so
      // we'll add to that bet (so long as it doesn't exceed the
      // hand maximum)
      let duplicateBet;
      let duplicateText;
      if (game.bets) {
        let i;

        for (i = 0; i < game.bets.length; i++) {
          if (utils.betsMatch(game.bets[i], bet)) {
            // Yes, it's a match - note and exit
            duplicateBet = game.bets[i];
            break;
          }
        }
      }

      if (duplicateBet) {
        // Can I add this?
        if (game.maxBet
          && ((bet.amount + duplicateBet.amount) > game.maxBet)) {
          // No, you can't
          game.bankroll += bet.amount;
          duplicateText = res.strings.BET_DUPLICATE_NOT_ADDED
              .replace('{0}', duplicateBet.amount)
              .replace('{1}', bet.amount)
              .replace('{2}', game.maxBet);
          speech = '{1}';
        } else if (game.maxOdds
            && ((bet.amount + duplicateBet.amount) > (game.maxOdds * game.lineBet))) {
          // No, you can't
          game.bankroll += bet.amount;
          duplicateText = res.strings.BET_DUPLICATE_NOT_ADDED
              .replace('{0}', duplicateBet.amount)
              .replace('{1}', bet.amount)
              .replace('{2}', game.maxOdds * game.lineBet);
          speech = '{1}';
        } else {
          duplicateBet.amount += bet.amount;
          bet.amount = duplicateBet.amount;
          duplicateText = res.strings.BET_DUPLICATE_ADDED;
        }
      } else if (game.bets) {
        game.bets.unshift(bet);
      } else {
        game.bets = [bet];
      }

      reprompt = res.strings.BET_PLACED_REPROMPT;
      speech = speech.replace('{0}', bet.amount).replace('{1}', reprompt);

      if (duplicateText) {
        speech = duplicateText + speech;
      }
    }

    if (speechError) {
      speechError += (' ' + reprompt);
    }

    utils.emitResponse(this.emit, this.event.request.locale, speechError, null, speech, reprompt);
  },
};
