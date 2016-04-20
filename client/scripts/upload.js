$.getJSON('/cartAPI', function(data) {
    var li = document.createElement("li")
    var a = document.createElement("a")
    li.appendChild(document.createTextNode("Cart [" + data.cart.length + "]"))
    a.setAttribute("href", "/cart")
    a.appendChild(li)
    $("#tabs").append(a)
})

