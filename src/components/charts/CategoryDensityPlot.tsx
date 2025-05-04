import { FunctionComponent, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '../../hooks/useTheme';

interface CategoryDensityPlotProps {
  categoricalColumnName: string;
  numericColumnName: string;
  categories: Array<string | number>;
  numericValues: Array<number[]>;
}

/**
 * A component that renders density plots grouped by categories, showing
 * the distribution of a numeric variable for each category.
 */
const CategoryDensityPlot: FunctionComponent<CategoryDensityPlotProps> = ({
  categoricalColumnName,
  numericColumnName,
  categories,
  numericValues
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (!chartContainerRef.current || !categories.length || !numericValues.length) {
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
    
    // Define color palette for the categories
    const colorPalette = [
      '#8b5cf6', // violet-500
      '#ec4899', // pink-500
      '#06b6d4', // cyan-500
      '#f97316', // orange-500
      '#10b981', // emerald-500
      '#3b82f6', // blue-500
      '#ef4444', // red-500
      '#f59e0b', // amber-500
      '#6366f1', // indigo-500
      '#14b8a6'  // teal-500
    ];
    
    // Ensure there's enough colors for all categories
    while (colorPalette.length < categories.length) {
      colorPalette.push(...colorPalette);
    }

    // Check if there's enough data to render the plot
    let hasEnoughData = false;
    for (const values of numericValues) {
      if (values.length >= 5) { // Minimum points needed for a reasonable density plot
        hasEnoughData = true;
        break;
      }
    }

    if (!hasEnoughData) {
      chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">Insufficient data for density plots. Need at least 5 points per category.</div>';
      return;
    }

    // Create traces for each category
    const traces: Plotly.Data[] = [];
    
    // Find overall min/max for x-axis scaling
    let allNumericValues: number[] = [];
    numericValues.forEach(values => {
      allNumericValues = allNumericValues.concat(values.filter(v => !isNaN(v) && v !== null));
    });
    
    if (allNumericValues.length === 0) {
      chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">No valid numeric data to display.</div>';
      return;
    }
    
    const minValue = Math.min(...allNumericValues);
    const maxValue = Math.max(...allNumericValues);
    const range = maxValue - minValue;
    
    // Add some padding to the range
    const xmin = minValue - range * 0.05;
    const xmax = maxValue + range * 0.05;

    // Generate KDE for each category
    categories.forEach((category, index) => {
      const values = numericValues[index].filter(v => !isNaN(v) && v !== null);
      
      if (values.length < 5) {
        // Skip categories with too few points
        return;
      }
      
      // Generate a KDE representation using a histogram with density normalization
      const trace: Plotly.Data = {
        x: values,
        type: 'histogram',
        histnorm: 'probability density',
        name: category.toString(),
        marker: {
          color: colorPalette[index % colorPalette.length],
          line: {
            color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            width: 0.5
          }
        },
        opacity: 0.7,
        xbins: {
          // Automatically determine appropriate bin size
          size: range / Math.min(30, Math.sqrt(values.length))
        },
        hovertemplate: `${categoricalColumnName}: ${category}<br>${numericColumnName}: %{x}<br>Density: %{y}<extra></extra>`
      };
      
      traces.push(trace);
    });

    if (traces.length === 0) {
      chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">No valid data to display density plots.</div>';
      return;
    }

    // Create layout
    const layout: Partial<Plotly.Layout> = {
      title: {
        text: `Density Plot by ${categoricalColumnName}: ${numericColumnName}`,
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
          text: numericColumnName,
          font: {
            family: 'monospace',
            size: 12
          }
        },
        range: [xmin, xmax],
        gridcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        zerolinecolor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        tickfont: {
          family: 'monospace',
          size: 10
        }
      },
      yaxis: {
        title: {
          text: 'Density',
          font: {
            family: 'monospace',
            size: 12
          }
        },
        gridcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        zerolinecolor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        tickfont: {
          family: 'monospace',
          size: 10
        }
      },
      barmode: 'overlay',
      paper_bgcolor,
      plot_bgcolor,
      margin: {
        l: 60,
        r: 20,
        t: 40,
        b: 60
      },
      height: 450,
      width: chartDiv.offsetWidth,
      autosize: false,
      showlegend: true,
      legend: {
        x: 1,
        xanchor: 'right',
        y: 1,
        bgcolor: isDark ? 'rgba(39, 39, 42, 0.7)' : 'rgba(249, 250, 251, 0.7)',
        bordercolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderwidth: 1,
        font: {
          family: 'monospace',
          size: 10,
          color: textColor
        }
      },
      hovermode: 'closest'
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
        console.error('Error rendering density plot:', err);
        if (chartDiv) {
          chartDiv.innerHTML = '<div class="p-4 text-red-500 font-mono text-sm">Error rendering density plot</div>';
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
          console.error('Error cleaning up density plot:', err);
        }
      }
    };
  }, [categories, numericValues, categoricalColumnName, numericColumnName, isDark]);

  return (
    <div className="w-full">
      <div
        ref={chartContainerRef}
        className="w-full h-[450px] min-h-[300px]"
        data-testid="category-density-plot"
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-pulse text-zinc-400 font-mono text-sm">Loading visualization...</div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDensityPlot;