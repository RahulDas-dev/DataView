import { FunctionComponent, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '../../hooks/useTheme';
import { getChartColors, getPlotlyConfig, getBaseLayout } from './PlotConfigs';

interface CountPlotProps {
  columnName: string;
  categoryValues: string[];
  maxCategories?: number; // Maximum number of categories to display
}

/**
 * A component that renders a Count Plot (Bar Chart) for categorical data visualization.
 * Shows the frequency of each category in the data.
 */
const CountPlot: FunctionComponent<CountPlotProps> = ({
  columnName,
  categoryValues,
  maxCategories = 20 // Default to showing top 20 categories
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (!chartContainerRef.current || !categoryValues.length) {
      return;
    }

    // Store the current value of the ref in a variable to use in cleanup
    const chartDiv = chartContainerRef.current;

    // Clear previous chart
    chartDiv.innerHTML = '';

    // Get theme colors
    const colors = getChartColors(isDark);

    // Filter out null or empty values
    const validValues = categoryValues.filter(val => val !== null && val !== undefined && val !== '');

    if (validValues.length === 0) {
      chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">No valid categorical data to display</div>';
      return;
    }

    // Count frequencies of each category
    const frequencyMap = validValues.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by frequency (descending)
    const sortedCategories = Object.entries(frequencyMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxCategories); // Limit to top maxCategories

    // Extract categories and counts for the plot
    const categories = sortedCategories.map(([category]) => category);
    const counts = sortedCategories.map(([, count]) => count);

    // Define zinc gradient colors for bars
    const barColors = colors.barGradient;

    // Create trace for the count plot
    const countTrace: Plotly.Data = {
      x: categories,
      y: counts,
      type: 'bar',
      marker: {
        color: counts.map((_, i) => barColors[i % barColors.length]),
        line: {
          color: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          width: 1
        }
      },
      hovertemplate: '<b>%{x}</b><br>Count: %{y}<extra></extra>'
    };

    // Create layout using the shared base layout
    const layout: Partial<Plotly.Layout> = {
      ...getBaseLayout(isDark, chartDiv.offsetWidth, '', 'Count'),
      xaxis: {
        ...getBaseLayout(isDark, chartDiv.offsetWidth).xaxis,
        title: '',
        tickangle: -45,
        automargin: true
      },
      margin: {
        l: 50,
        r: 10,
        t: 40,
        b: sortedCategories.length > 10 ? 120 : 80 // Adjust bottom margin based on number of categories
      },
      bargap: 0.2,
      showlegend: false
    };

    // Get standard Plotly config
    const config = getPlotlyConfig(`countplot_${columnName}`);

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
          Plotly.newPlot(chartDiv, [countTrace], layout, config);
          window.addEventListener('resize', handleResize);
        }
      } catch (err) {
        console.error('Error rendering count plot:', err);
        if (chartDiv) {
          chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">Error rendering count plot</div>';
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
          console.error('Error cleaning up count plot:', err);
        }
      }
    };
  }, [categoryValues, columnName, maxCategories, isDark]);

  return (
    <div className="w-full">
      <div
        ref={chartContainerRef}
        className="w-full h-[400px] min-h-[200px]"
        data-testid="count-plot"
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-pulse text-zinc-400 font-mono text-sm">Loading visualization...</div>
        </div>
      </div>
    </div>
  );
};

export default CountPlot;