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
    let hardValue;
    let placeValue;
    let bet = {};
    let baseBet;
    const res = require('../' + this.event.request.locale + '/resources');
    const game = this.attributes[this.attributes.currentGame];
    const validBets = {
      'POINT': ['OddsBetIntent', 'FieldBetIntent', 'CrapsBetIntent',
          'HardBetIntent', 'HardwaysBetIntent', 'YoBetIntent', 'HornBetIntent',
          'SevenBetIntent', 'ComeBetIntent', 'DontComeBetIntent', 'PlaceBetIntent'],
      'NOPOINT': ['PassBetIntent', 'DontPassBetIntent', 'FieldBetIntent',
          'CrapsBetIntent', 'YoBetIntent', 'HornBetIntent', 'SevenBetIntent'],
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

    // Validation specific to certain bets
    if (!speechError) {
      switch (this.event.request.intent.name) {
        case 'HardBetIntent':
          // Need to have a HardNumber of 4, 6, 8, or 10
          if (this.event.request.intent.slots.HardNumber
            && this.event.request.intent.slots.HardNumber.value) {
            hardValue = parseInt(this.event.request.intent.slots.HardNumber.value);
            if ((hardValue !== 4) && (hardValue !== 6)
              && (hardValue !== 8) && (hardValue !== 10)) {
              // Invalid value
              speechError = res.strings.BET_INVALID_HARDNUMBER
                  .replace('{0}', this.event.request.intent.slots.HardNumber.value);
              reprompt = res.strings.BET_INVALID_REPROMPT;
            }
          } else {
            // Just make this a hardways bet
            this.event.request.intent.name = 'HardwaysBetIntent';
          }
          break;
        case 'PlaceBetIntent':
          // Needs to be 4, 5, 6, 8, 9, or 10
          if (this.event.request.intent.slots.PlaceNumber
            && this.event.request.intent.slots.PlaceNumber.value) {
            placeValue = parseInt(this.event.request.intent.slots.PlaceNumber.value);
            if ([4, 5, 6, 8, 9, 10].indexOf(placeValue) === -1) {
              // Well, if it's 7 make it a seven bet or 11 a Yo bet
              if (hardValue === 7) {
                this.event.request.intent.name = 'SevenBetIntent';
              } else if (hardValue === 11) {
                this.event.request.intent.name = 'YoBetIntent';
              } else {
                speechError = res.strings.BET_INVALID_PLACENUMBER
                    .replace('{0}', this.event.request.intent.slots.PlaceNumber.value);
                reprompt = res.strings.BET_INVALID_REPROMPT;
              }
            }
          } else {
            // Sorry, I need a number
            speechError = res.strings.BET_NO_PLACENUMBER;
            reprompt = res.strings.BET_INVALID_REPROMPT;
          }
          break;
        default:
          break;
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
      } else {
        // Place the bet
        if (this.event.request.intent.name === 'HardwaysBetIntent') {
          bet.amount = bet.amount - (bet.amount % 4);
        } else if (this.event.request.intent.name === 'OddsBetIntent') {
          baseBet = utils.getBaseBet(game);
          if (!baseBet) {
            speechError = res.strings.BET_NO_BETFORODDS;
            reprompt = res.strings.BET_INVALID_REPROMPT;
          } else if (game.maxOdds && (bet.amount > (game.maxOdds * baseBet.amount))) {
            speechError = res.strings.BET_EXCEEDS_ODDS.replace('{0}', game.maxOdds).replace('{1}', game.lineBet);
            reprompt = res.strings.BET_INVALID_REPROMPT;
          }
        }

        if (!speechError) {
          game.bankroll -= bet.amount;
        }
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
        case 'ComeBetIntent':
          bet = utils.createLineBet(bet.amount, true);
          bet.type = 'ComeBet';
          speech = res.strings.COME_BET_PLACED;
          bet.state = 'NOPOINT';
          break;
        case 'DontComeBetIntent':
          bet = utils.createLineBet(bet.amount, false);
          bet.type = 'DontComeBet';
          speech = res.strings.DONTCOME_BET_PLACED;
          bet.state = 'NOPOINT';
          break;
        case 'OddsBetIntent':
          bet.type = 'OddsBet';
          speech = res.strings.ODDS_BET_PLACED;
          baseBet.odds = (baseBet.odds) ? (baseBet.odds + bet.amount) : bet.amount;
          if ((baseBet.type === 'PassBet') || (baseBet.type === 'ComeBet')) {
            const payout = {4: 2, 5: 1.5, 6: 1.2, 8: 1.2, 9: 1.5, 10: 2};
            baseBet.oddsPayout = payout[baseBet.point];
          } else {
            const payout = {4: 0.5, 5: 0.6667, 6: 0.8334, 8: 0.8334, 9: 0.6667, 10: 0.5};
            baseBet.oddsPayout = payout[baseBet.point];
          }
          break;
        case 'PlaceBetIntent':
          const placePayout = {4: 1.8, 5: 1.4, 6: 1.1667, 8: 1.1667, 9: 1.4, 10: 1.8};
          bet.type = 'PlaceBet';
          bet.winningRolls = {};
          bet.winningRolls[placeValue] = placePayout[placeValue];
          bet.losingRolls = [7];
          speech = res.strings.PLACE_BET_PLACED.replace('{1}', placeValue);
          break;
        case 'FieldBetIntent':
          bet.type = 'FieldBet';
          bet.winningRolls = {2: 2, 3: 1, 4: 1, 9: 1, 10: 1, 11: 1, 12: 3};
          bet.losingRolls = [5, 6, 7, 8];
          speech = res.strings.FIELD_BET_PLACED;
          break;
        case 'CrapsBetIntent':
          bet.type = 'CrapsBet';
          bet.winningRolls = {2: 7, 3: 7, 12: 7};
          bet.losingRolls = [4, 5, 6, 7, 8, 9, 10, 11];
          speech = res.strings.CRAPS_BET_PLACED;
          break;
        case 'YoBetIntent':
          bet.type = 'YoBet';
          bet.winningRolls = {11: 15};
          bet.losingRolls = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12];
          speech = res.strings.YO_BET_PLACED;
          break;
        case 'HornBetIntent':
          bet.type = 'HornBet';
          bet.winningRolls = {2: 6.75, 3: 3, 11: 3, 12: 6.75};
          bet.losingRolls = [4, 5, 6, 7, 8, 9, 10];
          speech = res.strings.HORN_BET_PLACED;
          break;
        case 'SevenBetIntent':
          bet.type = 'SevenBet';
          bet.winningRolls = {7: 4};
          bet.losingRolls = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12];
          speech = res.strings.SEVEN_BET_PLACED;
          break;
        case 'HardwaysBetIntent':
          bet.type = 'HardwaysBet';
          bet.winningRolls = {4: 1.75, 6: 2.25, 8: 2.25, 10: 1.75};
          bet.losingRolls = [4, 6, 8, 10, 7];
          speech = res.strings.HARDWAYS_BET_PLACED;
          break;
        case 'HardBetIntent':
          const hardPayout = {4: 7, 6: 9, 8: 9, 10: 7};
          bet.type = 'HardwayBet';
          bet.winningRolls = {};
          bet.winningRolls[hardValue] = hardPayout[hardValue];
          bet.losingRolls = [7, hardValue];
          speech = res.strings.HARDWAY_BET_PLACED.replace('{1}', hardValue);
          break;
        default:
          // This shouldn't happen
          console.log('Invalid outside bet???');
          break;
      }

      // Check if they already have an identical bet and if so
      // we'll add to that bet (so long as it doesn't exceed the
      // hand maximum).  Come bets are an exception
      let duplicateBet;
      let duplicateText;
      if (game.bets &&
          ((bet.type !== 'ComeBet') || (bet.type === 'DontComeBet'))) {
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
      } else if (bet.type !== 'OddsBet') {
        if (game.bets) {
          game.bets.push(bet);
        } else {
          game.bets = [bet];
        }
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
