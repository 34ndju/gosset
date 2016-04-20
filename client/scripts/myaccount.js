$.getJSON('/cartAPI', function(data) {
    var li = document.createElement("li")
    var a = document.createElement("a")
    li.appendChild(document.createTextNode("Cart [" + data.cart.length + "]"))
    a.setAttribute("href", "/cart")
    a.appendChild(li)
    $("#tabs").append(a)
})

$.getJSON('/accountinfoAPI', function(data) {
    var first = data.firstName,
        last = data.lastName,
        email = data.email;

    $('.name').append(document.createTextNode(first + " " + last))
    $('.email').append(document.createTextNode(email))
})
