/**
 * Module dependencies.
 */

var express = require('express')
  , engines = require('consolidate')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , plivo = require('plivo')
  , XMLWriter = require('xml-writer')
  , SubscriberProvider = require('./subscriberprovider').SubscriberProvider;

var plivo_api = plivo.RestAPI({
  authId: process.env.PLIVO_AUTH_ID,
  authToken: process.env.PLIVO_AUTH_TOKEN
});

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'handlebars');
  app.set('view options', {layout: false});
  app.engine('.html', engines.handlebars);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var subscriberProvider= new SubscriberProvider();

var params = {
  from: '1234567890',
  to: process.env.SIP_NUMBER,
  answer_url: process.env.PLIVO_ANSWER_URL
};

var index_data = {
        paypal_button_key: process.env.PAYPAL_BUTTON_KEY,
        title: 'rECHOrd'
    };

var callMe = function(req, res) {
  plivo_api.make_call(params, function(status, response) {
    if (status >= 200 && status < 300) {
      console.log('Successfully made call request.');
      console.log('Response:', response);
    } else {
      console.log('Oops! Something went wrong.');
      console.log('Status:', status);
      console.log('Response:', response);
    }
    index_data['resp'] = response.message + '. ';
    res.redirect('/')
  });
};

//Routes

// index
app.get('/', function(req, res){
    res.render('index.html', index_data);
});

// message recording scenario 
app.post('/scenario.xml', function(req, res){
    var xw = new XMLWriter,
        number = req.param('number') || params.to,
        callbackUrl = process.env.ECHO_REFERER + 'new/recording?number=' + number;
    xw.startDocument(varsion='1.0', encoding='UTF-8')
      .startElement('Response')
        .startElement('Speak').text('Please leave a message after the beep. '
          + 'You have ten minutes.')
        .endElement('Speak')
        .startElement('Record')
          .writeAttribute('maxLength','600')
          .writeAttribute('callbackUrl', callbackUrl)
        .endElement('Record')
        .startElement('Speak').text('Thanks for your call').endElement('Speak')
      .endElement('Response');
    xw.endDocument();

    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(xw.toString());
});

// save new subscriber
app.post('/new/recording', function(req, res){
    var rdata = {
        number: req.param('number') || '',
        url: req.param('RecordUrl') || '',
        duration: req.param('RecordingDuration') || 0,
        durationMs: req.param('RecordingDurationMs') || 0,
        start: req.param('RecordingStartMs'),
        end: req.param('RecordingEndMs')
    };
    subscriberProvider.saveRecording(rdata, function( error, docs) {
      res.send('OK');
    });
});

// make outbound call to record a message
app.post('/', function(req, res){
  if (req.body && req.body.phoneNumber && req.body.phoneNumber == 'sip') {

    params.to = process.env.SIP_NUMBER;

  } else if (req.body && req.body.phoneNumber && req.body.phoneNumber.length == 11) {

    params.to = req.body.phoneNumber;

  } else {
    index_data['message'] = 'Please type 11-digit number like 79871234567';
    params.to = process.env.SIP_NUMBER;
    res.redirect('/')
  }

  index_data['message'] = 'Please wait for about 30 sec. Calling ' + params.to;
  params.answer_url = process.env.PLIVO_ANSWER_URL + '?number=' + params.to;
  callMe(req, res);
});


app.listen(process.env.PORT || 3000);
