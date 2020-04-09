/**
    THIS IS THE SCRIPT FOR THE 3D VISUAL.
    ------ FUNCTIONS ------
    INIT()
    GETRESULT() RETURN STRING[]
    LIMITCHECK()
    SETUP()
    GETLENGTH(STRING) RETURN NUMBER
    FIRST(STRING[], INT) RETURN DATA
    SECOND(DATA, STRING, INT) RETURN NUMBER
    PROCESSDATA(DATA, NUMBER)
    DRAGSTART()
    DRAGGED()
    DRAGEND()
    MAKECUBE(NUMBER, NUMBER, NUMBER) RETURN VERTICE[]
**/


// ---------------------- IMAGE VARIABLES -------------------------
console.log("Starting the script")
var svg = d3.select('svg') // SELECTS IN HTML LOCATION OF IMAGE
    .call(d3.drag() // ENVOKES FUNCTION EXACTLY ONCE IN THIS CASE, THE DRAG FUNCTION WHICH CREATES NEW DRAG BEHAVIOR
        // EVENTS: ON START OF DRAG, DRAGGING, AND END OF DRAG
        .on('drag', dragged)
        .on('start', dragStart)
        .on('end', dragEnd))
    .append('g') // APPENDS G ELEMENT TO SVG (G ELEMENT USED TO GROUP SVG SHAPES TOGETHER)
    .attr("preserveAspectRatio", "xMinYMin meet") // ALLOWS UNIFORM SCALING FOR BOTH X AND Y USING VALUES IN VIEWBOX AS A BASE
    .attr("viewBox", "0 0 600 400") // VIEWBOX ATTRIBUTE MAKES SVG SCALABLE WITH ORIGIN AT 0,0 AND WIDTH 600, HEIGHT 400
    .classed("svg-content-responsive", true); // INSURES THE SVG IS CONTAINED WITHIN THE DIV

var origin = [505, 300], // THE LOCATION OF THE CENTER OF THE 3D IMAGE
    scale = 10, // USED TO SCALE THE OBJECT TO SIZE OF IMAGE: CHANGED FROM 20 TO 10
    startAngle = Math.PI / 6,
    yLine = [],
    xLine = [],
    xLabel = [],
    yLabel = [];

// USED FOR CLICK EVENTS
var selected = [];
var arraySize = 0;

var times_dragged = 0; //WAS USED FOR DEBUGGING DRAGGING AND SELECTIONS

// ------------------------ DATA VARIABLES ---------------------------
var datas; // THE DATA TO BE USED IN VISUALIZATION

var grid3d = d3._3d()
    .shape('GRID', 20) // TYPE OF SHAPE AND HOW MANY POINTS PER ROW
    .origin(origin) // WHERE THE SHAPE IS LOCATED
    //.rotateY( startAngle)
    //.rotateX(-startAngle)
    .scale(scale); //NOT SURE IF SCALE IS NEEDED FOR GRID (GRID NOT VISIBLE)

var yScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .rotateY(startAngle)
    .rotateX(-startAngle)
    .scale(scale);

var xScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .rotateY(startAngle)
    .rotateX(-startAngle)
    .scale(scale);

var cubes3D = d3._3d()
    .shape('CUBE') // TYPE OF SHAPE IN THIS CASE A CUBE
    .x(function (d) { return d.x; }) // LOCATION OF POINT ON X-AXIS
    .y(function (d) { return d.y; }) // LOCATION OF POINT ON Y-AXIS
    .z(function (d) { return d.z; }) // LOCATION OF POINT ON Z-AXIS
    .rotateY(startAngle) // ROTATION OF CUBES ON X-AXIS
    .rotateX(-startAngle) // ROTATION OF CUBES ON Y-AXIS
    .origin(origin) // POSITIONS OBJECT IN 3D AREA AROUND ORIGIN
    .scale(scale); // FITS SIZE OF SHAPE TO IMAGE





// ------------------------ OTHER VARIABLES ---------------------------

var color = d3.scaleOrdinal(d3.schemeCategory20); // AN ARRAY OF 20 COLORS REPRESENTED AS HEX NUMBERS WITHIN AN ORDINAL SCALE OBJECT
var cubesGroup = svg.append('g').attr('class', 'cubes'); // ASSIGNS ATTRIBUTE TO G OBJECT, IN THIS CASE CLASS=CUBES

// THE VARIABLES USED IN THE DRAG FUNCTIONS
var mx, // X POSITION OF MOUSE
    my, // Y POSITION OF MOUSE
    mouseX, // X PSOITION OF DRAGGED MOUSE
    mouseY, // Y POSITION OF DRAGGED MOUSE
    alpha = 0,
    beta = 0;

//******************START OF PROCESSING JSON*********************

