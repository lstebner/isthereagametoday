var DataCache,DataCacheFetcher;DataCache=function(){function t(t,e,n){this.key=null!=t?t:"",this.data=null!=e?e:[],null==n&&(n=""),this.set_params(this.params)}return t.prototype.set_data=function(t){this.data=t},t.prototype.set_params=function(t){var e,n,r;if("string"!=typeof t){e=[];for(n in t)r=t[n],e.push(n+":"+r);return this.params=e.join("_")}return this.params=t},t.prototype.expires=function(){return 864e5},t.prototype.store=function(t){return this.data=null!=t?t:this.data,this.remove_existing(function(t){return function(){var e;return e=new models.DataCache({created:(new Date).getTime(),expires:(new Date).getTime()+t.expires(),slug:t.key,data:t.data}),e.save(function(e){return e?console.log("error creating DataCache '"+t.key+"': "+e):console.log("DataCache stored '"+t.key+"' "+t.data.length+" items")})}}(this))},t.prototype.fetch=function(t,e){var n,r;return n={slug:this.key,parameters:t},r=models.DataCache.findOne(n,function(t){return function(t,n){return t&&console.log("DataCache fetch error",t),"function"==typeof e?e(t||!n?!1:n.data):void 0}}(this))},t.prototype.remove_existing=function(t){return models.DataCache.find({slug:this.key},function(e){return function(n,r){var a,o,i;if(!n&&r)for(console.log("DataCache removing "+r.length+" entries for "+e.key),o=0,i=r.length;i>o;o++)a=r[o],a.remove(function(){});return"function"==typeof t?t():void 0}}(this))},t.prototype.refresh=function(){return 1},t}(),DataCacheFetcher=function(){function t(){}return t.get=function(t,e){return models.DataCache.findOne({slug:t},function(t){return function(t,n){return"function"==typeof e?e(t?!1:n.data):void 0}}(this))},t}();

// Generated by CoffeeScript 1.9.3
var Schema, TeamsDataCache, _, _str, app, express, fs, http, models, moment, mongoose, path, routes, schemas, user,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

express = require('express');

routes = require('./routes');

user = require('./routes/user');

http = require('http');

path = require('path');

fs = require('fs');

_ = require('underscore');

_str = require('underscore.string');

moment = require('moment');

mongoose = require('mongoose');

Schema = mongoose.Schema;

app = express();

schemas = {};

schemas.DataCache = new Schema({
  created: {
    type: Date,
    required: true
  },
  expires: {
    type: Date,
    required: true
  },
  is_stale: {
    type: Boolean,
    "default": false
  },
  slug: {
    type: String,
    required: true
  },
  parameters: {
    type: String,
    "default": ""
  },
  data: {
    type: Schema.Types.Mixed,
    "default": []
  }
});

models = {
  DataCache: mongoose.model("DataCache", schemas.DataCache)
};

TeamsDataCache = (function(superClass) {
  extend(TeamsDataCache, superClass);

  function TeamsDataCache() {
    TeamsDataCache.__super__.constructor.call(this, "teams_data");
  }

  TeamsDataCache.prototype.refresh = function() {
    return fs.readFile(__dirname + '/teams_data.json', (function(_this) {
      return function(err, contents) {
        var data, j, len, results, tdata;
        if (!err) {
          data = JSON.parse(contents);
          if (data) {
            results = [];
            for (j = 0, len = data.length; j < len; j++) {
              tdata = data[j];
              results.push(_this.load_games_data(tdata.slug, _.extend({
                schedule: []
              }, tdata)));
            }
            return results;
          }
        } else {
          return console.log("error reading teams_data");
        }
      };
    })(this));
  };

  TeamsDataCache.prototype.load_games_data = function(team, team_data) {
    var games;
    games = [];
    return fs.readFile(__dirname + "/schedules/" + conf.data_year + "_" + team + ".csv", "UTF-8", (function(_this) {
      return function(err, contents) {
        var cache, game, game_data, i, j, k, key, l, len, len1, len2, line, m, ref, ref1;
        if (!err) {
          ref = contents.split("\n");
          for (i = j = 0, len = ref.length; j < len; i = ++j) {
            line = ref[i];
            if (!_.isEmpty(line)) {
              games.push(line.split(","));
            }
          }
          team_data.schedule = games;
          team_data.formatted_schedule = [];
          for (i = l = 0, len1 = games.length; l < len1; i = ++l) {
            game_data = games[i];
            game = {};
            if (i > 0) {
              ref1 = games[0];
              for (k = m = 0, len2 = ref1.length; m < len2; k = ++m) {
                key = ref1[k];
                key = key.toLowerCase();
                game[key] = game_data[k];
              }
              team_data.formatted_schedule.push(game);
            }
          }
          cache = new DataCache(team + "_team_data");
          cache.store(team_data);
          return console.log("team data stored for the " + team);
        } else {
          return console.log("error reading team schedule " + conf.data_year + "_" + team);
        }
      };
    })(this));
  };

  return TeamsDataCache;

})(DataCache);


