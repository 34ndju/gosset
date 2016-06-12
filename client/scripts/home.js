$(document).ready(function() {
    
    
    $('#reg').click(function() {
        /*var h = $(document).outerHeight() + 'px';
        $('#black-overlay').css({'height': h, 'visibility': 'visible'})
        $('.box').css('visibility','visible')
        if($('#pw1').val() != $('#pw2').val()) {
            $('#noMatch').css('visibility', 'visible')
            $('.box form button').prop('disabled', true)
        }
        else if($('#pw1').val() == '') {
            $('.box form button').prop('disabled', true)
        }
        
        ga('send', {
            hitType: 'event',
            eventCategory: 'Click',
            eventAction: 'Register Button Click',
            eventLabel: 'Register Button'
        }); */
        
        $('html, body').animate({
            scrollTop: $("body").offset().top
        }, 600);
    });
    
    $('.box #exit').click(function() {
        $('#black-overlay').css('visibility','hidden');
        $('.box').css('visibility','hidden');
        $('#noMatch').css('visibility', 'hidden')
    })
    
    $('#pw1, #pw2').on('input', function() {
        if($('#pw1').val() != $('#pw2').val()) {
            $('#noMatch').css('visibility', 'visible')
            $('.box form button').prop('disabled', true)
        }
        else if($('#pw1').val() == '') {
            $('.box form button').prop('disabled', true)
            $('#noMatch').css('visibility', 'hidden')
        }
        else {
            $('#noMatch').css('visibility', 'hidden')
            $('.box form button').prop('disabled', false)
        }
    })
    
    $('#b').click(function() {   //click buy and slide left
        $('#s').css({'color':'gray', 'font-weight':'normal'});
        $('#b').css({'color':'black', 'font-weight':'bold'})
        $('.sell').css('left','-100%')
        $('.buy').css('right','0%')
    })
    
    $('#s').click(function() {  //click sell and slide right
        $('#b').css({'color':'gray', 'font-weight':'normal'});
        $('#s').css({'color':'black', 'font-weight':'bold'})
        $('.sell').css('left','0%')
        $('.buy').css('right','-100%')
    })
    
    $('#sellScroll').click(function() {  //click sell in .info and scroll to bottom, then transition left/right
        $('html, body').animate({
            scrollTop: $(".more").offset().top
        }, 600);
        $('#b').css({'color':'gray', 'font-weight':'normal'});
        $('#s').css({'color':'black', 'font-weight':'bold'})
        $('.sell').css('left','0%')
        $('.buy').css('right','-100%')
    })
    
    $('#buyScroll').click(function() { //click buy in .info and scroll to bottom, then transition left/right
        $('html, body').animate({
            scrollTop: $(".more").offset().top
        }, 600);
        $('#s').css({'color':'gray', 'font-weight':'normal'});
        $('#b').css({'color':'black', 'font-weight':'bold'})
        $('.sell').css('left','-100%')
        $('.buy').css('right','0%')
    })
    
    $('#register').waypoint(function(direction) {
        if(direction == 'down') {
            $('#reg').css({'display':'block'})
            $('#login div').css({'width':'66px'})
            $('.header').css({'background':'rgba(255,255,255,0.9)', 'height': '50px'})
            $('#logo h1').css({'margin-left':'5px', 'float': 'right'});
        }
        else {
            $('#reg').css('display','none')
            $('#login div').css({'width':'76px'})
            $('.header').css({'background':'rgba(255,255,255,0.3)', 'height': '75px'})
            $('#logo h1').css({'margin-left':0, 'float': 'none'});
        }
    })
    
    $('#moveLeft').waypoint(function() {
        $('#moveLeftContent').css('margin-left',0);
    }, {offset:'100%'})
    
    $('#moveRight').waypoint(function() {
        $('#moveRightContent').css('margin-left', '50%')
    },{offset:'100%'})
})
