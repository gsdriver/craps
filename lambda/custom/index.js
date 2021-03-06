//
// Main handler for Alexa craps table skill
//

'use strict';

const AWS = require('aws-sdk');
const Alexa = require('alexa-sdk');
const CanFulfill = require('./intents/CanFulfill');
const Launch = require('./intents/Launch');
const Bet = require('./intents/Bet');
const Roll = require('./intents/Roll');
const HighScore = require('./intents/HighScore');
const Help = require('./intents/Help');
const Exit = require('./intents/Exit');
const Reset = require('./intents/Reset');
const Repeat = require('./intents/Repeat');
const Remove = require('./intents/Remove');
const utils = require('./utils');
const request = require('request');

const APP_ID = 'amzn1.ask.skill.f899a65f-5849-4ecd-a7fb-9b659e21fccb';

// Handlers for our skill
const resetHandlers = Alexa.CreateStateHandler('CONFIRMRESET', {
  'NewSession': function() {
    this.handler.state = '';
    this.emitWithState('NewSession');
  },
  'LaunchRequest': Reset.handleNoReset,
  'AMAZON.YesIntent': Reset.handleYesReset,
  'AMAZON.FallbackIntent': Reset.handleNoReset,
  'AMAZON.NoIntent': Reset.handleNoReset,
  'AMAZON.StopIntent': Exit.handleIntent,
  'AMAZON.CancelIntent': Reset.handleNoReset,
  'SessionEndedRequest': function() {
    saveState(this.event.session.user.userId, this.attributes);
  },
  'Unhandled': function() {
    const res = require('./' + this.event.request.locale + '/resources');
    utils.emitResponse(this, null, null,
              res.strings.UNKNOWNINTENT_RESET, res.strings.UNKNOWNINTENT_RESET_REPROMPT);
  },
});

const noPointHandlers = Alexa.CreateStateHandler('NOPOINT', {
  'NewSession': function() {
    this.handler.state = '';
    this.emitWithState('NewSession');
  },
  'PassBetIntent': Bet.handleIntent,
  'DontPassBetIntent': Bet.handleIntent,
  'OddsBetIntent': Bet.handleIntent,
  'FieldBetIntent': Bet.handleIntent,
  'CrapsBetIntent': Bet.handleIntent,
  'HardwaysBetIntent': Bet.handleIntent,
  'HardBetIntent': Bet.handleIntent,
  'HornBetIntent': Bet.handleIntent,
  'SevenBetIntent': Bet.handleIntent,
  'ComeBetIntent': Bet.handleIntent,
  'DontComeBetIntent': Bet.handleIntent,
  'PlaceBetIntent': Bet.handleIntent,
  'YoBetIntent': Bet.handleIntent,
  'RemoveIntent': Remove.handleIntent,
  'RollIntent': Roll.handleIntent,
  'HighScoreIntent': HighScore.handleIntent,
  'ResetIntent': Reset.handleIntent,
  'AMAZON.FallbackIntent': Repeat.handleIntent,
  'AMAZON.RepeatIntent': Repeat.handleIntent,
  'AMAZON.YesIntent': Roll.handleIntent,
  'AMAZON.NoIntent': Remove.handleIntent,
  'AMAZON.HelpIntent': Help.handleIntent,
  'AMAZON.StopIntent': Exit.handleIntent,
  'AMAZON.CancelIntent': Remove.handleIntent,
  'SessionEndedRequest': function() {
    saveState(this.event.session.user.userId, this.attributes);
  },
  'Unhandled': function() {
    const res = require('./' + this.event.request.locale + '/resources');
    utils.emitResponse(this, null, null,
          res.strings.UNKNOWN_BET_INTENT, res.strings.UNKNOWN_BET_INTENT_REPROMPT);
  },
});

