import { FunctionComponent, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '../../hooks/useTheme';

interface BoxPlotProps {
  columnName: string;
  columnValues: Array<number>;
}

/**
 * A component that renders a Box Plot for numerical data visualization.
 * Shows quartiles, outliers, and distribution shape at a glance.
 */
const BoxPlot: FunctionComponent<BoxPlotProps> = ({
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
    const boxColor = isDark ? 'rgba(16, 185, 129, 0.7)' : 'rgba(16, 185, 129, 0.7)'; // emerald-500 with opacity
    const lineColor = isDark ? 'rgba(16, 185, 129, 0.9)' : 'rgba(16, 185, 129, 0.9)'; // emerald-500 with opacity
    const outlierColor = isDark ? 'rgba(244, 63, 94, 0.8)' : 'rgba(244, 63, 94, 0.8)'; // rose-500 with opacity

    // Filter out null or NaN values for valid calculations
    const validValues = columnValues.filter(val => val !== null && !isNaN(Number(val)));

    if (validValues.length === 0) {
      chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">No valid numerical data to display</div>';
      return;
    }

    // Create box plot trace
    const boxTrace: Plotly.Data = {
      type: 'box',
      y: validValues,
      name: columnName,
      boxmean: true, // Show mean as a dashed line
      marker: {
        color: boxColor,
        outliercolor: outlierColor,
        line: {
          color: lineColor,
          width: 1.5
        }
      },
      line: {
        color: lineColor,
        width: 1.5
      },
      hoverinfo: 'y+name',
      boxpoints: 'outliers',
      jitter: 0.3,
      pointpos: 0,
      whiskerwidth: 0.8,
      fillcolor: boxColor,
      hoveron: 'boxes+points'
    };

    // Create layout
    const layout: Partial<Plotly.Layout> = {
      title: {
        text: `Box Plot of ${columnName}`,
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
          text: 'Outliers shown in red',
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
          Plotly.newPlot(chartDiv, [boxTrace], layout, config);
          window.addEventListener('resize', handleResize);
        }
      } catch (err) {
        console.error('Error rendering box plot:', err);
        if (chartDiv) {
          chartDiv.innerHTML = '<div class="p-4 text-red-500 font-mono text-sm">Error rendering box plot</div>';
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
          console.error('Error cleaning up box plot:', err);
        }
      }
    };
  }, [columnValues, columnName, isDark]);

  return (
    <div className="w-full">
      <div
        ref={chartContainerRef}
        className="w-full h-[400px] min-h-[200px]"
        data-testid="box-plot"
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-pulse text-zinc-400 font-mono text-sm">Loading visualization...</div>
        </div>
      </div>
    </div>
  );
};

export default BoxPlot;