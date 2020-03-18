const xwide = 100;
const xmargin = 5;
const ymargin = 5;
const subsvgheight = 90;
const subsvgwidth = 90;
var face_index = 0;

function createFaceDOM(face, index, svg) {
    
    let faceurl = `../static/img/faces/${face.imgid}_${face.faceid}.jpg` 
    let purl = `../static/img/portraits/${face.imgid}.jpg` 
    let facesvg = svg.append("svg")
        .attr("x", xmargin + (xwide * index))
        .attr("y", ymargin)
        .attr("width", subsvgwidth)
        .attr("height", subsvgheight)
        .attr("viewbox", "0 0 100 100")
        .classed("rounded-circle", true)
        .classed("shadow", true)

    let tooltiphtml = `<div class="container">
                       <img class='w-100' src='${purl}'>
                       <span>Distance</span>
                       <span>${face.deviation}</span>
                       </div>`

    let link = facesvg.append("a")
        .attr("href", faceurl)
    let faceobj = link.append("image")
        .attr("href", faceurl)
        .attr("y", 0)
        .attr("x", 0)
        .attr("width", 100)
        .attr("height", 100)
        .attr("data-toggle", "tooltip")
        .attr("data-html", "true")
        .attr("title", tooltiphtml)

    $(function () {
        $(faceobj.node()).tooltip()
    })
}

function buildFacesBar(data) {
    let svg = d3.select("#faces-simbar")
    svg.selectAll("svg").remove()
    data.forEach( (element, index) => {
        createFaceDOM(element, index, svg);
    });
}

function fetch_data() {
    var url = new URL('/api/faces_by_params', location.href)
    let params = filterJSParams;
    params["index"] = face_index;
    
    url.search = new URLSearchParams(params).toString();
    fetch(url).then(function (resp) {
        return resp.json()
    }).then(buildFacesBar);
}

function get_image_url(){
    let base_url = "/static/img"
    let time = filterJSParams['beginDate'];
    let dimension = filterJSParams["dimension"];
    let dimensionValue = filterJSParams["dimension-value"];
    let timefolder = "";
    let imgfolder = "";
    let imgname = ";"
    switch(filterJSParams['selected_time']) {
        case "YEAR":
            timefolder = "year"
          break;
        case "DECADE":
            timefolder = "decade"
            time = time
          break;
        case "CENTURY":
            timefolder = "century"
          break;
        case "ALL":
            timefolder = "all"
            if (dimension == "none") {
                dimensionValue == "1"
            }
            break;
      }
    if (filterJSParams["dimension"] != "none") {
        imgfolder = `${timefolder}-${dimension}`
        
        imgname = `${dimensionValue}-${time}`
        if (timefolder == "all") {
            imgname =  dimensionValue;
        } else {

        }
        //TODO fixes for sutff
    } else {
        imgfolder = `${timefolder}`
        imgname = `${time}`
        if (imgfolder == "all") {
            imgname = imgfolder;
        }
    }

    return `${base_url}/${imgfolder}/${imgname}.jpg`
}

function set_portrait(){
    let warpBoxBack = d3.select(`#usebox-svg-warped-face-2`);
    let warpBoxFront = d3.select(`#usebox-svg-warped-face-1`);
    let warpImageBack = d3.select(`#warped-face-2`)
    let warpImageFront = d3.select(`#warped-face-1`)
    let url = get_image_url();

    preloadImg(url, warpImageFront, warpImageBack, warpBoxFront);
        
}

var updateView = function(params, type) {
    fetch_data()
    set_portrait()
}

filterJSInitParamsChangedHook(updateView);