// ------------------------ VARIABLES ---------------------------
var dates = [], // AN ARRAY OF DATES
    personnel = [], // AN ARRAY CONTAINING INFORMATION/YEAR
    yearData = {}, // CREATES AN OBJECT YEARDATA (NOT AN ARRAY)
    // DATA IDENTIFIERS
    inst = 'all',
    role = 'faculty',
    fs = 'Total',
    year = 8;

// VARIABLES FOR LOOP
// CAN BE FOUND IN PROCESS DATA FOR MORE FLEXIBILITY
var years;
var fields = ['FS_Life_sciences',
    'FS_Mathematics_and_computer_sciences',
    'FS_Psychology_and_social_sciences',
    'FS_Engineering',
    'FS_Education',
    'FS_Humanities_and_arts',
    'FS_Others',
    'Total'];
var institution = ['r1',
    'fourYear',
    'twoYear',
    'all'];
var faculty = ['faculty',
    'nonfaculty',
    'postdoc'];
// ------------------------ VARIABLES ---------------------------



d3.json("data.json", function (d) { // DATA.JSON IS PASSED INTO FUNCTION THROUGH PARAM d

    console.log("I'm in ")

    years = "2007 2010 2011 2012 2013 2014 2015 2016 2017".split(" ") // CREATES ARRAY YEARS
    const numYears = years.length // SIZE OF YEARS

    console.log(numYears)

    for (var i = 0; i < numYears; i++) { // LOOPS THROUGH THE ARRAY YEARS

        if (i > 20) alert("stop")

        const year = years[i] // CURRENT YEAR
        const z = new Date("9/1/" + year) // CREATES A DATE USING THE CURRENT YEAR
        dates.push(z); // CURRENT DATE ADDED

        // OBTAIN INFORMATION FROM JSON
        yearData = {
            r1: {
                faculty: d[0][0][year],
                nonfaculty: d[0][1][year],
                postdoc: d[0][2][year]
            },
            fourYear: {
                faculty: d[1][0][year],
                nonfaculty: d[1][1][year],
                postdoc: d[1][2][year]
            },
            twoYear: {
                faculty: d[2][0][year],
                nonfaculty: d[2][1][year],
                postdoc: d[2][2][year]
            },
            all: {
                faculty: d[3][0][year],
                nonfaculty: d[3][1][year],
                postdoc: d[3][2][year]
            },
            Year: year
        }
        personnel.push(yearData)
    }

    console.log(yearData.r1.faculty)
    console.log("my year data is:", inst);

    // CREATES AN ARRAY OF SPECIFIED VALUES FOR EACH YEAR AND TAKES THE MAX
    maxFac = d3.max(personnel.map((x) => x.all.faculty.Total)) // FACULTY DATA
    maxNonFac = d3.max(personnel.map((x) => x.all.nonfaculty.Total)) // NON-FACULTY DATA
    maxPostdoc = d3.max(personnel.map((x) => x.all.postdoc.Total)) // POSTDOC DATA
    maxyScale = maxFac

    //******************Defining Datas*********************

        // ---------------------- IMAGE VARIABLES -------------------------
        console.log("Starting the script")
        var svg    = d3.select('svg') // SELECTS IN HTML LOCATION OF IMAGE
            .call(d3.drag() // ENVOKES FUNCTION EXACTLY ONCE IN THIS CASE, THE DRAG FUNCTION WHICH CREATES NEW DRAG BEHAVIOR
            // EVENTS: ON START OF DRAG, DRAGGING, AND END OF DRAG
                .on('drag', dragged)
                .on('start', dragStart)
                .on('end', dragEnd))
            .append('g') // APPENDS G ELEMENT TO SVG (G ELEMENT USED TO GROUP SVG SHAPES TOGETHER)
            .attr("preserveAspectRatio", "xMinYMin meet") // ALLOWS UNIFORM SCALING FOR BOTH X AND Y USING VALUES IN VIEWBOX AS A BASE
            .attr("viewBox", "0 0 600 400") // VIEWBOX ATTRIBUTE MAKES SVG SCALABLE WITH ORIGIN AT 0,0 AND WIDTH 600, HEIGHT 400
            .classed("svg-content-responsive", true); // INSURES THE SVG IS CONTAINED WITHIN THE DIV

        var origin = [505, 300], // THE LOCATION OF THE CENTER OF THE 3D IMAGE
            scale = 10, // USED TO SCALE THE OBJECT TO SIZE OF IMAGE: CHANGED FROM 20 TO 10
            startAngle = Math.PI/6;

        // USED FOR CLICK EVENTS
        var selected = [];
        var arraySize = 0;

        var times_dragged = 0; //WAS USED FOR DEBUGGING DRAGGING AND SELECTIONS






        // ------------------------ DATA VARIABLES ---------------------------

        var datas; // THE DATA TO BE USED IN VISUALIZATION

        var grid3d = d3._3d()
            .shape('GRID', 20) // TYPE OF SHAPE AND HOW MANY POINTS PER ROW
            .origin(origin) // WHERE THE SHAPE IS LOCATED
            //.rotateY( startAngle)
            //.rotateX(-startAngle)
            .scale(scale); //NOT SURE IF SCALE IS NEEDED FOR GRID (GRID NOT VISIBLE)

        var cubes3D = d3._3d()
            .shape('CUBE') // TYPE OF SHAPE IN THIS CASE A CUBE
            .x(function(d){ return d.x; }) // LOCATION OF POINT ON X-AXIS
            .y(function(d){ return d.y; }) // LOCATION OF POINT ON Y-AXIS
            .z(function(d){ return d.z; }) // LOCATION OF POINT ON Z-AXIS
            .rotateY( startAngle) // ROTATION OF CUBES ON X-AXIS
            .rotateX(-startAngle) // ROTATION OF CUBES ON Y-AXIS
            .origin(origin) // POSITIONS OBJECT IN 3D AREA AROUND ORIGIN
            .scale(scale); // FITS SIZE OF SHAPE TO IMAGE






        // ------------------------ OTHER VARIABLES ---------------------------

        var color  = d3.scaleOrdinal(d3.schemeCategory20); // AN ARRAY OF 20 COLORS REPRESENTED AS HEX NUMBERS WITHIN AN ORDINAL SCALE OBJECT
        var cubesGroup = svg.append('g').attr('class', 'cubes'); // ASSIGNS ATTRIBUTE TO G OBJECT, IN THIS CASE CLASS=CUBES

        // THE VARIABLES USED IN THE DRAG FUNCTIONS
        var mx, // X POSITION OF MOUSE
            my, // Y POSITION OF MOUSE
            mouseX, // X PSOITION OF DRAGGED MOUSE
            mouseY, // Y POSITION OF DRAGGED MOUSE
            alpha = 0,
            beta = 0;
        var checkinput = 0;






     //******************START OF PROCESSING JSON*********************

    // ------------------------ VARIABLES ---------------------------
        var dates = [], // AN ARRAY OF DATES
            personnel = [], // AN ARRAY CONTAINING INFORMATION/YEAR
            yearData = {}, // CREATES AN OBJECT YEARDATA (NOT AN ARRAY)
            // DATA IDENTIFIERS
            inst = 'all',
            role = 'faculty',
            fs = 'Total',
            year = 8;

        // VARIABLES FOR LOOP
        // CAN BE FOUND IN PROCESS DATA FOR MORE FLEXIBILITY
        var years;
        var fields = ['FS_Life_sciences',
                      'FS_Mathematics_and_computer_sciences',
                      'FS_Psychology_and_social_sciences',
                      'FS_Engineering',
                      'FS_Education',
                      'FS_Humanities_and_arts',
                      'FS_Others',
                      'Total'];
        var institution = ['r1',
                      'fourYear',
                      'twoYear',
                      'all'];
        var faculty = ['faculty',
                      'nonfaculty',
                      'postdoc'];
     // ------------------------ VARIABLES ---------------------------





        d3.json("data.json", function(d){ // DATA.JSON IS PASSED INTO FUNCTION THROUGH PARAM d

            console.log("I'm in ")

            years="2007 2010 2011 2012 2013 2014 2015 2016 2017".split(" ") // CREATES ARRAY YEARS
            const numYears = years.length // SIZE OF YEARS

            console.log(numYears)

            for (var i = 0; i<numYears; i++) { // LOOPS THROUGH THE ARRAY YEARS

                if (i > 20) alert("stop")

                const year = years[i] // CURRENT YEAR
                const z = new Date("9/1/"+year) // CREATES A DATE USING THE CURRENT YEAR
                dates.push( z ); // CURRENT DATE ADDED

                // OBTAIN INFORMATION FROM JSON
                yearData = {
                    r1: {
                        faculty:d[0][0][year],
                        nonfaculty:d[0][1][year],
                        postdoc:d[0][2][year]
                    },
                    fourYear: {
                        faculty:d[1][0][year],
                        nonfaculty:d[1][1][year],
                        postdoc:d[1][2][year]
                    },
                    twoYear: {
                        faculty:d[2][0][year],
                        nonfaculty:d[2][1][year],
                        postdoc:d[2][2][year]
                    },
                    all: {
                        faculty:d[3][0][year],
                        nonfaculty:d[3][1][year],
                        postdoc:d[3][2][year]
                    },
                    Year:year
                }
                personnel.push(yearData)
            }

    console.log("I'm out")

    //init();
})


//******************END OF PROCESSING JSON*********************


/**
* THIS IS A FUNCTION CALLED INIT
* IT CREATES THE CUBE AND DRAWS THE SVG
**/
function init() {
    //*******CREATE THE CUBES AND PUSH THEM********

    cubesData = []; // AN ARRAY OF CUBES WHERE EACH CUBES IS DEFINED BY 8 VERTICES

    yLine = [],
        xLine = [],

        cnt = 0; // CUBE ID NUMBER

    var results = getResult(); // OBTAINS VARIABLES CHOOSEN BY USER AS ARRAY

    // GETS THE SIZE OF THE DATA FOR EACH CHOOSEN VARIABLE
    var q = getLength(results[0]);
    var p = getLength(results[1]);

    var max_a = Number.MIN_VALUE;
    var max_b = Number.MIN_VALUE;

    for (var z = 0; z < q; z++) {
        firstData = first(results, z); // OBTAIN FIRST VARIABLE'S DATA
        console.log("ITS OVER HERE");
        for (var x = 0; x < p; x++) {
            secData = second(firstData, results[1], x); // OBTAIN SECOND VARIABLE'S DATA

            var y = parseFloat((-1 * (secData) / 10000).toFixed(5)); // NUMBER OF DIGITS TO APPEAR AFTER DECIMAL POINT = 5
            var a = 5 * x - 10; // ADJUST SIZE
            var b = 5 * z - 5; // ADJUST SIZE

            var x_line_edge = 5 * (p - 1) - 7;
            var y_line_edge = 5 * (q - 1) - 2;

            xLine.push([x_line_edge, 1, b]);
            yLine.push([a, 1, y_line_edge]);

            var _cube = makeCube(a, y, b);
            _cube.id = 'cube_' + cnt++; // THE NAME OF THE CUBE i.e cube_1
            _cube.height = y; // RECORDS THE HEIGHT OF THE CUBE
            cubesData.push(_cube); // ADDS CUBE TO ARRAY
        }

    }
    //d3.range(-1, 11, 1).forEach(function(d){ yLine.push([-j, -d, -j]); });
    console.log(cubesData.length);

    var allData = [
        cubes3D(cubesData),
        yScale3d([yLine]),
        xScale3d([xLine]),
    ];

    console.log(">>>>>>>>>>>> xLabel: ", xLabel);
    console.log(">>>>>>>>>>>> yLabel: ", yLabel);
    processData(allData, 1000); // DRAW THE SVG
}


/**
* THIS IS A FUNCTION CALLED GETRESULT
* IT OBTAINS THE USER INPUT FROM CHECKBOXES
* IT RETURNS AN ARRAY OF STRINGS OF TWO VARIABLES
* OR NULL IF TWO CHOICES WERE NOT MADE
**/
function getResult() {
    var x = document.getElementsByName('variable'); // GET THE HTML OBJECT
    var res = []; // ARRAY TO HOLD RESPONSES
    var g = 0; // COUNTS BOXES THAT HAVE BEEN CHECKED
    for (var i = 0; i < x.length; i++) {
        if (x[i].checked == true) { // IF THE CHECKBOX IS CHECKED
            res[g] = x[i].value; // ADD IT TO THE ARRAY
            g++;
        }
    }
    if (res.length == 2) {
        return res;
    } else {
        return null;
    }
}






        /**
        * THIS IS A FUNCTION CALLED LIMIT CHECK
        * IT LIMITS THE NUMBER OF CHECKBOXES THAT CAN BE CHECKED AT A TIME
        * ONLY 2 BOXES CAN BE CHECKED
        **/
        function limitCheck(){
            var a = document.getElementsByName('variable'); // GET HTML OBJECT
            var newvar = 0;
            for(var count=0; count<a.length; count++){
                if(a[count].checked==true){
                    newvar=newvar+1;
                }
            }
            if(newvar>2){
                return false;
            }
            checkinput = newvar;
        }
    }
    if (newvar > 2) {
        return false;
    }
}

