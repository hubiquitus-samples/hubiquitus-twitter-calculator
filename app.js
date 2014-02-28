var express = require("express");
var Twit = require("twit");
var http = require("http");
var path = require("path");
var h = require("hubiquitus-core");
var hGateway = require("hubiquitus-gateway");

var app = express();
var botScreenName = 'HubiquitusCalc';
var botMode = 'forceValue';
var forcedValue = 0;
var tweakOp = '';
var answerSentence = "I'm calculating **OP** ... I think it's **RES** !";

app.use('/twittercalc', express["static"](path.resolve(__dirname, 'web')));
var httpServer = http.createServer(app);

var gateway = hGateway.createGateway();
gateway.start(httpServer, {
    port: 80
});

var T = new Twit({
    consumer_key: "k9nYBjmGi266oWFEycZBw",
    consumer_secret: "TAvW84eaRvrNiQibPCVIJNP35VYf6wpjW6cLtGiIA",
    access_token: "2364419707-3E6bgH7o740wKVjiJLOZiA3Ml0O0SYW6hub64is",
    access_token_secret: "Myh1igWjKN0yQAvQckUbXLEbOtD4KR4OYh9k1wNcrxKp2"
});

console.log("=====================================");
console.log("Hubiquitus Twitter calculator is running");
console.log("Start the configuration web page now at http://localhost/twittercalc");
var regex = /([\(-+]?\d*\.?\d+\)?[\/\+\-\*])+([-+]?\d*\.?\d+\)?)/g;



console.log("stream..");
var stream = T.stream('statuses/filter', { track: '@' + botScreenName })
stream.on('tweet', function (tweet) {
    console.log('tweet !', tweet.text);
    if (tweet.user.screen_name != botScreenName) {
        var string = tweet.text.replace(/\s+/g, '');
        var result = string.match(regex);
        var i = -1;
        while(result[++i] != undefined) {
            var operation = result[i];
            var answerText = "";
            console.log('mode', botMode);
            switch (botMode) {
                case "realCalc":
                    var resultValue = eval(operation).toFixed(3);
                    answerText = compileSentence(operation, resultValue);
                    break;
                case "forceValue" :
                    var resultValue = forcedValue;
                    answerText = compileSentence(operation, resultValue);
                    break;
                case "tweakValue" :
                    operation = operation + tweakOp;
                    answerText = compileSentence(operation, resultValue);
                    break;
            }

            answerText = "@" + tweet.user.screen_name + " " + answerText;
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


h.addActor("twitCalcBot", function(req) {
    console.log("received :", req.content);
    switch (req.content.type) {
        case "initCalc":
            req.reply(null, {mode: botMode, sentence: answerSentence});
            break;
        case "realCalc" :
            botMode = req.content.type;
            break;
        case "forceValue" :
            botMode = req.content.type;
            forcedValue = req.content.val;
            break;
        case "forceAnswer" :
            botMode = req.content.type;
            answerSentence = req.content.val;
        case "tweakValue" :
            botMode = req.content.type;
            tweakOp = req.content.op;
            break;
    }
}).start();

var calculate = function(text) {
    var string = text.replace(/\s+/g, '');
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

var compileSentence = function(operation, resultValue) {
    var text = answerSentence;
    text = text.replace(/\*\*OP\*\*/g, operation);
    text = text.replace(/\*\*RES\*\*/g, resultValue);
    return text;
}