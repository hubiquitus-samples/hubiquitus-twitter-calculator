var Hubiquitus = window.hubiquitus.Hubiquitus;
var hubiquitus = new Hubiquitus({autoReconnect: true});

/* Hubiquitus connection parameters */
var server = window.location.hostname;
var endpoint = 'http://' + server + '/hubiquitus';

Hubiquitus.logger.enable('*','debug');

hubiquitus.on('connect', function() {
    initCount();

});
hubiquitus.on('reconnect', function() {
    initCount();

});

hubiquitus.on('message', function(req) {
    switch(req.content.type) {
        case 'tweet' :
            counter++;
            $('#count').html(counter);
            break;
    }
});

$('#startCountingButton').click(function() {
    initCount();
});

hubiquitus.connect(endpoint, {username:'twitcounterWeb'});

displayDate = function() {
    var currentTime = new Date();
    var month = currentTime.getMonth() + 1;
    if (month < 10) {
        month = '0' + month;
    }
    var day = currentTime.getDate();
    var year = currentTime.getFullYear();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var seconds = currentTime.getSeconds();
    if (minutes < 10) {minutes = '0' + minutes;}
    if (seconds < 10) {seconds = '0' + seconds;}
    var time = day + '/' + month + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;
    $('#currentDate').html(time);
}

initCount = function() {
    counter = 0;
    $('#count').html(counter);
    hubiquitus.send('twitcounterBot',  {type:'initTwit', track:  $('#trackText').val()});
    displayDate();
}