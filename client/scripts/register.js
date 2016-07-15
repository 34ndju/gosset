$(document).ready(function() {
    if(window.location.search.indexOf('path=') > -1) {
        var path = window.location.search.split('path=')[1]
        console.log(path)
        $('#path').val(path)
    }
    
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
    
    $('.box form button').click(function() {
        ga('send', {
            hitType: 'event',
            eventCategory: 'Register',
            eventAction: 'User Registration'
        });
    })
})