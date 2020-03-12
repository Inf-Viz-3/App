let marginColorDist = {top: 50, right: 20, bottom: 50, left: 65},
    widthColorDist = 500 - marginColorDist.left - marginColorDist.right,
    heightColorDist = 500 - marginColorDist.top - marginColorDist.bottom;

let colors;

fetch_color_dist_data = function () {
    let url = new URL('/api/color_dist', 'http://localhost:5000')
    url.search = new URLSearchParams(params).toString();

    fetch(url)
        .then(resp => resp.json())
        .then((data) => {
            // updateColorDistribution(data)
            drawBars(data);
        });
};

init_colors = function () {
    let url = new URL('/api/colors', 'http://localhost:5000')

    fetch(url)
        .then(resp => resp.json())
        .then((data) => {
            colors = data
        }).then(() => {
        fetch_color_dist_data()
    });
};
init_colors();

get_max_sum = function (data) {
    let values = [];
    data.forEach((ageGroup) => {
        let sum = 0;
        for (let i = 0; i < params['color'].length; i++) {
            sum += ageGroup[String(params['color'][i])]
        }
        values.push(sum);
    });
    return Math.max(...values);
};

// TODO maybe sort age groups?
function drawBars(data) {
    let groups = d3.map(data, d => d.age).keys();
    let subgroups = params['color'];

    // TODO fix for smaller values than 1000
    const maxY = Math.round((get_max_sum(data) + (get_max_sum(data) / 10)) / 1000) * 1000;
    let y = d3.scaleLinear()
        .domain([0, maxY])
        .range([heightColorDist, 0]);

    let x = d3.scaleBand()
        .domain(groups)
        .range([0, widthColorDist])
        .padding([0.2]);

    let colRange = colors.map(color => [color['R'], color['G'], color['B']]);

    // TODO maybe sort color groups? Looks actually good like this
    let color = d3.scaleOrdinal()
        .domain(params['color'])
        .range(colRange);

    console.log(colors);
    let stackedData = d3.stack()
        .keys(subgroups)
        (data);

    const svgColorDist = d3.select("#bubble")
        .append("svg")
        .attr("width", widthColorDist + marginColorDist.left + marginColorDist.right)
        .attr("height", heightColorDist + marginColorDist.top + marginColorDist.bottom)
        .append("g")
        .attr("transform",
            "translate(" + marginColorDist.left + "," + marginColorDist.top + ")");

    svgColorDist.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter().append("g")
        .attr("fill", d => {
            return "rgb(" + color(d.key)[2] + ", " + color(d.key)[1] + "," + color(d.key)[0] + ")"
        })
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(d => d)
        .enter().append("rect")
        .attr("x", d => {
            return x(d.data.age)
        })
        .attr("y", d => {
            return y(d[1])
        })
        .attr("height", (d) => {
            return y(d[0]) - y(d[1])
        })
        .attr("width", x.bandwidth())


    svgColorDist.append("g")
        .attr("transform", "translate(0," + heightColorDist + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0));

    svgColorDist.append("g")
        .call(d3.axisLeft(y));
}