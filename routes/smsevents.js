var express = require("express");
var redis = require("redis");

//const redisQueue = redis.createClient(6379, '127.0.0.1');
const redisQueue = redis.createClient(9595, 'tetra.redistogo.com');
redisQueue.auth("c7b8027aab73135083902c5018e879fd");

exports.smsevents = function(req, res) {

    // receives a callback from twilio and pops into a redis pubsub queue
    redisQueue.publish("reporting", JSON.stringify({"name":req.body.Body,"type":"polling_event"}));
    res.header("Content-type", "text/html");
    res.end(req.body.Body);

};
