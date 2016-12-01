var $target = $('.wrapper');
inView('.section').on('enter', function(el){
  var color = $(el).attr('data-background-color');
  $target.css('background-color', color );
});

var svg = d3.select("#d3viz").append("svg").attr("width", 600).attr('height',600),
    margin = 20,
    diameter = +svg.attr("width"),
    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

var color = d3.scaleLinear()
    .domain([-1, 5])
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl);

var pack = d3.pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);

$.getJSON('/api/get', function(data){
  var food = data.food;
  var jsonForD3 = {};
  jsonForD3.name = 'food';
  var children = [];
  food.forEach(function(item, index){
    var exist = false;
    for(var i = 0; i < children.length; i++){
      if(children[i].name == item.type){
        children[i].children.push({'name':item.name, 'size':item.calories, 'url': item.url});
        exist = true;
        break;
      }
    }
    if(!exist){
      var color;
      if(item.type == "Meat"){
        color = '#C84552';

      } else if(item.type == "Drink"){
        color = '#FDC029';
      }
      else if(item.type == "Frozen Food"){
        color = '#adf';
      }
      else if(item.type == "Vegetable"){
        color = 'green';
      }
      else if(item.type == "Nuts"){
        color = '#BE9A5B';
      }
      else if(item.type == "Sweets"){
        color = '#985238';
      }
      else if(item.type == "Grain"){
        color = '#D7844E';
      }
      else if(item.type == "Fruit"){
        color = '#FE7707';
      }
      else if(item.type == "Oil"){
        color = '#FDCE04';
      }
      else if(item.type == "Snacks"){
        color = '#CA5D15';
      }
      // else if(item.type == "Flower"){
      //   color = '#C7B14C';
      // }
      else if(item.type == "Dairy"){
        color = '#FFF0AD';
      }

      children.push({'name': item.type, 'color': color, 'children':[{'name':item.name, 'size':item.calories, 'url': item.url}]});
    }

    // var svgToAppend = '<svg width="100%" height="100%">' +
    //                 '<defs id="mdef">' +
    //             '<pattern id="' + item.name + '" x="0" y="0" height="100%" width="100%">' +
    //               '<image x="0" y="0" width="100%" height="100%" xlink:href="' + item.url + '"></image>' +
    //             '</pattern>'+
    //       '</defs>';
    // $("#hidden").append(svgToAppend);
  })
  jsonForD3.children = children;
  console.log(jsonForD3);
  createViz(jsonForD3);
});

function createViz(root){
  root = d3.hierarchy(root)
      .sum(function(d) { return d.size; })
      .sort(function(a, b) { return b.value - a.value; });

  var focus = root,
      nodes = pack(root).descendants(),
      view;

      console.log(nodes);
  var circle = g.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
      .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
      // .style("fill", function(d) { return d.children ? color(d.depth) : null; })
      .style("fill", function(d) { return d.data.url ? d.parent.data.color : color(d.depth) })
      // .style("stroke", function(d) { return color(0) })
      .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

  var text = g.selectAll("text")
    .data(nodes)
    .enter().append("text")
      .attr("class", "label")
      .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
      .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
      .text(function(d) { return d.data.name; });

  var node = g.selectAll("circle,text");

  svg
      // .style("background", color(-1))
      .on("click", function() { zoom(root); });

  zoomTo([root.x, root.y, root.r * 2 + margin]);

  function zoom(d) {
    var focus0 = focus; focus = d;

    var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function(d) {
          var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          return function(t) { zoomTo(i(t)); };
        });

    transition.selectAll("text")
      .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
        .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
        .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
  }

  function zoomTo(v) {
    var k = diameter / v[2]; view = v;
    node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
    circle.attr("r", function(d) { return d.r * k; });
  }
}

