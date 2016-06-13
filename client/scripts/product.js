$(document).ready(function() {
    /*$.getJSON('/productAPI', function(data) {
        var filename = data.filename,
            id = data._id,
            metadata = data.metadata, //assigns data again
            email = metadata.email,
            title = metadata.title
            //keys = Object.keys(data)
        console.log(1)
        $('.title').append(document.createTextNode(title))
        $('.fileName').append(document.createTextNode(filename))
        $('.email').append(document.createTextNode(email))
    
        not working now
        var str = ""
        keys.forEach(function(d) {
            str += "" + d + ", "
        })
        str = str.replace(/,\s*$/, "");
        
        $('.keys').append(document.createTextNode(str)) 
        
        var a = document.createElement("a")
        a.setAttribute("href", "/download/" + id)
        a.appendChild(document.createTextNode("Download"))
        $(".download").append(a)
    }) */
    
    $('#user').click(function() {
        console.log($('#dropdown').css('visibility'))
        if($('#dropdown').css('visibility') == 'hidden') {
            $('#dropdown').css({'visibility':'visible', 'top': '60px'})
        }
        else if($('#dropdown').css('visibility') == 'visible') {
            $('#dropdown').css({'visibility':'hidden', 'top': '-500px'})
        }
    })
    
    console.log($('.content h1').text())
    $('.options #download').click(function() {
        ga('send', {
            hitType: 'event',
            eventCategory: 'Download',
            eventAction: 'Downloaded Product',
            eventLabel: 'Downloaded' + $('.content h1').text()
        });
    })
})