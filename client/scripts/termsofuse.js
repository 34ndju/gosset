$(document).ready(function() {
    $('#title').waypoint(function(direction) {
        console.log(direction)
        if(direction == 'down') {
            $('.header').css({'background':'rgba(255,255,255,0.9)', 'height': '50px'})
            $('#logo h1').css({'margin-left':'5px', 'float': 'right'});
        }
        else {
            $('.header').css({'background':'rgba(255,255,255,0.3)', 'height': '75px'})
            $('#logo h1').css({'margin-left':0, 'float': 'none'});
        }
    })
})