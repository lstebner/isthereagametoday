# @codekit-prepend "Schedule.coffee";

$ ->
    if $('#schedule').length
        World.schedule = new Schedule "#schedule"
