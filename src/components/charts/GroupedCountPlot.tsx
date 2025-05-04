import { FunctionComponent, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '../../hooks/useTheme';

interface GroupedCountPlotProps {
  xColumnName: string;
  yColumnName: string;
  xValues: string[];
  yValues: string[];
  maxCategories?: number; // Maximum number of categories to display
}

/**
 * A component that renders a Grouped Count Plot (Grouped Bar Chart) for visualizing
 * the relationship between two categorical variables.
 * Shows the frequency distribution of one categorical variable grouped by another.
 */
const GroupedCountPlot: FunctionComponent<GroupedCountPlotProps> = ({
  xColumnName,
  yColumnName,
  xValues,
  yValues,
  maxCategories = 15 // Default to showing top 15 categories (fewer due to complexity)
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (!chartContainerRef.current || xValues.length === 0 || yValues.length === 0) {
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
    const colorPalette = isDark 
      ? ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#2563eb', '#1d4ed8'] // Blues
      : ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#2563eb', '#1d4ed8']; // Blues

    // Filter out null or empty values
    const validPairs = xValues.map((x, i) => [x, yValues[i]])
      .filter(([x, y]) => x !== null && x !== undefined && x !== '' && 
                           y !== null && y !== undefined && y !== '');
    
    if (validPairs.length === 0) {
      chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">No valid categorical data to display</div>';
      return;
    }

    // Count frequencies of each x-y pair
    const groupedData: Record<string, Record<string, number>> = {};
    validPairs.forEach(([x, y]) => {
      if (!groupedData[y]) {
        groupedData[y] = {};
      }
      groupedData[y][x] = (groupedData[y][x] || 0) + 1;
    });

    // Get unique x and y categories
    const uniqueXValues = [...new Set(validPairs.map(pair => pair[0]))];
    const uniqueYValues = Object.keys(groupedData);

    // Limit the number of categories for better visualization
    const topXCategories = uniqueXValues
      .slice(0, maxCategories);
    
    const topYCategories = uniqueYValues
      .slice(0, Math.min(7, uniqueYValues.length)); // Limit to 7 y-categories to avoid overwhelming visuals

    // Create trace for each y-category
    const traces: Plotly.Data[] = topYCategories.map((yCategory, index) => {
      const counts = topXCategories.map(xCategory => 
        groupedData[yCategory]?.[xCategory] || 0
      );

      return {
        x: topXCategories,
        y: counts,
        type: 'bar',
        name: yCategory,
        marker: {
          color: colorPalette[index % colorPalette.length],
          line: {
            color: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            width: 1
          }
        },
        hovertemplate: `<b>${yColumnName}</b>: %{text}<br>${xColumnName}: %{x}<br>Count: %{y}<extra></extra>`,
        text: Array(topXCategories.length).fill(yCategory)
      };
    });

    // Create layout
    const layout: Partial<Plotly.Layout> = {
      title: {
        text: `${yColumnName} distribution by ${xColumnName}`,
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
      barmode: 'group',
      xaxis: {
        title: {
          text: xColumnName,
          font: {
            family: 'monospace',
            size: 12
          }
        },
        tickangle: -45,
        tickfont: {
          family: 'monospace',
          size: 10
        },
        automargin: true
      },
      yaxis: {
        title: {
          text: 'Count',
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
        l: 60,
        r: 10,
        t: 50,
        b: topXCategories.length > 10 ? 120 : 80 // Adjust bottom margin based on number of categories
      },
      height: 450, // Slightly taller to accommodate the legend
      width: chartDiv.offsetWidth,
      autosize: false,
      legend: {
        title: {
          text: yColumnName,
          font: {
            family: 'monospace',
            size: 12
          }
        },
        font: {
          family: 'monospace',
          size: 10
        },
        orientation: 'h',
        yanchor: 'bottom',
        y: 1.02,
        xanchor: 'right',
        x: 1
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
          Plotly.newPlot(chartDiv, traces, layout, config);
          window.addEventListener('resize', handleResize);
        }
      } catch (err) {
        console.error('Error rendering grouped count plot:', err);
        if (chartDiv) {
          chartDiv.innerHTML = '<div class="p-4 text-red-500 font-mono text-sm">Error rendering grouped count plot</div>';
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
          console.error('Error cleaning up grouped count plot:', err);
        }
      }
    };
  }, [xValues, yValues, xColumnName, yColumnName, maxCategories, isDark]);

  return (
    <div className="w-full">
      <div
        ref={chartContainerRef}
        className="w-full h-[450px] min-h-[200px]"
        data-testid="grouped-count-plot"
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-pulse text-zinc-400 font-mono text-sm">Loading visualization...</div>
        </div>
      </div>
    </div>
  );
};

export default GroupedCountPlot;