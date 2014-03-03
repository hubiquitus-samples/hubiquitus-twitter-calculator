var express = require("express");
var Twit = require("twit");
var http = require("http");
var path = require("path");
var h = require("hubiquitus-core");
var hGateway = require("hubiquitus-gateway");

var app = express();
var botScreenName = 'HubiquitusCalc';
var botMode = 'realCalc';
var forcedValue = 0;
var tweakOp = '';
var answerSentence = "I'm calculating the op **OP** ... I think it's **RES** !";

app.use("/twittercalc", express["static"](path.resolve(__dirname, "web")));
var httpServer = http.createServer(app);

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
console.log("Start the configuration web page now at http://localhost/twittercalc");
var regex = /(?:[\(\-+]?\d*\.?\d+\)?[\/\+\-\*])+(?:[-+]?\d*\.?\d+\)?)/g;

console.log("stream..");
var stream = T.stream("statuses/filter", { track: "@" + botScreenName });

stream.on("tweet", function (tweet) {
    console.log("tweet !", tweet.text);
    if (tweet.user.screen_name != botScreenName) {
        var string = tweet.text.replace(/\s+/g, "");
        var result = string.match(regex);
        var i = -1;
        while(result[++i] != undefined) {
            var operation = result[i];
            var answerText = "";
            console.log("mode", botMode);
            switch (botMode) {
                case "realCalc":
                    console.log("op", operation);
                    var resultValue = Math.round(eval(operation)*1000)/1000;
                    console.log("op", resultValue);
                    answerText = compileSentence(operation, resultValue);
                    break;
                case "forceValue" :
                    var resultValue = forcedValue;
                    answerText = compileSentence(operation, resultValue);
                    break;
                case "tweakValue" :
                    var effectiveOp = "(" + operation + ")" + tweakOp;
                    var resultValue = Math.round(eval(effectiveOp)*1000)/1000;
                    answerText = compileSentence(operation, resultValue);
                    break;
            }

            answerText = "@" + tweet.user.screen_name + " " + answerText;
            T.post("statuses/update", {
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
            var initContent = {mode: botMode, sentence: answerSentence};
            if (tweakOp.length != 0) {
                initContent.tweakOp = tweakOp
            }
            req.reply(null, initContent);
            break;
        case "realCalc" :
            botMode = req.content.type;
            req.reply();
            break;
        case "forceValue" :
            botMode = req.content.type;
            forcedValue = req.content.val;
            req.reply();
            break;
        case "tweakValue" :
            botMode = req.content.type;
            tweakOp = req.content.op;
            req.reply();
            break;
    }
    if(req.content.sentence) {
        answerSentence = req.content.sentence;
    }
}).start();

var calculate = function(text) {
    var string = text.replace(/\s+/g, "");
    var result = string.match(regex);
    var i = -1;
    while(result[++i] != undefined) {
        var res = eval(result[i]).toFixed(3);
        var answerText = "@" + tweet.user.screen_name + " I'm calculating " + result[i] + " ... I think it's " + res + " !";
        console.log(answerText);
        T.post("statuses/update", {
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
