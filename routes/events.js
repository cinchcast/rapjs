var express = require("express");
var redis = require("redis");

//const redisQueue = redis.createClient(6379, '127.0.0.1');
const redisQueue = redis.createClient(9595, 'tetra.redistogo.com');
redisQueue.auth("c7b8027aab73135083902c5018e879fd");

exports.events = function(req, res) {
    var temp_event = JSON.parse(req.body.event);
    var ip = req.client.remoteAddress;
    temp_event.data['ipaddress'] = ip;

    redisQueue.publish("reporting", JSON.stringify(temp_event));

    res.header("Content-type", "text/javascript");
    res.end("complete");
};


