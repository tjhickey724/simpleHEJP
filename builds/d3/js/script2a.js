//d3.json('js/data/forecast.json', function(d) {
const selectElement = document.getElementById('instType');
  selectElement.addEventListener('change', event => {
    //setDataset(event);
    console.log("changing event")
    console.dir(event.target.value)
    inst = event.target.value
    console.log("updating data")
    myChart.data(personnel)
    console.log("data updated")
  });

d3.json('js/data/all_faculty.json', function(d) {

  var temperatures = [],
      personnel = [],
      dates = [],
      years=[],
      margin = { top: 0, right: 0, bottom: 30, left: 20 }
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
        inst = 'fourYear';

  for (var i = 1; i<d[0].length; i++) {
    temperatures.push(d[3][i].faculty);
    dates.push( new Date("9/1/"+d[0][i].Year) );
    personnel.push({r1:d[0][i],fourYear:d[1][i], twoYear:d[2][i], all:d[3][i]})
    years.push(d[0][i].Year)
  }
  console.log('out of loop')
//  console.log(`temps = ${temperatures}`)

  yScale = d3.scaleLinear()
    .domain([0, d3.max(temperatures)])
    .range([0,height]);

  console.log(`yScale(2000)= ${yScale(2000)}`)

  yAxisValues = d3.scaleLinear()
    .domain([0, d3.max(temperatures)])
    .range([height,0]);

  console.dir(`yAxisValues(0)=${yAxisValues(1)}`)

  yAxisTicks = d3.axisLeft(yAxisValues)
  .ticks(10)

  xScale = d3.scaleBand()
    .domain([2007,2010,2011,2012,2013,2014,2015,2016,2017])
    .paddingInner(100)
    .paddingOuter(100)
    .range([0, width])

  console.log(`xScale(2010)= ${xScale(2010)}`)
  console.log(`xScale(2017)= ${xScale(2017)}`)
  console.log('a')
  xAxisValues = d3.scaleLinear()
    .domain([d3.min(years), d3.max(years)])
    .range([0, width]);
console.log('b')
  xAxisTicks = d3.axisBottom(xAxisValues).ticks(10)
  console.log('c')

  console.log("after xAxisTicks")
/*
  xScale = d3.scaleBand()
    .domain(temperatures)
    .paddingInner(.1)
    .paddingOuter(.1)
    .range([0, width])

  xAxisValues = d3.scaleTime()
    .domain([dates[0],dates[(dates.length-1)]])
    .range([0, width])

  xAxisTicks = d3.axisBottom(xAxisValues)
    .ticks(d3.timeYear.every(1))
*/


  colors = d3.scaleLinear()
    .domain([0, d3.max(temperatures)])
    .range(['#FFFFFF', '#DA3637'])


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
    .selectAll('rect').data(personnel)
    .enter().append('rect')
      .attr('fill', function(d) { return colors(d[inst].faculty)})
      .attr('width', function(d) {
        console.dir(d)
        console.log(`xScale.bandwidth=`)
        console.log(xScale.bandwidth())
        return 50 //xScale.bandwidth();
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
            d[inst].faculty + '/'+d[inst].Year+'</div>'
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
      });

  console.log('myChart.data = '+myChart.data)

  yGuide = d3.select('#viz svg').append('g')
            .attr('transform', 'translate(60,0)')
            .call(yAxisTicks)

  xGuide = d3.select('#viz svg').append('g')
            .attr('transform', 'translate(20,'+ height + ')')
            .call(xAxisTicks)


  myChart.transition()
    .attr('height', function(d) {
      console.log('in transition')
      console.dir(d)
      console.log(`yScale=${d[inst].faculty}`)
      return yScale(d[inst].faculty);
    })
    .attr('y', function(d) {
      return height - yScale(d[inst].faculty);
    })
    .delay(function(d, i) {
      return i * 20;
    })
    .duration(500)
    .ease(d3.easeBounceOut)

}); // json import
