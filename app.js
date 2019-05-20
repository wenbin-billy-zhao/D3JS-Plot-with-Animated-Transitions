// section 1: set up the svg canvas - the usual stuff
const svgWidth = 960;
const svgHeight = 500;

const margin = {top:20, right:60, bottom:100, left:100};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

const svg = d3.select('#scatter').append('svg').attr('width', svgWidth).attr('height', svgHeight);

const chartGroup = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

// section 2: all the important functions that transform the circles based on user selection

let xSelection = 'poverty';
let ySelection = 'obesity';

function xScale(healthData, xSelection){
    let xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d=> d[xSelection]) * 0.6, d3.max(healthData, d => d[xSelection]) * 1.06])
        .range([0, width])
    return xLinearScale;
}

function yScale(healthData, ySelection){
    let yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d=> d[ySelection]) * 0.8, d3.max(healthData, d => d[ySelection]) * 1.06])
        .range([height, 0]);
    return yLinearScale;
}

function renderXAxes(xLinearScale, xAxis){
    let bottomAxis = d3.axisBottom(xLinearScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderYAxes(yLinearScale, yAxis){
    let leftAxis = d3.axisLeft(yLinearScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}


function drawCircles(circles, newXScale, newYScale, xSelection, ySelection){
    circles.transition()
    .duration(1000)
    .attr('cx', d=>newXScale(d[xSelection]))
    .attr('cy', d=>newYScale(d[ySelection]))
    return circles;
}

function drawAbbrs(abbrs, newXScale, newYScale, xSelection, ySelection) {
    abbrs.transition()
        .duration(1000)
        .attr('dx', d=>newXScale(d[xSelection]))
        .attr('y', d=>newYScale(d[ySelection]))
    return abbrs;
}

function updateToolTip(xSelection, ySelection, circles){
    let xTip = '';
    let yTip = '';

    switch (xSelection){
        case 'poverty': xTip = 'Poverty:';
            break;
        case 'age': xTip = 'Age: ';
            break;
        case 'income': xTip = 'Income: ';
    }
    console.log(xTip);
    switch (ySelection){
        case 'obesity': yTip = 'Obesity Rate:';
            break;
        case 'smokes': yTip = 'Smoker Population Rate:';
            break;
        case 'healthcare': yTip = 'Lack of Healthcare Rate: ';
    }
    console.log(yTip);

    const toolTip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([80, -60])
        .html(function(d){
            return(`<strong>${d.state}</strong><br>${xTip} ${d[xSelection]}<br>${yTip} ${d[ySelection]}`)
        })
    circles.call(toolTip);

    circles.on('mouseover', function(data){
        toolTip.show(data, this)
    })
    .on('mouseout', function(data, index){
        toolTip.hide(data, this);
    })

    return circles;

}


// section 3: import data and draw the chart
(async function(){
    const healthData = await d3.csv('data.csv');

    healthData.forEach(d => {
        d.poverty = +d.poverty;
        d.age = +d.age;
        d.income = +d.income;
        d.healthcare = +d.healthcare;
        d.obesity = +d.obesity;
        d.smokes = +d.smokes;
    });
    console.log(healthData);
    let xLinearScale = xScale(healthData, xSelection)
    let yLinearScale = yScale(healthData, ySelection)
        
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    let xAxis = chartGroup.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(bottomAxis);
    
    let yAxis = chartGroup.append('g')
        .call(leftAxis);
    
    let circlesGroup = svg.selectAll('circlesGroup').data(healthData).enter();

    let circles = circlesGroup.append('circle')
        .attr('cx', d => xLinearScale(d[xSelection]))
        .attr('cy', d => yLinearScale(d[ySelection]))
        .attr('r', '12')
        .attr('class', 'stateCircle')
        .attr('fill', 'lightblue')
        .attr('opacity', '.8')
    
    let abbrs = circlesGroup.append('text')
        .attr('class', 'state-abbr')
        .attr('dx', d => xLinearScale(d[xSelection]))
        .attr('y', d => yLinearScale(d[ySelection]))
        .attr('dy', '0.4em')
        .text(d => d.abbr)
    
    const xLabels = chartGroup.append('g')
        .attr('transform', `translate(${width/2}, ${height+20})`)
    
    const povertyLabel = xLabels.append('text')
        .attr('x', 0).attr('y', 20)
        .attr('value', 'poverty')
        .attr('class', 'active')
        .text('Poverty Rate(%)');
    
    const ageLabel = xLabels.append('text')
        .attr('x', 0).attr('y', 40)
        .attr('value', 'age')
        .attr('class', 'inactive')
        .text('Median Age in Population');
    
    const incomeLabel = xLabels.append('text')
        .attr('x', 0).attr('y', 60)
        .attr('value', 'income')
        .attr('class', 'inactive')
        .text('Median Household Income')

    const yLabels = chartGroup.append('g')
        .attr('transform', 'rotate(-90)')

    const obesityLabel = yLabels.append('text')
        .attr('x', 0-(height/2)).attr('y', -40)
        .attr('value', 'obesity')
        .attr('class', 'active')
        .text('Obesity Rate (%)')
    
    const smokesLabel = yLabels.append('text')
        .attr('x', 0-(height/2)).attr('y', -60)
        .attr('value', 'smokes')
        .attr('class', 'inactive')
        .text('Smoking Population (%)')
    
    const hCareLabel = yLabels.append('text')
        .attr('x', 0-(height/2)).attr('y', -80)
        .attr('value', 'healthcare')
        .attr('class', 'inactive')
        .text('Lacks of Healthcare (%)')
    
    circles = updateToolTip(xSelection, ySelection, circles)

    xLabels.selectAll('text')
        .on('click', function(){
            const value = d3.select(this).attr('value')
  
            if (value !== xSelection){
                xSelection = value;
                
                xLinearScale = xScale(healthData, xSelection);
                yLinearScale = yScale(healthData, ySelection);

                circles = drawCircles(circles, xLinearScale, yLinearScale, xSelection, ySelection);
                
                xAxis = renderXAxes(xLinearScale, xAxis)

                circles = updateToolTip(xSelection, ySelection, circles);

                abbrs = drawAbbrs(abbrs, xLinearScale, yLinearScale, xSelection, ySelection);
                
                
                if (xSelection === 'poverty'){
                    povertyLabel
                        .classed('active', true).classed('inactive', false);
                    ageLabel
                        .classed('active', false).classed('inactive', true);
                    incomeLabel
                        .classed('active', false).classed('inactive', true);
                }
                else if (xSelection === 'age') {
                    povertyLabel
                        .classed('active', false).classed('inactive', true);
                    ageLabel
                        .classed('active', true).classed('inactive', false);
                    incomeLabel
                        .classed('active', false).classed('inactive', true);
                }
                else {
                    povertyLabel
                        .classed('active', false).classed('inactive', true);
                    ageLabel
                        .classed('active', false).classed('inactive', true);
                    incomeLabel
                        .classed('active', true).classed('inactive', false);
                }
                
            }

        })

        yLabels.selectAll('text')
        .on('click', function(){
            const value = d3.select(this).attr('value')

            if (value !== ySelection){
                
                ySelection = value;
                console.log('x:', xSelection, 'y:', ySelection);
                xLinearScale = xScale(healthData, xSelection);
                yLinearScale = yScale(healthData, ySelection);

                circles = drawCircles(circles, xLinearScale, yLinearScale, xSelection, ySelection);
                
                yAxis = renderYAxes(yLinearScale, yAxis)
                
                circles = updateToolTip(xSelection, ySelection, circles);
                
                abbrs = drawAbbrs(abbrs, xLinearScale, yLinearScale, xSelection, ySelection);
                
                if (ySelection === 'obesity'){
                    obesityLabel
                        .classed('active', true).classed('inactive', false);
                    smokesLabel
                        .classed('active', false).classed('inactive', true);
                    hCareLabel
                        .classed('active', false).classed('inactive', true);
                }
                else if (ySelection === 'smokes') {
                    obesityLabel
                        .classed('active', false).classed('inactive', true);
                    smokesLabel
                        .classed('active', true).classed('inactive', false);
                    hCareLabel
                        .classed('active', false).classed('inactive', true);
                }
                else {
                    obesityLabel
                        .classed('active', false).classed('inactive', true);
                    smokesLabel
                        .classed('active', false).classed('inactive', true);
                    hCareLabel
                        .classed('active', true).classed('inactive', false);
                }
                
            }

        })
})()