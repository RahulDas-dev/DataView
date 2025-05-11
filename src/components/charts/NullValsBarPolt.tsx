import { FunctionComponent, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import useTheme from '../../hooks/useTheme';

interface BarChartProps {
  columnsInfo: Array<{
    name: string;
    dtype: string;
    nullCount: number;
    nullPercentage: number;
  }>;
}

const NullValsBarPolt: FunctionComponent<BarChartProps> = ({ 
  columnsInfo
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  useEffect(() => {
    const chartDiv = chartContainerRef.current;
    if (!chartDiv || !columnsInfo.length) {
      return;
    }
    
    // Clear previous chart
    chartDiv.innerHTML = '';
    
    // Define chart colors based on theme
    const textColor = isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)';
    const paper_bgcolor = isDark ? '#27272a' : '#f9fafb'; // zinc-800 for dark, gray-50 for light
    const plot_bgcolor = isDark ? '#27272a' : '#f9fafb';
    // const barColor = '#F08080'; // Red color for consistency with the null values heatmap
    const barColor = isDark ? '#f8f8f8':'#353935' ;
    
    // Sort columns by null count in descending order
    const sortedColumns = [...columnsInfo].sort((a, b) => b.nullCount - a.nullCount);
    
    // Prepare data for the bar chart
    const columnNames = sortedColumns.map(col => col.name);
    const nullCounts = sortedColumns.map(col => col.nullCount);
    
    // Create bar chart data
    const data: Plotly.Data[] = [{
      x: columnNames,
      y: nullCounts,
      type: 'bar',
      marker: {
        color: barColor
      },
      hovertemplate: '<b>%{x}</b><br>Null Count: %{y}<extra></extra>'
    }];
    
    // Calculate appropriate margins
    const margin = {
      l: 50,  // Space for y-axis labels
      r: 10,
      t: 10,  // Minimal top margin (no title)
      b: 120  // Space for x-axis labels (column names can be long)
    };
    
    // Create layout
    const layout: Partial<Plotly.Layout> = {
      font: {
        family: 'monospace',
        color: textColor
      },
      xaxis: {
        title: '',
        tickangle: -45,
        tickfont: {
          family: 'monospace',
          size: 10
        }
      },
      yaxis: {
        title: 'Null Count',
        titlefont: {
          family: 'monospace',
          size: 12
        },
        tickfont: {
          family: 'monospace',
          size: 10
        }
      },
      paper_bgcolor,
      plot_bgcolor,
      margin,
      height: 400,
      width: chartDiv.offsetWidth,
      bargap: 0.2
    };
    
    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: false
    };

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
          Plotly.newPlot(chartDiv, data, layout, config);
          window.addEventListener('resize', handleResize);
        }
      } catch (err) {
        console.error('Error rendering pie chart:', err);
        if (chartDiv) {
          chartDiv.innerHTML = '<div class="p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">Error rendering pie chart</div>';
        }
      }
    }, 50);
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
      
      // Remove resize event listener
      window.removeEventListener('resize', handleResize);
      if (chartDiv) {
        try {
          Plotly.purge(chartDiv);
        } catch (err) {
          console.error('Error cleaning up bar chart:', err);
        }
      }
    };
  }, [columnsInfo, isDark]);
  
  if (!columnsInfo.length) {
    return null;
  }
  
  return (
    <div className="w-full">
      <div 
        ref={chartContainerRef} 
        className="w-full"
        style={{ height: '400px', minHeight: '200px' }}
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-pulse text-zinc-400 font-mono text-sm">Loading visualization...</div>
        </div>
      </div>
    </div>
  );
};

export default NullValsBarPolt;