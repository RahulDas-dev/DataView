import { FunctionComponent, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '../../hooks/useTheme';

interface ViolinPlotProps {
  columnName: string;
  columnValues: Array<number>;
}

/**
 * A component that renders a Violin Plot for numerical data visualization.
 * Shows distribution shape, density, and quartiles in a single visualization.
 */
const ViolinPlot: FunctionComponent<ViolinPlotProps> = ({
  columnName,
  columnValues
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
    const violinColor = isDark ? 'rgba(124, 58, 237, 0.7)' : 'rgba(124, 58, 237, 0.7)'; // violet-600 with opacity
    const lineColor = isDark ? 'rgba(124, 58, 237, 0.9)' : 'rgba(124, 58, 237, 0.9)'; // violet-600 with opacity
    const insideColor = isDark ? '#27272a' : '#f9fafb'; // Match background for nice contrast

    // Filter out null or NaN values for valid calculations
    const validValues = columnValues.filter(val => val !== null && !isNaN(Number(val)));

    if (validValues.length === 0) {
      chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">No valid numerical data to display</div>';
      return;
    }

    // Create violin plot trace
    const violinTrace: Plotly.Data = {
      type: 'violin',
      y: validValues,
      name: columnName,
      box: {
        visible: true,
        width: 0.2
      },
      meanline: {
        visible: true,
        color: isDark ? 'rgba(252, 211, 77, 0.9)' : 'rgba(217, 119, 6, 0.9)', // amber-300/amber-600
        width: 2
      },
      line: {
        color: lineColor,
        width: 1.5
      },
      fillcolor: violinColor,
      opacity: 0.8,
      points: 'outliers',
      jitter: 0.3,
      pointpos: 0,
      hoveron: 'violins+points+kde',
      side: 'both',
      width: 1.8,
      spanmode: 'soft',
      marker: {
        symbol: 'circle',
        opacity: 0.7,
        color: isDark ? 'rgba(249, 115, 22, 0.7)' : 'rgba(249, 115, 22, 0.7)', // orange-500
        size: 5,
        line: {
          color: isDark ? 'rgba(249, 115, 22, 0.9)' : 'rgba(249, 115, 22, 0.9)', // orange-500
          width: 1
        }
      }
    };

    // Create layout
    const layout: Partial<Plotly.Layout> = {
      title: {
        text: `Violin Plot of ${columnName}`,
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
      yaxis: {
        title: {
          text: columnName,
          font: {
            family: 'monospace',
            size: 12
          }
        },
        zeroline: false,
        gridcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        tickfont: {
          family: 'monospace',
          size: 10
        }
      },
      xaxis: {
        visible: false,
        showticklabels: false
      },
      paper_bgcolor,
      plot_bgcolor,
      margin: {
        l: 50,
        r: 10,
        t: 40,
        b: 20
      },
      height: 400,
      width: chartDiv.offsetWidth,
      autosize: false,
      showlegend: false,
      annotations: [
        {
          x: 0,
          y: 1.12,
          xref: 'paper',
          yref: 'paper',
          text: 'Mean shown as dashed line',
          showarrow: false,
          font: {
            family: 'monospace',
            size: 10,
            color: textColor
          }
        }
      ]
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
          Plotly.newPlot(chartDiv, [violinTrace], layout, config);
          window.addEventListener('resize', handleResize);
        }
      } catch (err) {
        console.error('Error rendering violin plot:', err);
        if (chartDiv) {
          chartDiv.innerHTML = '<div class="p-4 text-red-500 font-mono text-sm">Error rendering violin plot</div>';
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
          console.error('Error cleaning up violin plot:', err);
        }
      }
    };
  }, [columnValues, columnName, isDark]);

  return (
    <div className="w-full">
      <div
        ref={chartContainerRef}
        className="w-full h-[400px] min-h-[200px]"
        data-testid="violin-plot"
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-pulse text-zinc-400 font-mono text-sm">Loading visualization...</div>
        </div>
      </div>
    </div>
  );
};

export default ViolinPlot;