$(document).ready(function() {
    var startTime = new Date().getTime();
    $("body").click(function() {
        $('.black').css({'background': 'rgba(0,0,0, 0'});
        $('.main-header a').css({'color':'white'});
        $('.videobox').remove()
        var endTime = new Date().getTime();
        var timeSpent = endTime - startTime;
        
        console.log(timeSpent)
        
        ga('send', {
            hitType: 'timing',
            timingCategory: 'Video',
            timingVar: 'Demo Vid Viewtime',
            timingValue: timeSpent
        });
        
        
        //window._gaq.push(['_trackTiming', 'Video', 'Video Demo Watch', timeSpent, 'watchTime'])
    })
})