/**
* THIS IS A FUNCTION CALLED SETUP
* IT MAKES CERTAIN RADIOBOXES VISIBLE DEPENDING ON INPUT
**/
function setUp() {
    var d1 = document.getElementById("instbuttons");
    var d2 = document.getElementById("staffbuttons");
    var d3 = document.getElementById("fieldbuttons");
    var d4 = document.getElementById("yearbuttons");
    var x = document.getElementsByName('variable');

    if (x[0].checked == false) { //years
        d4.style.display = "block"
    } else {
        d4.style.display = "none"
    }
    if (x[1].checked == false) { //inst
        d1.style.display = "block"
    } else {
        d1.style.display = "none"
    }
    if (x[2].checked == false) { //staff
        d2.style.display = "block"
    } else {
        d2.style.display = "none"
    }
    if (x[3].checked == false) { //fields
        d3.style.display = "block"
    } else {
        d3.style.display = "none"
    }
}



/**
* THIS IS A FUNCTION CALLED GETLENGTH
* IT TAKES A STRING NAME OF DATA AS INPUT
* AND RETURNS THE SIZE OF THE DATA
**/
function getLength(result) {
    if (result.localeCompare("institution") == 0) {
        return institution.length;
    }
    if (result.localeCompare("staff") == 0) {
        return faculty.length;
    }
    if (result.localeCompare("fields") == 0) {
        return fields.length;
    }
    if (result.localeCompare("years") == 0) {
        return years.length;
    }
}


        /**
        * THIS IS A FUNCTION CALLED SETUP
        * IT MAKES CERTAIN RADIOBOXES VISIBLE DEPENDING ON INPUT
        **/
        function setUp(){
            var d1 = document.getElementById("instbuttons");
            var d2 = document.getElementById("staffbuttons");
            var d3 = document.getElementById("fieldbuttons");
            var d4 = document.getElementById("yearbuttons");
            var d5 = document.getElementById("warning");
            var d6 = document.getElementById("image");
            var x = document.getElementsByName('variable');

            if(checkinput==2){
               if(x[0].checked==false){ //years
                    d4.style.display = "block"
                } else{
                    d4.style.display = "none"
                }
                if(x[1].checked==false){ //inst
                    d1.style.display = "block"
                } else{
                    d1.style.display = "none"
                }
                if(x[2].checked==false){ //staff
                    d2.style.display = "block"
                } else{
                    d2.style.display = "none"
                }
                if(x[3].checked==false){ //fields
                    d3.style.display = "block"
                } else{
                    d3.style.display = "none"
                }
                d6.style.display = "block";
                init();
            } else{
                d5.style.display = "block"
                d1.style.display = "none"
                d2.style.display = "none"
                d3.style.display = "none"
                d4.style.display = "none"
                d6.style.display = "none"
            }
        }






