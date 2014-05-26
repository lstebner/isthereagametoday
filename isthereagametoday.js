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

    fs.readFile(__dirname + "/schedules/" + data_year + "_" + team + '.csv', 'UTF-8', function(err, contents){
        if (!err){
            _.each(contents.split("\n"), function(line, i){
                games.push(line.split(","));
            });
        }
    });

    if (store){
        if (!_.has(teams_data, team)){
            teams_data[team] = {};
        }

        teams_data[team].schedule = games;
    }

    return games;
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

        res.render('index', {
            title: 'Are the ' + team_data.name + ' Playing Today?'
            ,base_url: 'http://' + req.headers.host
            ,team_name: team //poorly named, this is really the slug used for javascript stuff
            ,team_data: _.omit(team_data, 'schedule')
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
