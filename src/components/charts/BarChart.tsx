import { FunctionComponent, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

interface BarChartProps {
  columnsInfo: Array<{
    name: string;
    dtype: string;
    nullCount: number;
    nullPercentage: number;
  }>;
  darkMode: boolean;
}

const BarChart: FunctionComponent<BarChartProps> = ({ 
  columnsInfo,
  darkMode
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!chartContainerRef.current || !columnsInfo.length) {
      return;
    }
    
    // Clear previous chart
    chartContainerRef.current.innerHTML = '';
    
    // Define chart colors based on theme
    const textColor = darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)';
    const paper_bgcolor = darkMode ? '#27272a' : '#f9fafb'; // zinc-800 for dark, gray-50 for light
    const plot_bgcolor = darkMode ? '#27272a' : '#f9fafb';
    const barColor = '#F08080'; // Red color for consistency with the null values heatmap
    
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
      width: chartContainerRef.current.offsetWidth,
      bargap: 0.2
    };
    
    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: false
    };
    
    try {
      Plotly.newPlot(chartContainerRef.current, data, layout, config);
    } catch (err) {
      console.error('Error rendering bar chart:', err);
      chartContainerRef.current.innerHTML = '<div class="p-4 text-red-500 font-mono text-sm">Error rendering bar chart</div>';
    }
    
    // Cleanup function
    return () => {
      if (chartContainerRef.current) {
        try {
          Plotly.purge(chartContainerRef.current);
        } catch (err) {
          console.error('Error cleaning up bar chart:', err);
        }
      }
    };
  }, [columnsInfo, darkMode]);
  
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

export default BarChart;