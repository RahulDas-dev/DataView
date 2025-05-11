import { FunctionComponent, useRef, useEffect, useMemo } from 'react';
import Plotly from 'plotly.js-dist-min';
import { getBaseLayout, getPlotlyConfig } from './PlotConfigs';
import { useData } from '../../hooks/useData';
import useTheme from '../../hooks/useTheme';
import { computePearsonCorrelation } from '../../utility/plotUtils';


const PearSonCorrelationMatrix: FunctionComponent = () => {
  const correlationMapRef = useRef<HTMLDivElement>(null);
  const { dataFrame } = useData();  
  const { isDark } = useTheme();

  const correlationMatrix = useMemo(() => {
  if (!dataFrame || dataFrame.isEmpty || dataFrame.shape[0]==0 ) return null;
  
  const matrix = computePearsonCorrelation(dataFrame);
  return matrix;
}, [dataFrame]);

  // Create correlation heatmap
  useEffect(() => {
    if (!correlationMatrix || !correlationMapRef.current) return;
    
    const chartDiv = correlationMapRef.current;
    chartDiv.innerHTML = '';
    
    // Extract data for the heatmap
    const colNames = Object.keys(correlationMatrix);
    const zValues: number[][] = [];
    
    colNames.forEach(row => {
      const rowValues: number[] = [];
      colNames.forEach(col => {
        rowValues.push(correlationMatrix[row][col]);
      });
      zValues.push(rowValues);
    });
    
    // Create the heatmap trace
    const heatmapTrace: Plotly.Data = {
      type: 'heatmap',
      z: zValues,
      x: colNames,
      y: colNames,
      colorscale: [
        [0, isDark ? 'rgb(59, 130, 246)' : 'rgb(59, 130, 246)'],   // Strong negative correlation (blue)
        [0.5, isDark ? 'rgb(39, 39, 42)' : 'rgb(241, 245, 249)'],  // No correlation (neutral)
        [1, isDark ? 'rgb(239, 68, 68)' : 'rgb(239, 68, 68)']      // Strong positive correlation (red)
        
      ],
      zmin: -1,
      zmax: 1,
      hoverongaps: false,
      colorbar: {
        title: 'Correlation',
        titlefont: {
          family: 'Montserrat, sans-serif',
          size: 14,
          color: isDark ? 'rgba(244, 244, 245, 0.9)' : 'rgba(63, 63, 70, 0.9)',
          weight: 5,  // Add required property
          shadow: ''   // Add required property
        },
        tickfont: {
            family: 'monospace',
            size: 11,
            color: isDark ? 'rgba(212, 212, 216, 0.9)' : 'rgba(63, 63, 70, 0.9)',
            weight: 5,  // Add required property
            shadow: ''   // Add required property
        }
      },
      text: zValues.map(row => row.map(val => isNaN(val) ? 'NA' : val.toFixed(4))) as unknown as string[], 
      texttemplate: '%{text}',
      textfont: {
        family: 'monospace',
        size: 11,
        color: isDark ? 'rgba(244, 244, 245, 0.9)' : 'rgba(24, 24, 27, 0.9)'
      }
    };
    
    // Create layout
    const layout: Partial<Plotly.Layout> = {
      ...getBaseLayout(isDark, chartDiv.offsetWidth, 'Correlation Matrix', ''),
      height: Math.max(500, 50 * colNames.length),
      xaxis: {
        tickangle: -45,
        tickfont: {
          family: 'monospace',
          size: 11,
          color: isDark ? 'rgba(212, 212, 216, 0.9)' : 'rgba(63, 63, 70, 0.9)'
        }
      },
      yaxis: {
        tickfont: {
          family: 'monospace',
          size: 11,
          color: isDark ? 'rgba(212, 212, 216, 0.9)' : 'rgba(63, 63, 70, 0.9)'
        }
      }
    };
    
    // Get config with customized filename
    const config = getPlotlyConfig(`correlation_matrix`);

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
                Plotly.newPlot(chartDiv, [heatmapTrace], layout, config);
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
                console.error('Error cleaning up pie chart:', err);
            }
        }
    };
  }, [correlationMatrix, isDark]);

  return (
    <div className='w-full'>
      <div ref={correlationMapRef} className="w-full h-[500px] min-h-[200px]" >
        <div className="h-full w-full flex items-center justify-center">
            <div className="animate-pulse text-zinc-400 font-mono text-sm">Loading visualization...</div>
        </div>
      </div>
    </div>
  );
};

export default PearSonCorrelationMatrix