updateCenturiesData = function(data){
  for (var i = 0; i < data.length; i++) {
    const century = data[i].century;
    if (century === 1 || century === 21) {
      data[i].century = century + 'st';
      continue;
    }
    if (data[i].century === 2 ) {
      data[i].century = century + 'nd';
      continue;
    }
    if (data[i].century === 3 ) {
      data[i].century = century + 'rd';
      continue;
    }
    data[i].century = century + 'th';
  }
  return data;
};

function componentToHex(c) {
  let hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


//Read the data
readAndDrawData = function (){
  fetch('/api/colors_200').then(function(resp){
    return resp.json();
  }).then((colors) => {
    fetch('/api/portraits_heatmap').then(function(resp){
      return resp.json();
    }).then(function(data){
      data = updateCenturiesData(data)
      // set the dimensions and margins of the graph
      var heatmap_margin = {top: 10, right: 55, bottom: 100, left: 65},
          heatmap_width = 600 - heatmap_margin.left - heatmap_margin.right,
          heatmap_height = 600 - heatmap_margin.top - heatmap_margin.bottom;
      // viewBox="0 0 1400 500" xmlns="http://www.w3.org/2000/svg">
      // append the svg object to the body of the page

      let colorHeatmap = d3.scaleOrdinal();
      let colRange = colors.map(color => [color['R'], color['G'], color['B']]);
      let colGroupsDomain = []
      const amountOfColorGroups = 200;
      for (let i = 0; i < amountOfColorGroups; i++) {
        colGroupsDomain.push(i)
      }
      colorHeatmap.domain(colGroupsDomain)
          .range(colRange);


      let viewboxHeight = heatmap_width + heatmap_margin.left + heatmap_margin.right;
      let viewBoxWidth = heatmap_height + heatmap_margin.top + heatmap_margin.bottom;
      let viewBox = `0 0 ${viewBoxWidth} ${viewboxHeight}`;
      var heatmap_svg = d3.select("#my_dataviz")
          .append("svg")
          .attr("id", "heatmap")
          .attr("viewBox", viewBox)
          .append("g")
          .attr("transform",
              "translate(" + heatmap_margin.left + "," + heatmap_margin.top + ")");
      // Labels of row and columns

      var periods = d3.map(data, function(d){return d.period}).keys()
      var centuries = d3.map(data, function(d){return d.century}).keys()
      // Build X scales and axis:
      var x = d3.scaleBand()
          .range([0, heatmap_width ])
          .domain(periods)
          .padding(0.01);

      heatmap_svg.append("g")
          .style("font-size", 15)
          .attr("transform", "translate(0," + heatmap_height + ")")
          .call(d3.axisBottom(x).tickSize(5))
          // Rotate the x-axis labels
          .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-60)")

      // Build Y scales and axis:
      var y = d3.scaleBand()
          .range([ 0, heatmap_height ])
          .domain(centuries)
          .padding(0.01);

      heatmap_svg.append("g")
          .style("font-size", 15)
          .attr("transform", "translate(-5,0)")
          .call(d3.axisLeft(y)
              .tickSize(5))

      heatmap_svg.append("text")
          // .attr("transform", "rotate(0)")
          .attr("y", heatmap_height + (heatmap_margin.bottom/2))
          .attr("x", (heatmap_width / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Periods");

      heatmap_svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - heatmap_margin.left)
          .attr("x",0 - (heatmap_height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Centuries");

      heatmap_svg.selectAll()
          .data(data)
          .enter()
          .append("rect")
          .attr("x", function(d) { return x(d.period) })
          .attr("y", function(d) { return y(d.century) })
          .attr("width", x.bandwidth() )
          .attr("height", y.bandwidth() )
          .attr("data-toggle", "slidertooltip")
          .attr("data-html", "true")
          .attr("data-placement", "top")
          // .attr("data-delay", '{"show":"1", "hide":"0"}')
          .attr("title", (x, d, z) => {  
            var text;
            if(x.group){
              text = "The color of this period is: <strong>" +
                  rgbToHex(colorHeatmap(x.group)[2], colorHeatmap(x.group)[1], colorHeatmap(x.group)[0]).toUpperCase() +
                  "</strong> based on <strong>" + x.count + "</strong> portraits in the most dominant color group."
            } else{
              text = "There is no portrait from this century and period."
            }
            return text
          })
          .style("fill", function(d) {
            if (d.group !== null){
              return "rgb(" +colorHeatmap(d.group)[0] +"," +colorHeatmap(d.group)[1] +"," +colorHeatmap(d.group)[2] +")"
            }  else {
              return '#FFFFFF';
            }})

          $(function () {
            $('[data-toggle="slidertooltip"]').tooltip()
          })

      heatmap_svg.selectAll()
          .data(data)
          .enter().filter(function(d){ return d.group === null})
          .append("line")
          .attr("x1", function(d) { return x(d.period)})
          .attr("y1", function(d) { return y(d.century) + y.bandwidth()})
          .attr("x2", function(d) { return x(d.period) +  x.bandwidth()})
          .attr("y2", function(d) { return y(d.century)})
          .style("stroke", "grey")
          .style("stroke-width", 1);
    })
  })
};
  
readAndDrawData();

