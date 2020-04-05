var origin = [505, 400], // THE LOCATION OF THE CENTER OF THE 3D IMAGE
    scale = 10, // USED TO SCALE THE OBJECT TO SIZE OF IMAGE: CHANGED FROM 20 TO 10
    // VARIABLES USED IN ROTATION AND DRAG EVENTS
    alpha = 0,
    beta = 0,
    startAngle = Math.PI/6
    //xGrid = [],
    yLine = [],
    xLine = [];

var svg    = d3.select('svg') // SELECTS IN HTML LOCATION OF IMAGE
    .call(d3.drag() // ENVOKES FUNCTION EXACTLY ONCE IN THIS CASE, THE DRAG FUNCTION WHICH CREATES NEW DRAG BEHAVIOR
    // EVENTS: ON START OF DRAG, DRAGGING, AND END OF DRAG
        .on('drag', dragged)
        .on('start', dragStart)
        .on('end', dragEnd))
    .append('g') // APPENDS G ELEMENT TO SVG (G ELEMENT USED TO GROUP SVG SHAPES TOGETHER)
    .attr("preserveAspectRatio", "xMinYMin meet") // ALLOWS UNIFORM SCALING FOR BOTH X AND Y USING VALUES IN VIEWBOX AS A BASE
    .attr("viewBox", "0 0 600 400") // VIEWBOX ATTRIBUTE MAKES SVG SCALABLE WITH ORIGIN AT 0,0 AND WIDTH 600, HEIGHT 400
    .classed("svg-content-responsive", true) // INSURES THE SVG IS CONTAINED WITHIN THE DIV

var color  = d3.scaleOrdinal(d3.schemeCategory20); // AN ARRAY OF 20 COLORS REPRESENTED AS HEX NUMBERS WITHIN AN ORDINAL SCALE OBJECT
var cubesGroup = svg.append('g').attr('class', 'cubes'); // ASSIGNS ATTRIBUTE TO G OBJECT, IN THIS CASE CLASS=CUBES

// THE VARIABLES USED IN THE DRAG FUNCTIONS
var mx, // X POSITION OF MOUSE
    my, // Y POSITION OF MOUSE
    mouseX, // X PSOITION OF DRAGGED MOUSE
    mouseY; // Y POSITION OF DRAGGED MOUSE

var datas; // THE DATA TO BE USED IN VISUALIZATION

var grid3d = d3._3d()
    .shape('GRID', 9) // TYPE OF SHAPE AND HOW MANY POINTS PER ROW
    .origin(origin) // WHERE THE SHAPE IS LOCATED
// ******* ROTATION OF GRID, NOT CERTAIN IF NEEDED *********
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale); //NOT SURE IF SCALE IS NEEDED FOR GRID (GRID NOT VISIBLE)

var yScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale);
    
var xScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale);

var cubes3D = d3._3d()
    .shape('CUBE') // TYPE OF SHAPE IN THIS CASE A CUBE
    .x(function(d){ return d.x; }) // LOCATION OF POINT ON X-AXIS
    .y(function(d){ return d.y; }) // LOCATION OF POINT ON Y-AXIS
    .z(function(d){ return d.z; }) // LOCATION OF POINT ON Z-AXIS
    .rotateY( startAngle) // ROTATION OF CUBES ON X-AXIS
    .rotateX(-startAngle) // ROTATION OF CUBES ON Y-AXIS
    .origin(origin) // POSITIONS OBJECT IN 3D AREA AROUND ORIGIN
    .scale(scale); // FITS SIZE OF SHAPE TO IMAGE


//******************START OF PROCESSING JSON*********************

var dates = [], // AN ARRAY OF DATES
    personnel = [], // AN ARRAY CONTAINING INFORMATION/YEAR
    yearData = {}, // CREATES AN OBJECT YEARDATA (NOT AN ARRAY)
    // DATA IDENTIFIERS
    inst = 'all',
    role = 'faculty',
    fs = 'Total';

// VARIABLES FOR LOOP
// CAN BE FOUND IN PROCESS DATA FOR MORE FLEXIBILITY
var yearnum;
var facnum = 3,
    fsnum = 8,
    instnum = 4;

var fields = ['r1',
              'fourYear',
              'twoYear',
              'all'];

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

    console.log(yearData.r1.faculty)
    console.log("my year data is:", inst);

    // CREATES AN ARRAY OF SPECIFIED VALUES FOR EACH YEAR AND TAKES THE MAX
    maxFac=d3.max(personnel.map((x)=>x.all.faculty.Total)) // FACULTY DATA
    maxNonFac=d3.max(personnel.map((x)=>x.all.nonfaculty.Total)) // NON-FACULTY DATA
    maxPostdoc=d3.max(personnel.map((x)=>x.all.postdoc.Total)) // POSTDOC DATA
    maxyScale = maxFac

    //******************Defining Datas*********************

    console.log("Trying out the variables", yearData[inst][role][fs])

    console.log("I'm out")
    
    init();
})




