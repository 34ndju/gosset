$(document).ready(function() {
    if(window.location.search.indexOf('path=') > -1) {
        var path = window.location.search.split('path=')[1].split('%2F').join('/')
        console.log(path)
        $('#path').val(path)
    }
    
    $('.login form button').click(function() {
        ga('send', {
            hitType: 'event',
            eventCategory: 'Login',
            eventAction: 'User logged in'
        });
    })
})