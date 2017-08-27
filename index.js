//
// Main handler for Alexa craps table skill
//

'use strict';

const AWS = require('aws-sdk');
const Alexa = require('alexa-sdk');
const Launch = require('./intents/Launch');
const Bet = require('./intents/Bet');
const Roll = require('./intents/Roll');
const HighScore = require('./intents/HighScore');
const Help = require('./intents/Help');
const Exit = require('./intents/Exit');
const Reset = require('./intents/Reset');
const Repeat = require('./intents/Repeat');
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
  'AMAZON.NoIntent': Reset.handleNoReset,
  'AMAZON.StopIntent': Exit.handleIntent,
  'AMAZON.CancelIntent': Reset.handleNoReset,
  'SessionEndedRequest': function() {
    saveState(this.event.session.user.userId, this.attributes);
  },
  'Unhandled': function() {
    const res = require('./' + this.event.request.locale + '/resources');
    utils.emitResponse(this.emit, this.event.request.locale, null, null,
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
  'RollIntent': Roll.handleIntent,
  'HighScoreIntent': HighScore.handleIntent,
  'AMAZON.RepeatIntent': Repeat.handleIntent,
  'AMAZON.HelpIntent': Help.handleIntent,
  'AMAZON.StopIntent': Exit.handleIntent,
  'AMAZON.CancelIntent': Exit.handleIntent,
  'SessionEndedRequest': function() {
    saveState(this.event.session.user.userId, this.attributes);
  },
  'Unhandled': function() {
    const res = require('./' + this.event.request.locale + '/resources');
    utils.emitResponse(this.emit, this.event.request.locale, null, null,
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
  'RollIntent': Roll.handleIntent,
  'HighScoreIntent': HighScore.handleIntent,
  'AMAZON.RepeatIntent': Repeat.handleIntent,
  'AMAZON.YesIntent': Roll.handleIntent,
  'AMAZON.NoIntent': Exit.handleIntent,
  'AMAZON.HelpIntent': Help.handleIntent,
  'AMAZON.StopIntent': Exit.handleIntent,
  'AMAZON.CancelIntent': Exit.handleIntent,
  'SessionEndedRequest': function() {
    saveState(this.event.session.user.userId, this.attributes);
  },
  'Unhandled': function() {
    const res = require('./' + this.event.request.locale + '/resources');
    utils.emitResponse(this.emit, this.event.request.locale, null, null,
          res.strings.UNKNOWN_INGAME_INTENT, res.strings.UNKNOWN_INGAME_INTENT_REPROMPT);
  },
});

const handlers = {
  'NewSession': function() {
    // Initialize attributes and route the request
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
    utils.emitResponse(this.emit, this.event.request.locale, null, null,
          res.strings.UNKNOWN_INTENT, res.strings.UNKNOWN_INTENT_REPROMPT);
  },
};

exports.handler = function(event, context, callback) {
  AWS.config.update({region: 'us-east-1'});

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
};

function saveState(userId, attributes) {
  const doc = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
  doc.put({TableName: 'Craps',
      Item: {userId: userId, mapAttr: attributes}},
      (err, data) => {
    console.log('Saved');
  });
}
