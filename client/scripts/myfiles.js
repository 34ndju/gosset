$.getJSON('/cartAPI', function(data) {
    var li = document.createElement("li")
    var a = document.createElement("a")
    li.appendChild(document.createTextNode("Cart [" + data.cart.length + "]"))
    a.setAttribute("href", "/cart")
    a.appendChild(li)
    $("#tabs").append(a)
})


$.getJSON('/mydataAPI', function(data) {
    var files = data.files;
    files.forEach(function(d) {
        var space = document.createElement("a")
        var x = document.createElement("a")
        x.className = "x"
        x.appendChild(document.createTextNode("✕"))
        var p = document.createElement("p");
        var link = document.createElement("a");
        link.setAttribute("href", "/product/" + d.id)
        link.appendChild(document.createTextNode(d.title))
        p.appendChild(link);
        x.setAttribute("href", "/totalremove/" + d.id)
        p.appendChild(x)
        $(".files").append(p)
    })
})

