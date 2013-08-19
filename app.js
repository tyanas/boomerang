/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , SubscriberProvider = require('./subscriberprovider').SubscriberProvider;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.engine('html', require('ejs').renderFile);
  app.set('view options', {layout: false});
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var subscriberProvider= new SubscriberProvider(
      process.env.MONGOHQ_HOST, process.env.MONGOHQ_PORT);

//Routes

//index
app.get('/', function(req, res){
    res.render('index.html', {
        title: 'Rec.All'
    });
});

//save new subscriber
app.post('/', function(req, res){
    subscriberProvider.save({
        phoneNumber: req.param('phoneNumber')
    }, function( error, docs) {
        res.redirect('/')
    });
});


app.listen(process.env.PORT || 3000);
