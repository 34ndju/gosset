/*$.getJSON('/cartAPI', function(data) {
    var li = document.createElement("li")
    var a = document.createElement("a")
    li.appendChild(document.createTextNode("Cart [" + data.cart.length + "]"))
    a.setAttribute("href", "/cart")
    a.appendChild(li)
    $("#tabs").append(a)
}) */


$.getJSON('/cartAPI', function(data) {
    var cart = data.cart
    cart.forEach(function(d) {
        var space = document.createElement("a")
        var x = document.createElement("a")
        x.className = "x"
        x.appendChild(document.createTextNode("✕"))
        var p = document.createElement("p");
        var link = document.createElement("a")
        link.setAttribute("href", "/product/" + d.id)  //CHANGE THE LINK WHEN PRODUCT PAGE IS SET UP
        link.appendChild(document.createTextNode(d.title))
        p.appendChild(link)
        x.setAttribute("href", "/removefromcart/" + d.id)
        p.appendChild(x)
        $(".cart").append(p)
    })
})

