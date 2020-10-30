// Setting the SVG perimeter
let svgWidth = 900;
let svgHeight = 500;

// Setting the margins that will be used to get a chart area
let margin = {
    top: 30,
    right: 50,
    bottom: 90,
    left: 80
};

// Chart area
let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group, and shift the group
let svg = d3.select('#scatter')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

// Append an SVG Group - shift the group
let chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Initial Params
// Y axis is going to be Obesity
// X axis is going to be Income or it's going to be healthcare
let chosenX = 'income';

// Create a function that will go through and update the x_scale upon clicking on the axis label
function xScale(HealthData, chosenX) {
    // create linear scale
    let xLinearScale = d3.scaleLinear()
        .domain([d3.min(HealthData, d => d[chosenX]) * 0.7 ,d3.max(HealthData, d=> d[chosenX]) * 1.3])
        .range([0, width]);
    
    return xLinearScale;
}

// Function for rendering x-Axis, whenever we have a click event
function renderAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale); 
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
};

// functoin used for updating the circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenX) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenX]))
    
    return circlesGroup;
};

// update the circles group with a new tooltip
function updateToolTip(chosenX, circlesGroup) {
    let label;

    if (chosenX === "income") {
        label = 'Income:'
    }
    else {
        label = 'Poverty'
    }

    let toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${label} ${d[chosenX]}`);
        });
    
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
    .on("mouseout", function(data) {
        toolTip.hide(data);
    });
    return circlesGroup
}

d3.csv('data.csv').then(function(HealthData) {
        console.log()


    HealthData.forEach(function(data) {
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.healthcare = +data.healthcare
    })

    let xLinearScale = xScale(HealthData, chosenX);

    let yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(HealthData, d=>d.healthcare)])
        .range([height, 5]);

    // just for the beginning
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(5,${height})`)
        .call(bottomAxis);
    
    // append y axis
    chartGroup.append("g")
        .call(leftAxis);
    
    // append initial circles 
    let circlesGroup = chartGroup.selectAll("circle")
        .data(HealthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenX]))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 6)
        .attr("fill", "purple")
        .attr("opacity", "0.5")
    
    let labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 40})`)
    
    let incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 5)
        .attr("value", "income")
        .classed("active", true)
        .text("Income Level");
    
    let povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 30)
        .attr("value", "poverty")
        .classed("inactive", true)
        .text("Poverty Level");
    
    // Set up y axis label
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Obesity");
    
    // updateToolTip
    circlesGroup = updateToolTip(chosenX, circlesGroup)

    labelsGroup.selectAll("text")
        .on("click", function() {
            let value = d3.select(this).attr("value");
            if (value !== chosenX) {
                chosenX = value;

                console.log(chosenX);

                xLinearScale = xScale(HealthData, chosenX);
                xAxis = renderAxes(xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenX);
                circlesGroup = updateToolTip(chosenX, circlesGroup);


                if (chosenX === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        })
}).catch(function(error) {
    console.log(error);
})