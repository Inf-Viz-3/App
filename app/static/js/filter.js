var filterJSParams = {};
// init
const age_groups = ["(0-2)", "(4-6)", "(8-12)", "(15-20)", "(25-32)", "(38-43)", "(48-53)", "(60-100)"];
const gender_groups = ["male", "female"];

const color_objects = [  
    {
        id: 0,
        color: "rgb(200, 155, 113)"
    },
    {
        id: 1,
        color: "rgb(159, 102, 58)"
    },
    {
        id: 2,
        color: "rgb(96, 62, 42)"
    },
    {
        id: 3,
        color: "rgb(165, 134, 111)"
    },
    {
        id: 4,
        color: "rgb(126, 88, 61)"
    },
    {
        id: 5,
        color: "rgb(177, 158, 144)"
    },
    {
        id: 6,
        color: "rgb(144, 113, 89)"
    },
    {
        id: 7,
        color: "rgb(207, 187, 168)"
    },
    {
        id: 8,
        color: "rgb(182, 127, 80)"
    },
]

const color_groups = color_objects.map(x=>x.id)

filterJSParams['beginDate'] = 0;
filterJSParams['endDate'] = 2020;
filterJSParams['age'] = age_groups;
filterJSParams['gender'] = ["male", "female"];
filterJSParams['color'] = color_groups;
filterJSParams['selected_time'] = "ALL"
filterJSParams['dimension'] = "none";
filterJSParams['dimension-value'] = "none";

// Hooks to update
filterJSParamsChangedHooks = [];
filterJSOnScrollHooks = [];
filterJSOnWindowLookHooks = [];

// Global Functions
var filterJSUpdate = function(param, value, skip=false) {
    filterJSParams[param] = value;
    if (!skip) {
        filterJSNotify(filterJSParams, param);
    }
    
}

var filterJSInitParamsChangedHook = function(callback) {
    filterJSParamsChangedHooks.push(callback);
    return filterJSParams;
}

var filterJSInitScrollHook = function(callback) {
    filterJSOnScrollHooks.push(callback);
}

var filterJSAddWindowLoadHook = function(callback) {
    filterJSOnWindowLookHooks.push(callback);
}

let filterJSNotify = function(filterJSParams, param) {
    filterJSParamsChangedHooks.forEach(f => {
        f(filterJSParams, param);
    });
}

function displayDimensionFilter(dimensionValue) {

    if (!dimensionValue) {
        let dimensionSelect = document.getElementById("input-group-timeslider-dimension");
        dimensionValue = dimensionSelect.value;
        filterJSParams["dimension"] = dimensionValue;
    }

    let elems = document.querySelectorAll(".tab-pane-dimension");
    let newTargetId = `timeslider-dimension-list-${dimensionValue}`;
    let selectTargetId = `timeslider-dimension-list-select-${dimensionValue}`;
    

    elems.forEach((elem) => {
        if (elem.classList.contains("show") && elem.id != newTargetId) {
            elem.classList.remove("show")
            elem.classList.remove("active")
        }
    })
    let target = document.getElementById(newTargetId);
    if (target && !target.classList.contains("show")) {
        target.classList.add("show")
        target.classList.add("active")
    }

    // Set the select to first value
    let selectTarget = document.getElementById(selectTargetId);
    
    let newDimensionValue = "none";
    if (selectTarget) {
        selectTarget.selectedIndex = 0;
        newDimensionValue = selectTarget.value;
        // Deactivate the respective filter
    }

    let detailFilterId = `detailfilter-control-${dimensionValue}`;
    let detailFilterElems = document.querySelectorAll(`[id^='detailfilter-control']`)
    detailFilterElems.forEach((elem) => {
        if (elem.id == detailFilterId) {
            elem.disabled = true;
            $(function () {
                // Not nice, but works 🙈
                $(elem).selectpicker('refresh');
            });
        } else {
            elem.disabled = false;
            $(function () {
                // Not nice, but works 🙈 <-- nice emoji's in code!
                $(elem).selectpicker('refresh');
            });
        }
    })

    filterJSUpdate("dimension-value", newDimensionValue);
}

// // functions for the age
function registerListener() {
    
    let dimensionSelect = document.getElementById("input-group-timeslider-dimension");
    dimensionSelect.onchange = function(ev) {
        filterJSUpdate("dimension", ev.target.value, skip=true)
        // hide all but the current selected
        displayDimensionFilter(ev.target.value);
    }

    document.getElementById("detailfilter-control-gender").onchange = function(ev) {
        filterJSUpdate("gender", ev.target.value)
    }

    document.getElementById('detailfilter-control-age').onchange = function () {
        var elements = document.getElementById('detailfilter-control-age').selectedOptions;
        let selection = Array.prototype.slice.call(elements).map((element) => {
            return element.value
        });
        filterJSUpdate("age", selection);       
    };

}


