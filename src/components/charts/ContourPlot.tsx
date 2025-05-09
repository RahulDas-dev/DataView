import { FunctionComponent, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '../../hooks/useTheme';

interface ContourPlotProps {
  xColumnName: string;
  yColumnName: string;
  xValues: Array<number>;
  yValues: Array<number>;
}

/**
 * A component that renders a Contour Plot for visualizing 2D density distributions
 * of two numeric variables.
 */
const ContourPlot: FunctionComponent<ContourPlotProps> = ({
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
    const colorscale = [
      [0, isDark ? 'rgba(39, 39, 42, 1)' : 'rgba(255, 255, 255, 1)'],
      [0.1, isDark ? 'rgba(49, 46, 129, 0.5)' : 'rgba(238, 242, 255, 1)'],
      [0.3, isDark ? 'rgba(67, 56, 202, 0.7)' : 'rgba(199, 210, 254, 1)'],
      [0.5, isDark ? 'rgba(79, 70, 229, 0.8)' : 'rgba(165, 180, 252, 1)'],
      [0.7, isDark ? 'rgba(124, 58, 237, 0.9)' : 'rgba(139, 92, 246, 1)'],
      [0.9, isDark ? 'rgba(147, 51, 234, 1)' : 'rgba(124, 58, 237, 1)'],
      [1, isDark ? 'rgba(192, 38, 211, 1)' : 'rgba(107, 33, 168, 1)']
    ];

    // Create paired dataset, filtering out nulls or NaNs
    const validPairs = [];
    for (let i = 0; i < Math.min(xValues.length, yValues.length); i++) {
      const x = Number(xValues[i]);
      const y = Number(yValues[i]);
      if (!isNaN(x) && !isNaN(y) && x !== null && y !== null) {
        validPairs.push([x, y]);
      }
    }

    if (validPairs.length === 0 || validPairs.length < 10) {
      chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">Insufficient data for contour plot. Need at least 10 valid data points.</div>';
      return;
    }

    // Extract x and y values from valid pairs
    const validXValues = validPairs.map(p => p[0]);
    const validYValues = validPairs.map(p => p[1]);

    // Create scatter points for overlay
    const scatterTrace: Plotly.Data = {
      x: validXValues,
      y: validYValues,
      mode: 'markers',
      type: 'scatter',
      marker: {
        color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
        size: 4,
        opacity: 0.5
      },
      hovertemplate: `${xColumnName}: %{x}<br>${yColumnName}: %{y}<extra></extra>`,
      showlegend: false,
      name: 'Data Points'
    };

    // Create contour data
    const contourTrace: Plotly.Data = {
      x: validXValues,
      y: validYValues,
      type: 'histogram2dcontour',
      // colorscale: colorscale,
      contours: {
        showlabels: true,
        labelfont: {
          family: 'monospace',
          color: textColor,
          size: 10
        }
      },
      hoverlabel: {
        bgcolor: isDark ? '#3f3f46' : '#f4f4f5',
        bordercolor: isDark ? '#52525b' : '#d4d4d8',
        font: {
          family: 'monospace',
          size: 12,
          color: textColor
        }
      },
      hovertemplate: 'Density: %{z}<extra></extra>',
      showscale: true,
      colorbar: {
        title: 'Density',
        tickfont: {
          family: 'monospace',
          size: 10,
          color: textColor,
          shadow: 'rgba(0, 0, 0, 0.5)',
          weight: 2
        }
      },
      ncontours: 12,
      reversescale: false,
      showlegend: false,
      name: 'Density'
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
        text: `Contour Plot: ${xColumnName} vs ${yColumnName}`,
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
      annotations: annotations,
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
          Plotly.newPlot(chartDiv, [contourTrace, scatterTrace], layout, config);
          window.addEventListener('resize', handleResize);
        }
      } catch (err) {
        console.error('Error rendering contour plot:', err);
        if (chartDiv) {
          chartDiv.innerHTML = '<div class="p-4 text-red-500 font-mono text-sm">Error rendering contour plot</div>';
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
          console.error('Error cleaning up contour plot:', err);
        }
      }
    };
  }, [xValues, yValues, xColumnName, yColumnName, isDark]);

  return (
    <div className="w-full">
      <div
        ref={chartContainerRef}
        className="w-full h-[450px] min-h-[300px]"
        data-testid="contour-plot"
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-pulse text-zinc-400 font-mono text-sm">Loading visualization...</div>
        </div>
      </div>
    </div>
  );
};

export default ContourPlot;