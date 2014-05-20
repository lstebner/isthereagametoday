
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
app.set('port', process.env.PORT || 3035);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var sfgiants_games = [];
fs.readFile('2014_sfgiants.csv', 'UTF-8', function(err, contents){
    if (!err){
        _.each(contents.split("\n"), function(line, i){
            // if (i > 0){
                sfgiants_games.push(line.split(","));
            // }
        });
    }
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

app.get('/games-data/sfgiants', function(req, res){
    res.json(sfgiants_games);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