//******************END OF PROCESSING JSON*********************




/**
* THIS IS A FUNCTION CALLED INIT
* IT CREATES THE CUBE AND DRAWS THE SVG
**/
function init(){
    // datas = personnel.map((x)=>x[inst][role][fs]); // MAPS EVERY YEAR TO A SINGLE SPECIFIED DATA POINT
    // console.log("Here are my numbers", datas)
    
    //*******CREATE THE CUBES AND PUSH THEM********
    
    cubesData = []; // AN ARRAY OF CUBES WHERE EACH CUBES IS DEFINED BY 8 VERTICES
    //xGrid = [],
    yLine = [],
    xLine = [];
    // var i = -1 // NUMBER OF CUBES MADE, USED IN PREVIOUS VERSION
    
    var j = 10, // NUMBER OF CUBES TO MAKE
        cnt = 0; // CUBE ID NUMBER
/*******************************************************/
    // ------------------ OLD VISUAL -----------------------
    /**
    for(var z = -j/2; z <= j/2; z = z + 5){
        for(var x = -j; x <= j; x = x + 5){
            i = i +1;
            if(i<9){
                var y = parseFloat((-1*(datas[i])/10000).toFixed(5)); // NUMBER OF DIGITS TO APPEAR AFTER DECIMAL POINT = 5
                var _cube = makeCube(x, y, z);
                _cube.id = 'cube_' + cnt++; // THE NAME OF THE CUBE i.e cube_1
                _cube.height = y; // RECORDS THE HEIGHT OF THE CUBE
                cubesData.push(_cube); // ADDS CUBE TO ARRAY
            }
        }
    }**/
    
    // ---------------------- NEW VISUAL -----------------------
    // USES INSTITUTION TYPE CURRENTLY
    
    for(var z=0; z<4; z++){
        datas = personnel.map((x)=>x[fields[z]][role][fs]);
        console.log("ITS OVER HERE")
        console.log(datas)
        for(var x=0; x<9; x++){
            var y = parseFloat((-1*(datas[x])/10000).toFixed(5)); // NUMBER OF DIGITS TO APPEAR AFTER DECIMAL POINT = 5
            var a = 5*x-10
            var b = 5*z-5
            //xGrid.push([a, 1, b]);
            yLine.push([a, 1, 15]);
            xLine.push([35, 1, b])
            var _cube = makeCube(a, y, b);
            _cube.id = 'cube_' + cnt++; // THE NAME OF THE CUBE i.e cube_1
            _cube.height = y; // RECORDS THE HEIGHT OF THE CUBE
            cubesData.push(_cube); // ADDS CUBE TO ARRAY
        }
        
    }
    //d3.range(-1, 11, 1).forEach(function(d){ yLine.push([-j, -d, -j]); });
    console.log(cubesData.length);


    var allData = [
        //grid3d(xGrid), 
        cubes3D(cubesData),
        yScale3d([yLine]),
        xScale3d([xLine]),
    ];

    processData(allData, 1000); // DRAW THE SVG
}




