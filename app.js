
/**
 * Module dependencies.
 */

var express = require('express');
var routes = {};
require("fs").readdirSync("./routes").forEach(function(file) {
    var routeName = file.replace(/\.[^/.]+$/, "");
    routes[routeName] = require("./routes/" + file)[routeName];
});


var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.post('/events', routes.events);
app.post('/smsevents', routes.smsevents);


// TODO: will need to run on port 80
app.listen((process.env.PORT || 3000), function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

// Socket Listener
var io = require('socket.io').listen(app);
var sys = require('util');
var redis = require('redis');
var count = 0;

io.sockets.on('connection', function(socket) {

    const redisQueue = redis.createClient(9595, 'tetra.redistogo.com');
    redisQueue.auth("c7b8027aab73135083902c5018e879fd");
    //const redisQueue = redis.createClient(6379, '127.0.0.1');

    redisQueue.subscribe('reporting');

    socket.emit('connected', "connected to the server" );
    count++;
    socket.emit('real-action', getVisitEvent(count));

    socket.on('disconnect', function() {
        count--;
        socket.emit('real-action', getVisitEvent(count));
    });

    redisQueue.on("message", function(channel, message) {
        socket.emit('recv-action', message );
    });

    setInterval(function() {
        socket.emit('real-action', getVisitEvent(count));
    }, 1200);

});

function getVisitEvent(count) {
    return { name : "visit", type : "realtime-event", data : count, date : getEpoch() };
}

function getEpoch() {
    return Math.round((new Date()).getTime() / 1000);
}