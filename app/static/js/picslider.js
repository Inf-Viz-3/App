var width = 750;
var height = 120;
var margin = { top: 0, right: 50, bottom: 10, left: 40 };
var padding = 0.1;
var previousBegin = null;
var previousEnd = null;
var previousTimegap = null;
var allTimeGroups = ["All", "Century", "Decade", "Year"]

//create dropdown
d3.select("#selectTimeButton")
.selectAll('myOptions')
    .data(allTimeGroups)
.enter()
    .append('option')
.text(function (d) { return d; })
.attr("value", function (d) { return d.toUpperCase(); }) 

//Read the data
readAndDrawData = function (){
    let url = new URL('/api/portrait_count_by_params', location.href)
    let fetchParams = filterJSParams
    fetchParams['beginDate'] = 0;
    fetchParams['endDate'] = 2020;
    fetchParams['age'] = age_groups;
    fetchParams['gender'] = ["male", "female"];
    fetchParams['color'] = color_groups;
    
    url.search = new URLSearchParams(fetchParams).toString();
    fetch(url).then(function(resp){
      return resp.json();
    }).then(function(data){
      update_pic_slider(data)
    });
}

function map_data(data, time_type) {
    switch(time_type) {
        case "YEAR":
            data.time = data.creation_year
            data.count = +data.count;
          break;
        case "DECADE":
            data.time = data.decade
            data.count = +data.count;
          break;
        case "CENTURY":
            data.time = data.century
            data.count = +data.count;
            break;
        case "ALL":
            data.time = data.period
            data.count = +data.count;
            break;
        default:
          break;
      }
    return data;
}