/**
* THIS IS A FUNCTION CALLED PROCESSDATA
* THIS FUNCTION DRAWS THE SVG AND DECIDES APPEARANCE
* PARAM data THE CUBES TO BE DRAWN
* PARAM tt THE DURATION OF TRANSITIONS
**/
function processData(data, tt){
    
    /* ----------- X AND Y AXES ----------- */
    var yScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale);

    var xScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .rotateY( startAngle)
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
        .each(function(d){
            d.centroid = {x: d.rotated.x, y: d.rotated.y, z: d.rotated.z};
        })
        .attr('x', function(d){ return d.projected.x; })
        .attr('y', function(d){ return d.projected.y; })
        .text(function(d){ return 'year'; });
        //.text(function(d){ return data[0][0]; });
        //.text(function(d){ return d[1] <= 0 ? d[1] : ''; });

    yText.exit().remove();

    /* ----------- x-Scale Text ----------- */
    var xText = svg.selectAll('text.xText').data(data[2][0]);
    xText
        .enter()
        .append('text')
        .attr('class', '_3d xText')
        .attr('dx', '.3em')
        .merge(xText)
        .each(function(d){
            d.centroid = {x: d.rotated.x, y: d.rotated.y, z: d.rotated.z};
        })
        .attr('x', function(d){ return d.projected.x; })
        .attr('y', function(d){ return d.projected.y; })
        .text(function(d){ return 'item'; });
        //.text(function(d){ return data[0][0]; });
        //.text(function(d){ return d[1] <= 0 ? d[1] : ''; });

    xText.exit().remove();

    /* --------- CUBES ---------*/

    var cubes = cubesGroup.selectAll('g.cube').data(data[0], function(d){ return d.id });
    
    var tooltip = d3.select('body')
        .append('div')
        .attr("class", "tooltip")
        .style('position', 'absolute')
        .style('padding', '0 10px')
        .style('background', 'white')
        .style('opacity', 0);

    var ce = cubes
        .enter()
        .append('g')
        .attr('class', 'cube')
        .attr('fill', function(d){ return color(d.id); })
        .attr('stroke', function(d){ return d3.color(color(d.id)).darker(2); })
        .merge(cubes)
        .sort(cubes3D.sort)
    /*****************  MOUSEOVER ********************/
    // Essentially, for the mouse, you don't want it to activate
    // when the mouse is being cliked as the viz is rotated. 
    
        .on('mouseover', function(d) {
            tooltip
                .transition()
                .duration(200)
                .style('opacity', .9)
            tooltip.html('<div style="font-size: 2rem; font-weight: bold">'+ d.id +'</div>')
                .style('left', (d3.event.pageX -35) + 'px')
                .style('top', (d3.event.pageY -30) + 'px')
            tempColor = this.style.fill;
            d3.select(this)
                .style('fill', 'yellow')
        })

        .on('mouseout', function(d) {
            tooltip.html('')
            d3.select(this)
                .style('fill', tempColor)
        });

    cubes.exit().remove();

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
    
    /* --------- TEXT ---------*/
    
    /**var texts = cubes.merge(ce).selectAll('text.text').data(function(d){
        var _t = d.faces.filter(function(d){
            return d.face === 'top';
        });
        return [{height: d.height, centroid: _t[0].centroid}];
    });

    texts
        .enter()
        .append('text')
        .attr('class', 'text')
        .attr('dy', '-.7em')
        .attr('text-anchor', 'middle')
        .attr('font-family', 'sans-serif')
        .attr('font-weight', 'bolder')
        .attr('x', function(d){ return origin[0] + scale * d.centroid.x })
        .attr('y', function(d){ return origin[1] + scale * d.centroid.y })
        .classed('_3d', true)
        .merge(texts)
        .transition().duration(tt)
        .attr('fill', 'black')
        .attr('stroke', 'none')
        .attr('x', function(d){ return origin[0] + scale * d.centroid.x })
        .attr('y', function(d){ return origin[1] + scale * d.centroid.y })
        .tween('text', function(d){
            var that = d3.select(this);
            var i = d3.interpolateNumber(+that.text(), Math.abs(d.height));
            return function(t){
                that.text(~~(i(t)*10000));
            };
        });

    texts.exit().remove(); **/
 

    /* --------- SORT TEXT & FACES ---------*/

    ce.selectAll('._3d').sort(d3._3d().sort);

}





/**
* THIS IS A FUNCTION CALLED DRAGSTART
* IT DETERMINES WHAT HAPPENS IN EVENT START
**/
function dragStart(){
    mx = d3.event.x;
    my = d3.event.y;
}





/**
* THIS IS A FUNCTION CALLED DRAGGED
* IT DETERMINES WHAT HAPPENS WHEN THE EVENT DRAG OCCURS
**/
function dragged(){
    mouseX = mouseX || 0; // A SHORTENED VERSION OF AN IF ELSE STATEMENT
    mouseY = mouseY || 0; // IF VARIABLE IS DEFINED USE MOUSEY ELSE USE 0
    beta   = (d3.event.x - mx + mouseX) * Math.PI / 230 ;
    alpha  = (d3.event.y - my + mouseY) * Math.PI / 230  * (-1);
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
function dragEnd(){
    mouseX = d3.event.x - mx + mouseX;
    mouseY = d3.event.y - my + mouseY;
}






/**
* THIS IS A FUNCTION CALLED MAKECUBE
* IT CREATES THE VERTICES OF A SINGLE CUBE
* PARAMETERS X,Y,Z ON A COORDINATE PLANE
* RETURNS A LIST OF VERTICES
**/
function makeCube(x, y, z){
    return [
        {x: x - 1, y: y, z: z + 1}, // FRONT TOP LEFT
        {x: x - 1, y: 0, z: z + 1}, // FRONT BOTTOM LEFT
        {x: x + 1, y: 0, z: z + 1}, // FRONT BOTTOM RIGHT
        {x: x + 1, y: y, z: z + 1}, // FRONT TOP RIGHT
        {x: x - 1, y: y, z: z - 1}, // BACK  TOP LEFT
        {x: x - 1, y: 0, z: z - 1}, // BACK  BOTTOM LEFT
        {x: x + 1, y: 0, z: z - 1}, // BACK  BOTTOM RIGHT
        {x: x + 1, y: y, z: z - 1}, // BACK  TOP RIGHT
    ];
}

d3.selectAll('button').on('click', init); // RERUNS INIT WITH BUTTON PRESS


