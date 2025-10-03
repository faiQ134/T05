// Chart 1: ARE Spot Prices - Line Chart
function createChart1(data) {
  console.log('Creating Chart 1 with data:', data);
  
  // Setup chart dimensions
  const { svg, g, width, height } = createResponsiveSVG('chart1');
  
  if (width <= 0 || height <= 0) {
    console.error('Invalid chart dimensions for Chart 1');
    return;
  }

  // Parse data - assuming the CSV has date and price columns
  // Adjust column names based on actual CSV structure
  const parseDate = d3.timeParse('%Y-%m-%d'); // Adjust format as needed
  
  const processedData = data.map(d => {
    // Adjust these column names based on your actual CSV structure
    const dateColumn = Object.keys(d)[0]; // First column assumed to be date
    const priceColumn = Object.keys(d)[1]; // Second column assumed to be price
    
    return {
      date: parseDate(d[dateColumn]) || new Date(d[dateColumn]),
      price: +d[priceColumn] || 0,
      original: d
    };
  }).filter(d => d.date && !isNaN(d.price));

  if (processedData.length === 0) {
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .text('No valid data to display')
      .style('font-size', '16px')
      .style('fill', '#666');
    return;
  }

  // Create scales
  const xScale = d3.scaleTime()
    .domain(d3.extent(processedData, d => d.date))
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(processedData, d => d.price))
    .nice()
    .range([height, 0]);

  // Create line generator
  const line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.price))
    .curve(d3.curveMonotoneX);

  // Add axes
  g.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat('%b %Y')));

  g.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(yScale));

  // Add axis labels
  g.append('text')
    .attr('class', 'axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - 40)
    .attr('x', 0 - (height / 2))
    .style('text-anchor', 'middle')
    .text('Price ($)');

  g.append('text')
    .attr('class', 'axis-label')
    .attr('transform', `translate(${width / 2}, ${height + 35})`)
    .style('text-anchor', 'middle')
    .text('Date');

  // Add the line
  g.append('path')
    .datum(processedData)
    .attr('class', 'line')
    .attr('fill', 'none')
    .attr('stroke', '#3498db')
    .attr('stroke-width', 2)
    .attr('d', line);

  // Add dots
  const tooltip = createTooltip();

  g.selectAll('.dot')
    .data(processedData)
    .enter().append('circle')
    .attr('class', 'dot')
    .attr('cx', d => xScale(d.date))
    .attr('cy', d => yScale(d.price))
    .attr('r', 4)
    .attr('fill', '#3498db')
    .attr('stroke', '#fff')
    .on('mouseover', function(event, d) {
      tooltip.transition()
        .duration(200)
        .style('opacity', .9);
      tooltip.html(`Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br/>Price: $${d.price.toFixed(2)}`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
      d3.select(this).attr('r', 6);
    })
    .on('mouseout', function(d) {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
      d3.select(this).attr('r', 4);
    });

  console.log('Chart 1 created successfully');
}