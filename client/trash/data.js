var margin = {top: 20, right: 20, bottom: 50, left: 70},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select(".svg").append("svg")
    .attr("width", width + margin.left  + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("outline", "thin solid gray")
    .append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")


d3.json("/dataAPI", function(data) {
    
    console.log(data)
    
    var ind = "x",  //d3.keys(data[0])[0],
        dep = "y"  //d3.keys(data[0])[1];
        
    data = data["data"];

    svg.append("text")
        .attr("x", width/2) 
        .attr("y", height + margin.top + (margin.bottom / 2))
        .style("text-anchor", "middle")
        .text(ind);
    
    svg.append("text")
        .attr("x",  height/2) //50
        .attr("y", margin.left/2 + margin.right) //235
        .attr("transform", "rotate(90)")
        .style("text-anchor", "middle")
        .text(dep)

    var maxX = d3.max(data, function(d) { return +d[ind]; }),
        minX = d3.min(data, function(d) { return +d[ind]; }),
        maxY = d3.max(data, function(d) { return +d[dep]}),
        minY = d3.min(data, function(d) { return +d[dep]; });

    var x = d3.scale.linear()
        .domain([minX, maxX])
        .range([0, width]);
    
    var y = d3.scale.linear()
        .domain([minY, maxY])
        .range([height, 0]);
        
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSize(1, 2)
        
    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(1, 2)
        .orient("left");
        
    var gx = svg.append("g")
        .attr("transform", "translate(0, " + height + ")")
        .call(xAxis);
    
    var gy = svg.append("g")
        .call(yAxis)
        
    svg.selectAll(".svg").append("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", 2)
        .attr("cx", function(d) {return x(d[ind]);})
        .attr("cy", function(d) {return y(d[dep]);}) 
 
});

//https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json