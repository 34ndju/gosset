$(document).ready(function() {
    Stripe.setPublishableKey('pk_live_0kmdttZT0HwB3E8el8SpRFf8');
    var opened = false;
    
    function n(n){
        if(n.length == 1) {
            return '0' + n
        }
        else {
            return n;
        }
    }
    
    $('#user').click(function() {
        console.log($('#dropdown').css('visibility'))
        if($('#dropdown').css('visibility') == 'hidden') {
            $('#dropdown').css({'visibility':'visible', 'top': '60px'})
        }
        else if($('#dropdown').css('visibility') == 'visible') {
            $('#dropdown').css({'visibility':'hidden', 'top': '-500px'})
        }
    })
    
    $('#download').click(function() {
        $('.downloadOptions').css('display', 'block')
    })
    
    
    $('#rawDownload').click(function() {
        ga('send', {
            hitType: 'event',
            eventCategory: 'Download',
            eventAction: 'Downloaded Raw File',
            eventLabel: 'Downloaded' + $('#filename').text()
        });
    })
    
    $('#json').click(function() {
        ga('send', {
            hitType: 'event',
            eventCategory: 'Download',
            eventAction: 'Downloaded JSON',
            eventLabel: 'Downloaded' + $('#filename').text()
        });
    })
    
    $('#csv').click(function() {
        ga('send', {
            hitType: 'event',
            eventCategory: 'Download',
            eventAction: 'Downloaded CSV',
            eventLabel: 'Downloaded' + $('#filename').text()
        });
    })
    
    $('#submit').click(function() {
        if(opened) {
            Stripe.card.createToken({
                number: $('#number').val(),
                cvc: $('#cvc').val(),
                exp_month: n($('#exp_month').val()),
                exp_year: $('#exp_year').val()
            }, function(err, response) {
                $('#creditCardToken').val(response.id)
                console.log(response)
                if(response.error)
                    $('#error').val(response.error.message)
                $('.pay').submit()
            });
        }
        else {
            $('.top').css('display', 'block')
            $('.bottom').css('display', 'block')
            opened = true;
        }
    })
    
    $('#buttonLabel #securityText').hover(
        function() {
            console.log(1)
            $('#buttonLabel #security').css({'display':'block'})
        },
        function() {
            $('#buttonLabel #security').css({'display':'none'})
        }
    )
})