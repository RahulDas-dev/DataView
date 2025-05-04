import { FunctionComponent, ReactElement, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { countBy } from 'lodash';

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

  return (
    <div className="w-full h-[400px] bg-white dark:bg-zinc-800 rounded-md">
      {uniqueFirstValues.length > 0 && uniqueSecondValues.length > 0 ? (
        <Plot
          data={[
            {
              type: 'heatmap',
              z: zValues,
              x: uniqueSecondValues,
              y: uniqueFirstValues,
              colorscale: 'Viridis',
              text: textValues,
              hoverinfo: 'text',
              showscale: true,
              colorbar: {
                title: 'Count',
                titleside: 'right'
              }
            }
          ]}
          layout={{
            autosize: true,
            margin: { l: 100, r: 50, b: 100, t: 50, pad: 4 },
            title: {
              text: `Relationship between ${firstColumnName} and ${secondColumnName}`,
              font: {
                family: 'Montserrat, sans-serif',
                size: 16
              }
            },
            xaxis: {
              title: secondColumnName,
              titlefont: {
                family: 'Montserrat, sans-serif',
                size: 14
              }
            },
            yaxis: {
              title: firstColumnName,
              titlefont: {
                family: 'Montserrat, sans-serif',
                size: 14
              }
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: {
              color: document.documentElement.classList.contains('dark') ? '#e4e4e7' : '#27272a'
            }
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
          config={{ responsive: true }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-500 dark:text-zinc-400">
          Not enough categorical data to display a heatmap
        </div>
      )}
    </div>
  );
};

export default HeatmapPlot;