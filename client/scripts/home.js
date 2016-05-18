$(document).ready(function() {
    $('#register').click(function() {
        var h = $("body").height() + 'px';
        $('#black-overlay').css({'height': h, 'visibility': 'visible'})
        $('.box').css('visibility','visible')
    });
    
    $('.box #exit').click(function() {
        $('#black-overlay').css('visibility','hidden');
        $('.box').css('visibility','hidden');
    })
})