function timesliderDimensionValueChanged(ev) {
    let value = ev.value;
    filterJSUpdate("dimension-value", value);

}

function buildAgeOptionList() {
    const groupSelect = document.getElementById('detailfilter-control-age');
    for (let i = 0; i < age_groups.length; i++) {
        var opt = document.createElement("option");
        opt.value = age_groups[i];
        opt.text = age_groups[i];

        groupSelect.appendChild(opt);
    }
    $(function () {
        $(groupSelect).selectpicker({});
        $(groupSelect).selectpicker('selectAll');
    });
}

function buildGenderOptionList() {
    const groupSelect = document.getElementById('detailfilter-control-gender');
    for (let i = 0; i < gender_groups.length; i++) {
        var opt = document.createElement("option");
        opt.value = gender_groups[i];
        opt.text = gender_groups[i];
        groupSelect.appendChild(opt);
    }
    $(function () {
        $(groupSelect).selectpicker({});
        $(groupSelect).selectpicker('selectAll');
    });
}

function buildColorGroupOptionList() {
    const groupSelect = document.getElementById('detailfilter-control-group');
    for (let i = 0; i < color_objects.length; i++) {
        var opt = document.createElement("option");
        var col = color_objects[i];
        opt.value = col.id;
        opt.text = "Group " +(Number(col.id) + 1);
        opt.style["background-color"] = col.color

        groupSelect.appendChild(opt);
    }

    groupSelect.onchange = function () {
        var elements = groupSelect.selectedOptions;
        let selection = Array.prototype.slice.call(elements).map((element) => {
            return element.value
        });
        filterJSUpdate("color", selection);
    }
    $(function () {
        $(groupSelect).selectpicker({});
        $(groupSelect).selectpicker('selectAll');
    });
}

function buildDimensionAgeOptionList() {
    const groupSelect = document.getElementById('timeslider-dimension-list-select-age');
    for (let i = 0; i < age_groups.length; i++) {
        var opt = document.createElement("option");
        opt.value = age_groups[i];
        opt.text = age_groups[i];

        groupSelect.appendChild(opt);
    }
}

function writeFilterText(){
    var para = document.createElement("p")
    var bold = document.createElement("strong")
    var bold_2 = document.createElement("strong")
    var bold_3 = document.createElement("strong")
    var text_1 = document.createTextNode("Filter all the data above by ")
    var text_2 = document.createTextNode("Age ")
    var text_3 = document.createTextNode(", ")
    var text_4 = document.createTextNode("Gender ")
    var text_5 = document.createTextNode("and ")
    var text_6 = document.createTextNode("Color group")
    var text_7 = document.createTextNode(".")
    para.appendChild(text_1)
    bold.appendChild(text_2)
    para.appendChild(bold)
    para.appendChild(text_3)
    bold_2.appendChild(text_4)
    para.appendChild(bold_2)
    para.appendChild(text_5)
    bold_3.appendChild(text_6)
    para.appendChild(bold_3)
    para.appendChild(text_7)
    para.setAttribute("style", "margin-bottom:0;")
    
    var expl_text = document.getElementById("explanatory_text")
    expl_text.appendChild(para)
}
let toggleTooltipRectSlider = function(x, toggle){
    if(toggle) $('#rect-'+x).tooltip('show')
    else $('[data-toggle="tooltip"]').tooltip('hide')
}
let toggleFunction = function (x) {

    var bottomNav = document.getElementById('filter-nav-bar');
    if (!bottomNav) return;

    if (window.scrollY > (window.innerHeight * 0.7)) {
        // you're at the bottom of the page
        if (bottomNav.classList.contains('crossfade')) {
            bottomNav.classList.remove('crossfade');
            // alert("remove faq display!");
        }
        toggleTooltipRectSlider(x,true)
    } else {
        if (!bottomNav.classList.contains('crossfade')) {
            bottomNav.classList.add('crossfade');
        }
        toggleTooltipRectSlider(x,false)
    }
};

// Onload Event
window.onload = function(e){ 
    filterJSOnWindowLookHooks.forEach(f => {
        f();
    });
}

window.onscroll = function() {
    filterJSOnScrollHooks.forEach(f => {
        f();
    });
}

filterJSInitScrollHook(toggleFunction);
filterJSAddWindowLoadHook(toggleFunction);
filterJSAddWindowLoadHook(buildAgeOptionList);
filterJSAddWindowLoadHook(buildDimensionAgeOptionList);
filterJSAddWindowLoadHook(buildColorGroupOptionList);
filterJSAddWindowLoadHook(writeFilterText);
filterJSAddWindowLoadHook(buildGenderOptionList);
filterJSAddWindowLoadHook(registerListener);
filterJSAddWindowLoadHook(displayDimensionFilter);