// @codekit-prepend "DataCache.js";
// @codekit-prepend "includes.js";

var FAVICON_VERSION=2;


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

var conf = {
    ads_enabled: true,
    data_year: 2015
};

var refresh_teams_data = function(){
    team_cache = new TeamsDataCache();
    team_cache.refresh();
};

// refresh_teams_data();

function isThereAGameToday(team_data){
    var now = moment()
        ,hours_in_1_day = 3600*60*24
        ,tomorrow = moment().add(1, 'days')
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
        ,start_date = moment(new Date(data[0].start_date + ' ' + data[0].start_time))
        ,upcoming_games = []
        ,current_game_idx = 0
    ;

    if (now.unix() < start_date.unix()){
        is_there = 'No';
        if (start_date.get('month') == now.get('month') && start_date.get('date') == now.get('date')){
            day = 'today';
        }
        else if (start_date.get('month') == now.get('month') && start_date.get('date') == now.get('date') + 1){
            day = 'tomorrow';
        }
        else{
            day = start_date.format('dddd');
        }

        if (day != "tomorrow" && day != "today"){
            day = " on " + day;
        }

        if (team_data.league == "mlb"){
            details = "Spring training is coming! It starts " + day + ", " + start_date.format('MMMM Do') + " at " + data[0].location + " @ " + start_date.format("h:mma");
        }
        else{
            details = "The season starts " + day + ", " + start_date.format('M/D') + " at the " + data[0].location.substr(0, data[0].location.indexOf(" -"));
        }

        tweet_text += details;
    }
    else{
        for (var i in data){
            start_date = moment(new Date(data[i].start_date + ' ' + data[i].start_time));
            end_date = moment(new Date(data[i].end_date + ' ' + data[i].end_time));

            if (now.format('MMDD') == start_date.format('MMDD')){
                is_there = 'Yes';
                tweet_text += 'Yes!';

                if (now.unix() < end_date.unix()){
                    if (now.unix() > start_date.unix()){
                        details = 'they\'re playing right now at ' + data[i].location + ' against the ' + data[i].against + '!';
                        tweet_text += ' Right now against the ' + data[i].against + '! ' + team_data.hashtag_during_game;
                    }
                    else{
                        start_time = start_date.format('h:mma')
                        details = 'at ' + data[i].location + ' against The ' + data[i].against + ' @ ' + start_time
                        tweet_text += ' Starting at ' + start_time + ' against the ' + data[i].against;
                    }
                }
                else{
                    details = 'but it\'s already over.';

                    if (data.length > i){
                        next_game_start_date = moment(new Date(data[parseInt(i)+1].start_date));

                        if (next_game_start_date != "Invalid Date"){
                            if (start_date.get('month') == now.get('month') && start_date.get('date') == now.get('date') + 1){
                                day = 'tomorrow';
                            }
                            else{
                                day = next_game_start_date.format('dddd');
                            }

                            details += ' The next game is scheduled for ' + day + ' at ' + data[parseInt(i)+1].location + ' @ ' + next_game_start_date.format('h:mma');
                        }
                    }
                }

                current_game_idx = i;
                break;
            }
            else if (is_there.toLowerCase() == "no" && end_date.unix() > now.unix()){ 
                next_game_start_date = moment(new Date(data[i].start_date + " " + data[i].start_time));

                if (next_game_start_date.isValid()){
                    if (next_game_start_date.get('day') == now.get('day') + 1){
                        day = 'tomorrow';
                    }
                    else{
                        day = next_game_start_date.format('dddd');
                    }

                    details = 'Not today, looks like the next scheduled game is ' + day + ' at ' + data[i].location + ' @ ' + next_game_start_date.format('h:mma');
                    tweet_text += 'Not today, the next scheduled game is ' + day + ' at ' + data[i].location + ' @ ' + next_game_start_date.format('h:mma');
                }

                current_game_idx = i;
                break;
            }
        }
    }

    upcoming_games = data.slice(current_game_idx, parseInt(current_game_idx) + 5);

    _.each(upcoming_games, function(gameday, idx){
        var start_date = moment(new Date(gameday.start_date + " " + gameday.start_time));

        upcoming_games[idx].datetime = start_date.valueOf();
        upcoming_games[idx].date_formatted = start_date.format('M/D');
        if (team_data.league == "mlb"){
            upcoming_games[idx].details = gameday.against + ' at ' + gameday.location + ' @ ' + start_date.format('h:mma')
        }
        else{
            upcoming_games[idx].details = gameday.against + ' at the ' + gameday.location.substr(0, gameday.location.indexOf(" -")) + '. Puck drops at ' + start_date.format('h:mma')
        }
    });

    return {
        is_there: is_there
        ,tweet_text: tweet_text
        ,details: details
        ,start_date: start_date ? start_date.valueOf() : null
        ,month: start_date.format('MMMM')
        ,day: start_date.format('dddd')
        ,next_game_start_date: next_game_start_date ? next_game_start_date.valueOf() : null
        ,upcoming_games: upcoming_games
    };
};

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  conf.ads_enabled = false;
  mongoose.connect("mongodb://localhost/isthereagametoday");
}
else{
  mongoose.connect("mongodb://localhost/isthereagametoday");
}

