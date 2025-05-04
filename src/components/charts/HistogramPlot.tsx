import { FunctionComponent, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '../../hooks/useTheme';

interface HistogramPlotProps {
  columnName: string;
  columnValues: Array<number>;
  binCount?: number;
}

/**
 * A component that renders a histogram with a KDE (Kernel Density Estimation) overlay
 * for numerical data visualization.
 */
const HistogramPlot: FunctionComponent<HistogramPlotProps> = ({
  columnName,
  columnValues,
  binCount = 30
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

    // Define chart colors based on theme
    const textColor = isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)';
    const paper_bgcolor = isDark ? '#27272a' : '#f9fafb'; // zinc-800 for dark, gray-50 for light
    const plot_bgcolor = isDark ? '#27272a' : '#f9fafb';
    const histogramColor = isDark ? 'rgba(59, 130, 246, 0.7)' : 'rgba(59, 130, 246, 0.7)'; // blue-500 with opacity
    const kdeColor = isDark ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 0.9)'; // red-500 with opacity

    // Filter out null or NaN values for valid calculations
    const validValues = columnValues.filter(val => val !== null && !isNaN(Number(val)));

    if (validValues.length === 0) {
      chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">No valid numerical data to display</div>';
      return;
    }

    // Calculate histogram bins
    const histValues = [...validValues];
    
    // Compute min and max for consistent bin ranges
    const minValue = Math.min(...histValues);
    const maxValue = Math.max(...histValues);
    
    // Calculate bin size
    const binSize = (maxValue - minValue) / binCount;
    
    // Create histogram trace
    const histogramTrace: Plotly.Data = {
      x: histValues,
      type: 'histogram',
      name: 'Histogram',
      opacity: 0.7,
      autobinx: false,
      xbins: {
        start: minValue - binSize / 2,
        end: maxValue + binSize / 2,
        size: binSize
      },
      marker: {
        color: histogramColor
      },
      hovertemplate: 'Range: %{x}<br>Count: %{y}<extra></extra>'
    };

    // Generate KDE (Kernel Density Estimation)
    // We'll use a simplified approach for KDE by smoothing the histogram
    const generateKDE = () => {
      // Sort values for proper KDE calculation
      const sortedValues = [...histValues].sort((a, b) => a - b);
      
      // Create x points for the KDE curve (more points than bins for smooth curve)
      const step = (maxValue - minValue) / 100;
      const kdeXValues = Array.from({ length: 101 }, (_, i) => minValue + i * step);
      
      // Bandwidth (smoothing parameter) - can be adjusted based on data distribution
      // Scott's rule for bandwidth selection: n^(-1/5) * σ
      const bandwidth = Math.pow(sortedValues.length, -0.2) * 
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
      
      // Scale the KDE to match the histogram height for better visualization
      const maxHistValue = Math.max(...histValues.reduce((acc, val) => {
        const binIndex = Math.floor((val - minValue) / binSize);
        acc[binIndex] = (acc[binIndex] || 0) + 1;
        return acc;
      }, Array(binCount).fill(0)));
      
      const maxKDEValue = Math.max(...kdeYValues);
      const scaleFactor = maxHistValue / maxKDEValue;
      
      const scaledKDEYValues = kdeYValues.map(y => y * scaleFactor);
      
      return {
        x: kdeXValues,
        y: scaledKDEYValues
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
        color: kdeColor,
        width: 2
      },
      hovertemplate: 'Value: %{x}<br>Density: %{y}<extra></extra>'
    };

    // Create layout
    const layout: Partial<Plotly.Layout> = {
      title: {
        text: `Distribution of ${columnName}`,
        font: {
          family: "'Montserrat', sans-serif",
          size: 16
        },
        x: 0.05,
        xanchor: 'left'
      },
      font: {
        family: 'monospace',
        color: textColor
      },
      xaxis: {
        title: {
          text: columnName,
          font: {
            family: 'monospace',
            size: 12
          }
        },
        tickfont: {
          family: 'monospace',
          size: 10
        }
      },
      yaxis: {
        title: {
          text: 'Frequency',
          font: {
            family: 'monospace',
            size: 12
          }
        },
        tickfont: {
          family: 'monospace',
          size: 10
        }
      },
      paper_bgcolor,
      plot_bgcolor,
      margin: {
        l: 50,
        r: 10,
        t: 40,
        b: 50
      },
      barmode: 'overlay',
      height: 400,
      width: chartDiv.offsetWidth,
      autosize: false,
      showlegend: true,
      legend: {
        x: 0.95,
        y: 0.95,
        font: {
          family: 'monospace',
          size: 10
        }
      }
    };

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };

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
          Plotly.newPlot(chartDiv, [histogramTrace, kdeTrace], layout, config);
          window.addEventListener('resize', handleResize);
        }
      } catch (err) {
        console.error('Error rendering histogram plot:', err);
        if (chartDiv) {
          chartDiv.innerHTML = '<div class="p-4 text-red-500 font-mono text-sm">Error rendering histogram plot</div>';
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
          console.error('Error cleaning up histogram plot:', err);
        }
      }
    };
  }, [columnValues, columnName, binCount, isDark]);

  return (
    <div className="w-full">
      <div
        ref={chartContainerRef}
        className="w-full h-[400px] min-h-[200px]"
        data-testid="histogram-plot"
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-pulse text-zinc-400 font-mono text-sm">Loading visualization...</div>
        </div>
      </div>
    </div>
  );
};

export default HistogramPlot;