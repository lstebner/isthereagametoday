# Is there a game today? 

========================================

This little site "generator" is used to power several individual sites. I personally run:
- arethegiantsplayingtoday.com
- arethepiratesplayingtoday.com
- aretheindiansplayingtoday.com

You can use it to run one as well if you want, I will update this in the near future with steps on how to create new team pages. 


## How to add a new team page

1. Google for "[team name] downloadable schedule" and you should find an official site with a downloadable CSV file. 
    - Save this file to the "schedules" folder with the name "[year]_[team].csv"
    - Open this file because you need to make some replacements
        1. Change the "SCHEDULE" column title to "AGAINST"
        2. Search for all instances of " at [team]" and "[team] at " and replace it with an empty string. For example, the Pirates, you would replace "Pirates at " and " at Pirates", making sure to include the spaces.

2. Copy one of the existing LESS files from /stylesheets/teams to your new team name.
    - Now go visit http://teamcolors.arc90.com/ and find your teams colors. You'll need to put the top 3 colors and the team slug in the LESS file you just made. 

3. Several Images will be needed. 
    - First, create a new folder in public/images/teams/ with your teams slug
    - Now find a decent quality logo and save it as "logo.jpg"
    - Next take that logo and turn it into a favicon using a favicon generator (use google) and save that as "favicon.ico"
    - Lastly, find an image (I've been using stadium images) that you want to use as the page background and save it as "background.jpg"

4. Now you'll need to add an entry to teams_data.json for the new team(s)
    - Open this file and copy one of the existing blocks
    - Change all the properties to values that match your new team
        1. name: The full name of your team, i.e. Pittsburgh Pirates
        2. slug: This should be the slug you've been using in places like the image folder, i.e. "pirates"
        3. hashtag: The hashtag to use in the tweet button
        4. hashtag_during_game: An additional hashtag to add when a user visits during a game
        5. tracking_code: A google analytics tracking code to add to the page for this team
        6. auth_code: A google webmasters auth code for this team

5. Lastly, you'll need to set up your server, but that's sorta up to you. At this point you should be able to run the site and visit localhost:3035/your_team_slug and see your teams page. I use an nginx configuration that routes the different domains to this URL, you can see the example in nginx_server.conf.
