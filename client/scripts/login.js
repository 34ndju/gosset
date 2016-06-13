$(document).ready(function() {
    $('.login form button').click(function() {
        ga('send', {
            hitType: 'event',
            eventCategory: 'Login',
            eventAction: 'User logged in'
        });
    })
})