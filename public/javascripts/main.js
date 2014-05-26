// @codekit-prepend "../bower_components/jquery/dist/jquery.js";
// @codekit-prepend "../bower_components/underscore/underscore.js";

var team_name = ""
    ,team_data = {}
    ,games_feed = '/games-data'
    ,hours_in_1_day = 3600*60*24
;

var get_games = function(){
    $.ajax({
        type:'GET'
        ,url: games_feed
        ,dataType: 'json'
        ,success: function(msg){
            var rows = msg
                ,fields = _.first(rows)
                ,data = []
            ;

            _.each(rows, function(row, key){
                //the fields come back first
                if (key == 0){ return; }

                var data_row = {};

                _.each(row, function(val, key){
                    data_row[fields[key].toLowerCase()] = val;
                });

                data.push(data_row);
            });

            isThereAGameToday(data);
        }
    });
}

function isThereAGameToday(data){
    var now = new Date()
        ,tomorrow = new Date(now.getTime() + hours_in_1_day)
        ,start_date = null
        ,start_time = null
        ,end_date = null
        ,start_hours = 0
        ,start_minutes = 0
        ,start_time = ''
        ,is_there = 'No'
        ,tweet_text = 'Are the ' + team_data.hashtag + ' playing today? '
        ,details = ''
    ;

    for (var i in data){
        start_date = new Date(data[i].start_date + ' ' + data[i].start_time);

        if (start_date.getDate() == now.getDate() && start_date.getMonth() == now.getMonth()){
            end_date = new Date(data[i].end_date + ' ' + data[i].end_time);

            is_there = 'Yes';
            tweet_text += 'Yes!';

            if (end_date.getHours() > now.getHours() || (end_date.getHours() == now.getHours() && end_date.getMinutes() > now.getMinutes())){
                if (start_date.getHours() <= now.getHours() && start_date.getMinutes() <= now.getMinutes()){
                    details = 'they\'re playing right now at ' + data[i].location + ' against the ' + data[i].against + '!';
                    tweet_text += ' Right now against the ' + data[i].against + '! ' + team_data.hashtag_during_game;
                }
                else{
                    start_hours = (start_date.getHours() > 12 ? start_date.getHours() - 12 : start_date.getHours());
                    start_minutes = (start_date.getMinutes() < 10 ? "0" + start_date.getMinutes() : start_date.getMinutes());
                    start_time = start_hours + ':' + start_minutes + ' PST';
                    details = 'at ' + data[i].location + ' against The ' + data[i].against + ' @ ' + start_time;
                    tweet_text += ' Starting at ' + start_time + ' against the ' + data[i].against;
                }
            }
            else{
                details = 'but it\'s already over.';

                if (data.length > i){
                    var next_date = new Date(data[parseInt(i)+1].start_date);
                    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    var day = '';

                    if (next_date != "Invalid Date"){
                        if (next_date.getDay() == now.getDay() + 1){
                            day = 'tomorrow';
                        }
                        else{
                            day = days[next_date.getDay()];
                        }

                        details += ' The next game is scheduled for ' + day + ' at ' + data[parseInt(i)+1].location + '.';
                    }
                }
            }

            break;
        }
        else if (is_there.toLowerCase() == "no" && start_date.getDate() > now.getDate() && start_date.getMonth() >= now.getMonth()){
            var next_date = new Date(data[i].start_date);
            var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            var day = '';

            if (next_date != "Invalid Date"){
                if (next_date.getDay() == now.getDay() + 1){
                    day = 'tomorrow';
                }
                else{
                    day = days[next_date.getDay()];
                }

                details = 'Not today, looks like the next scheduled game is ' + day + ' at ' + data[i].location + '.';
            }

            break;
        }
    }

    if (is_there == 'NO'){
        tweet_text += ' No.';
    }

    $('.Three-Dee').text(is_there).fadeIn(150);
    $('.twitter-share-button').attr('data-text', tweet_text);
    tbn(document, 'script', 'twitter-wjs');
    $('#game-details').text(details);
}

$(function(){
    team_name = $('input[name=team_name]').val();
    team_data = JSON.parse($('input[name=team_data]').val());
    games_feed = $('input[name=games_url]').val();
    get_games();

    if (send_tracking){
        ga('create', team_data.tracking_code, team_data.track_url);
        ga('send', 'pageview');
    }
});