/**
* THIS IS A FUNCTION CALLED FIRST
* IT FINDS THE DATA ASSOCIATED WITH THE FIRST CHOSEN VARIABLE
* AND RETURNS IT BASED ON THE SECOND VARIABLE
* IT TAKES A STRING ARRAY OF VARIABLE NAMES
* AND A NUMBER Z
**/
function first(result, z) {
    if (result[0].localeCompare("years") == 0) {
        xLabel = years;
        if (result[1].localeCompare("staff") == 0) {
            yLabel = faculty;
            return personnel[z][inst]
        }
        if (result[1].localeCompare("fields") == 0) {
            yLabel = fields;
            return personnel[z][inst][role]
        }
        return personnel[z];
    }
    if (result[0].localeCompare("institution") == 0) {
        xLabel = institution;
        if (result[1].localeCompare("fields") == 0) {
            yLabel = fields;
            return personnel[year][institution[z]][role]
        }
        return personnel[year][institution[z]]
    }
    if (result[0].localeCompare("staff") == 0) {
        xLabel = faculty;
        return personnel[year][inst][role]
    }
}



/**
* THIS IS A FUNCTION CALLED SECOND
* IT TAKES A DATA OBJECT
* A STRING NAME OF DATA
* AND A NUMBER Z AS INPUT
* AND RETURNS A NUMBER
**/
function second(first, result, z) {
    if (result.localeCompare("institution") == 0) {
        yLabel = institution;
        return first[institution[z]][role][fs]
    }
    if (result.localeCompare("staff") == 0) {
        yLabel = faculty;
        return first[faculty[z]][fs]
    }
    if (result.localeCompare("fields") == 0) {
        yLabel = fields;
        return first[fields[z]]
    }
}


