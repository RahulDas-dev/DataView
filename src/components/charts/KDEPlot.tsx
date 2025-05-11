import { FunctionComponent, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '../../hooks/useTheme';
import { getChartColors, getPlotlyConfig, getBaseLayout } from './PlotConfigs';
import { Series } from 'danfojs';
import { computeKDE } from '../../utility/plotUtils';
import { useData } from '../../hooks/useData';

interface KDEPlotProps {
  columnName: string| null;
  bandwidth?: number | 'silverman' | 'scott'; 
  binCount?: number; // Optional: size of the bins for the histogram
}

/**
 * A component that renders a Kernel Density Estimation (KDE) plot
 * for visualizing the probability density of numerical data.
 */
const KDEPlot: FunctionComponent<KDEPlotProps> = ({
  columnName,
  bandwidth = 'silverman',
  binCount = 30
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
    const cleanDf: Series = dataFrame[columnName].dropNa()
    // Filter out null or NaN values for valid calculations
    const validValues = cleanDf.values as number[];

    if (validValues.length === 0) {
      chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">No valid numerical data to display</div>';
      return;
    }

    // Generate KDE (Kernel Density Estimation)
    
    const minValue = cleanDf.min() as number;
    const maxValue = cleanDf.max() as number;
    
    const kde = computeKDE( validValues, bandwidth, minValue, maxValue, true, binCount);
    
    // Create KDE trace
    const kdeTrace: Plotly.Data = {
      x: kde.x,
      y: kde.y,
      type: 'scatter',
      mode: 'lines',
      name: 'Density',
      line: {
        color: colors.kdeColor, // Using shared color
        width: 2.5
      },
      fill: 'tozeroy',
      fillcolor: isDark ? 'rgba(161, 161, 170, 0.2)' : 'rgba(113, 113, 122, 0.2)', // zinc-400/zinc-500 with low opacity
      hovertemplate: 'Value: %{x}<br>Density: %{y}<extra></extra>'
    };

    // Add rug plot (small ticks for each data point) at the bottom
    const rugTrace: Plotly.Data = {
      x: validValues,
      y: Array(validValues.length).fill(0),
      mode: 'markers',
      type: 'scatter',
      marker: {
        symbol: 'line-ns',
        color: colors.kdeColor, // Using shared color
        size: 10,
        opacity: 0.5,
        line: {
          width: 1
        }
      },
      hoverinfo: 'x',
      showlegend: false
    };

    // Get base layout and customize for KDE plot
    const layout: Partial<Plotly.Layout> = {
      ...getBaseLayout(isDark, chartDiv.offsetWidth, columnName, 'Density'),
      yaxis: {
        ...getBaseLayout(isDark, chartDiv.offsetWidth).yaxis,
        title: {
          text: 'Density',
          font: {
            family: 'monospace',
            size: 12
          }
        },
        rangemode: 'tozero'
      },
      showlegend: false,
      hovermode: 'closest'
    };

    // Get standard Plotly config with customized filename
    const config = getPlotlyConfig(`kde_${columnName}`);

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
          Plotly.newPlot(chartDiv, [kdeTrace, rugTrace], layout, config);
          window.addEventListener('resize', handleResize);
        }
      } catch (err) {
        console.error('Error rendering KDE plot:', err);
        if (chartDiv) {
          chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">Error rendering KDE plot</div>';
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
          console.error('Error cleaning up KDE plot:', err);
        }
      }
    };
  }, [dataFrame, columnName, bandwidth,binCount, isDark]);

  return (
    <div className="w-full">
      <div
        ref={chartContainerRef}
        className="w-full h-[400px] min-h-[200px]"
        data-testid="kde-plot"
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-pulse text-zinc-400 font-mono text-sm">Loading visualization...</div>
        </div>
      </div>
    </div>
  );
};

export default KDEPlot;