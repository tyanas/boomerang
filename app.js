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

var api = plivo.RestAPI({
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

/**
 * api.make_call accepts params and callback
 */

// Keys and values to be used for params are the same as documented for our REST API.
// So for using RestAPI.make_call, valid params can be checked
// at https://www.plivo.com/docs/api/call/#outbound.
var params = {
  from: '1234567890',
  to: process.env.SIP_NUMBER,
  //to: process.env.REAL_NUMBER,
  //answer_url: 'http://pastebin.com/raw.php?i=cSFWiTFn',
  answer_url: process.env.PLIVO_ANSWER_URL
};

var index_data = {
        paypal_button_key: process.env.PAYPAL_BUTTON_KEY,
        title: 'rECHOrd'
    };

callMe = function(req, res) {
  api.make_call(params, function(status, response) {
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

// plivo call
app.get('/call', function(req, res){
  callMe(req, res);
});

//index
app.get('/', function(req, res){
    res.render('index.html', index_data);
});

// 
app.get('/scenario.xml', function(req, res){
    xw = new XMLWriter;
    xw.startDocument(varsion='1.0', encoding='UTF-8')
      .startElement('Response')
        .startElement('Speak').text('Please leave a message after the beep. '
          + 'You will have two minutes. Press the star key when done.')
        .endElement('Speak')
        .startElement('Record').writeAttribute('maxLength','600').endElement('Record')
        .startElement('Speak').text('Thanks for your call').endElement('Speak')
      .endElement('Response');
    xw.endDocument();

    console.log(xw.toString());
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(xw.toString());
});

//save new subscriber
app.post('/new/recording', function(req, res){
    subscriberProvider.saveRecording({
        url: req.param('RecordUrl'),
        duration: req.param('RecordingDuration'),
        durationMs: req.param('RecordingDurationMs'),
        start: req.param('RecordingStartMs'),
        end: req.param('RecordingEndMs')
    }, function( error, docs) {
    });
});

//save new subscriber
app.post('/', function(req, res){
    //params.answer_url = req.headers.referer + 'scenario.xml';
    subscriberProvider.save({
        phoneNumber: req.param('phoneNumber')
    }, function( error, docs) {
        if (req.body && req.body.phoneNumber && req.body.phoneNumber == 'sip') {
          params.to = process.env.SIP_NUMBER;
          index_data['message'] = 'Please wait for about 30 sec. Calling ' + params.to;
          index_data['extra'] = '';
          callMe(req, res);
        } else if (req.body && req.body.phoneNumber && req.body.phoneNumber.length == 11) {
          index_data['message'] = 'Please wait for about 30 sec. Calling '+req.body.phoneNumber;
          index_data['extra'] = 'And please listen for at least 30 sec';

          params.to = req.body.phoneNumber;
          if (params.to == process.env.PLIVO_SPEC_NUMBER) {
            params.answer_url = process.env.PLIVO_SPEC_ANSWER_URL;
          }

          callMe(req, res);
        } else {
          index_data['message'] = 'Please type 11-digit number like 79871234567';
          index_data['extra'] = '';
          params.to = process.env.SIP_NUMBER;
          res.redirect('/')
        }
    });
});


app.listen(process.env.PORT || 3000);