/**
* THIS IS A FUNCTION CALLED PROCESSDATA
* THIS FUNCTION DRAWS THE SVG AND DECIDES APPEARANCE
* PARAM data THE CUBES TO BE DRAWN
* PARAM tt THE DURATION OF TRANSITIONS
**/
function processData(data, tt) {
    console.log("Is this processed?")

    /* ----------- GRID ----------- */
    /* ----------- X AND Y AXES ----------- */
    var yScale3d = d3._3d()
        .shape('LINE_STRIP')
        .origin(origin)
        .rotateY(startAngle)
        .rotateX(-startAngle)
        .scale(scale);

    var xScale3d = d3._3d()
        .shape('LINE_STRIP')
        .origin(origin)
        .rotateY(startAngle)
        .rotateX(-startAngle)
        .scale(scale);

    /* ----------- y-Scale ----------- */
    var yScale = svg.selectAll('path.yScale').data(data[1]);
    yScale
        .enter()
        .append('path')
        .attr('class', '_3d yScale')
        .merge(yScale)
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('d', yScale3d.draw);

    yScale.exit().remove();

    /* ----------- x-Scale ----------- */
    var xScale = svg.selectAll('path.xScale').data(data[2]);
    xScale
        .enter()
        .append('path')
        .attr('class', '_3d yScale')
        .merge(xScale)
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('d', xScale3d.draw);

    xScale.exit().remove();

    /* ----------- y-Scale Text ----------- */
    var yText = svg.selectAll('text.yText').data(data[1][0]);
    yText
        .enter()
        .append('text')
        .attr('class', '_3d yText')
        .attr('dx', '.3em')
        .merge(yText)
        .each(function (d) {
            d.centroid = { x: d.rotated.x, y: d.rotated.y, z: d.rotated.z };
        })
        .attr('x', function (d) { return d.projected.x; })
        .attr('y', function (d) { return d.projected.y; })
        .text(function (d, i) {
            if ((i + 1) % xLabel.length == 0) {
                return yLabel[(i + 1) / xLabel.length - 1];
            }
        });
    yText.exit().remove();

    /* ----------- x-Scale Text ----------- */
    var xText = svg.selectAll('text.xText').data(data[2][0]);
    xText
        .enter()
        .append('text')
        .attr('class', '_3d xText')
        .attr('dx', '.3em')
        .merge(xText)
        .each(function (d) {
            d.centroid = { x: d.rotated.x, y: d.rotated.y, z: d.rotated.z };
        })
        .attr('x', function (d) { return d.projected.x; })
        .attr('y', function (d) { return d.projected.y; })
        .text(function (d, i) {
            if ((i + 1) % yLabel.length == 0) {
                return xLabel[(i + 1) / yLabel.length - 1];
            }
        });
    xText.exit().remove();

    /* --------- CUBES ---------*/

    var cubes = cubesGroup.selectAll('g.cube').data(data[0], function (d) { return d.id });

    var ce = cubes
        .enter()
        .append('g')
        .attr('class', 'cube')
        .attr('fill', function (d) { return color(d.id); })
        .attr('stroke', function (d) { return d3.color(color(d.id)).darker(2); })
        .merge(cubes)
        .sort(cubes3D.sort)

        /** THIS IS THE INFO ON THE PREVIOUS TOOLTIP
            .html('<div style="font-size: 2rem; font-weight: bold">'+ d.id +'</div>')
            .style('left', (origin[0]-400) + 'px')
            .style('top', (300) + 'px') ***/

        /*****************  NEW ON-CLICK OPTIONS ********************/

        .on('click', function (d) {

            // IF NOTHING IS SELECTED
            if (arraySize == 0) {
                tempColor = this.style.fill;
                temp_colors[0] = tempColor;
                console.log("This cube color is selected", temp_colors[0]);
                selected[0] = this
                arraySize = 1;
                console.log("This cube is selected", selected);

                //SELECT THE CURRENT CUBE
                d3.select(this)
                    .style('fill', 'yellow')

                //DISPLAY THE TEXT
                draw_information(d, "visible");
            }

            // IF SELECTED AGAIN
            else if (arraySize == 1 && Object.is(this, selected[0])) {

                //REMOVE THE TEXT OF THE TOOLTIP
                draw_information(d, "hidden");


        /**
        * THIS IS A FUNCTION CALLED PROCESSDATA
        * THIS FUNCTION DRAWS THE SVG AND DECIDES APPEARANCE
        * PARAM data THE CUBES TO BE DRAWN
        * PARAM tt THE DURATION OF TRANSITIONS
        **/
        function processData(data, tt){
            console.log("Is this processed?")

            /* ----------- GRID ----------- */
            // GRID IS NOT DRAWN AND DOES NOT APPEAR


            var yScale3d = d3._3d()
                .shape('LINE_STRIP')
                .origin(origin)
                .rotateY( startAngle)
                .rotateX(-startAngle)
                .scale(scale);

            var xGrid = svg.selectAll('path.grid');

            xGrid
                .enter()
                .append('path')
                .attr('class', '_3d grid')
                .merge(xGrid)
                .attr('stroke', 'black')
                .attr('stroke-width', 0.3)
                .attr('fill', function(d){ return d.ccw ? 'lightgrey' : '#717171'; })
                .attr('fill-opacity', 0.9)
                .attr('d', grid3d.draw);

            xGrid.exit().remove();


            /* --------- CUBES ---------*/

            var cubes = cubesGroup.selectAll('g.cube').data(data, function(d){ return d.id });

            var ce = cubes
                .enter()
                .append('g')
                .attr('class', 'cube')
                .attr('fill', function(d){ return color(d.id); })
                .attr('stroke', function(d){ return d3.color(color(d.id)).darker(2); })
                .merge(cubes)
                .sort(cubes3D.sort)

                /** THIS IS THE INFO ON THE PREVIOUS TOOLTIP
                    .html('<div style="font-size: 2rem; font-weight: bold">'+ d.id +'</div>')
                    .style('left', (origin[0]-400) + 'px')
                    .style('top', (300) + 'px') ***/

            /*****************  NEW ON-CLICK OPTIONS ********************/

                .on('click', function(d) {

                    // IF NOTHING IS SELECTED
                    if(arraySize == 0){
                        tempColor = this.style.fill;
                        selected[0] = this
                        arraySize = 1;
                        console.log("This cube is selected", selected);

                        //SELECT THE CURRENT CUBE
                        d3.select(this)
                            .style('fill', 'yellow')

                        //DISPLAY THE TEXT
                        draw_information(d, "visible");
                    }

                    // IF SELECTED AGAIN
                    else if(arraySize == 1 && Object.is(this, selected[0])){

                        //REMOVE THE TEXT OF THE TOOLTIP
                        draw_information(d, "hidden");

                        //AND RESTORE THE COLOR
                        d3.select(this)
                        .style('fill', tempColor)
                        arraySize = 0;
                        console.log("This cube is selected again", selected[0]);
                    }

                    //IF ANOTHER CUBE IS SELECTED
                    else if(!Object.is(this, selected[0])){
                        tempColor = this.style.fill;
                        console.log("another cube is selected", selected[0]);
                        var tempCube = selected[0]

                        //the text is hidden automatically

                        //AND RESTORE THE COLOR
                        d3.select(tempCube)
                        .style('fill', tempColor)

                        //SELECT THE CURRENT CUBE
                        selected[0] = this;

                        d3.select(this)
                            .style('fill', 'yellow')


                    //ADD NEW TEXT TO THE TOOLTIP
                        draw_information(d, "visible");

                    }

                })


            /* --------- FACES ---------*/

            var faces = cubes
                .merge(ce)
                .selectAll('path.face')
                .data(function(d){ return d.faces; }, function(d){ return d.face; });

            faces
                .enter()
                .append('path')
                .attr('class', 'face')
                .attr('fill-opacity', 0.95)
                .classed('_3d', true)
                .merge(faces)
                .transition().duration(tt)
                .attr('d', cubes3D.draw);

            faces.exit().remove();


            /** THIS IS THE NEW TOOLTIP THAT DRAWS INFO ABOUT EACH CUBE **/

            function draw_information(clicked_cube, visibility){
                var texts = cubes.merge(ce).selectAll('text.text').data(function(d){
                    //var _t = clicked_cube.faces.filter(function(d){
                    //    return clicked_cube.face === 'top';
                    //});
                    return [{height: clicked_cube.height, centroid: clicked_cube.faces[4].centroid}];
                });

                texts
                    .enter()
                    .append('text')
                    .attr('class', 'text')
                    .attr('dy', '-.7em')
                    .attr('text-anchor', 'middle')
                    .attr('font-family', 'sans-serif')
                    .attr('font-weight', 'bolder')
                    .attr("font-size", "25px")
                    .attr('x', function(d){ return (origin[0]-400) + 'px' })
                    .attr('y', function(d){ return (300) + 'px' })
                    .classed('_3d', true)
                    .merge(texts)
                    .transition().duration(tt)
                    .attr('fill', 'black')
                    .attr('stroke', 'none')
                    .attr('x', function(d){ return (origin[0]-400) + 'px'})
                    .attr('y', function(d){ return (300) + 'px' })
                    .tween('text', function(d){
                        var that = d3.select(this);
                        //THE INTERPOLATION ADDS A DYNAMIC EFFECT BEFORE IT LANDS ON THE CURRENT INFO
                        var i = d3.interpolateNumber(+that.text(), Math.abs(clicked_cube.height));
                        return function(t){
                            that.text(clicked_cube.id + " " + ~~(i(t)*10000))
                            .attr("visibility", visibility) //CHANGE VISIBILITY
                            .attr("fill", "red") //COLOR OF THE TEXT

                        };
                    });
                    console.log("tried to display the text")
                texts.exit().remove();
            }

            //IF ANOTHER CUBE IS SELECTED
            else if (!Object.is(this, selected[0])) {
                tempColor = this.style.fill;
                console.log("another cube is selected", selected[0]);
                var tempCube = selected[0]

                //the text is hidden automatically

                //AND RESTORE THE COLOR
                d3.select(tempCube)
                    .style('fill', tempColor)

                //SELECT THE CURRENT CUBE
                selected[0] = this;

                d3.select(this)
                    .style('fill', 'yellow')


                //ADD NEW TEXT TO THE TOOLTIP
                draw_information(d, "visible");

            }

        })

    /* --------- FACES ---------*/

    var faces = cubes
        .merge(ce)
        .selectAll('path.face')
        .data(function (d) { return d.faces; }, function (d) { return d.face; });

    faces
        .enter()
        .append('path')
        .attr('class', 'face')
        .attr('fill-opacity', 0.95)
        .classed('_3d', true)
        .merge(faces)
        .transition().duration(tt)
        .attr('d', cubes3D.draw);

    faces.exit().remove();

    /** THIS IS THE NEW TOOLTIP THAT DRAWS INFO ABOUT EACH CUBE **/

    function draw_information(clicked_cube, visibility) {
        var texts = cubes.merge(ce).selectAll('text.text').data(function (d) {
            //var _t = clicked_cube.faces.filter(function(d){
            //    return clicked_cube.face === 'top';
            //});
            return [{ height: clicked_cube.height, centroid: clicked_cube.faces[4].centroid }];
        });

        texts
            .enter()
            .append('text')
            .attr('class', 'text')
            .attr('dy', '-.7em')
            .attr('text-anchor', 'middle')
            .attr('font-family', 'sans-serif')
            .attr('font-weight', 'bolder')
            .attr("font-size", "25px")
            .attr('x', function (d) { return (origin[0] - 400) + 'px' })
            .attr('y', function (d) { return (300) + 'px' })
            .classed('_3d', true)
            .merge(texts)
            .transition().duration(tt)
            .attr('fill', 'black')
            .attr('stroke', 'none')
            .attr('x', function (d) { return (origin[0] - 400) + 'px' })
            .attr('y', function (d) { return (300) + 'px' })
            .tween('text', function (d) {
                var that = d3.select(this);
                //THE INTERPOLATION ADDS A DYNAMIC EFFECT BEFORE IT LANDS ON THE CURRENT INFO
                var i = d3.interpolateNumber(+that.text(), Math.abs(clicked_cube.height));
                return function (t) {
                    that.text(clicked_cube.id + " " + ~~(i(t) * 10000))
                        .attr("visibility", visibility) //CHANGE VISIBILITY
                        .attr("fill", "red") //COLOR OF THE TEXT

                };
            });
        console.log("tried to display the text")
        texts.exit().remove();
    }
    console.log("exiting the svg")

    //my theory is that the tooltip is not exited().
    //it is not removed.something about the drag just imprints it into the svg.

    cubes.exit().remove(); //VERY IMPORTANT STEP

    /* --------- SORT TEXT & FACES ---------*/

    ce.selectAll('._3d').sort(d3._3d().sort);

    console.log("The very last step")
}




/**
* THIS IS A FUNCTION CALLED DRAGSTART
* IT DETERMINES WHAT HAPPENS IN EVENT START
**/
function dragStart() {
    mx = d3.event.x;
    my = d3.event.y;
}





/**
* THIS IS A FUNCTION CALLED DRAGGED
* IT DETERMINES WHAT HAPPENS WHEN THE EVENT DRAG OCCURS
**/
function dragged() {
    mouseX = mouseX || 0; // A SHORTENED VERSION OF AN IF ELSE STATEMENT
    mouseY = mouseY || 0; // IF VARIABLE IS DEFINED USE MOUSEY ELSE USE 0
    beta = (d3.event.x - mx + mouseX) * Math.PI / 230;
    alpha = (d3.event.y - my + mouseY) * Math.PI / 230 * (-1);
    //processData(cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle)(cubesData), 0);
    var data = [
        //grid3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(xGrid),
        cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle)(cubesData),
        yScale3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)([yLine]),
        xScale3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)([xLine]),
    ];
    processData(data, 0);
}





