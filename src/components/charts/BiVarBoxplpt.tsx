import { FunctionComponent, useEffect, useState, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '../../hooks/useTheme';
import { DataFrame } from 'danfojs';
import { getChartColors, getPlotlyConfig, getBaseLayout } from './PlotConfigs';

interface BiVariateBoxplotProps {
  categoricalColumnName: string;
  numericColumnName: string;
  dataFrame: DataFrame | null;
  notched?: boolean;  // Whether to use notched boxplots (confidence intervals on median)
  showPoints?: 'all' | 'outliers' | 'none';  // Control how points are displayed
}

/**
 * A component that renders boxplots grouped by categories, showing
 * the distribution of a numeric variable across different categories.
 */
const BiVariateBoxplot: FunctionComponent<BiVariateBoxplotProps> = ({
  categoricalColumnName,
  numericColumnName,
  dataFrame,
  notched = false,
  showPoints = 'outliers'
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  
  // Create state variables
  const [categories, setCategories] = useState<Array<string | number>>([]);
  const [numericValues, setNumericValues] = useState<Record<string | number, number[]>>({});
  const [hasEnoughData, setHasEnoughData] = useState(false);
  
  // First useEffect to populate categories and numericValues
  useEffect(() => {
    if (!dataFrame || dataFrame.isEmpty || !dataFrame.shape || dataFrame.shape[0] === 0) {
      setCategories([]);
      setNumericValues({});
      setHasEnoughData(false);
      return;
    }
    
    // Extract unique categories
    try {
      const uniqueCategories = dataFrame[categoricalColumnName].unique();
      const categoryValues = uniqueCategories ? uniqueCategories.values : [];
      setCategories(categoryValues);
      
      // Process data for each category
      const valuesByCategory: Record<string | number, number[]> = {};
      let foundEnoughData = false;
      
      for (const category of categoryValues) {
        try {
          // Filter dataFrame for current category
          const rowidx = dataFrame[categoricalColumnName].eq(category);
          const filteredDf = dataFrame.iloc({rows: rowidx});
          
          if (filteredDf && filteredDf.shape[0] >= 5) {
            // Extract numeric values for this category
            const values = filteredDf[numericColumnName].dropNa().values || [];
            // Filter out invalid values and convert to numbers
            
              
            if (values.length >= 5) {
              valuesByCategory[category] = values;
              foundEnoughData = true;
            }
          }
        } catch (err) {
          console.error(`Error processing data for category: ${category}`, err);
        }
      }
      
      setNumericValues(valuesByCategory);
      setHasEnoughData(foundEnoughData);
    } catch (err) {
      console.error("Error extracting categories:", err);
      setCategories([]);
      setNumericValues({});
      setHasEnoughData(false);
    }
  }, [dataFrame, categoricalColumnName, numericColumnName]);
  
  // Main rendering useEffect
  useEffect(() => {
    if (!chartContainerRef.current || !hasEnoughData || categories.length === 0) {
      return;
    }

    // Store the current value of the ref in a variable to use in cleanup
    const chartDiv = chartContainerRef.current;

    // Clear previous chart
    chartDiv.innerHTML = '';

    // Get theme-based colors
    const colors = getChartColors(isDark);
    
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

    // Create traces for each category
    const traces: Plotly.Data[] = [];
    
    // Find overall min/max for y-axis scaling
    let allNumericValues: number[] = [];
    Object.values(numericValues).forEach(values => {
      allNumericValues = allNumericValues.concat(values);
    });
    
    if (allNumericValues.length === 0) {
      chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">No valid numeric data to display.</div>';
      return;
    }
    
    const minValue = Math.min(...allNumericValues);
    const maxValue = Math.max(...allNumericValues);
    const range = maxValue - minValue;
    
    // Add some padding to the range
    const ymin = minValue - range * 0.05;
    const ymax = maxValue + range * 0.05;

    // Determine how points should be rendered
    let pointsConfiguration: boolean | 'all' | 'outliers' | 'suspectedoutliers' | 'false';
    switch(showPoints) {
      case 'all': 
        pointsConfiguration = 'all'; 
        break;
      case 'outliers': 
        pointsConfiguration = 'outliers'; 
        break;
      case 'none': 
        pointsConfiguration = false; 
        break;
      default: 
        pointsConfiguration = 'outliers';
    }

    // Generate boxplot for each category
    let categoryIndex = 0;
    for (const category of categories) {
      const values = numericValues[category];
      
      if (!values || values.length < 5) {
        // Skip categories with too few points
        continue;
      }
      
      // Create a boxplot trace
      const trace = {
        type: 'box',
        y: values,
        name: category.toString(),
        boxmean: true, // Show mean as a dashed line
        notched: notched, // Show confidence interval for median if true
        marker: {
          color: colorPalette[categoryIndex % colorPalette.length],
          outliercolor: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
          line: {
            width: 1,
            color: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
          }
        },
        boxpoints: pointsConfiguration,
        jitter: 0.3,
        pointpos: 0,
        orientation: 'v',
        hoverinfo: 'y+name',
        hovertemplate: `${categoricalColumnName}: ${category}<br>${numericColumnName}: %{y}<extra></extra>`
      } as Plotly.Data;
              
      
      traces.push(trace);
      categoryIndex++;
    }

    if (traces.length === 0) {
      chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">No valid data to display boxplots.</div>';
      return;
    }

    // Get base layout from utility function
    const baseLayout = getBaseLayout(
      isDark,
      chartDiv.offsetWidth,
      categoricalColumnName,
      numericColumnName
    );
    
    // Create layout with component-specific customizations
    const layout: Partial<Plotly.Layout> = {
      ...baseLayout,
      title: {
        text: `Boxplot of ${numericColumnName} by ${categoricalColumnName}`,
        font: {
          family: "'Montserrat', sans-serif",
          size: 16
        },
        x: 0.05,
        xanchor: 'left'
      },
      yaxis: {
        ...baseLayout.yaxis,
        range: [ymin, ymax],
        title: {
          text: numericColumnName,
          font: {
            family: 'monospace',
            size: 12
          }
        }
      },
      xaxis: {
        ...baseLayout.xaxis,
        title: {
          text: categoricalColumnName,
          font: {
            family: 'monospace',
            size: 12
          }
        }
      },
      boxmode: 'group',
      height: 450,
      margin: {
        l: 60,
        r: 20,
        t: 40,
        b: 60
      },
      legend: {
        ...baseLayout.legend,
        x: 1,
        xanchor: 'right',
        y: 1,
        bgcolor: colors.legendBackground,
        bordercolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderwidth: 1,
      },
    };

    // Get standard Plotly config
    const config = getPlotlyConfig(`boxplot_${categoricalColumnName}_${numericColumnName}`);

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
        console.error('Error rendering boxplot:', err);
        if (chartDiv) {
          chartDiv.innerHTML = '<div class="p-4 text-red-500 font-mono text-sm">Error rendering boxplot</div>';
        }
      }
    }, 50);
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      if (chartDiv) {
        try {
          Plotly.purge(chartDiv);
        } catch (err) {
          console.error('Error cleaning up boxplot:', err);
        }
      }
    };
  }, [categories, numericValues, hasEnoughData, categoricalColumnName, numericColumnName, isDark, notched, showPoints]);

  return (
    <div className="w-full">
      <div
        ref={chartContainerRef}
        className="w-full h-[450px] min-h-[300px]"
        data-testid="bivariate-boxplot"
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-pulse text-zinc-400 font-mono text-sm">
            {categories.length > 0 && !hasEnoughData
              ? "Insufficient data for boxplots. Need at least 5 points per category."
              : "Loading visualization..."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiVariateBoxplot;