import { FunctionComponent, useCallback, useEffect, useRef, useMemo } from 'react';
import { DataFrame } from 'danfojs';
import Plotly from 'plotly.js-dist-min';
import useTheme from '../../hooks/useTheme';

interface NullValuesHeatmapProps {
  dataFrame: DataFrame | null;
}

const NullValuesHeatmap: FunctionComponent<NullValuesHeatmapProps> = ({ 
  dataFrame
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const generateHeatmapData = useCallback(() => {
    if (!dataFrame || dataFrame.isEmpty || !dataFrame.shape || dataFrame.shape[0] === 0) {
      return null;
    }
    
    try {
      const totalNulls = dataFrame.isNa().sum().sum();
      
      if (totalNulls === 0) {
        return null;
      }
      
      const rawMatrix = dataFrame.isNa().applyMap((x: boolean) => x ? 1 : 0).values as number[][];
      
      const [totalRows, totalCols] = dataFrame.shape;
      const columnNames = dataFrame.columns;
      
      // Create row labels (1, 2, 3, ...) for hover information
      const rowLabels = Array.from({ length: totalRows }, (_, i) => (i + 1).toString());
      
      return {
        z: rawMatrix,
        x: columnNames,
        y: rowLabels, // Include row labels for hover information
        columnCount: totalCols,
        rowCount: totalRows
      };
    } catch (error) {
      console.error("Error generating heatmap data:", error);
      return null;
    }
  }, [dataFrame]);
  
  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }
    
    const chartDiv = chartContainerRef.current;

    const heatmapData = generateHeatmapData();
    if (!heatmapData) {
      chartDiv.innerHTML = '';
      return;
    }
    chartDiv.innerHTML = '';
    
    // Use the same explicit background colors as in BarChart
    const textColor = isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)';
    const paper_bgcolor = isDark ? '#27272a' : '#f9fafb'; // zinc-800 for dark, gray-50 for light
    const plot_bgcolor = isDark ? '#27272a' : '#f9fafb';
    
    const dataPresent = isDark ? '#272727' : '#f8f8f8';
    const dataAbsent = isDark ? '#f8f8f8':'#353935' ;
    
    const data: Plotly.Data[] = [
      {
        z: heatmapData.z,
        x: heatmapData.x,
        y: heatmapData.y,
        type: 'heatmap',
        colorscale: [
          [0, dataPresent],
          [1, dataAbsent]
        ],
        showscale: false,
        hovertemplate: 'Row - %{y}<br>Column - %{x}<br><extra></extra>',
        name: 'Data Matrix'
      },
      {
        x: [null],
        y: [null],
        type: 'scatter',
        mode: 'markers',
        marker: {
          color: dataPresent,
          size: 10,
          symbol: 'square',
          line: {
            color: 'rgba(0,0,0,0.3)',
            width: 1
          }
        },
        name: 'Data present',
        showlegend: true
      },
      {
        x: [null],
        y: [null],
        type: 'scatter',
        mode: 'markers',
        marker: {
          color: dataAbsent,
          size: 10,
          symbol: 'square'
        },
        name: 'Null values',
        showlegend: true
      }
    ];
    
    const margin = {
      l: 0,
      r: 10,
      t: 10,
      b: 100
    };
    
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
        },
        showgrid: false,
      },
      yaxis: {
        showticklabels: false,
        title: '',
        showgrid: false,
        zeroline: false,
        showline: false,
        ticks: ''
      },
      paper_bgcolor,
      plot_bgcolor,
      margin,
      height: 400,
      width: chartContainerRef.current.offsetWidth,
      showlegend: true,
      legend: {
        x: 1,
        xanchor: 'right',
        y: 1,
        font: {
          family: 'monospace',
          size: 10
        },
        bgcolor: isDark ? 'rgba(39, 39, 42, 0.7)' : 'rgba(249, 250, 251, 0.7)', // Semi-transparent background matching theme
        bordercolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderwidth: 0,
      }
    };
    
    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: false
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
    
    
    return () => {
      clearTimeout(timer);
      
      // Remove resize event listener
      window.removeEventListener('resize', handleResize);
      if (chartDiv) {
        try {
          Plotly.purge(chartDiv);
        } catch (err) {
          console.error('Error cleaning up heatmap:', err);
        }
      }
    };
  }, [generateHeatmapData, isDark]);
  
  const hasNullValues = useMemo(() => {
    if (!dataFrame || dataFrame.isEmpty) return false;
    
    try {
      const totalNulls = dataFrame.isNa().sum().sum();
      return totalNulls > 0;
    } catch (error) {
      console.error("Error checking null values:", error);
      return false;
    }
  }, [dataFrame]);
  
  if (!hasNullValues) {
    return null;
  }
  
  if (!dataFrame || dataFrame.isEmpty) {
    return (
      <div className="w-full p-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm text-center">
        No data available for null values visualization
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <div ref={chartContainerRef} className="w-full" style={{ height: '400px', minHeight: '200px' }}>
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-pulse text-zinc-400 font-mono text-sm">Loading visualization...</div>
        </div>
      </div>
    </div>
  );
};

export default NullValuesHeatmap;