/**
* THIS IS A FUNCTION CALLED DRAGEND
* IT DETERMINES WHAT HAPPENS IN EVENT END
**/
function dragEnd() {
    mouseX = d3.event.x - mx + mouseX;
    mouseY = d3.event.y - my + mouseY;
}







/**
* THIS IS A FUNCTION CALLED MAKECUBE
* IT CREATES THE VERTICES OF A SINGLE CUBE
* PARAMETERS X,Y,Z ON A COORDINATE PLANE
* RETURNS A LIST OF VERTICES
**/
function makeCube(x, y, z) {
    return [
        { x: x - 1, y: y, z: z + 1 }, // FRONT TOP LEFT
        { x: x - 1, y: 0, z: z + 1 }, // FRONT BOTTOM LEFT
        { x: x + 1, y: 0, z: z + 1 }, // FRONT BOTTOM RIGHT
        { x: x + 1, y: y, z: z + 1 }, // FRONT TOP RIGHT
        { x: x - 1, y: y, z: z - 1 }, // BACK  TOP LEFT
        { x: x - 1, y: 0, z: z - 1 }, // BACK  BOTTOM LEFT
        { x: x + 1, y: 0, z: z - 1 }, // BACK  BOTTOM RIGHT
        { x: x + 1, y: y, z: z - 1 }, // BACK  TOP RIGHT
    ];
}

        //d3.selectAll('button').on('click', init); // RERUNS INIT WITH BUTTON PRESS
