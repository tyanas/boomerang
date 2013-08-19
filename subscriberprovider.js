var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

SubscriberProvider = function(host, port) {
  this.db= new Db('node-mongo-subscriber', new Server(
        host, port, {safe: false}, {auto_reconnect: true}, {}), {safe:false});
  this.db.open(function(){});
};


SubscriberProvider.prototype.getCollection= function(callback) {
  this.db.collection('subscribers', function(error, subscriber_collection) {
    if( error ) callback(error);
    else callback(null, subscriber_collection);
  });
};

//find all subscribers
SubscriberProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, subscriber_collection) {
      if( error ) callback(error)
      else {
        subscriber_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

//find an subscriber by ID
SubscriberProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, subscriber_collection) {
      if( error ) callback(error)
      else {
        subscriber_collection.findOne({_id: subscriber_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};


//save new subscriber
SubscriberProvider.prototype.save = function(subscribers, callback) {
    this.getCollection(function(error, subscriber_collection) {
      if( error ) callback(error)
      else {
        if( typeof(subscribers.length)=="undefined")
          subscribers = [subscribers];

        for( var i =0;i< subscribers.length;i++ ) {
          subscriber = subscribers[i];
          subscriber.created_at = new Date();
        }

        subscriber_collection.insert(subscribers, function() {
          callback(null, subscribers);
        });
      }
    });
};

// update an subscriber
SubscriberProvider.prototype.update = function(subscriberId, subscribers, callback) {
    this.getCollection(function(error, subscriber_collection) {
      if( error ) callback(error);
      else {
        subscriber_collection.update(
					{_id: subscriber_collection.db.bson_serializer.ObjectID.createFromHexString(subscriberId)},
					subscribers,
					function(error, subscribers) {
						if(error) callback(error);
						else callback(null, subscribers)       
					});
      }
    });
};

//delete subscriber
SubscriberProvider.prototype.delete = function(subscriberId, callback) {
	this.getCollection(function(error, subscriber_collection) {
		if(error) callback(error);
		else {
			subscriber_collection.remove(
				{_id: subscriber_collection.db.bson_serializer.ObjectID.createFromHexString(subscriberId)},
				function(error, subscriber){
					if(error) callback(error);
					else callback(null, subscriber)
				});
			}
	});
};

exports.SubscriberProvider = SubscriberProvider;
