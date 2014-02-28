var express = require("express");
var Twit = require("twit");
var http = require("http");
var path = require("path");
var h = require("hubiquitus-core");
var hGateway = require("hubiquitus-gateway");

var app = express();
var botScreenName = 'HubiquitusSampl';
var countTweets = 0;

app.use('/twittercounter', express["static"](path.resolve(__dirname, 'web')));
var httpServer = http.createServer(app);

app.use(function(req, res, next) {
    return next();
});

var gateway = hGateway.createGateway();
gateway.start(httpServer, {
    port: 80
});

var T = new Twit({
    consumer_key: "...",
    consumer_secret: "...",
    access_token: "...",
    access_token_secret: "..."
});

console.log("=====================================");
console.log("Hubiquitus Twitter calculator is running");
//console.log("Start the web page now at http://localhost/twittercounter");
var regex = /([\(-+]?\d*\.?\d+\)?[\/\+\-\*])+([-+]?\d*\.?\d+\)?)/g;


console.log("stream..");
var stream = T.stream('statuses/filter', { track: '@HubiquitusSampl' })
stream.on('tweet', function (tweet) {
    if (tweet.user.screen_name != botScreenName) {
        var string = tweet.text.replace(/\s+/g, '');
        var result = string.match(regex);
        var i = -1;
        while(result[++i] != undefined) {
            var res = eval(result[i]).toFixed(3);
            var answerText = "@" + tweet.user.screen_name + " I'm calculating " + result[i] + " ... I think it's " + res + " !";
            console.log(answerText);
            T.post('statuses/update', {
                    status: answerText,
                    in_reply_to_status_id: tweet.id
                }, function(err) {
                    if(err) {
                        console.log("err !", err);
                    }
                }
            );
        }
    }
});

/*
 h.send("twittestbot", "twitcounterWeb", {
 type: "tweet"
 */