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
  'INVALID_BET_NO_POINT': 'Sorry, this bet can\'t be played until a point has been established.',
  'INVALID_BET_POINT': 'Sorry, this bet can\'t be played once a point has been established.',
  'INVALID_BET_HAVE_LINEBET': 'Sorry, you already have a line bet in play.',
  'PASSBET_PLACED': '${0} pass bet placed.',
  'DONTPASSBET_PLACED': '${0} don\'t pass bet placed.',
  'ODDS_BET_PLACED': '${0} odds placed.',
  'FIELD_BET_PLACED': '${0} field bet placed.',
  'CRAPS_BET_PLACED': '${0} craps bet placed.',
  'YO_BET_PLACED': '${0} bet on yo eleven.',
  'HARDWAY_BET_PLACED': '${0} placed on hard {1}.',
  'HARDWAYS_BET_PLACED': '${0} divided among the hard way bets.',
  'BET_DUPLICATE_ADDED': 'Adding to your existing bet for a total of ',
  'BET_DUPLICATE_NOT_ADDED': 'You already placed ${0} on this bet, and another ${1} would exceed the maximum bet of ${2}. ',
  'BET_PLACED_REPROMPT': 'Place another bet or say roll to roll the dice.',
  // From Exit.js
  'EXIT_GAME': '{0} Goodbye.',
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
  'REMOVE_BET': 'Removing your bet of {0}. ',
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

    switch (bet.type) {
      case 'PassBet':
        format = '${0} on the pass line';
        break;
      case 'DontPassBet':
        format = '${0} on the don\'t pass line';
        break;
      case 'OddsBet':
        format = '${0} odds';
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
      case 'HardwayBet':
        let hardNumber;
        let roll;
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

    return format.replace('{0}', bet.amount);
  },
  sayBetType: function(betType) {
    const bets = {PassBet: 'pass line bet', DontPassBet: 'don\'t pass line bet',
      OddsBet: 'odds bet', FieldBet: 'field bet', CrapsBet: 'craps bet',
      HardwayBet: 'hard way bet', HardwaysBet: 'on the hard ways', YoBet: 'yo eleven bet'};
    return (bets[betType]) ? bets[betType] : betType;
  },
};

function pickRandomOption(res) {
  const options = res.split('|');
  return options[Math.floor(Math.random() * options.length)];
}
