import { FunctionComponent, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '../../hooks/useTheme';
import { getChartColors, getPlotlyConfig, getBaseLayout } from './PlotConfigs';
import { useData } from '../../hooks/useData';
import { Series } from 'danfojs';

interface CountPlotProps {
  columnName: string| null;
  maxCategories?: number; // Maximum number of categories to display
}

/**
 * A component that renders a Count Plot (Bar Chart) for categorical data visualization.
 * Shows the frequency of each category in the data.
 */
const CountPlot: FunctionComponent<CountPlotProps> = ({
  columnName,
  maxCategories = 30 // Default to showing top 20 categories
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const { dataFrame } = useData();

  useEffect(() => {
    if (!chartContainerRef.current || !dataFrame|| dataFrame.isEmpty || dataFrame.shape[0]==0 ||!columnName) {
      return;
    }

    // Store the current value of the ref in a variable to use in cleanup
    const chartDiv = chartContainerRef.current;

    // Clear previous chart
    chartDiv.innerHTML = '';

    // Get theme colors
    const colors = getChartColors(isDark);

    // Filter out null or NaN values for valid calculations
    const cleanDf: Series = dataFrame[columnName].dropNa()
    // Filter out null or NaN values for valid calculations
    const validValues = cleanDf.values as (number| string| boolean) [];
        
    if (validValues.length === 0) {
      chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">No valid categorical data to display</div>';
      return;
    }
    const valueCounts = cleanDf.valueCounts().sortValues({ ascending: false });

    // Convert to Record<string, number>
    const frequencyMap: Record<string, number> = {};
    const categories = valueCounts.index.map((x:string| number| symbol)=> String(x)) as string[];
    const counts = valueCounts.values as number[];

    // Combine into a single object
    const totalcategories = Math.min(categories.length, maxCategories);
    for (let i = 0; i < totalcategories; i++) {
      frequencyMap[categories[i]] = counts[i];
    }
    // Convert to array and sort by frequency (descending)
    
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
        b: categories.length > 10 ? 120 : 80 // Adjust bottom margin based on number of categories
      },
      bargap: 0.2,
      showlegend: false,
      //height:500
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
  }, [dataFrame, columnName, maxCategories, isDark]);

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