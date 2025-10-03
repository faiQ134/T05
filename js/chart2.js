// Chart 2: TV Energy by Screen Type (55 inch) - Bar Chart
function createChart2(data) {
  console.log('Creating Chart 2 with data:', data);
  
  // Setup chart dimensions
  const { svg, g, width, height } = createResponsiveSVG('chart2');
  
  if (width <= 0 || height <= 0) {
    console.error('Invalid chart dimensions for Chart 2');
    return;
  }

  // Process data - assuming CSV has screen type and energy consumption columns
  const processedData = data.map(d => {
    // Adjust these column names based on your actual CSV structure
    const columns = Object.keys(d);
    const typeColumn = columns[0]; // First column assumed to be screen type
    const energyColumn = columns[1]; // Second column assumed to be energy
    
    return {
      type: d[typeColumn],
      energy: +d[energyColumn] || 0,
      original: d
    };
  }).filter(d => d.type && !isNaN(d.energy));

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
  const xScale = d3.scaleBand()
    .domain(processedData.map(d => d.type))
    .range([0, width])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(processedData, d => d.energy)])
    .nice()
    .range([height, 0]);

  // Color scale
  const colorScale = d3.scaleOrdinal()
    .domain(processedData.map(d => d.type))
    .range(['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6']);

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
    .text('Screen Type');

  // Create tooltip
  const tooltip = createTooltip();

  // Add bars
  g.selectAll('.bar')
    .data(processedData)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d.type))
    .attr('width', xScale.bandwidth())
    .attr('y', height)
    .attr('height', 0)
    .attr('fill', d => colorScale(d.type))
    .on('mouseover', function(event, d) {
      tooltip.transition()
        .duration(200)
        .style('opacity', .9);
      tooltip.html(`Screen Type: ${d.type}<br/>Energy: ${d.energy} kWh`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
      d3.select(this).style('opacity', 0.8);
    })
    .on('mouseout', function(d) {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
      d3.select(this).style('opacity', 1);
    })
    .transition()
    .duration(800)
    .attr('y', d => yScale(d.energy))
    .attr('height', d => height - yScale(d.energy));

  // Add value labels on bars
  g.selectAll('.bar-label')
    .data(processedData)
    .enter().append('text')
    .attr('class', 'bar-label')
    .attr('x', d => xScale(d.type) + xScale.bandwidth() / 2)
    .attr('y', height)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('fill', '#2c3e50')
    .text(d => d.energy)
    .transition()
    .duration(800)
    .attr('y', d => yScale(d.energy) - 5);

  console.log('Chart 2 created successfully');
}