$(window).load(function() {
    var onVid=false;
    var startTime;

    $(".black, .exit").click(function() {
        if(onVid) {
            $('.black').height(0);
            $('.black').width(0);
            $('.video').attr('src', '');
            $('.videobox').css('display', 'none')
            var endTime = new Date().getTime();
            var timeSpent = endTime - startTime;
            onVid = false;
            
            ga('send', {
                hitType: 'timing',
                timingCategory: 'Video',
                timingVar: 'Demo Vid Viewtime',
                timingValue: timeSpent
            });
        }
    });



    $(".play").click(function() {
        if(!onVid) {
            $('.video').attr('src', 'https://docs.google.com/file/d/0B_l-CMeRzdw3YjhzajY0dk5EWms/preview?&autoplay=1?');
            $('.videobox').css('display', 'block');
            $('.black').height($(document).height());
            $('.black').width($(document).width());
            startTime = new Date().getTime();
            onVid = true;
            
            ga('send', {
                hitType: 'event',
                eventCategory: 'Video',
                eventAction: 'Playe Video',
                eventLabel: 'Played Demo Vid'
            });
        }
    });

    var inview = new Waypoint.Inview({
        element: $('.about')[0],
        enter: function(direction) {
            console.log(1)
            $('.about').addClass('about-t');
            $('.buy').addClass('buy-t');
            $('.sell').addClass('sell-t');
        },
        entered: function(direction) {
            console.log(2)
        },
        exit: function(direction) {
            console.log(3)
        },
        exited: function(direction) {
            $('.about').removeClass('about-t');
            $('.buy').removeClass('buy-t');
            $('.sell').removeClass('sell-t');
        }
    })
    

})
