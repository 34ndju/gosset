$(document).ready(function() {
    $('#user').click(function() {
        console.log($('#dropdown').css('visibility'))
        if($('#dropdown').css('visibility') == 'hidden') {
            $('#dropdown').css({'visibility':'visible', 'top': '60px'})
        }
        else if($('#dropdown').css('visibility') == 'visible') {
            $('#dropdown').css({'visibility':'hidden', 'top': '-500px'})
        }
    })
    
    $('#fileInput').change(function() {
        var filepath = this.value;
        var m = filepath.match(/([^\/\\]+)$/);
        var filename = m[1];
        $('#filename').html(filename);
    });

})