const pointHandlers = Alexa.CreateStateHandler('POINT', {
  'NewSession': function() {
    this.handler.state = '';
    this.emitWithState('NewSession');
  },
  'PassBetIntent': Bet.handleIntent,
  'DontPassBetIntent': Bet.handleIntent,
  'OddsBetIntent': Bet.handleIntent,
  'FieldBetIntent': Bet.handleIntent,
  'CrapsBetIntent': Bet.handleIntent,
  'HardwaysBetIntent': Bet.handleIntent,
  'HardBetIntent': Bet.handleIntent,
  'YoBetIntent': Bet.handleIntent,
  'HornBetIntent': Bet.handleIntent,
  'SevenBetIntent': Bet.handleIntent,
  'ComeBetIntent': Bet.handleIntent,
  'DontComeBetIntent': Bet.handleIntent,
  'PlaceBetIntent': Bet.handleIntent,
  'RemoveIntent': Remove.handleIntent,
  'RollIntent': Roll.handleIntent,
  'HighScoreIntent': HighScore.handleIntent,
  'ResetIntent': Reset.handleIntent,
  'AMAZON.FallbackIntent': Repeat.handleIntent,
  'AMAZON.RepeatIntent': Repeat.handleIntent,
  'AMAZON.YesIntent': Roll.handleIntent,
  'AMAZON.NoIntent': Remove.handleIntent,
  'AMAZON.HelpIntent': Help.handleIntent,
  'AMAZON.StopIntent': Exit.handleIntent,
  'AMAZON.CancelIntent': Remove.handleIntent,
  'SessionEndedRequest': function() {
    saveState(this.event.session.user.userId, this.attributes);
  },
  'Unhandled': function() {
    const res = require('./' + this.event.request.locale + '/resources');
    utils.emitResponse(this, null, null,
          res.strings.UNKNOWN_INGAME_INTENT, res.strings.UNKNOWN_INGAME_INTENT_REPROMPT);
  },
});

const handlers = {
  'NewSession': function() {
    // Initialize attributes and route the request
    this.attributes.playerLocale = this.event.request.locale;
    if (!this.attributes.currentGame) {
      this.attributes.currentGame = 'basic';
    }

    if (!this.attributes[this.attributes.currentGame]) {
      this.attributes[this.attributes.currentGame] = {
        bankroll: 1000,
        high: 1000,
        minBet: 5,
        maxOdds: 10,
        canReset: true,
      };
    }

    this.emit('LaunchRequest');
  },
  'LaunchRequest': Launch.handleIntent,
  'Unhandled': function() {
    const res = require('./' + this.event.request.locale + '/resources');
    utils.emitResponse(this, null, null,
          res.strings.UNKNOWN_INTENT, res.strings.UNKNOWN_INTENT_REPROMPT);
  },
};

if (process.env.DASHBOTKEY) {
  const dashbot = require('dashbot')(process.env.DASHBOTKEY).alexa;
  exports.handler = dashbot.handler(runGame);
} else {
  exports.handler = runGame;
}

function runGame(event, context, callback) {
  AWS.config.update({region: 'us-east-1'});

  // If this is a CanFulfill, handle this separately
  if (event.request && (event.request.type == 'CanFulfillIntentRequest')) {
    context.succeed(CanFulfill.check(event));
    return;
  }

  const alexa = Alexa.handler(event, context);

  alexa.appId = APP_ID;
  if (!event.session.sessionId || event.session['new']) {
    const doc = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
    doc.get({TableName: 'Craps',
            ConsistentRead: true,
            Key: {userId: event.session.user.userId}},
            (err, data) => {
      if (err || (data.Item === undefined)) {
        if (err) {
          console.log('Error reading attributes ' + err);
        } else {
          request.post({url: process.env.SERVICEURL + 'craps/newUser'}, (err, res, body) => {
          });
        }
      } else {
        Object.assign(event.session.attributes, data.Item.mapAttr);
      }

      execute();
    });
  } else {
    execute();
  }

  function execute() {
    utils.setEvent(event);
    alexa.registerHandlers(handlers, resetHandlers, noPointHandlers, pointHandlers);
    alexa.execute();
  }
}

function saveState(userId, attributes) {
  const formData = {};

  formData.savedb = JSON.stringify({
    userId: userId,
    attributes: attributes,
  });

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
