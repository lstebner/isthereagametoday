class Schedule
    constructor: (container, @opts={}) ->
        @default_opts()
        @container = $ container
        @months = @container.find '.months'
        @games = @container.find '.games'

        @setup_events()

        if @container.data("show_month")
            console.log "show_month"
            @show_month @container.data("show_month")

    default_opts: ->
        @opts = _.extend
            handle_navigation: false
            @opts

    setup_events: ->
        if @opts.handle_navigation
            @months.on 'click', 'a', (e) =>
                e.preventDefault()
                $a = $(e.currentTarget)
                @show_month $a.data('month')

    show_month: (month) ->
        month = month.toLowerCase()
        @months.find('.active').removeClass('active')
        @months.find('[data-month=' + month + ']').addClass('active')
        @games.find('.month-container.active').removeClass('active')
        @games.find('.month-container[data-month=' + month + ']').addClass('active')


World.Schedule = Schedule
