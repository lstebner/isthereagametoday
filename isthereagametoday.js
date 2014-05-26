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
var load_teams = ['sfgiants', 'pirates', 'indians'];

var load_games_data = function(team, store){
    var games = [];

    fs.readFile(data_year + "_" + team + '.csv', 'UTF-8', function(err, contents){
        if (!err){
            _.each(contents.split("\n"), function(line, i){
                games.push(line.split(","));
            });
        }
    });

    if (store){
        teams_data[team] = games;
    }

    return games;
};

_.each(load_teams, function(team){
    load_games_data(team, true);
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/:team', function(req, res){
    var team = req.params.team.toLowerCase();
    if (_.indexOf(_.keys(teams_data), team) > -1){
        res.render(team, {
            title: 'Are the San Francisco Giants Playing Today?'
            ,team_name: team
            ,meta_description: 'Find out if the San Francisco Giants are playing a baseball game today!'
        });
    }
});

app.get('/games-data/:team', function(req, res){
    if (_.indexOf(_.keys(teams_data), req.params.team.toLowerCase()) > -1){
        res.json(teams_data[req.params.team.toLowerCase()]);
    }
    else{
        res.json({ error: 'not found' });
    }
});

app.get('/', function(req, res){
    res.render('listing', {
        teams: load_teams
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
