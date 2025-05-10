import { FunctionComponent, useEffect, useState, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '../../hooks/useTheme';
import { DataFrame } from 'danfojs';
import { getChartColors, getPlotlyConfig, getBaseLayout } from './PlotConfigs';
import { computeKDE } from '../../utility/plotUtils';

interface BiVariateKDEPlotProps {
  categoricalColumnName: string;
  numericColumnName: string;
  dataFrame: DataFrame | null;
  bandwidth?: number | 'silverman' | 'scott'; // Control smoothness of KDE
}

/**
 * A component that renders KDE (Kernel Density Estimation) plots grouped by categories,
 * showing the distribution of a numeric variable for each category with a common x-axis.
 */
const BiVariateKDEPlot: FunctionComponent<BiVariateKDEPlotProps> = ({
  categoricalColumnName,
  numericColumnName,
  dataFrame,
  bandwidth = 'silverman'
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
  
  // Compute KDE for a set of values
  
  
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
    
    // Find overall min/max for x-axis scaling
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
    const xmin = minValue - range * 0.05;
    const xmax = maxValue + range * 0.05;

    // Generate traces for each category
    let categoryIndex = 0;
    for (const category of categories) {
      const values = numericValues[category];
      
      if (!values || values.length < 5) {
        // Skip categories with too few points
        continue;
      }
      
      // Generate KDE points
      const kdeData = computeKDE(values, bandwidth, xmin, xmax);
      
      // Create a line+area plot for KDE visualization
      const trace = {
        type: 'scatter',
        x: kdeData.x,
        y: kdeData.y,
        mode: 'lines',
        name: category.toString(),
        line: {
          color: colorPalette[categoryIndex % colorPalette.length],
          width: 2
        },
        fill: 'tozeroy',
        opacity: 0.3,
        fillcolor: colorPalette[categoryIndex % colorPalette.length].replace('rgb', 'rgba').replace(')', ', 0.7)'),
        hoverinfo: 'x+y+name',
        hovertemplate: `${categoricalColumnName}: ${category}<br>${numericColumnName}: %{x}<br>Density: %{y}<extra></extra>`
      } as Plotly.Data;
      
      traces.push(trace);
      categoryIndex++;
    }

    if (traces.length === 0) {
      chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">No valid data to display KDE plots.</div>';
      return;
    }

    // Get base layout from utility function
    const baseLayout = getBaseLayout(
      isDark,
      chartDiv.offsetWidth,
      numericColumnName,
      'Density'
    );
    
    // Create layout with component-specific customizations
    const layout = {
      ...baseLayout,
      title: {
        text: `KDE Plot by ${categoricalColumnName}: ${numericColumnName}`,
        font: {
          family: "'Montserrat', sans-serif",
          size: 16
        },
        x: 0.05,
        xanchor: 'left'
      },
      xaxis: {
        ...baseLayout.xaxis,
        range: [xmin, xmax],
        showgrid: true,
        gridcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        gridwidth: 1,
        zeroline: true,
        title: {
          text: numericColumnName,
          font: {
            family: 'monospace',
            size: 12
          }
        }
      },
      yaxis: {
        ...baseLayout.yaxis,
        showgrid: true,
        gridcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        gridwidth: 1,
        zeroline: true,
        zerolinecolor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        zerolinewidth: 1,
        title: {
          text: 'Density',
          font: {
            family: 'monospace',
            size: 12
          }
        }
      },
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
    } as Partial<Plotly.Layout>;

    // Get standard Plotly config
    const config = getPlotlyConfig(`kde_${categoricalColumnName}_${numericColumnName}`);

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
        console.error('Error rendering KDE plot:', err);
        if (chartDiv) {
          chartDiv.innerHTML = '<div class="p-4 text-red-500 font-mono text-sm">Error rendering KDE plot</div>';
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
          console.error('Error cleaning up KDE plot:', err);
        }
      }
    };
  }, [categories, numericValues, hasEnoughData, categoricalColumnName, numericColumnName, isDark, bandwidth]);

  return (
    <div className="w-full">
      <div
        ref={chartContainerRef}
        className="w-full h-[450px] min-h-[300px]"
        data-testid="bivariate-kde-plot"
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-pulse text-zinc-400 font-mono text-sm">
            {categories.length > 0 && !hasEnoughData
              ? "Insufficient data for KDE plots. Need at least 5 points per category."
              : "Loading visualization..."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiVariateKDEPlot;