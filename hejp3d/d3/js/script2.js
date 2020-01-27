// Github doesn't have the data sets, you have to add them yourself
// Don't push them
// use this http://bl.ocks.org/phoebebright/3098488

//d3.json('js/data/forecast.json', function(d) {

/*
const selectElement = document.getElementById('instType');
  selectElement.addEventListener('change', event => {
    //setDataset(event);
    console.log("changing event")
    console.dir(event.target.value)
    inst = event.target.value
    update(personnel)
  });
*/





  var
      personnel = [],
      dates = [],
      years=[],
      margin = { top: 0, right: 0, bottom: 30, left: 60 }
      height = 400 - margin.top - margin.bottom,
      width = 600 - margin.left - margin.right;

  var   tempColor,
        yScale,
        yAxisValues,
        yAxisTicks,
        yGuide,
        xScale,
        xAxisValues,
        xAxisTicks,
        xGuide,
        colors,
        tooltip,
        myChart,
        myBoxes,
        maxYScale,
        maxFac,
        maxNonFac,
        maxPostdoc,
        inst = 'r1',
        role = 'faculty';

d3.json('js/all_faculty.json', function(d) {
  for (var i = 1; i<d[0].length; i++) {

    dates.push( new Date("9/1/"+d[0][i].Year) );
    personnel.push({r1:d[0][i],fourYear:d[1][i], twoYear:d[2][i], all:d[3][i]})
    years.push(d[0][i].Year)
  }
  maxFac=d3.max(personnel.map((x)=>x.all.faculty))
  maxNonFac=d3.max(personnel.map((x)=>x.all.nonfaculty))
  maxPostdoc=d3.max(personnel.map((x)=>x.all.postdoc))
  maxYScale = maxFac
  console.log('out of loop')
  //  console.log(`temps = ${temperatures}`)
  console.log('calling update')
  update0(personnel)
})

console.log('defining update')


function update0(theData) {


  yScale = d3.scaleLinear()
    .domain([0, maxYScale])
    .range([0,height])

  yAxisValues = d3.scaleLinear()
    .domain([0, maxYScale])
    .range([height,0]);

  yAxisTicks = d3.axisLeft(yAxisValues)
  .ticks(10)

  xScale = d3.scaleBand()
    .domain([2010,2011,2012,2013,2014,2015,2016,2017])
    //.paddingInner(2)
    //.paddingOuter(2)
    .range([0, width])

  xAxisValues = xScale
  xAxisTicks = d3.axisBottom(xAxisValues).ticks(10)

  colors = d3.scaleLinear()
    .domain([0, maxYScale])
    .range(['#FF0000', '#0000FF'])


  tooltip = d3.select('body')
    .append('div')
    .style('position', 'absolute')
    .style('padding', '0 10px')
    .style('background', 'white')
    .style('opacity', 0);

    console.log("personnel =")
    console.dir(personnel)


    myChart = d3.select('#viz').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform',
        'translate(' + margin.left + ',' + margin.right + ')')
      .selectAll('rect').data(theData,d =>d.Year)
    .enter().append('rect')
      .attr('fill', function(d) { return colors(d[inst][role])})
      .attr('width', function(d) {
        console.dir(d)
        console.log(`xScale.bandwidth=`)
        console.log(xScale.bandwidth())
        return 0.9*xScale.bandwidth();
      })
      .attr('height', 0)
      .attr('x', function(d) {
        console.log(`Year=${d[inst].Year}\n x=${xScale(d[inst].Year)}`)
        return xScale(d[inst].Year);
      })
      .attr('y', height)


      .on('mouseover', function(d) {
        tooltip.transition().duration(200)
          .style('opacity', .9)
        tooltip.html(
          '<div style="font-size: 2rem; font-weight: bold">' +
            d[inst][role] + '/'+d[inst].Year+'</div>'
        )
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
      })




  console.log('myChart.data = '+myChart.data)

  yGuide = d3.select('#viz svg').append('g')
            .attr('transform', 'translate(60,0)')
            .attr("class", "yaxis")
            .call(yAxisTicks)

  xGuide = d3.select('#viz svg').append('g')
            .attr('transform', 'translate(60,'+ height + ')')
            .call(xAxisTicks)


  myChart.transition()
    .attr('height', function(d) {
      console.log('in transition')
      console.dir(d)
      console.log(`yScale=${d[inst][role]}`)
      return yScale(d[inst][role]);
    })
    .attr('y', function(d) {
      return height - yScale(d[inst][role]);
    })
    .delay(function(d, i) {
      return i * 20;
    })
    .duration(500)
    .ease(d3.easeBounceOut)

}

function update(newData){
  if (role=='faculty') {
    maxYScale = maxFac
  } else if (role=='nonfaculty'){
    maxYScale = maxNonFac
  } else {
    maxYScale = maxPostdoc
  }
  yScale
    .domain([0, maxYScale])
    //.range([0,height])
  console.log("before selection")
  viz = d3.select("#viz svg")

  viz.select(".yaxis")
                  .transition().duration(1500).ease("sin-in-out")  // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
                  .call(yAxisTicks);

  console.log("tried to select yaxis")
/*
  yAxisValues = d3.scaleLinear()
    .domain([0, maxYScale])
    .range([height,0]);

  yAxisTicks = d3.axisLeft(yAxisValues)
    .ticks(10)
  */


  colors = d3.scaleLinear()
    .domain([0, maxYScale])
    .range(['#FF0000', '#0000FF'])

  d3.selectAll('rect')
     .data(newData)
     .transition().duration(500)
     .attr('y', function(d) {
       return height - yScale(d[inst][role]);
     })
     .attr('fill', function(d) { return colors(d[inst][role])})
     .attr('height', function(d) {
       return yScale(d[inst][role])
     })
}
