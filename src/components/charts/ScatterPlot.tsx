import { FunctionComponent, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '../../hooks/useTheme';

interface ScatterPlotProps {
  xColumnName: string;
  yColumnName: string;
  xValues: Array<number>;
  yValues: Array<number>;
}

/**
 * A component that renders a Scatter Plot for visualizing relationships between two numeric variables.
 */
const ScatterPlot: FunctionComponent<ScatterPlotProps> = ({
  xColumnName,
  yColumnName,
  xValues,
  yValues
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (!chartContainerRef.current || !xValues.length || !yValues.length) {
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
    const markerColor = isDark ? 'rgba(124, 58, 237, 0.6)' : 'rgba(124, 58, 237, 0.6)'; // violet-600 with opacity
    const lineColor = isDark ? 'rgba(124, 58, 237, 0.8)' : 'rgba(124, 58, 237, 0.8)'; // violet-600 with opacity

    // Create paired dataset, filtering out nulls or NaNs
    const validPairs = [];
    for (let i = 0; i < Math.min(xValues.length, yValues.length); i++) {
      const x = Number(xValues[i]);
      const y = Number(yValues[i]);
      if (!isNaN(x) && !isNaN(y) && x !== null && y !== null) {
        validPairs.push([x, y]);
      }
    }

    if (validPairs.length === 0) {
      chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">No valid paired numerical data to display</div>';
      return;
    }

    // Extract x and y values from valid pairs
    const validXValues = validPairs.map(p => p[0]);
    const validYValues = validPairs.map(p => p[1]);

    // Create scatter plot trace
    const scatterTrace: Plotly.Data = {
      x: validXValues,
      y: validYValues,
      mode: 'markers',
      type: 'scatter',
      marker: {
        color: markerColor,
        size: 8,
        opacity: 0.7,
        line: {
          color: lineColor,
          width: 1
        }
      },
      hovertemplate: `${xColumnName}: %{x}<br>${yColumnName}: %{y}<extra></extra>`
    };

    // Calculate correlation if possible
    let correlationCoefficient = 0;
    try {
      if (validPairs.length > 1) {
        // Calculate means
        const meanX = validXValues.reduce((a, b) => a + b, 0) / validXValues.length;
        const meanY = validYValues.reduce((a, b) => a + b, 0) / validYValues.length;

        // Calculate correlation coefficient
        let numerator = 0;
        let denominatorX = 0;
        let denominatorY = 0;

        for (let i = 0; i < validXValues.length; i++) {
          const xDiff = validXValues[i] - meanX;
          const yDiff = validYValues[i] - meanY;
          numerator += xDiff * yDiff;
          denominatorX += xDiff * xDiff;
          denominatorY += yDiff * yDiff;
        }

        correlationCoefficient = numerator / (Math.sqrt(denominatorX) * Math.sqrt(denominatorY));
      }
    } catch (err) {
      console.error('Error calculating correlation:', err);
      correlationCoefficient = NaN;
    }

    // Add trend line if correlation is significant
    const traces = [scatterTrace];
    
    if (!isNaN(correlationCoefficient) && Math.abs(correlationCoefficient) > 0.1 && validPairs.length > 5) {
      // Simple linear regression
      const n = validXValues.length;
      const sumX = validXValues.reduce((a, b) => a + b, 0);
      const sumY = validYValues.reduce((a, b) => a + b, 0);
      const sumXY = validXValues.reduce((sum, x, i) => sum + x * validYValues[i], 0);
      const sumXX = validXValues.reduce((sum, x) => sum + x * x, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      // Create x values for trend line
      const minX = Math.min(...validXValues);
      const maxX = Math.max(...validXValues);
      const trendX = [minX, maxX];
      const trendY = trendX.map(x => slope * x + intercept);
      
      const trendTrace: Plotly.Data = {
        x: trendX,
        y: trendY,
        mode: 'lines',
        type: 'scatter',
        line: {
          color: isDark ? 'rgba(239, 68, 68, 0.8)' : 'rgba(220, 38, 38, 0.8)', // red-500/600
          width: 2,
          dash: 'solid'
        },
        hoverinfo: 'none',
        showlegend: false
      };
      
      traces.push(trendTrace);
    }

    // Annotations for correlation coefficient
    const annotations: Partial<Plotly.Annotations>[] = [];
    
    if (!isNaN(correlationCoefficient)) {
      annotations.push({
        x: 0.98,
        y: 0.98,
        xref: 'paper',
        yref: 'paper',
        text: `Correlation: ${correlationCoefficient.toFixed(4)}`,
        showarrow: false,
        font: {
          family: 'monospace',
          size: 12,
          color: textColor
        },
        bgcolor: isDark ? 'rgba(39, 39, 42, 0.7)' : 'rgba(249, 250, 251, 0.7)',
        bordercolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderwidth: 1,
        borderpad: 4,
        align: 'right'
      });
    }

    // Create layout
    const layout: Partial<Plotly.Layout> = {
      title: {
        text: `Scatter Plot: ${xColumnName} vs ${yColumnName}`,
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
          text: xColumnName,
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
      yaxis: {
        title: {
          text: yColumnName,
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
      showlegend: false,
      annotations: annotations
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
        console.error('Error rendering scatter plot:', err);
        if (chartDiv) {
          chartDiv.innerHTML = '<div class="p-4 text-red-500 font-mono text-sm">Error rendering scatter plot</div>';
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
          console.error('Error cleaning up scatter plot:', err);
        }
      }
    };
  }, [xValues, yValues, xColumnName, yColumnName, isDark]);

  return (
    <div className="w-full">
      <div
        ref={chartContainerRef}
        className="w-full h-[450px] min-h-[300px]"
        data-testid="scatter-plot"
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-pulse text-zinc-400 font-mono text-sm">Loading visualization...</div>
        </div>
      </div>
    </div>
  );
};

export default ScatterPlot;