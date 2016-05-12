$(document).ready(function() {
    var onVid=false;
    var startTime;

    $(".black, .exit").click(function() {
        if(onVid) {
            console.log('onVid');
            $('.black').height(0);
            $('.black').width(0);
            $('.video').attr('src', '');
            $('.videobox').css('display', 'none')
            var endTime = new Date().getTime();
            var timeSpent = endTime - startTime;

            
            ga('send', {
                hitType: 'timing',
                timingCategory: 'Video',
                timingVar: 'Demo Vid Viewtime',
                timingValue: timeSpent
            });
            
            onVid = false;
        }
    });



    $(".vid").click(function() {
        if(!onVid) {
            console.log('not onVid')
            $('.video').attr('src', 'https://docs.google.com/file/d/0B_l-CMeRzdw3YjhzajY0dk5EWms/preview?&autoplay=1?');
            $('.videobox').css('display', 'block');
            $('.black').height($(document).height());
            $('.black').width($(document).width());
            startTime = new Date().getTime();
            onVid = true;
        }
    });

})

