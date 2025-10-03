// Data loader for all CSV files
class DataLoader {
  constructor() {
    this.data = {};
    this.loadingPromises = [];
  }

  async loadAllData() {
    try {
      // Show loading indicators
      this.showLoadingIndicators();

      // Load all CSV files
      const promises = [
        this.loadCSV('data/Ex5_ARE_Spot_Prices.csv', 'areSpotPrices'),
        this.loadCSV('data/Ex5_TV_energy_55inchtv_byScreenType.csv', 'tv55inch'),
        this.loadCSV('data/Ex5_TV_energy_Allsizes_byScreenType.csv', 'tvAllSizes'),
        this.loadCSV('data/Ex5_TV_energy.csv', 'tvEnergy')
      ];

      const results = await Promise.all(promises);
      
      // Store the loaded data
      results.forEach((result, index) => {
        const keys = ['areSpotPrices', 'tv55inch', 'tvAllSizes', 'tvEnergy'];
        this.data[keys[index]] = result;
      });

      console.log('All data loaded successfully:', this.data);
      
      // Hide loading indicators
      this.hideLoadingIndicators();
      
      // Create all charts
      this.createCharts();
      
    } catch (error) {
      console.error('Error loading data:', error);
      this.showError('Failed to load data files');
    }
  }

  async loadCSV(path, key) {
    try {
      const data = await d3.csv(path);
      console.log(`Loaded ${key}:`, data);
      return data;
    } catch (error) {
      console.error(`Error loading ${path}:`, error);
      throw error;
    }
  }

  showLoadingIndicators() {
    const charts = ['chart1', 'chart2', 'chart3', 'chart4'];
    charts.forEach(chartId => {
      const container = document.getElementById(chartId);
      if (container) {
        container.innerHTML = '<div class="loading">Loading data...</div>';
      }
    });
  }

  hideLoadingIndicators() {
    const charts = ['chart1', 'chart2', 'chart3', 'chart4'];
    charts.forEach(chartId => {
      const container = document.getElementById(chartId);
      if (container) {
        const loadingElement = container.querySelector('.loading');
        if (loadingElement) {
          loadingElement.remove();
        }
      }
    });
  }

  showError(message) {
    const charts = ['chart1', 'chart2', 'chart3', 'chart4'];
    charts.forEach(chartId => {
      const container = document.getElementById(chartId);
      if (container) {
        container.innerHTML = `<div class="error">${message}</div>`;
      }
    });
  }

  createCharts() {
    // Create each chart with its respective data
    if (typeof createChart1 === 'function' && this.data.areSpotPrices) {
      createChart1(this.data.areSpotPrices);
    }
    
    if (typeof createChart2 === 'function' && this.data.tv55inch) {
      createChart2(this.data.tv55inch);
    }
    
    if (typeof createChart3 === 'function' && this.data.tvAllSizes) {
      createChart3(this.data.tvAllSizes);
    }
    
    if (typeof createChart4 === 'function' && this.data.tvEnergy) {
      createChart4(this.data.tvEnergy);
    }
  }

  getData(key) {
    return this.data[key];
  }
}

// Global data loader instance
const dataLoader = new DataLoader();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  dataLoader.loadAllData();
});

// Helper function to create responsive SVG
function createResponsiveSVG(containerId, margin = { top: 20, right: 30, bottom: 40, left: 50 }) {
  const container = d3.select(`#${containerId}`);
  
  // Remove any existing SVG
  container.select('svg').remove();
  
  // Get container dimensions
  const containerRect = container.node().getBoundingClientRect();
  const width = containerRect.width - margin.left - margin.right;
  const height = containerRect.height - margin.top - margin.bottom;
  
  // Create SVG
  const svg = container
    .append('svg')
    .attr('width', containerRect.width)
    .attr('height', containerRect.height);
  
  // Create main group
  const g = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  return {
    svg,
    g,
    width,
    height,
    margin
  };
}

// Helper function to create tooltip
function createTooltip() {
  return d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
}