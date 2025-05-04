import { FunctionComponent, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '../../hooks/useTheme';

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

    // Define chart colors based on theme
    const textColor = isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)';
    const paper_bgcolor = isDark ? '#27272a' : '#f9fafb'; // zinc-800 for dark, gray-50 for light
    const plot_bgcolor = isDark ? '#27272a' : '#f9fafb';
    const colorPalette = [
      '#3b82f6', // blue-500
      '#ec4899', // pink-500
      '#8b5cf6', // violet-500
      '#10b981', // emerald-500
      '#f59e0b', // amber-500
      '#ef4444', // red-500
      '#14b8a6', // teal-500
      '#6366f1', // indigo-500
      '#f97316', // orange-500
      '#84cc16', // lime-500
      '#06b6d4', // cyan-500
      '#d946ef', // fuchsia-500
      '#6b7280', // gray-500
      '#0ea5e9', // sky-500
      '#22c55e', // green-500
    ];

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
      hoverinfo: 'label+percent+value',
      marker: {
        colors: labels.map((_, i) => {
          if (hasOtherCategory && i === labels.length - 1) {
            return isDark ? '#6b7280' : '#9ca3af'; // gray-500/400 for "Other"
          }
          return colorPalette[i % colorPalette.length];
        }),
        line: {
          color: isDark ? '#27272a' : '#ffffff',
          width: 1
        }
      },
      pull: labels.map((label) => label === 'Other' ? 0.05 : 0) // Pull out the "Other" slice slightly
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
      paper_bgcolor,
      plot_bgcolor,
      margin: {
        l: 20,
        r: 20,
        t: 40,
        b: 20
      },
      height: 400,
      width: chartDiv.offsetWidth,
      autosize: false,
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
        bgcolor: isDark ? 'rgba(39, 39, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        bordercolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderwidth: 1
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
          Plotly.newPlot(chartDiv, [pieTrace], layout, config);
          window.addEventListener('resize', handleResize);
        }
      } catch (err) {
        console.error('Error rendering pie chart:', err);
        if (chartDiv) {
          chartDiv.innerHTML = '<div class="p-4 text-red-500 font-mono text-sm">Error rendering pie chart</div>';
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