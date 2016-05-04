$.getJSON('/mydataAPI', function(data) {
    var files = data.files;
    files.forEach(function(d) {
        var div = document.createElement("div")
        var space = document.createElement("p")
        var x = document.createElement("a")
        
        space.appendChild(document.createTextNode("✕"))
        x.className = "x"
        x.appendChild(space)
        
        
        var p = document.createElement("p");
        p.appendChild(document.createTextNode(d.title))
        var link = document.createElement("a");
        link.setAttribute("href", "/product/" + d.id)
        link.appendChild(p);
        x.setAttribute("href", "/totalremove/" + d.id)
        div.appendChild(link)
        div.appendChild(x)
        div.className = "box"
        $(".files").append(div)
    })
})

