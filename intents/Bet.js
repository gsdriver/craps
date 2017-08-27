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
    const bet = {};
    const res = require('../' + this.event.request.locale + '/resources');
    const game = this.attributes[this.attributes.currentGame];
    const validBets = {
      'POINT': ['OddsBetIntent'],
      'NOPOINT': ['PassBetIntent'],
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
        case 'PassBetIntent':
          game.lineBet = bet.amount;
          bet.type = 'PassBet';
          speech = res.strings.PASSBET_PLACED;
          break;
        case 'OddsBetIntent':
          bet.type = 'OddsBet';
          speech = res.strings.ODDS_BET_PLACED;
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
