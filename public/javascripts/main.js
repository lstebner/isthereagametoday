// @codekit-prepend "../bower_components/jquery/dist/jquery.js";
// @codekit-prepend "../bower_components/underscore/underscore.js";

var team_name = ""
    ,games_feed = '/games-data'
;

$(function(){
    team_name = $('input[name=team_name]').val();
    games_feed = $('input[name=games_url]').val();
    tbn(document, 'script', 'twitter-wjs');

    if (send_tracking){
        ga('create', team_data.tracking_code, team_data.track_url);
        ga('send', 'pageview');
    }
});
