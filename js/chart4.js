// Chart 4: TV Energy Consumption - Scatter Plot
function createChart4(data) {
  console.log('Creating Chart 4 with data:', data);
  
  // Setup chart dimensions
  const { svg, g, width, height } = createResponsiveSVG('chart4');
  
  if (width <= 0 || height <= 0) {
    console.error('Invalid chart dimensions for Chart 4');
    return;
  }

  // Process data - using star rating and energy consumption
  const processedData = data.map(d => {
    return {
      x: +d.star2 || 0,  // Star rating on x-axis
      y: +d.energy_consumpt || 0,  // Energy consumption on y-axis
      category: d.screen_tech || 'Unknown',  // Screen technology as category
      brand: d.brand || 'Unknown',
      screensize: +d.screensize || 0,
      original: d
    };
  }).filter(d => !isNaN(d.x) && !isNaN(d.y) && d.x > 0 && d.y > 0);

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
  const xScale = d3.scaleLinear()
    .domain(d3.extent(processedData, d => d.x))
    .nice()
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(processedData, d => d.y))
    .nice()
    .range([height, 0]);

  // Color scale for categories
  const categories = [...new Set(processedData.map(d => d.category))];
  const colorScale = d3.scaleOrdinal()
    .domain(categories)
    .range(['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e']);

  // Add axes
  g.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

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
    .text('Energy Consumption (kWh)');

  g.append('text')
    .attr('class', 'axis-label')
    .attr('transform', `translate(${width / 2}, ${height + 35})`)
    .style('text-anchor', 'middle')
    .text('Star Rating');

  // Create tooltip
  const tooltip = createTooltip();

  // Add scatter points
  g.selectAll('.dot')
    .data(processedData)
    .enter().append('circle')
    .attr('class', 'dot')
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('r', 0)
    .attr('fill', d => colorScale(d.category))
    .attr('stroke', '#fff')
    .attr('stroke-width', 1)
    .on('mouseover', function(event, d) {
      tooltip.transition()
        .duration(200)
        .style('opacity', .9);
      tooltip.html(`Star Rating: ${d.x}<br/>Energy: ${d.y} kWh<br/>Screen Tech: ${d.category}<br/>Brand: ${d.brand}<br/>Screen Size: ${d.screensize}"`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
      d3.select(this).attr('r', 8);
    })
    .on('mouseout', function(d) {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
      d3.select(this).attr('r', 5);
    })
    .transition()
    .duration(800)
    .attr('r', 5);

  // Add trend line if there's a clear correlation
  if (processedData.length > 2) {
    const regression = calculateLinearRegression(processedData);
    if (regression && !isNaN(regression.slope) && !isNaN(regression.intercept)) {
      const xDomain = xScale.domain();
      const trendData = [
        { x: xDomain[0], y: regression.slope * xDomain[0] + regression.intercept },
        { x: xDomain[1], y: regression.slope * xDomain[1] + regression.intercept }
      ];

      g.append('line')
        .attr('class', 'trend-line')
        .attr('x1', xScale(trendData[0].x))
        .attr('y1', yScale(trendData[0].y))
        .attr('x2', xScale(trendData[1].x))
        .attr('y2', yScale(trendData[1].y))
        .style('stroke', '#e74c3c')
        .style('stroke-width', 2)
        .style('stroke-dasharray', '5,5')
        .style('opacity', 0.7);
    }
  }

  // Add legend if there are multiple categories
  if (categories.length > 1 && categories.length <= 7) {
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 120}, 20)`);

    const legendItems = legend.selectAll('.legend-item')
      .data(categories)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legendItems.append('circle')
      .attr('cx', 7)
      .attr('cy', 7)
      .attr('r', 5)
      .attr('fill', d => colorScale(d));

    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .style('font-size', '12px')
      .text(d => d);
  }

  console.log('Chart 4 created successfully');
}

// Helper function to calculate linear regression
function calculateLinearRegression(data) {
  const n = data.length;
  if (n < 2) return null;

  const sumX = data.reduce((sum, d) => sum + d.x, 0);
  const sumY = data.reduce((sum, d) => sum + d.y, 0);
  const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0);
  const sumXX = data.reduce((sum, d) => sum + d.x * d.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}