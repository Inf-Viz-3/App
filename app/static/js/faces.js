const xwide = 100;
const xmargin = 5;
const ymargin = 5;
const subsvgheight = 90;
const subsvgwidth = 90;
var face_index = 0;
var modal;
var faces = [];

function createFaceDOM(face, index, svg) {
    
    let faceurl = `../static/img/faces/${face.imgid}_${face.faceid}.jpg` 
    let facesvg = svg.append("svg")
        .attr("id", index)
        .attr("x", xmargin + (xwide * index))
        .attr("y", ymargin)
        .attr("width", subsvgwidth)
        .attr("height", subsvgheight)
        .attr("viewbox", "0 0 100 100")
        .classed("rounded-circle", true)
        .classed("shadow", true)
        .attr("onclick", "handleImgClick(evt)")

    let tooltiphtml = `<div class="container">
                       <img class='w-100' src='${faceurl}'>
                       <span>Distance</span>
                       <span>${face.deviation}</span>
                       </div>`

    // let link = facesvg.append("a")
    //     .attr("href", faceurl)
    let faceobj = facesvg.append("image")
        .attr("class", "face-img")
        .attr("href", faceurl)
        .attr("y", 0)
        .attr("x", 0)
        .attr("width", 100)
        .attr("height", 100)
        .attr("alt", `Distance ${face.deviation}`)
        .attr("data-toggle", "tooltip")
        .attr("data-html", "true")
        .attr("title", tooltiphtml)

    $(function () {
        $(faceobj.node()).tooltip()
    })
}
function handleImgClick(evt){
    // Get the modal
    var bottomNav = document.getElementById('filter-nav-bar');
    bottomNav.style.display = "none";

    modal = document.getElementById("myModal");

    var face = faces[evt.currentTarget.id]
    let purl = `../static/img/portraits/${face.imgid}.jpg` 
    var modalImg = document.getElementById("img01");
    var captionText = document.getElementById("caption");
    modal.style.display = "block";
    modalImg.src = purl;
    captionText.innerHTML = `Distance ${face.deviation}`
    
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        bottomNav.style.display = "block";
        modal.style.display = "none";
    }
}
function buildFacesBar(data) {
    faces = [];
    let svg = d3.select("#faces-simbar")
    svg.selectAll("svg").remove()
    data.forEach( (element, index) => {
        createFaceDOM(element, index, svg);
        faces.push(element)
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

let preloadFaceImg = function (url, frameImageFront, frameImageBack, useBoxFrameImageFront) {
    let imgCache = new Image();

    imgCache.onload = function() {
        frameImageBack.attr("href", url)
        rotateImageIndex = (rotateImageIndex + 1) % availableCenturyImages.length;
        useBoxFrameImageFront.classed("crossfade", true);

        setTimeout(() => {
            frameImageFront.attr("href", url)
            useBoxFrameImageFront.classed("crossfade", false);
        }, 2000);
    };
    imgCache.src = url;
}

function set_portrait(){
    let warpBoxBack = d3.select(`#usebox-svg-warped-face-2`);
    let warpBoxFront = d3.select(`#usebox-svg-warped-face-1`);
    let warpImageBack = d3.select(`#warped-face-2`)
    let warpImageFront = d3.select(`#warped-face-1`)
    let url = get_image_url();

    preloadFaceImg(url, warpImageFront, warpImageBack, warpBoxFront);
        
}

var updateView = function(params, type) {
    fetch_data()
    set_portrait()
}


filterJSInitParamsChangedHook(updateView);
filterJSInitScrollHook(() => {
    toggleFunction(undefined)
  });