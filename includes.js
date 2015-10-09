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
