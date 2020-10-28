// Setting the SVG perimeter
let svgWidth = 1000;
let svgHeight = 500;

// Setting the margins that will be used to get a chart area
let margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

// Chart area
let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group, and shift the group
let svg = d3.select('.chart')
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
        label = 'HealthCare'
    }

    let toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.rockband}<br><br>${label} ${d[chosenX]}`);
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

d3.csv('../data.csv').then(function(HealthData) {

    HealthData.forEach(function(data) {
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.healthcare = +data.healthcare
    })

    let xLinearScale = xScale(HealthData, chosenX);

    let yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(HealthData, d=>d.healthcare)])
        .range([height, 0]);

    // just for the beginning
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0,${height})`)
        .call(bottomAxis);
    
    // append y axis
    chartGroup.append("g")
        .call(leftAxis);
    
    // append initial circles 
    let circlesGroup = chartGroup.selectAll("circle")
        .data(hairData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenX]))
        .attr("cy", d => yLinearScale(d.num_hits))
        .attr("r", 20)
        .attr("fill", "blue")
        .attr("opacity", "0.5")
    
    let labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`)
    
    let hairLengthLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "hair_length")
        .classed("active", true)
        .text("Hair Metal Band Hair Length (Inches)");
    
    let albumsLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "num_albums")
        .classed("inactive", true)
        .text("# of Albums Released");
    
    // Set up y axis label
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Number of Billboard 500 Hits");
    
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


                if (chosenX === "num_albums") {
                    albumsLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    hairLengthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    albumsLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    hairLengthLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        })
}).catch(function(error) {
    console.log(error);
})