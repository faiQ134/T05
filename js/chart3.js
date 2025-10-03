// Chart 3: TV Energy by Screen Type (All Sizes) - Grouped Bar Chart
function createChart3(data) {
  console.log('Creating Chart 3 with data:', data);
  
  // Setup chart dimensions
  const { svg, g, width, height } = createResponsiveSVG('chart3');
  
  if (width <= 0 || height <= 0) {
    console.error('Invalid chart dimensions for Chart 3');
    return;
  }

  // Process data - assuming CSV has screen type and multiple size columns
  const columns = Object.keys(data[0]);
  const screenTypeColumn = columns[0]; // First column assumed to be screen type
  const sizeColumns = columns.slice(1); // Remaining columns are different sizes
  
  const processedData = data.map(d => {
    const result = {
      type: d[screenTypeColumn],
      values: {}
    };
    
    sizeColumns.forEach(col => {
      result.values[col] = +d[col] || 0;
    });
    
    return result;
  }).filter(d => d.type);

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

  // Flatten data for easier manipulation
  const flatData = [];
  processedData.forEach(d => {
    Object.entries(d.values).forEach(([size, value]) => {
      flatData.push({
        type: d.type,
        size: size,
        value: value
      });
    });
  });

  // Create scales
  const x0Scale = d3.scaleBand()
    .domain(processedData.map(d => d.type))
    .range([0, width])
    .padding(0.1);

  const x1Scale = d3.scaleBand()
    .domain(sizeColumns)
    .range([0, x0Scale.bandwidth()])
    .padding(0.05);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(flatData, d => d.value)])
    .nice()
    .range([height, 0]);

  // Color scale for different sizes
  const colorScale = d3.scaleOrdinal()
    .domain(sizeColumns)
    .range(['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6']);

  // Add axes
  g.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x0Scale));

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

  // Add grouped bars
  const groups = g.selectAll('.group')
    .data(processedData)
    .enter().append('g')
    .attr('class', 'group')
    .attr('transform', d => `translate(${x0Scale(d.type)}, 0)`);

  groups.selectAll('.bar')
    .data(d => sizeColumns.map(size => ({
      size: size,
      value: d.values[size],
      type: d.type
    })))
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', d => x1Scale(d.size))
    .attr('width', x1Scale.bandwidth())
    .attr('y', height)
    .attr('height', 0)
    .attr('fill', d => colorScale(d.size))
    .on('mouseover', function(event, d) {
      tooltip.transition()
        .duration(200)
        .style('opacity', .9);
      tooltip.html(`Type: ${d.type}<br/>Size: ${d.size}<br/>Energy: ${d.value} kWh`)
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
    .attr('y', d => yScale(d.value))
    .attr('height', d => height - yScale(d.value));

  // Add legend
  const legend = g.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width - 100}, 20)`);

  const legendItems = legend.selectAll('.legend-item')
    .data(sizeColumns)
    .enter().append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0, ${i * 20})`);

  legendItems.append('rect')
    .attr('width', 15)
    .attr('height', 15)
    .attr('fill', d => colorScale(d));

  legendItems.append('text')
    .attr('x', 20)
    .attr('y', 12)
    .style('font-size', '12px')
    .text(d => d);

  console.log('Chart 3 created successfully');
}