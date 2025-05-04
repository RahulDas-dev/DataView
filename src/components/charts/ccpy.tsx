import { FunctionComponent, useCallback, useEffect, useRef, useMemo } from 'react';
import { DataFrame } from 'danfojs';
import Plotly from 'plotly.js-dist-min';

interface NullValuesHeatmapProps {
  dataFrame: DataFrame | null;
  darkMode: boolean;
}

const NullValuesHeatmap: FunctionComponent<NullValuesHeatmapProps> = ({ 
  dataFrame, 
  darkMode
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
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
    
    const heatmapData = generateHeatmapData();
    if (!heatmapData) {
      chartContainerRef.current.innerHTML = '';
      return;
    }
    
    chartContainerRef.current.innerHTML = '';
    
    // Use consistent text color based on theme
    const textColor = darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)';
    
    // Use transparent backgrounds to let the container background color show through
    const paper_bgcolor = 'rgba(0, 0, 0, 0)';  // Transparent
    const plot_bgcolor = 'rgba(0, 0, 0, 0)';   // Transparent
    
    const dataPresent = '#ffffff';
    const dataAbsent = '#F08080';
    
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
        hovertemplate: 'Row: %{y}<br>Column: %{x}<br><extra></extra>',
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
        gridcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
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
        bgcolor: darkMode ? 'rgba(39, 39, 42, 0.7)' : 'rgba(249, 250, 251, 0.7)', // Semi-transparent background matching theme
        bordercolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderwidth: 1,
      }
    };
    
    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: false
    };
    
    try {
      Plotly.newPlot(chartContainerRef.current, data, layout, config);
    } catch (err) {
      console.error('Error rendering heatmap:', err);
      chartContainerRef.current.innerHTML = '<div class="p-4 text-red-500 font-mono text-sm">Error rendering heatmap</div>';
    }
    
    return () => {
      if (chartContainerRef.current) {
        try {
          Plotly.purge(chartContainerRef.current);
        } catch (err) {
          console.error('Error cleaning up heatmap:', err);
        }
      }
    };
  }, [generateHeatmapData, darkMode]);
  
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
      <div 
        ref={chartContainerRef} 
        className="w-full bg-zinc-50 dark:bg-zinc-800 rounded"
        style={{ height: '400px', minHeight: '200px' }}
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-pulse text-zinc-400 font-mono text-sm">Loading visualization...</div>
        </div>
      </div>
    </div>
  );
};

export default NullValuesHeatmap;