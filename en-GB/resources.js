//
// Localized resources
//

const resources = {
  // From index.js
  'UNKNOWN_INTENT': 'Sorry, I didn\'t get that. Try saying Bet.',
  'UNKNOWN_INTENT_REPROMPT': 'Try saying Bet.',
  'UNKNOWN_BET_INTENT': 'Sorry, I didn\'t get that. Try saying roll the dice.',
  'UNKNOWN_BET_INTENT_REPROMPT': 'Try saying roll the dice.',
  'UNKNOWN_INGAME_INTENT': 'Sorry, I didn\'t get that. Try saying roll the dice.',
  'UNKNOWN_INGAME_INTENT_REPROMPT': 'Try saying roll the dice.',
  'UNKNOWNINTENT_RESET': 'Sorry, I didn\'t get that. Try saying Yes or No.',
  'UNKNOWNINTENT_RESET_REPROMPT': 'Try saying Yes or No.',
  // From Bet.js
  'BET_INVALID_AMOUNT': 'I\'m sorry, {0} is not a valid amount to bet.',
  'BET_INVALID_REPROMPT': 'What else can I help you with?',
  'BET_EXCEEDS_MAX': 'Sorry, this bet exceeds the maximum bet of ${0}.',
  'BET_EXCEEDS_BANKROLL': 'Sorry, this bet exceeds your bankroll of ${0}.',
  'BET_EXCEEDS_ODDS': 'Sorry, this bet exceeds {0} times odds based on your line bet of ${1}.',
  'BET_INVALID_HARDNUMBER': 'Sorry, {0} is not a valid hard way bet. ',
  'BET_INVALID_PLACENUMBER': 'Sorry, {0} is not a valid place bet. ',
  'BET_NO_PLACENUMBER': 'Sorry, I didn\'t hear a place number. ',
  'BET_NO_BETFORODDS': 'Sorry, there is no bet to place odds on. ',
  'INVALID_BET_NO_POINT': 'Sorry, this bet can\'t be played until a point has been established.',
  'INVALID_BET_POINT': 'Sorry, this bet can\'t be played once a point has been established.',
  'INVALID_BET_HAVE_LINEBET': 'Sorry, you already have a line bet in play.',
  'PASSBET_PLACED': '${0} pass bet placed.',
  'DONTPASSBET_PLACED': '${0} don\'t pass bet placed.',
  'ODDS_BET_PLACED': '${0} odds placed.',
  'FIELD_BET_PLACED': '${0} field bet placed.',
  'CRAPS_BET_PLACED': '${0} craps bet placed.',
  'YO_BET_PLACED': '${0} bet on yo eleven.',
  'HORN_BET_PLACED': '${0} horn bet placed.',
  'SEVEN_BET_PLACED': '${0} bet on seven.',
  'COME_BET_PLACED': '${0} come bet placed.',
  'DONTCOME_BET_PLACED': '${0} don\'t come bet placed.',
  'HARDWAY_BET_PLACED': '${0} placed on hard {1}.',
  'HARDWAYS_BET_PLACED': '${0} divided among the hard way bets.',
  'PLACE_BET_PLACED': '${0} place bet on {1}.',
  'BET_DUPLICATE_ADDED': 'Adding to your existing bet for a total of ',
  'BET_DUPLICATE_NOT_ADDED': 'You already placed ${0} on this bet, and another ${1} would exceed the maximum bet of ${2}. ',
  'BET_PLACED_REPROMPT': 'Place another bet or say roll to roll the dice.',
  // From Exit.js
  'EXIT_GAME': '{0} Goodbye.',
  // From Help.js
  'HELP_REPROMPT': 'For full rules see the Alexa companion app. What else can I help you with?',
  'HELP_CARD_TITLE': 'Craps Table',
  'HELP_CARD_TEXT': 'You can place various craps bets, and can place {0} on each bet. Say READ HIGH SCORES to hear the leader board.\nStart the game by saying BET to place a line bet. On your first roll of the dice a total of 7 or 11 will win and a roll of 2, 3, or 12 will lose. Any other roll establishes a point. You continue rolling the dice until you either roll the point again (and win), or roll a 7 (and lose)\nOnce you have a point established, you can say PLACE ODDS to put odds on your number. This bet pays true odds if the point is rolled (that is, 2:1 if the point is 4 or 10, 3:2 if the point is 5 or 9, and 6:5 if the point is 6 or 8).\nYou can place various inside bets such as a FIELD BET which pays if the next roll is 2, 3, 4, 9, 10, 11, or 12 (it pays 2:1 on a 12), a YO BET which pays 15:1 if the next roll is 11, a CRAPS BET which pays 7:1 if the next roll is 2, 3, or 12, a SEVEN BET which pays 4:1 if the next roll is 7, or a HORN BET which combines the craps and yo bet paying out on 2 or 12 (27:4), 3 or 11 (3:1).\nYou can place a PLACE BET after the point is established on 4, 5, 6, 8, 9, or 10. This roll will win if the number bet on is rolled and loses if a 7 is rolled. The payouts are 9:5 for 4 or 10, 7:5 for 5 or 9, and 7:6 for 6 or 8.\nYou can also place a HARDWAY BET which is a bet on even numbers (4, 6, 8, or 10) that the next time that number is rolled, it will be a hard total (a pair of numbers such) as opposed to an easy total (two non-matching numbers that add to that even number). This bet wins on a hard total and loses on either a seven or an easy total. The 4 and 10 pay 7:1 while the 6 and 8 pay 9:1.\nYou can place a COME BET which is similar to the initial line bet, but is placed after the point is established. If you make this bet, it loses on 2, 3, or 12 and wins on 7 or 11. Any other roll establishes a bet-specific point, which wins if that number is rolled again and loses if a 7 is rolled first. Like the line bet, you can also take odds on the come bet.\nFinally, if you want to bet against the table, you can make DON\'T PASS bet on your initial bet which wins on 2 or 3 (pushes on 12), and loses on 7 or 11. Any other number establishes a point, and you *lose* if the point is rolled but win if a 7 is rolled first. You can also take odds on this bet, and can place the similar DON\'T COME bet after an initial point is established.\nIf you accidentally place the wrong bet you can say REMOVE BET to remove the bet, and you can say REPEAT to hear the current bankroll and full set of bets you have up. Good luck!',
  // From HighScore.js
  'HIGHSCORE_REPROMPT': 'What else can I help you with?',
  // Launch.js
  'LAUNCH_REPROMPT': 'You can place a line bet or say read high scores to hear the leader board.',
  'LAUNCH_WELCOME': 'Welcome to Craps Table. ',
  'LAUNCH_WELCOME_NAME': 'Welcome back {0}. ',
  'LAUNCH_REGISTER': ' <break time=\'300ms\'/>If you would like to register to have your name on the leader board please visit the Alexa companion app. ',
  // From Remove.js
  'REMOVE_REPROMPT': 'What else can I help you with?',
  'REMOVE_NOBETS': 'You haven\'t placed any bets to remove. ',
  'REMOVE_BETNOTPLACED': 'You haven\'t placed a {0}. ',
  'REMOVE_UNKNOWN_BETTYPE': 'Sorry, I don\'t know what a {0} bet is. ',
  'REMOVE_CANTREMOVE_PASSBET': 'Sorry, you can\'t remove a line bet once a point has been established. ',
  'REMOVE_CANTREMOVE_COMEBET': 'Sorry, you can\'t remove a come bet once a point for that roll has been established. ',
  'REMOVE_BET': 'Removing your bet of {0}. ',
  'REMOVE_ODDS': 'Removing odds from {0}. ',
  // From Repeat.js
  'READ_REPROMPT': 'What else can I help you with?',
  'READ_BANKROLL': 'You have ${0}. ',
  'READ_POINT': 'The point is {0}. ',
  'READ_BETS': 'You bet {0}. ',
  // From Reset.js
  'RESET_CONFIRM': 'Would you like to reset the game? This will reset your bankroll, clear all bets, and abort the current roll.',
  'RESET_COMPLETED': 'You have $1000. You can place a line bet or say read high scores to hear the leader board.',
  'RESET_REPROMPT': 'You can place a line bet or say read high scores to hear the leader board.',
  'RESET_ABORTED': 'Game not reset.',
  'RESET_INVALIDACTION_REPROMPT': 'What else can I help you with?',
  'RESET_NORESET': 'Sorry, you can\'t reset your bankroll. What else can I help you with?',
  // From Roll.js
  'ROLL_RESULT': 'You got {0}. ',
  'ROLL_NOBETS': 'Sorry, you have to place a line bet before you can roll the dice.',
  'ROLL_INVALID_REPROMPT': 'Place a bet',
  'ROLL_CANTBET_LASTBETS': 'Sorry, your bankroll of ${0} can\'t support your last line bet.',
  'ROLL_BUSTED': 'You lost all your money. Resetting to $1000 and clearing your bets. ',
  'ROLL_BUSTED_REPROMPT': 'Place new bets.',
  'ROLL_NET_WIN': ' You won ${0}. ',
  'ROLL_NET_LOSE': ' You lost ${0}. ',
  'ROLL_NET_PUSH': ' You broke even. ',
  'ROLL_REPROMPT': 'Say roll to roll the dice.',
  'ROLL_COME_REPROMPT': 'Would you like to play another round?',
  'ROLL_POINT_ESTABLISHED': 'The point has been established. ',
  'ROLL_SEVEN_CRAPS': 'Craps 7! ',
  'ROLL_GOT_POINT': 'You rolled the point! ',
  'ROLL_OFF_TABLE': 'Oops, one of the dice fell off the table - rolling again. ',
  // From utils.js
  'LEADER_RANKING': 'Your current bankroll of ${0} ranks you as <say-as interpret-as="ordinal">{1}</say-as> of {2} players. ',
  'LEADER_NO_SCORES': 'Sorry, I\'m unable to read the current leader board',
  'LEADER_FORMAT': '${0}',
  'LEADER_FORMAT_NAME': '{0} with ${1}',
  'LEADER_TOP_SCORES': 'The top {0} bankrolls are ',
};

