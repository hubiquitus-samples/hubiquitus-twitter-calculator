var Hubiquitus = window.hubiquitus.Hubiquitus;
var hubiquitus = new Hubiquitus({autoReconnect: true});

/* Hubiquitus connection parameters */
var server = window.location.hostname;
var endpoint = 'http://' + server + '/hubiquitus';

Hubiquitus.logger.enable('*','debug');
$()

hubiquitus.on('connect', function() {
    initCalculator();
    console.log('connected !');

});
hubiquitus.on('reconnect', function() {
    console.log('connected !');
    initCalculator();

});

hubiquitus.on('message', function(req) {
    switch(req.content.type) {
        case 'tweet' :
            counter++;
            $('#count').html(counter);
            break;
    }
});

hubiquitus.connect(endpoint, {username:'twitcounterWeb'});

var initCalculator = function() {
    hubiquitus.send('twitCalcBot',  {type:'initCalc'}, function(err, res) {
        if (!err) {
            console.log('RES REC !', res.content);
            switch(res.content.mode) {
                case 'realCalc' :
                    $('input[name="bot-mode-choice"][value="choice-1"]').prop('checked', true);
                    break;
                case 'forceValue' :
                    $('input[name="bot-mode-choice"][value="choice-2"]').prop('checked', true);
                    break;
                case 'forceAnswer' :
                    $('input[name="bot-mode-choice"][value="choice-3"]').prop('checked', true);
                    break;
                case 'tweakValue' :
                    $('input[name="bot-mode-choice"][value="choice-4"]').prop('checked', true);
                    break;
            }
            $('textarea.customAnswer').val(res.content.sentence);
        }
    });

    $(".loadingDiv").fadeOut(200, function() {
        this.remove();
        $(".calculator").slideDown();
    });

}

$('#launchConfig').click(function() {
    var choiceVal = $('input[name=bot-mode-choice]:checked', '.calculator').val();
    var content = "";
    console.log('send1', choiceVal);

    switch(choiceVal) {
        case 'choice-1' :
            content = {type:'realCalc'};
            break;
        case 'choice-2' :
            var val = parseInt($('#forcedValue').val(), 10);
            if (typeof(val) == 'number') {
                content = {type:'forceValue', val: val};
            }
            break;
        case 'choice-3' :
            var op = $('#select-op').val();
            var val = $('#op-value').val();
            content = {type:'tweakValue', op: ""+op+val};
            break;
    }
    console.log('send', content);
    hubiquitus.send('twitCalcBot', content, function(err, res) {
    });
});