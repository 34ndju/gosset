$.getJSON('/productAPI', function(data) {
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

    /* not working now
    var str = ""
    keys.forEach(function(d) {
        str += "" + d + ", "
    })
    str = str.replace(/,\s*$/, "");
    
    $('.keys').append(document.createTextNode(str)) */
    
    var a = document.createElement("a")
    a.setAttribute("href", "/download/" + id)
    a.appendChild(document.createTextNode("Download"))
    $(".download").append(a)
})