module.exports = {
  strings: resources,
  sayRoll: function(dice, point) {
    const totalFormat = {
      2: 'snake eyes|aces|craps 2|2',
      3: '3|craps 3',
      11: '11|11|yo 11',
      12: '12|boxcars|double sixes|12|craps 12',
    };
    const hardFormat = 'double {0}s|hard {2}|{2} the hard way';
    const easyFormat = '{0} and {1} for a total of {2}|{0} and {1} for an easy {2}';
    const otherFormat = '{0} and {1} for a total of {2}';
    const hard = (dice[0] === dice[1]);
    const total = dice[0] + dice[1];
    let format;

    if (totalFormat[total]) {
      format = pickRandomOption(totalFormat[total]);
    } else if (hard) {
      format = pickRandomOption(hardFormat);
    } else if (total % 2 === 0) {
      format = pickRandomOption(easyFormat);
    } else {
      // If one of the dice is 1, we may say "and a pimple"
      if (((dice[0] === 1) || (dice[1] === 1)) &&
        (Math.floor(Math.random() * 5) === 1)) {
        if (dice[0] === 1) {
          format = '{1} and a pimple makes {2}';
        } else {
          format = '{0} and a pimple makes {2}';
        }
      }

      format = pickRandomOption(otherFormat);
    }

    return format.replace('{0}', dice[0]).replace('{1}', dice[1]).replace('{2}', total);
  },
  sayBet: function(bet) {
    let format;
    let result;
    let roll;

    switch (bet.type) {
      case 'PassBet':
        format = '${0} on the pass line';
        break;
      case 'DontPassBet':
        format = '${0} on the don\'t pass line';
        break;
      case 'FieldBet':
        format = 'a ${0} field bet';
        break;
      case 'CrapsBet':
        format = 'a ${0} craps bet';
        break;
      case 'YoBet':
        format = 'a ${0} yo eleven bet';
        break;
      case 'HardwaysBet':
        format = '${0} divided among the hard ways';
        break;
      case 'HornBet':
        format = '${0} horn bet';
        break;
      case 'SevenBet':
        format = '${0} on seven';
        break;
      case 'PlaceBet':
        let placeNumber;
        for (roll in bet.winningRolls) {
          if (roll) {
            placeNumber = roll;
          }
        }
        format = '${0} place bet on ' + placeNumber;
        break;
      case 'ComeBet':
        if (bet.point) {
          format = '${0} come bet with a point of ' + bet.point;
        } else {
          format = '${0} come bet';
        }
        break;
      case 'DontComeBet':
        if (bet.point) {
          format = '${0} don\'t come bet with a point of ' + bet.point;
        } else {
          format = '${0} don\'t come bet';
        }
        break;
      case 'HardwayBet':
        let hardNumber;
        for (roll in bet.winningRolls) {
          if (roll) {
            hardNumber = roll;
          }
        }
        format = '${0} on hard ' + hardNumber;
        break;
      default:
        format = '${0}';
        break;
    }

    result = format.replace('{0}', bet.amount);
    if (bet.odds) {
      result += (' with $' + bet.odds + ' odds');
    }

    return result;
  },
  sayBetType: function(betType) {
    const bets = {PassBet: 'pass line bet', DontPassBet: 'don\'t pass line bet',
      OddsBet: 'odds bet', FieldBet: 'field bet', CrapsBet: 'craps bet',
      HardwayBet: 'hard way bet', HardwaysBet: 'on the hard ways', YoBet: 'yo eleven bet',
      HornBet: 'horn bet', SevenBet: 'on seven', ComeBet: 'come bet',
      DontComeBet: 'don\'t come bet', PlaceBet: 'place bet'};
    return (bets[betType]) ? bets[betType] : betType;
  },
  betRange: function(game) {
    let format;

    if (game.minBet && game.maxBet) {
      format = 'between ${0} and ${1}';
    } else if (game.minBet) {
      format = '${0} or more';
    } else if (game.maxBet) {
      format = '${1} or less';
    } else {
      format = 'any amount';
    }

    return (format.replace('{0}', game.minBet).replace('{1}', game.maxBet));
  },
};

function pickRandomOption(res) {
  const options = res.split('|');
  return options[Math.floor(Math.random() * options.length)];
}
