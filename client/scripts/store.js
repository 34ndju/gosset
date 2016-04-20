$.getJSON('/cartAPI', function(data) {
    var li = document.createElement("li")
    var a = document.createElement("a")
    li.appendChild(document.createTextNode("Cart [" + data.cart.length + "]"))
    a.setAttribute("href", "/cart")
    a.appendChild(li)
    $("#tabs").append(a)
})



$.getJSON('/storeAPI', function(data) {
    var files = data.files;
    files.forEach(function(d) {
        var p = document.createElement("p");
        var link = document.createElement("a");
        link.setAttribute("href", "/addtocart/" + d.id + "/" + d.title.replace(/ /g, "_"))
        link.appendChild(document.createTextNode(d.title))
        p.appendChild(link);
        $(".files").append(p)
    })
})

