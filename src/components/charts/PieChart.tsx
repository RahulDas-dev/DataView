import { FunctionComponent, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '../../hooks/useTheme';
import { getChartColors, getPlotlyConfig, getBaseLayout } from './PlotConfigs';

interface PieChartProps {
  columnName: string;
  categoryValues: string[];
  maxCategories?: number; // Maximum number of categories to display
}

/**
 * A component that renders a Pie Chart for categorical data visualization.
 * Shows the proportion of each category in the data.
 */
const PieChart: FunctionComponent<PieChartProps> = ({
  columnName,
  categoryValues,
  maxCategories = 10 // Default to showing top 10 categories
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
      .sort((a, b) => b[1] - a[1]);

    const displayCategories = sortedCategories.slice(0, maxCategories);
    let hasOtherCategory = false;
    
    // If there are more categories than maxCategories, create an "Other" category
    if (sortedCategories.length > maxCategories) {
      hasOtherCategory = true;
      const otherCount = sortedCategories
        .slice(maxCategories)
        .reduce((sum, [, count]) => sum + count, 0);
      
      displayCategories.push(['Other', otherCount]);
    }

    // Extract categories and counts for the plot
    const labels = displayCategories.map(([category]) => category);
    const values = displayCategories.map(([, count]) => count);

    // Create trace for the pie chart
    const pieTrace: Plotly.Data = {
      labels,
      values,
      type: 'pie',
      textinfo: 'percent',
      textposition: 'inside',
      automargin: true,
      hoverinfo: 'label+percent+name',
      textfont: {
        color: isDark ? 'rgba(0, 0, 0, 0.9)': 'rgba(255, 255, 255, 0.9)',
        family: 'monospace',
        size: 11
      },
      marker: {
        colors: labels.map((_, i) => {
          // For "Other" category, use a distinctive color in the zinc palette
          if (hasOtherCategory && i === labels.length - 1) {
            return isDark ? 'rgba(82, 82, 91, 0.8)' : 'rgba(161, 161, 170, 0.8)'; // zinc-600/zinc-400
          }
          // Use the extended barGradient for pie chart slices
          return colors.barGradient[i % colors.barGradient.length];
        }),
        line: {
          color: isDark ? '#27272a' : '#f8fafc', // zinc-800/slate-50
          width: 1.5
        }
      },
      pull: labels.map((label) => label === 'Other' ? 0.05 : 0), // Pull out the "Other" slice slightly
      rotation: 45 // Start at 45 degrees for better visual balance
    };

    // Create layout using shared base layout
    const layout: Partial<Plotly.Layout> = {
      ...getBaseLayout(isDark, chartDiv.offsetWidth),
      title: {
        text: `Distribution of ${columnName}`,
        font: {
          family: "'Montserrat', sans-serif",
          size: 16
        },
        x: 0.05,
        xanchor: 'left'
      },
      margin: {
        l: 20,
        r: 20,
        t: 40,
        b: 20
      },
      showlegend: true,
      legend: {
        orientation: 'v',
        x: 1,
        y: 0.5,
        xanchor: 'left',
        font: {
          family: 'monospace',
          size: 10
        },
        bgcolor: colors.legendBackground,
        bordercolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderwidth: 1
      }
    };

    // Get standard Plotly config
    const config = getPlotlyConfig(`piechart_${columnName}`);

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
          Plotly.newPlot(chartDiv, [pieTrace], layout, config);
          window.addEventListener('resize', handleResize);
        }
      } catch (err) {
        console.error('Error rendering pie chart:', err);
        if (chartDiv) {
          chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">Error rendering pie chart</div>';
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
          console.error('Error cleaning up pie chart:', err);
        }
      }
    };
  }, [categoryValues, columnName, maxCategories, isDark]);

  return (
    <div className="w-full">
      <div
        ref={chartContainerRef}
        className="w-full h-[400px] min-h-[200px]"
        data-testid="pie-chart"
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-pulse text-zinc-400 font-mono text-sm">Loading visualization...</div>
        </div>
      </div>
    </div>
  );
};

export default PieChart;