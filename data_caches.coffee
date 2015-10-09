class TeamsDataCache extends DataCache
  constructor: ->
    super "teams_data"

  refresh: ->
    fs.readFile __dirname + '/teams_data.json', (err, contents) =>
      if !err
        data = JSON.parse(contents)

        if data
          for tdata in data
            @load_games_data tdata.slug, _.extend({schedule:[]}, tdata)
      else
        console.log "error reading teams_data"

  load_games_data: (team, team_data) ->
    games = []

    fs.readFile "#{__dirname}/schedules/#{conf.data_year}_#{team}.csv", "UTF-8", (err, contents) =>
      if !err
        for line, i in contents.split("\n")
          if !_.isEmpty(line)
            games.push(line.split(","))

        team_data.schedule = games
        team_data.formatted_schedule = []
        
        for game_data, i in games
          game = {}

          if i > 0
            for key, k in games[0]
              key = key.toLowerCase()
              game[key] = game_data[k]

            team_data.formatted_schedule.push(game);

        cache = new DataCache("#{team}_team_data")
        cache.store team_data
        console.log "team data stored for the #{team}"
      else
        console.log "error reading team schedule #{conf.data_year}_#{team}"
