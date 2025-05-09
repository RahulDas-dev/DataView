import { FunctionComponent, ReactElement, useEffect, useMemo, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '../../hooks/useTheme';
import { getChartColors, getPlotlyConfig, getBaseLayout } from './PlotConfigs';

interface HeatmapPlotProps {
  firstColumnName: string;
  secondColumnName: string;
  firstValues: string[];
  secondValues: string[];
}

/**
 * Heatmap plot for visualizing relationships between two categorical variables
 * Used in BivariateStats for categorical-categorical relationships
 * Different from NullValuesHeatmap which shows patterns of null values in the dataset
 */
const HeatmapPlot: FunctionComponent<HeatmapPlotProps> = ({
  firstColumnName,
  secondColumnName,
  firstValues,
  secondValues
}): ReactElement => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  
  // Process the data to create a contingency table
  const { uniqueFirstValues, uniqueSecondValues, zValues } = useMemo(() => {
    if (!firstValues.length || !secondValues.length) {
      return { uniqueFirstValues: [], uniqueSecondValues: [], zValues: [[]] };
    }

    // Get unique values for both columns
    const uniqueFirst = Array.from(new Set(firstValues)).sort();
    const uniqueSecond = Array.from(new Set(secondValues)).sort();
    
    // Create a map for counting occurrences
    const countMap: Record<string, Record<string, number>> = {};
    
    // Initialize the count map
    for (const val1 of uniqueFirst) {
      countMap[val1] = {};
      for (const val2 of uniqueSecond) {
        countMap[val1][val2] = 0;
      }
    }
    
    // Count co-occurrences
    for (let i = 0; i < firstValues.length; i++) {
      const val1 = firstValues[i];
      const val2 = secondValues[i];
      
      if (val1 && val2) { // Skip nulls
        countMap[val1][val2] = (countMap[val1][val2] || 0) + 1;
      }
    }
    
    // Create z values matrix for the heatmap
    const zValues = uniqueFirst.map(val1 => 
      uniqueSecond.map(val2 => countMap[val1][val2])
    );
    
    return {
      uniqueFirstValues: uniqueFirst,
      uniqueSecondValues: uniqueSecond,
      zValues
    };
  }, [firstValues, secondValues]);

  // Calculate percentages for text values
  const textValues = useMemo(() => {
    if (!zValues.length || !zValues[0].length) return [[]];
    
    // Get total count
    const total = zValues.flat().reduce((sum, val) => sum + val, 0);
    
    // Create percentage text values
    return zValues.map(row => 
      row.map(val => {
        const percent = (val / total * 100).toFixed(1);
        return `${val} (${percent}%)`;
      })
    );
  }, [zValues]);

  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }

    // Store the current value of the ref in a variable to use in cleanup
    const chartDiv = chartContainerRef.current;

    // Clear previous chart
    chartDiv.innerHTML = '';

    if (uniqueFirstValues.length === 0 || uniqueSecondValues.length === 0) {
      chartDiv.innerHTML = '<div class="w-full h-full flex items-center justify-center text-zinc-500 dark:text-zinc-400">Not enough categorical data to display a heatmap</div>';
      return;
    }

    // Get theme colors
    const colors = getChartColors(isDark);

    // Create heatmap trace
    const heatmapTrace: Plotly.Data = {
      type: 'heatmap',
      z: zValues,
      x: uniqueSecondValues,
      y: uniqueFirstValues,
      colorscale: 'Viridis',
      text: textValues.flat(),
      hoverinfo: 'text',
      showscale: true,
      colorbar: {
        title: 'Count',
        titleside: 'right',
        titlefont: {
          family: 'monospace',
          size: 10,
          color: colors.textColor,
          shadow: 'rgba(0, 0, 0, 0.5)',
          weight: 2
        },
        tickfont: {
          family: 'monospace',
          size: 10,
          color: colors.textColor,
          shadow: 'rgba(0, 0, 0, 0.5)',
          weight: 2
        }
      }
    };

    // Create base layout using the shared config function
    const baseLayout = getBaseLayout(
      isDark, 
      chartDiv.offsetWidth, 
      secondColumnName, 
      firstColumnName
    );

    // Extend the base layout with heatmap-specific settings
    const layout: Partial<Plotly.Layout> = {
      ...baseLayout,
      margin: { l: 100, r: 50, b: 100, t: 50, pad: 4 },
      title: {
        text: `Relationship between ${firstColumnName} and ${secondColumnName}`,
        font: {
          family: 'monospace',
          size: 14,
          color: colors.textColor
        }
      }
    };

    // Get standard Plotly config with customized filename
    const config = getPlotlyConfig(`heatmap_${firstColumnName}_${secondColumnName}`);

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
          Plotly.newPlot(chartDiv, [heatmapTrace], layout, config);
          window.addEventListener('resize', handleResize);
        }
      } catch (err) {
        console.error('Error rendering heatmap plot:', err);
        if (chartDiv) {
          chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">Error rendering heatmap plot</div>';
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
          console.error('Error cleaning up heatmap plot:', err);
        }
      }
    };
  }, [uniqueFirstValues, uniqueSecondValues, zValues, textValues, firstColumnName, secondColumnName, isDark]);

  return (
    <div className="w-full h-[400px] bg-white dark:bg-zinc-800 rounded-md">
      <div
        ref={chartContainerRef}
        className="w-full h-full"
        data-testid="heatmap-plot"
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-pulse text-zinc-400 font-mono text-sm">Loading visualization...</div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapPlot;