import { FunctionComponent, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { Button } from '../Button';
import { NumericStats, BooleanStats, CategoricalStats } from '../../hooks/useColumnStats';

import Plotly from 'plotly.js-dist-min';

// Chart Modal Component
const ChartModal: FunctionComponent<{
  isOpen: boolean;
  onClose: () => void;
  stats: NumericStats | CategoricalStats | BooleanStats;
  selectedColumn: string | null;
  dataValues: Array<string | number | boolean | null | undefined>;
}> = ({ isOpen, onClose, stats, selectedColumn, dataValues }) => {
  const chartRef = useCallback((node: HTMLDivElement) => {
    if (node !== null && stats) {
      // Clear previous chart
      node.innerHTML = '';
      
      // Create the appropriate chart based on data type
      if (stats.numeric) {
        // For numeric data, create a histogram
        const { mean, median } = stats as NumericStats;
        
        // Filter and convert to valid Plotly data type (numbers only)
        const validValues = dataValues
          .filter((val) => 
            val !== null && val !== undefined && !isNaN(Number(val))
          )
          .map(val => Number(val)); // Convert all to numbers for Plotly
        
        // Fix type errors by using the correct literal types for xref and yref
        const layout: Partial<Plotly.Layout> = {
          title: `Distribution of ${selectedColumn || 'Data'}`,
          xaxis: { title: selectedColumn || 'Value' },
          yaxis: { title: 'Frequency' },
          annotations: [
            {
              x: mean,
              y: 0,
              xref: 'x', // No type assertion needed - already a literal
              yref: 'paper', // No type assertion needed - already a literal
              text: `Mean: ${Number(mean).toFixed(2)}`,
              showarrow: true,
              arrowhead: 2,
              arrowcolor: '#ff0000',
              ax: 0,
              ay: -40
            },
            {
              x: median,
              y: 0.1,
              xref: 'x', // No type assertion needed - already a literal
              yref: 'paper', // No type assertion needed - already a literal
              text: `Median: ${Number(median).toFixed(2)}`,
              showarrow: true,
              arrowhead: 2,
              arrowcolor: '#00ff00',
              ax: 0,
              ay: -60
            }
          ]
        };
        
        Plotly.newPlot(node, [{
          x: validValues,
          type: 'histogram',
          marker: {
            color: 'rgba(75, 192, 192, 0.7)',
            line: {
              color: 'rgba(75, 192, 192, 1)',
              width: 1
            }
          }
        }], layout);
        
      } else if (stats.categorical || stats.boolean) {
        // For categorical/boolean data, create a bar chart
        const frequencies = (stats as CategoricalStats | BooleanStats).frequencies;
        
        // Extract values and counts
        const values = frequencies.map(f => String(f[0]));
        const counts = frequencies.map(f => Number(f[1]));
        
        const layout: Partial<Plotly.Layout> = {
          title: `Frequency Distribution of ${selectedColumn || 'Data'}`,
          xaxis: { title: selectedColumn || 'Value' },
          yaxis: { title: 'Frequency' },
          margin: { l: 50, r: 30, b: 80, t: 50, pad: 4 },
          autosize: true,
        };
        
        Plotly.newPlot(node, [{
          x: values,
          y: counts,
          type: 'bar',
          marker: {
            color: 'rgba(54, 162, 235, 0.7)',
            line: {
              color: 'rgba(54, 162, 235, 1)',
              width: 1
            }
          }
        }], layout);
      }
    }
  }, [stats, selectedColumn, dataValues]);
  
  if (!isOpen) return null;
  
  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-700">
          <h3 className="font-['Montserrat'] font-semibold text-lg">
            {selectedColumn} Visualization
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="p-4 flex-grow overflow-auto">
          <div ref={chartRef} className="w-full h-[500px]"></div>
        </div>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-end">
          <Button onClick={onClose} variant="primary">Close</Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ChartModal;