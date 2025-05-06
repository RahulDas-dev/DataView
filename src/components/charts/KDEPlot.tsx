import { FunctionComponent, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '../../hooks/useTheme';
import { getChartColors, getPlotlyConfig, getBaseLayout } from './PlotConfigs';

interface KDEPlotProps {
  columnName: string;
  columnValues: Array<number>;
  smoothingFactor?: number; // Controls the bandwidth of the KDE
}

/**
 * A component that renders a Kernel Density Estimation (KDE) plot
 * for visualizing the probability density of numerical data.
 */
const KDEPlot: FunctionComponent<KDEPlotProps> = ({
  columnName,
  columnValues,
  smoothingFactor = 1.0 // Default smoothing factor
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (!chartContainerRef.current || !columnValues.length) {
      return;
    }

    // Store the current value of the ref in a variable to use in cleanup
    const chartDiv = chartContainerRef.current;

    // Clear previous chart
    chartDiv.innerHTML = '';

    // Get theme colors
    const colors = getChartColors(isDark);

    // Filter out null or NaN values for valid calculations
    const validValues = columnValues.filter(val => val !== null && !isNaN(Number(val)));

    if (validValues.length === 0) {
      chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">No valid numerical data to display</div>';
      return;
    }

    // Generate KDE (Kernel Density Estimation)
    const generateKDE = () => {
      // Sort values for proper KDE calculation
      const sortedValues = [...validValues].sort((a, b) => a - b);
      
      // Find min and max for x-axis range
      const minValue = Math.min(...sortedValues);
      const maxValue = Math.max(...sortedValues);
      
      // Create x points for the KDE curve (more points for smooth curve)
      const step = (maxValue - minValue) / 200;
      const kdeXValues = Array.from({ length: 201 }, (_, i) => minValue + i * step);
      
      // Bandwidth (smoothing parameter) - can be adjusted based on data distribution
      // Scott's rule for bandwidth selection: n^(-1/5) * σ
      const bandwidth = smoothingFactor * Math.pow(sortedValues.length, -0.2) * 
                        Math.sqrt(sortedValues.reduce((acc, val) => 
                            acc + Math.pow(val - (sortedValues.reduce((a, b) => a + b, 0) / sortedValues.length), 2), 0) / sortedValues.length);
      
      // Calculate KDE values
      const kdeYValues = kdeXValues.map(x => {
        // Gaussian kernel
        return sortedValues.reduce((sum, val) => {
          const z = (x - val) / bandwidth;
          return sum + Math.exp(-0.5 * z * z) / (bandwidth * Math.sqrt(2 * Math.PI));
        }, 0) / sortedValues.length;
      });
      
      return {
        x: kdeXValues,
        y: kdeYValues
      };
    };
    
    const kde = generateKDE();
    
    // Create KDE trace
    const kdeTrace: Plotly.Data = {
      x: kde.x,
      y: kde.y,
      type: 'scatter',
      mode: 'lines',
      name: 'Density',
      line: {
        color: colors.kdeColor, // Using shared color
        width: 2.5
      },
      fill: 'tozeroy',
      fillcolor: isDark ? 'rgba(161, 161, 170, 0.2)' : 'rgba(113, 113, 122, 0.2)', // zinc-400/zinc-500 with low opacity
      hovertemplate: 'Value: %{x}<br>Density: %{y}<extra></extra>'
    };

    // Add rug plot (small ticks for each data point) at the bottom
    const rugTrace: Plotly.Data = {
      x: validValues,
      y: Array(validValues.length).fill(0),
      mode: 'markers',
      type: 'scatter',
      marker: {
        symbol: 'line-ns',
        color: colors.kdeColor, // Using shared color
        size: 10,
        opacity: 0.5,
        line: {
          width: 1
        }
      },
      hoverinfo: 'x',
      showlegend: false
    };

    // Get base layout and customize for KDE plot
    const layout: Partial<Plotly.Layout> = {
      ...getBaseLayout(isDark, chartDiv.offsetWidth, columnName, 'Density'),
      yaxis: {
        ...getBaseLayout(isDark, chartDiv.offsetWidth).yaxis,
        title: {
          text: 'Density',
          font: {
            family: 'monospace',
            size: 12
          }
        },
        rangemode: 'tozero'
      },
      showlegend: false,
      hovermode: 'closest'
    };

    // Get standard Plotly config with customized filename
    const config = getPlotlyConfig(`kde_${columnName}`);

    // Make the plot responsive
    const handleResize = () => {
      if (chartDiv) {
        Plotly.relayout(chartDiv, {
          'width': chartDiv.offsetWidth
        });
      }
    };

    // Add a small delay to ensure the container is fully rendered
    const timer = setTimeout(() => {
      try {
        if (chartDiv) {
          Plotly.newPlot(chartDiv, [kdeTrace, rugTrace], layout, config);
          window.addEventListener('resize', handleResize);
        }
      } catch (err) {
        console.error('Error rendering KDE plot:', err);
        if (chartDiv) {
          chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">Error rendering KDE plot</div>';
        }
      }
    }, 50);

    // Cleanup function
    return () => {
      // Clear the timeout
      clearTimeout(timer);
      
      // Remove resize event listener
      window.removeEventListener('resize', handleResize);
      
      // Purge Plotly chart
      if (chartDiv) {
        try {
          Plotly.purge(chartDiv);
        } catch (err) {
          console.error('Error cleaning up KDE plot:', err);
        }
      }
    };
  }, [columnValues, columnName, smoothingFactor, isDark]);

  return (
    <div className="w-full">
      <div
        ref={chartContainerRef}
        className="w-full h-[400px] min-h-[200px]"
        data-testid="kde-plot"
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-pulse text-zinc-400 font-mono text-sm">Loading visualization...</div>
        </div>
      </div>
    </div>
  );
};

export default KDEPlot;