function update_pic_slider(data){
  const time_slider = document.getElementById("time_slider")
  const childs = time_slider.childNodes[0]
  if(childs != undefined)childs.remove();

  const tooltips = document.getElementsByClassName('tooltip-inner')
  if(tooltips != undefined){
    while(tooltips.length > 0){
      tooltips[0].parentNode.removeChild(tooltips[0]);
    }
  }

  const tooltiparrows = document.getElementsByClassName('arrow')
  if(tooltiparrows != undefined){
    while(tooltiparrows.length > 0){
      tooltiparrows[0].parentNode.removeChild(tooltiparrows[0]);
    }
  }

  init_pic_slider(data)
}
var slider;
var selected;
function init_pic_slider(data){
  if (filterJSParams['selected_time'] == "ALL"){
    var para = document.createElement("p")
    var bold = document.createElement("strong")
    var br = document.createElement("br")
    var bold_2 = document.createElement("strong")
    var text_1 = document.createTextNode("View a different face from a different time by selecting the ")
    var text_2 = document.createTextNode("Timespan ")
    var text_3 = document.createTextNode("control or by selecting the ")
    var text_4 = document.createTextNode("Dimension ")
    var text_5 = document.createTextNode("control which filters on age, gender or color group.")
    var text_6 = document.createTextNode("Have fun!")
    para.appendChild(text_1)
    bold.appendChild(text_2)
    para.appendChild(bold)
    para.appendChild(text_3)
    bold_2.appendChild(text_4)
    para.appendChild(bold_2)
    para.appendChild(text_5)
    para.appendChild(br)
    para.appendChild(text_6)

    
    var time_slider = document.getElementById("time_slider")
    time_slider.appendChild(para)
    return;
  }
  const svg = d3.select("#time_slider")
        .append("svg")
        // .attr("class", "w-100 h-100")
        .attr("viewBox", "0 0 750 150")
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")


  
  data.map(function(d){return map_data(d, filterJSParams['selected_time'])});
  var xBand = d3
      .scaleBand()
      .domain(data.map(d => d.time))
      .range([margin.left, width - margin.right])
      .padding(padding);

  var xLinear = d3
      .scaleLinear()
      .domain([
      d3.min(data, d => d.time),
      d3.max(data, d => d.time),
      ])
      .range([
      margin.left + xBand.bandwidth() / 2 + xBand.step() * padding - 0.5,
      width -
          margin.right -
          xBand.bandwidth() / 2 -
          xBand.step() * padding -
          0.5,
      ]);

  var y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .nice()
      .range([height - margin.bottom, margin.top])

  // var yAxis = g => g.attr('transform', `translate(${width - margin.right},0)`)
      // .call(g => g.select('.domain').remove());

  var bars = svg
  .append('g')
  .selectAll('rect')
  .data(data);

  var barsEnter = bars
      .enter()
      .append('rect')
      .attr('id', d => 'rect-' + d.time)
      .attr('x', d => xBand(d.time))
      .attr('y', d => y(d.count))
      .attr('height', d => y(0) - y(d.count))
      .attr('width', xBand.bandwidth());

  var draw = selected => {
    barsEnter
    .merge(bars)
    .attr('fill', d => (d.time === selected ? '#bad80a' : '#e0e0e0'))     
    .attr("data-toggle", "tooltip")
    .attr("data-html","true")
    .attr("data-placement", "top" )
    .attr("data-delay",'{"show":"1", "hide":"0"}')
    .attr("title", (x, d, z) => {       
        return `${Math.trunc(Math.exp(x.count)) -1 } Faces`
    })
    $('[data-toggle="tooltip"]').tooltip('hide')
    $('#rect-'+selected).tooltip('show')
  };

  // Create Tooltips
  $(function () {
      $('[data-toggle="tooltip"]').tooltip()
  })

  
  let begin = previousBegin;
  let end = previousEnd;
  
  // Time dependent
  if(filterJSParams['selected_time'] == "YEAR"){
      if (previousBegin) {
          // console.log(data);
      } else {
        begin = 1650;
        end = 1651;
      }
      selected = begin;
      filterJSUpdate("beginDate", begin, true)
      filterJSUpdate("endDate", end)
      slider = g => g.attr('transform', `translate(0,${height - margin.bottom})`).call(d3
              .sliderBottom(xLinear)
              .step(1)
              .ticks(10)
              .tickFormat(d3.format('.0f'))
              .default(filterJSParams['beginDate'])
              .on('onchange', value => draw(value))
              .on('drag', debounceD3Event(dragged_debounce,200))
          );
  } else if(filterJSParams['selected_time'] == "DECADE"){
    if (previousBegin) {
      begin = Math.round(previousBegin/10) * 10;
      end = (Math.round(previousEnd/10) * 10);
      if (end == begin) end = end + 10;
    } else {
      begin = 1650
      end = 1660
    }
    selected = begin;
    filterJSUpdate("beginDate", begin, true)
    filterJSUpdate("endDate", end)
    slider = g => g.attr('transform', `translate(0,${height - margin.bottom})`).call(d3
              .sliderBottom(xLinear)
              .step(10)
              .ticks(10)
              .tickFormat(d3.format('.0f'))
              .default(filterJSParams['beginDate'])
              .on('onchange', value => draw(value))
              .on('drag', debounceD3Event(dragged_debounce,200))
          );
  }else if(filterJSParams['selected_time'] == "CENTURY"){
    
    if (previousBegin) {
      if (previousTimegap == "CENTURY") {
        begin = previousBegin;
        end = previousEnd;
      } else {
        begin = Math.floor(previousBegin / 100) * 100;
        end = (Math.floor(previousBegin / 100) + 1) * 100;
      }
      
    } else {
      begin = 1600
      end = 1700
    }
    selected = Math.floor(end / 100);
    filterJSUpdate("beginDate", begin, true)
    filterJSUpdate("endDate", end)
    
    slider = g => g.attr('transform', `translate(0,${height - margin.bottom})`).call(d3
              .sliderBottom(xLinear)
              .step(1)
              .ticks(5)
              .tickFormat(d3.format('.0f'))
              .default(selected)
              .on('onchange', value => draw(value))
              .on('drag', debounceD3Event(dragged_debounce,200))
          );
  } else{
    
  }
  draw(selected);
  
  // svg.append('g').call(yAxis);
  svg.append('g').call(slider);
  svg.append("text")
        .attr("transform", "translate(45,0) rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("font-size", "smaller")
        .style("text-anchor", "middle")
        .attr("data-toggle", "tooltip")
        .attr("data-html","true")
        .attr("data-placement", "top" )
        .attr("title", (x, d, z) => {       
            return "Height bar indicates amount of faces for the selected timespan"
        })
        .text("Amount faces");
}

function dragged_debounce(d) {

    let begin = d;
    let end = d;
    switch(filterJSParams['selected_time']) {
      case "YEAR":
        // nothing
        end = end +1;
        previousBegin = begin;
        previousEnd = end;
        previousTimegap = "YEAR";
        break;
      case "DECADE":
          begin = begin
          end = end + 10
          previousBegin = begin;
          previousEnd = end;
          previousTimegap = "DECADE";
        break;
      case "CENTURY":
          begin = (d * 100) - 100 ;
          end = d * 100 
          previousBegin = begin;
          previousEnd = end;
          previousTimegap = "CENTURY";
        break;
      case "ALL":
          begin = 0
          end = 9999
          previousBegin = null;
          previousEnd = null;
          previousTimegap = "ALL";
        break;
      default:
          throw Error("something wrong here")
    }
    
    filterJSUpdate("beginDate", begin, true)
    filterJSUpdate("endDate", end)
}

function debounceD3Event(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      var evt  = d3.event;

      var later = function() {
        timeout = null;
        if (!immediate) {
          var tmpEvent = d3.event;
          d3.event = evt;
          func.apply(context, args);
          d3.event = tmpEvent;
        }
      };

      var callNow = immediate && !timeout;
      var x = Math.min(d3.event.x, innerWidth);
      d3.select('.slider_debounce').attr('transform', 'translate(' + Math.max(0,Math.min(x, x-margin.left)) + ',' + 25 + ')');
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        var tmpEvent = d3.event;
        d3.event = evt;
        func.apply(context, args);
        d3.event = tmpEvent;
      }
    };
  }

readAndDrawData();

var timer = null;

function done() {
  $('#rect-'+selected).tooltip('show')
}

window.addEventListener('scroll', function() {
  $('[data-toggle="tooltip"]').tooltip('hide')
    if (timer !== null) {
        clearTimeout(timer);        
    }

    
    timer = setTimeout(done, 450);
}, false);

filterJSInitParamsChangedHook((param, update_type) => {
  if (["beginDate", "endDate", "age", "gender", "color"].indexOf(update_type) == -1) {
    readAndDrawData();
  }
});

filterJSInitScrollHook(() => {
  toggleFunction(selected);
});