app.get('/:team/sitemap', function(req, res){
    var team = req.params.team.toLowerCase();

    DataCacheFetcher.get(team + "_team_data", function(team_data){
        if (!team_data){
            return res.send('404', 'sorry!');
        }

        res.render('sitemap', {
            layout: false
            ,today: moment().format('YYYY-MM-DD')
            ,base_url: 'http://www.' + team_data.track_url
            ,conf: conf
        });
    });
});

app.get('/:team', function(req, res){
    var team = req.params.team.toLowerCase();
    var team_data = {};

    DataCacheFetcher.get(team + "_team_data", function(team_data){
        if (!team_data){
            return res.send('404', 'not found');
        }

        today_data = isThereAGameToday(team_data);

        layout = "index";

        if (team_data.league == "nhl"){
            layout = "index_new"; //classic
        }

        res.render(layout, {
            title: 'Are the ' + team_data.name + ' Playing Today?'
            ,base_url: 'http://' + req.headers.host
            ,team_name: team //poorly named, this is really the slug used for javascript stuff
            ,team_data: team_data
            ,team_data_clean: _.omit(team_data, 'schedule', 'formatted_schedule')
            ,today_data: today_data
            ,meta_description: 'Find out if the ' + team_data.name + ' are playing a ' + (team_data.league == "mlb" ? "baseball" : "hockey") + ' game today!'
            ,favicon_version: FAVICON_VERSION
            ,conf: conf
        });
    });
});

app.get('/:team/schedule/:month?', function(req, res){
    var team = req.params.team.toLowerCase();
    var team_data = {};
    var months = [];
    var games_by_month = {};

    DataCacheFetcher.get(team + "_team_data", function(team_data){
        if (!team_dat){
            return res.send('404', 'not found');
        }

        today_data = isThereAGameToday(team_data);

        _.each(team_data.formatted_schedule, function(gameday){
            var start_date = moment(new Date(gameday.start_date + " " + gameday.start_time));
            var month_name = start_date.format('MMMM');

            if (_.indexOf(months, month_name) < 0){
                months.push(month_name);
                games_by_month[month_name] = [];
            }

            games_by_month[month_name].push({
                datetime: start_date.valueOf()
                ,date_formatted: start_date.format('dddd M/DD/YYYY')
                ,details: gameday.against + ' at ' + gameday.location + ' @ ' + start_date.format('H:mma')
            });
        });

        var first_month = _.first(_.keys(games_by_month));
        var selected_month = req.params.month ? req.params.month.toLowerCase() : false;
        var is_canonical = selected_month ? false : first_month;

        res.render('schedule', {
            title: team_data.name + " " + conf.data_year + " " + (selected_month ? _str.capitalize(selected_month) : _str.capitalize(first_month)) + " Schedule"
            ,base_url: 'http://www.' + team_data.track_url
            ,team_name: team //poorly named, this is really the slug used for javascript stuff
            ,team_data: team_data
            ,team_data_clean: _.omit(team_data, 'schedule', 'formatted_schedule')
            ,today_data: today_data
            ,months: months
            ,games_by_month: games_by_month
            ,selected_month: selected_month
            ,is_canonical: is_canonical
            ,meta_description: 'View the ' + conf.data_year + ' Schedule for the ' + team_data.name
            ,favicon_version: FAVICON_VERSION
            ,schedule_url: app.get('env') == "development" ? "/" + team_data.slug + "/schedule" : "/schedule"
            ,conf: conf
        });
    });
});

app.get('/games-data/:team', function(req, res){
    var team_name = req.params.team.toLowerCase()
    DataCacheFetcher.get(team + "_team_data", function(team_data){
        if (!team_data){
            return res.json({ error: 'not found' });
        }

        res.json(team_data.schedule);
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


