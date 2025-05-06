import { FunctionComponent, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '../../hooks/useTheme';
import { getChartColors, getPlotlyConfig, getBaseLayout } from './PlotConfigs';

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

    // Get theme colors
    const colors = getChartColors(isDark);

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
        color: isDark ? 'rgba(244, 244, 245, 0.9)' : 'rgba(39, 39, 42, 0.9)', // zinc-100/zinc-800
        width: 2
      },
      line: {
        color: isDark ? 'rgba(212, 212, 216, 0.9)' : 'rgba(63, 63, 70, 0.9)', // zinc-300/zinc-700
        width: 1.5
      },
      fillcolor: colors.violinColor,
      opacity: 0.8,
      points: 'outliers',
      jitter: 0.3,
      pointpos: 0,
      hoveron: 'violins+points',
      side: 'both',
      width: 1.8,
      spanmode: 'soft',
      marker: {
        symbol: 'circle',
        opacity: 0.7,
        color: isDark ? 'rgba(244, 244, 245, 0.8)' : 'rgba(24, 24, 27, 0.8)', // zinc-100/zinc-900
        size: 5,
        line: {
          color: isDark ? 'rgba(228, 228, 231, 0.9)' : 'rgba(39, 39, 42, 0.9)', // zinc-200/zinc-800
          width: 1
        }
      }
    };

    // Create layout using shared base layout
    const layout: Partial<Plotly.Layout> = {
      ...getBaseLayout(isDark, chartDiv.offsetWidth, '', columnName),
      xaxis: {
        visible: false,
        showticklabels: false
      },
      margin: {
        l: 50,
        r: 10,
        t: 20,
        b: 20
      },
      showlegend: false,
      /* annotations: [
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
            color: colors.textColor
          }
        }
      ] */
    };

    // Get standard Plotly config with customized filename
    const config = getPlotlyConfig(`violinplot_${columnName}`);

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
          chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">Error rendering violin plot</div>';
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