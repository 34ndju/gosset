$(document).ready(function() {
    var numInvites = 2;
    $('#submit').click(function() {
        console.log('click')
        $('.right form').submit();
    })
    
    $('#addMore').click(function() {
        $('.right form').append("<input type='email' spellcheck='false' name='email" + (++numInvites) + "'>")
    })
})