// @codekit-prepend "../bower_components/jquery/dist/jquery.js";
// @codekit-prepend "../bower_components/underscore/underscore.js";
// @codekit-prepend "../bower_components/moment/moment.js";

var team_name = ""
    ,team_data = {}
    ,today_data = null
    ,games_feed = '/games-data'
    ,World = {}
    ,resize_columns = null
;

$(function(){
    var win_height = $(window).height();
    var NHL_LAYOUT = $(document.body).hasClass("nhl_layout");

    if (typeof(tbn) == "undefined"){
        tbn = function(){};
    }

    team_name = $('input[name=team_name]').val();
    games_feed = $('input[name=games_url]').val();
    team_data = JSON.parse($('input[name=team_data]').val());
    today_data = JSON.parse($('input[name=today_data]').val());
    tbn(document, 'script', 'twitter-wjs');

    if (send_tracking){
        ga('create', team_data.tracking_code, team_data.track_url);
        ga('send', 'pageview');
    }

    if ($(".other-teams").length){
        var $style = $("<style/>").prop("type", "text/css");
        var styles = [];
        var selector = "";
        var color = "";

        $(".other-teams li").each(function(){
            $a = $(this).children("a");
            styles.push([$a.data("team"), $a.data("team_color")]);
        });

        for (var i in styles){
            selector = ".team-" + styles[i][0] + " a:hover";
            color = "color: " + styles[i][1] + ";";

            $style.append(selector + "{ " + color + " }\n");
        }

        $("head").append($style);
    }

    if (NHL_LAYOUT){
        resize_columns = function(){
            if ($(window).width() < 769){
                return false;
            }

            $(".left_col .content_container, .right_col .content_container").each(function(){
                var height = $(this).outerHeight();
                var newtop = (win_height - height) / 2;
                $(this).css("top", newtop - 40);
            });
        };

        resize_columns();

        $(window).on("resize", resize_columns);
    }
});
