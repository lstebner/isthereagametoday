var FAVICON_VERSION=2;

/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var moment = require('moment');

var app = express();

// all environments
app.set('port', 3035);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var data_year = "2014";
var teams_data = {};

fs.readFile(__dirname + '/teams_data.json', function(err, contents){
    if (!err){
        var data = JSON.parse(contents);

        if (data){
            _.each(data, function(tdata){
                teams_data[tdata.slug] = _.extend({schedule:[]}, tdata);
                load_games_data(tdata.slug, true);
            });
        }
    }
});

var load_games_data = function(team, store){
    var games = [];

    var fn = function(){
        if (store){
            if (!_.has(teams_data, team)){
                teams_data[team] = {};
            }

            teams_data[team].schedule = games;
            teams_data[team].formatted_schedule = [];
            
            _.each(games, function(game_data, i){
                var game = {};

                if (i > 0){
                    _.each(games[0], function(key, k){
                        key = key.toLowerCase();

                        game[key] = game_data[k];
                    });

                    teams_data[team].formatted_schedule.push(game);
                }
            });
        }
    };

    fs.readFile(__dirname + "/schedules/" + data_year + "_" + team + '.csv', 'UTF-8', function(err, contents){
        if (!err){
            _.each(contents.split("\n"), function(line, i){
                if (!_.isEmpty(line)){
                    games.push(line.split(","));
                }
            });

            fn();
        }
    });
};

function isThereAGameToday(team_data){
    var now = moment()
        ,hours_in_1_day = 3600*60*24
        ,tomorrow = moment().add('days', 1)
        ,start_date = null  
        ,start_time = null
        ,end_date = null
        ,start_hours = 0
        ,start_minutes = 0
        ,start_time = ''
        ,is_there = 'No'
        ,tweet_text = 'Are the ' + team_data.hashtag + ' playing today? '
        ,details = ''
        ,data = team_data.formatted_schedule
        ,next_game_start_date = null
        ,day = ''
    ;

    for (var i in data){
        start_date = moment(new Date(data[i].start_date + ' ' + data[i].start_time));

        if (start_date.get('date') == now.get('date') && start_date.get('month') == now.get('month')){
            end_date = moment(new Date(data[i].end_date + ' ' + data[i].end_time));

            is_there = 'Yes';
            tweet_text += 'Yes!';

            if (end_date.get('hours') > now.get('hours') || (end_date.get('hours') == now.get('hours') && end_date.get('minutes') > now.get('minutes'))){
                if (start_date.get('hours') <= now.get('hours') && start_date.get('minutes') <= now.get('minutes')){
                    details = 'they\'re playing right now at ' + data[i].location + ' against the ' + data[i].against + '!';
                    tweet_text += ' Right now against the ' + data[i].against + '! ' + team_data.hashtag_during_game;
                }
                else{
                    start_hours = (start_date.get('hours') > 12 ? start_date.get('hours') - 12 : start_date.get('hours'));
                    start_minutes = (start_date.get('minutes') < 10 ? "0" + start_date.get('minutes') : start_date.get('minutes'));
                    start_time = start_hours + ':' + start_minutes + ' PST';
                    details = 'at ' + data[i].location + ' against The ' + data[i].against + ' @ ' + start_time;
                    tweet_text += ' Starting at ' + start_time + ' against the ' + data[i].against;
                }
            }
            else{
                details = 'but it\'s already over.';

                if (data.length > i){
                    next_game_start_date = moment(new Date(data[parseInt(i)+1].start_date));

                    if (next_game_start_date != "Invalid Date"){
                        if (next_game_start_date.get('day') == now.get('day') + 1){
                            day = 'tomorrow';
                        }
                        else{
                            day = next_game_start_date.format('dddd');
                        }

                        details += ' The next game is scheduled for ' + day + ' at ' + data[parseInt(i)+1].location + '.';
                    }
                }
            }

            break;
        }
        else if (is_there.toLowerCase() == "no" && start_date.get('date') > now.get('date') && start_date.get('month') >= now.get('month')){
            next_game_start_date = moment(new Date(data[i].start_date));

            if (next_game_start_date.isValid()){
                if (next_game_start_date.get('day') == now.get('day') + 1){
                    day = 'tomorrow';
                }
                else{
                    day = next_game_start_date.format('dddd');
                }

                details = 'Not today, looks like the next scheduled game is ' + day + ' at ' + data[i].location + '.';
            }

            break;
        }
    }

    if (is_there == 'NO'){
        tweet_text += ' No.';
    }

    return {
        is_there: is_there
        ,tweet_text: tweet_text
        ,details: details
        ,start_date: start_date ? start_date.valueOf() : null
        ,next_game_start_date: next_game_start_date ? next_game_start_date.valueOf() : null
    };
};

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/:team', function(req, res){
    var team = req.params.team.toLowerCase();
    var team_data = {};

    if (_.indexOf(_.keys(teams_data), team) > -1){
        team_data = teams_data[team];

        today_data = isThereAGameToday(team_data);

        res.render('index', {
            title: 'Are the ' + team_data.name + ' Playing Today?'
            ,base_url: 'http://' + req.headers.host
            ,team_name: team //poorly named, this is really the slug used for javascript stuff
            ,team_data: _.omit(team_data, 'schedule')
            ,teams_data: teams_data
            ,today_data: today_data
            ,meta_description: 'Find out if the ' + team_data.name + ' are playing a baseball game today!'
            ,favicon_version: FAVICON_VERSION
        });
    }
});

app.get('/games-data/:team', function(req, res){
    var team_name = req.params.team.toLowerCase()
    if (_.indexOf(_.keys(teams_data), team_name) > -1){
        res.json(teams_data[team_name].schedule);
    }
    else{
        res.json({ error: 'not found' });
    }
});

app.get('/', function(req, res){
    res.render('listing', {
        teams: _.keys(teams_data)
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
