import { FunctionComponent, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '../../hooks/useTheme';
import { getChartColors, getPlotlyConfig, getBaseLayout } from './PlotConfigs';

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

    // Get theme colors
    const colors = getChartColors(isDark);

    // Filter out null or NaN values for valid calculations
    const validValues = columnValues.filter(val => val !== null && !isNaN(Number(val)));

    if (validValues.length === 0) {
      chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">No valid numerical data to display</div>';
      return;
    }

    // Create box plot trace
    // Update the boxTrace object with better outlier styling
    const boxTrace: Plotly.Data = {
      type: 'box',
      y: validValues,
      name: columnName,
      boxmean: true, // Show mean as a dashed line
      marker: {
        color: colors.boxplotColor,
        // Make outliers clearly distinct with a different zinc color
        outliercolor: isDark ? 'rgba(244, 244, 245, 0.95)' : 'rgba(0, 0, 27, 0)', // zinc-100/zinc-900 for outliers
        size: 6,
        opacity: 0.8,
        /* line: {
          color: isDark ? 'rgba(212, 212, 216, 0.9)' : 'rgba(39, 39, 42, 0.9)', // zinc-300/zinc-800
          width: 1
        } */
      },
      line: {
        color: isDark ? 'rgba(244, 244, 245, 0.9)' : 'rgba(63, 63, 70, 0.9)', // zinc-100/zinc-700
        width: 1.5
      },
      hoverinfo: 'y+name',
      boxpoints: 'outliers',
      jitter: 0.3,
      pointpos: 0,
      // whiskerwidth: 0.8,
      fillcolor: colors.boxplotColor,
      hoveron: 'points'
    };

    // Create layout using shared base layout
    const layout: Partial<Plotly.Layout> = {
      ...getBaseLayout(isDark, chartDiv.offsetWidth, '', columnName),

      xaxis: {
        showticklabels: false,
        zeroline: false
      },
      margin: {
        l: 50,
        r: 10,
        t: 40,
        b: 20
      },
      showlegend: false,
      /* annotations: [
        {
          x: 0,
          y: 1.12,
          xref: 'paper',
          yref: 'paper',
          text: 'Outliers shown in lighter color',
          showarrow: false,
          font: {
            family: 'monospace',
            size: 10,
            color: colors.textColor
          }
        }
      ] */
    };

    // Get standard Plotly config with customized filename
    const config = getPlotlyConfig(`boxplot_${columnName}`);

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
          chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">Error rendering box plot</div>';
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