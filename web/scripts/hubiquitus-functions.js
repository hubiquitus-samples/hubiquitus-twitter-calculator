var Hubiquitus = window.hubiquitus.Hubiquitus;
var hubiquitus = new Hubiquitus({autoReconnect: true});

/* Hubiquitus connection parameters */
var server = window.location.hostname;
var endpoint = 'http://' + server + '/hubiquitus';

var tweakOpRegexp = /([\/\+\-\*])([-+]?\d*\.?\d+)/g;
var loadingDiv = '';

//Hubiquitus.logger.enable('*','debug');
hubiquitus.on('connect', function() {
    initCalculator();

});
hubiquitus.on('reconnect', function() {
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
            switch(res.content.mode) {
                case 'realCalc' :
                    $('input[name="bot-mode-choice"][value="choice-1"]').prop('checked', true);
                    break;
                case 'forceValue' :
                    $('input[name="bot-mode-choice"][value="choice-2"]').prop('checked', true);
                    break;
                case 'tweakValue' :
                    $('input[name="bot-mode-choice"][value="choice-4"]').prop('checked', true);
                    break;
            }
            $('textarea.customAnswer').val(res.content.sentence);
            var tweakOp = res.content.tweakOp;
            if(tweakOp) {
                var result = tweakOpRegexp.exec(tweakOp);
                if(result[1] && result[2]) {
                    $('#select-op').val(result[1]);
                    $('#op-value').val(result[2]);
                }
            }
            $('.loadingDiv').fadeOut(200, function() {
                loadingDiv = this;
                this.remove();
                $('.calculator').slideDown();
            });
        }
    });

}

$('#launchConfig').click(function(e) {
    e.preventDefault();
    $(loadingDiv).css('display','');
    $("#calculator").append(loadingDiv);

    var choiceVal = $('input[name=bot-mode-choice]:checked', '.calculator').val();
    var content = '';
    var sentence = $.trim($('textarea.customAnswer').val());
    switch(choiceVal) {
        case 'choice-1' :
            content = {type:'realCalc', sentence: sentence};
            break;
        case 'choice-2' :
            var val = parseInt($('#forcedValue').val(), 10);
            if (typeof(val) == 'number') {
                content = {type:'forceValue', val: val, sentence: sentence};
            }
            break;
        case 'choice-3' :
            var op = $('#select-op').val();
            var val = $('#op-value').val();
            content = {type:'tweakValue', op: ''+op+val, sentence: sentence};
            break;
    }

    hubiquitus.send('twitCalcBot', content, function(err, res) {
        if(!err) {
            $('.loadingDiv').html('<h1>Done !</h1>');
            setTimeout(function() {
                $('.loadingDiv').slideUp(400, function() {
                    this.remove();
                });
            }, 2000);
        }
    });
});