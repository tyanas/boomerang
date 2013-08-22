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
  //to: process.env.SIP_NUMBER,
  to: process.env.REAL_NUMBER,
  answer_url: 'https://s3.amazonaws.com/plivosamplexml/play_url.xml',
};

var index_data = {
        paypal_button_key: process.env.PAYPAL_BUTTON_KEY,
        title: 'rECHOrd'
    };

callMe = function(req, res) {
  console.log(req.body.phoneNumber);
  params.to = req.body.phoneNumber;
  api.make_call(params, function(status, response) {
    if (status >= 200 && status < 300) {
      console.log('Successfully made call request.');
      console.log('Response:', response);
    } else {
      console.log('Oops! Something went wrong.');
      console.log('Status:', status);
      console.log('Response:', response);
    }
    index_data['resp'] = response.message;
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

//save new subscriber
app.post('/', function(req, res){
    subscriberProvider.save({
        phoneNumber: req.param('phoneNumber')
    }, function( error, docs) {
        index_data['message'] = req.body.phoneNumber;
        callMe(req, res);
    });
});


app.listen(process.env.PORT || 3000);
