import { FunctionComponent, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '../../hooks/useTheme';
import { getChartColors, getPlotlyConfig, getBaseLayout } from './PlotConfigs';
import { Series } from 'danfojs';
import { computeKDE } from '../../utility/plotUtils';
import { useData } from '../../hooks/useData';

interface HistogramPlotProps {
  columnName: string| null;
  bandwidth?: number | 'silverman' | 'scott'; 
  binCount?: number; // Optional: size of the bins for the histogram
}

/**
 * A component that renders a histogram with a KDE (Kernel Density Estimation) overlay
 * for numerical data visualization.
 */
const HistogramPlot: FunctionComponent<HistogramPlotProps> = ({
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
    chartDiv.innerHTML = '';
    const cleanDf: Series = dataFrame[columnName].dropNa()
    const colors = getChartColors(isDark);

    // Filter out null or NaN values for valid calculations
    const histValues = cleanDf.values as number[];
    if (histValues.length === 0) {
      chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">No valid numerical data to display</div>';
      return;
    }

    // Compute min and max for consistent bin ranges
    const minValue = cleanDf.min() as number;
    const maxValue = cleanDf.max() as number;
    // Create histogram trace
    const binCount_ = Math.min(Math.ceil(Math.sqrt(cleanDf.values.length)), binCount);
    const binSize = (maxValue - minValue) / binCount_;
    const histogramTrace: Plotly.Data = {
      x: histValues,
      type: 'histogram',
      name: 'Histogram',
      opacity: 0.7,
      autobinx: false,
      xbins: {
        start: minValue - binSize / 2,
        end: maxValue + binSize / 2,
        size: binSize
      },
      marker: {
        color: colors.histogramColor
      },
      hovertemplate: 'Range: %{x}<br>Count: %{y}<extra></extra>'
    };

    
    const kde = computeKDE( histValues, bandwidth, minValue, maxValue, false, binCount);
    
    // Create KDE trace
    const kdeTrace: Plotly.Data = {
      x: kde.x,
      y: kde.y,
      type: 'scatter',
      mode: 'lines',
      name: 'Density',
      line: {
        color: colors.kdeColor,
        width: 2
      },
      hovertemplate: 'Value: %{x}<br>Density: %{y}<extra></extra>'
    };

    // Create layout
    const layout = {
      ...getBaseLayout(isDark, chartDiv.offsetWidth, columnName, 'Frequency'),
      barmode: 'overlay' as const ,
      bargap: 0.05
    };

    const config = getPlotlyConfig(`histogram_${columnName}`);

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
          Plotly.newPlot(chartDiv, [histogramTrace, kdeTrace], layout, config);
          window.addEventListener('resize', handleResize);
        }
      } catch (err) {
        console.error('Error rendering histogram plot:', err);
        if (chartDiv) {
          chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">Error rendering histogram plot</div>';
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
          console.error('Error cleaning up histogram plot:', err);
        }
      }
    };
  }, [dataFrame, columnName,bandwidth, isDark]);

  return (
    <div className="w-full">
      <div
        ref={chartContainerRef}
        className="w-full h-[400px] min-h-[200px]"
        data-testid="histogram-plot"
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-pulse text-zinc-400 font-mono text-sm">Loading visualization...</div>
        </div>
      </div>
    </div>
  );
};

export default HistogramPlot;