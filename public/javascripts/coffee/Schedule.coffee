class Schedule
    constructor: (container) ->
        @container = $ container
        @months = @container.find '.months'
        @games = @container.find '.games'

        @setup_events()

    setup_events: ->
        @months.on 'click', 'a', (e) =>
            e.preventDefault()
            $a = $(e.currentTarget)
            @show_month $a.data('month')

    show_month: (month) ->
        @months.find('.active').removeClass('active')
        @months.find('[data-month=' + month + ']').addClass('active')
        @games.find('.month-container.active').removeClass('active')
        @games.find('.month-container[data-month=' + month + ']').addClass('active')


World.Schedule = Schedule
