$.getJSON('/productAPI', function(data) {
    var email = data.email,
        fileName = data.fileName,
        title = data.title,
        id = data._id,
        data = data.data[0],
        keys = Object.keys(data)
        
    $('.title').append(document.createTextNode(title))
    $('.fileName').append(document.createTextNode(fileName))
    $('.email').append(document.createTextNode(email))
    
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
})