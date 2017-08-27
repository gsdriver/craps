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
  'INVALID_BET_NO_POINT': 'Sorry, this bet can\'t be played until a point has been established.',
  'INVALID_BET_POINT': 'Sorry, this bet can\'t be played once a point has been established.',
  'PASSBET_PLACED': '${0} pass bet placed.',
  'ODDS_BET_PLACED': '${0} odds placed.',
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
  // From Reset.js
  'RESET_CONFIRM': 'Would you like to reset the game? This will reset your bankroll, clear all bets, and abort the current roll.',
  'RESET_COMPLETED': 'You have $1000. You can place a line bet or say read high scores to hear the leader board.',
  'RESET_REPROMPT': 'You can place a line bet or say read high scores to hear the leader board.',
  'RESET_ABORTED': 'Game not reset.',
  'RESET_INVALIDACTION_REPROMPT': 'What else can I help you with?',
  'RESET_NORESET': 'Sorry, you can\'t reset your bankroll. What else can I help you with?',
  // From Roll.js
  'ROLL_RESULT': 'You got {0}. ',
  'ROLL_NOBETS': 'Sorry, you have to place a bet before you can roll the dice.',
  'ROLL_INVALID_REPROMPT': 'Place a bet',
  'ROLL_CANTBET_LASTBETS': 'Sorry, your bankroll of ${0} can\'t support your last line bet.',
  'ROLL_BUSTED': 'You lost all your money. Resetting to $1000 and clearing your bets. ',
  'ROLL_BUSTED_REPROMPT': 'Place new bets.',
  'ROLL_NET_WIN': ' You won ${0}. ',
  'ROLL_NET_LOSE': ' You lost ${0}. ',
  'ROLL_NET_PUSH': ' You broke even. ',
  'ROLL_REPROMPT': 'Say roll to roll the dice.',
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
    const easy = (dice[0] !== dice[1]);
    const total = dice[0] + dice[1];
    let format;

    if (totalFormat[total]) {
      format = pickRandomOption(totalFormat[2]);
    } else if (easy) {
      format = pickRandomOption(easyFormat);
    } else if (total % 2 === 0) {
      format = pickRandomOption(hardFormat);
    } else {
      format = pickRandomOption(otherFormat);
    }

    return format.replace('{0}', dice[0]).replace('{1}', dice[1]).replace('{2}', total);
  },
};

function pickRandomOption(res) {
  const options = res.split('|');
  return options[Math.floor(Math.random() * options.length)];
}
