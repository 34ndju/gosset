$(document).ready(function() {
    var numInvites = 2;
    
    if(window.location.search.indexOf('path=') > -1) {
        var path = window.location.search.split('path=')[1].split('%2F').join('/')
        console.log(path)
        $('#path').val(path)
    }
    
    
    $('#submit').click(function() {
        console.log('click')
        $('.right form').submit();
    })
    
    $('#addMore').click(function() {
        $('.right form').append("<input type='email' spellcheck='false' name='email" + (++numInvites) + "'>")
    })
    
    $('#submit').click(function() {
        ga('send', {
            hitType: 'event',
            eventCategory: 'Click',
            eventAction: 'Clicked "Invite Colleagues"'
        });
    })
    
    $('#skip').click(function() {
        ga('send', {
            hitType: 'event',
            eventCategory: 'Click',
            eventAction: 'Clicked "Skip Invitation"'
        });
    })
})