var mainApp = require('../index');

const attributeFile = 'attributes.txt';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const USERID = 'not-amazon';

function BuildEvent(argv)
{
  // Templates that can fill in the intent
  const bet = {'name': 'PassBetIntent', 'slots': {'Amount': {'name': 'Amount', 'value': ''}}};
  const oddsbet = {'name': 'OddsBetIntent', 'slots': {'Amount': {'name': 'Amount', 'value': ''}}};
  const fieldbet = {'name': 'FieldBetIntent', 'slots': {'Amount': {'name': 'Amount', 'value': ''}}};
  const roll = {'name': 'RollIntent', 'slots': {}};
  const rules = {'name': 'RulesIntent', 'slots': {}};
  const reset = {'name': 'ResetIntent', 'slots': {}};
  const yes = {'name': 'AMAZON.YesIntent', 'slots': {}};
  const no = {'name': 'AMAZON.NoIntent', 'slots': {}};
  const help = {'name': 'AMAZON.HelpIntent', 'slots': {}};
  const stop = {'name': 'AMAZON.StopIntent', 'slots': {}};
  const cancel = {'name': 'AMAZON.CancelIntent', 'slots': {}};
  const highScore = {'name': 'HighScoreIntent', 'slots': {}};
  const repeat = {'name': 'AMAZON.RepeatIntent', 'slots': {}};

  const lambda = {
    "session": {
      "sessionId": "SessionId.c88ec34d-28b0-46f6-a4c7-120d8fba8fa7",
      "application": {
        "applicationId": "amzn1.ask.skill.f899a65f-5849-4ecd-a7fb-9b659e21fccb"
      },
      "attributes": {},
      "user": {
        "userId": USERID,
      },
      "new": false
    },
    "request": {
      "type": "IntentRequest",
      "requestId": "EdwRequestId.26405959-e350-4dc0-8980-14cdc9a4e921",
      "locale": "en-US",
      "timestamp": "2016-11-03T21:31:08Z",
      "intent": {}
    },
    "version": "1.0"
  };

  const openEvent = {
    "session": {
      "sessionId": "SessionId.c88ec34d-28b0-46f6-a4c7-120d8fba8fa7",
      "application": {
        "applicationId": "amzn1.ask.skill.f899a65f-5849-4ecd-a7fb-9b659e21fccb"
      },
      "attributes": {},
      "user": {
        "userId": USERID,
      },
      "new": true
    },
    "request": {
      "type": "LaunchRequest",
      "requestId": "EdwRequestId.26405959-e350-4dc0-8980-14cdc9a4e921",
      "locale": "en-US",
      "timestamp": "2016-11-03T21:31:08Z",
      "intent": {}
    },
    "version": "1.0"
  };

  // If there is an attributes.txt file, read the attributes from there
  const fs = require('fs');
  if (fs.existsSync(attributeFile)) {
    data = fs.readFileSync(attributeFile, 'utf8');
    if (data) {
      lambda.session.attributes = JSON.parse(data);
      openEvent.session.attributes = JSON.parse(data);
    }
  }

  // If there is no argument, then we'll just return
  if (argv.length <= 2) {
    console.log('I need some parameters');
    return null;
  } else if (argv[2] == 'bet') {
    lambda.request.intent = bet;
    if (argv.length > 3) {
      bet.slots.Amount.value = argv[3];
    }
  } else if (argv[2] == 'oddsbet') {
    lambda.request.intent = oddsbet;
    if (argv.length > 3) {
      oddsbet.slots.Amount.value = argv[3];
    }
  } else if (argv[2] == 'fieldbet') {
    lambda.request.intent = fieldbet;
    if (argv.length > 3) {
      fieldbet.slots.Amount.value = argv[3];
    }
  } else if (argv[2] == 'rules') {
    lambda.request.intent = rules;
  } else if (argv[2] == 'roll') {
    lambda.request.intent = roll;
  } else if (argv[2] == 'launch') {
    return openEvent;
  } else if (argv[2] == 'highscore') {
    lambda.request.intent = highScore;
  } else if (argv[2] == 'help') {
    lambda.request.intent = help;
  } else if (argv[2] == 'stop') {
    lambda.request.intent = stop;
  } else if (argv[2] == 'cancel') {
    lambda.request.intent = cancel;
  } else if (argv[2] == 'reset') {
    lambda.request.intent = reset;
  } else if (argv[2] == 'repeat') {
    lambda.request.intent = repeat;
  } else if (argv[2] == 'yes') {
    lambda.request.intent = yes;
  } else if (argv[2] == 'no') {
    lambda.request.intent = no;
  }
  else {
    console.log(argv[2] + ' was not valid');
    return null;
  }

  return lambda;
}

// Simple response - just print out what I'm given
function myResponse(appId) {
  this._appId = appId;
}

myResponse.succeed = function(result) {
  if (result.response.outputSpeech.ssml) {
    console.log('AS SSML: ' + result.response.outputSpeech.ssml);
  } else {
    console.log(result.response.outputSpeech.text);
  }
  if (result.response.card && result.response.card.content) {
    console.log('Card Content: ' + result.response.card.content);
  }
  console.log('The session ' + ((!result.response.shouldEndSession) ? 'stays open.' : 'closes.'));
  if (result.sessionAttributes) {
    // Output the attributes too
    const fs = require('fs');
    fs.writeFile(attributeFile, JSON.stringify(result.sessionAttributes), (err) => {
      if (!process.env.NOLOG) {
        console.log('attributes:' + JSON.stringify(result.sessionAttributes) + ',');
      }
    });
  }
}

myResponse.fail = function(e) {
  console.log(e);
}

// Build the event object and call the app
if ((process.argv.length == 3) && (process.argv[2] == 'clear')) {
  const fs = require('fs');

  // Clear is a special case - delete this entry from the DB and delete the attributes.txt file
  dynamodb.deleteItem({TableName: 'Craps', Key: { userId: {S: USERID}}}, function (error, data) {
    console.log("Deleted " + error);
    if (fs.existsSync(attributeFile)) {
      fs.unlinkSync(attributeFile);
    }
  });
} else {
  var event = BuildEvent(process.argv);
  if (event) {
      mainApp.handler(event, myResponse);
  }
}