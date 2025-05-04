import { FunctionComponent, ReactElement, useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useData } from '../hooks/useData';
import { Button } from './Button';
import { FiDownload, FiPlay, FiPause, FiSkipForward } from 'react-icons/fi';
import TabSelector from './common/TabSelector';
import ScatterPlot from './charts/ScatterPlot';
import ContourPlot from './charts/ContourPlot';
import GroupedCountPlot from './charts/GroupedCountPlot';
import CategoryDensityPlot from './charts/CategoryDensityPlot';
import HeatmapPlot from './charts/HeatmapPlot';
import useColumnStats from '../hooks/useColumnStats';

/**
 * Component for bivariate analysis between two columns, offering different
 * visualization options based on the data types of the selected columns.
 */
const BivariateStats: FunctionComponent = (): ReactElement => {
  const { dataFrame } = useData();
  const [firstColumn, setFirstColumn] = useState<string | null>(null);
  const [secondColumn, setSecondColumn] = useState<string | null>(null);
  const [isIterating, setIsIterating] = useState<boolean>(false);
  const [iterationSpeed, setIterationSpeed] = useState<number>(3000); // Default: 3 seconds
  const iterationTimerRef = useRef<number | null>(null);
  
  // Get column names - memoized
  const columns = useMemo(() => {
    return dataFrame?.columns || [];
  }, [dataFrame]);
  
  // Set default columns
  useEffect(() => {
    if (columns.length > 0) {
      if (!firstColumn) {
        setFirstColumn(columns[0]);
      }
      if (!secondColumn && columns.length > 1) {
        setSecondColumn(columns[1]);
      } else if (!secondColumn) {
        setSecondColumn(columns[0]);
      }
    }
  }, [columns, firstColumn, secondColumn]);

  // Function to get the next pair of columns
  const getNextColumnPair = useCallback(() => {
    if (columns.length < 2) return;

    // Find current indices
    const firstIndex = columns.indexOf(firstColumn || columns[0]);
    const secondIndex = columns.indexOf(secondColumn || columns[0]);
    
    let newFirstIndex = firstIndex;
    let newSecondIndex = secondIndex + 1;
    
    // If second index reached the end
    if (newSecondIndex >= columns.length) {
      newFirstIndex = (firstIndex + 1) % columns.length;
      newSecondIndex = (newFirstIndex + 1) % columns.length;
      
      // If we've wrapped around and are back at the original pair
      if (newFirstIndex === firstIndex && newSecondIndex === secondIndex) {
        // Just use a different second column if possible
        if (columns.length > 2) {
          newSecondIndex = (newSecondIndex + 1) % columns.length;
          if (newSecondIndex === newFirstIndex) {
            newSecondIndex = (newSecondIndex + 1) % columns.length;
          }
        }
      }
    }
    
    // Ensure we don't select the same column for both
    if (newFirstIndex === newSecondIndex && columns.length > 1) {
      newSecondIndex = (newSecondIndex + 1) % columns.length;
    }
    
    setFirstColumn(columns[newFirstIndex]);
    setSecondColumn(columns[newSecondIndex]);
  }, [columns, firstColumn, secondColumn]);

  // Handle iteration
  useEffect(() => {
    if (isIterating) {
      iterationTimerRef.current = window.setTimeout(() => {
        getNextColumnPair();
      }, iterationSpeed);
    } else if (iterationTimerRef.current) {
      clearTimeout(iterationTimerRef.current);
      iterationTimerRef.current = null;
    }
    
    return () => {
      if (iterationTimerRef.current) {
        clearTimeout(iterationTimerRef.current);
        iterationTimerRef.current = null;
      }
    };
  }, [isIterating, iterationSpeed, getNextColumnPair]);

  // Get column values for the charts
  const firstColumnValues = useMemo(() => {
    if (!dataFrame || !firstColumn) return [];
    try {
      return dataFrame[firstColumn]?.values || [];
    } catch (e) {
      console.error("Error getting first column values:", e);
      return [];
    }
  }, [dataFrame, firstColumn]);
  
  const secondColumnValues = useMemo(() => {
    if (!dataFrame || !secondColumn) return [];
    try {
      return dataFrame[secondColumn]?.values || [];
    } catch (e) {
      console.error("Error getting second column values:", e);
      return [];
    }
  }, [dataFrame, secondColumn]);
  
  // Get column statistics to determine data types
  const firstColumnStats = useColumnStats(dataFrame, firstColumn);
  const secondColumnStats = useColumnStats(dataFrame, secondColumn);
  
  // Determine relationship type based on column data types
  const relationshipType = useMemo(() => {
    if (!firstColumnStats || !secondColumnStats || 
        firstColumnStats.error || secondColumnStats.error) {
      return null;
    }
    
    if (firstColumnStats.numeric && secondColumnStats.numeric) {
      return 'numeric-numeric';
    } else if (firstColumnStats.numeric && 
               (secondColumnStats.categorical || secondColumnStats.boolean)) {
      return 'numeric-categorical';
    } else if ((firstColumnStats.categorical || firstColumnStats.boolean) && 
               secondColumnStats.numeric) {
      return 'categorical-numeric';
    } else if ((firstColumnStats.categorical || firstColumnStats.boolean) && 
               (secondColumnStats.categorical || secondColumnStats.boolean)) {
      return 'categorical-categorical';
    }
    
    return null;
  }, [firstColumnStats, secondColumnStats]);
  
  // Define visualization options based on relationship type
  const numericNumericTabs = useMemo(() => [
    {
      id: 'scatter',
      label: 'Scatter Plot',
      content: (
        <ScatterPlot
          xColumnName={firstColumn || ''}
          yColumnName={secondColumn || ''}
          xValues={firstColumnValues as number[]} 
          yValues={secondColumnValues as number[]}
        />
      )
    },
    {
      id: 'contour',
      label: 'Contour Plot',
      content: (
        <ContourPlot
          xColumnName={firstColumn || ''}
          yColumnName={secondColumn || ''}
          xValues={firstColumnValues as number[]} 
          yValues={secondColumnValues as number[]}
        />
      )
    }
  ], [firstColumn, secondColumn, firstColumnValues, secondColumnValues]);
  
  const numericCategoricalTabs = useMemo(() => {
    const numericColumn = relationshipType === 'numeric-categorical' ? firstColumn : secondColumn;
    const categoricalColumn = relationshipType === 'numeric-categorical' ? secondColumn : firstColumn;
    const numericValues = relationshipType === 'numeric-categorical' ? 
                          firstColumnValues as number[] : 
                          secondColumnValues as number[];
    const categoricalValues = relationshipType === 'numeric-categorical' ? 
                             secondColumnValues as string[] : 
                             firstColumnValues as string[];
    
    return [
      {
        id: 'groupedcount',
        label: 'Grouped Count Plot',
        content: (
          <GroupedCountPlot
            numericColumnName={numericColumn || ''}
            categoricalColumnName={categoricalColumn || ''}
            numericValues={numericValues}
            categoricalValues={categoricalValues}
          />
        )
      },
      {
        id: 'groupeddensity',
        label: 'Category Density Plot',
        content: (
          <CategoryDensityPlot
            numericColumnName={numericColumn || ''}
            categoricalColumnName={categoricalColumn || ''}
            numericValues={numericValues}
            categoricalValues={categoricalValues}
          />
        )
      }
    ];
  }, [relationshipType, firstColumn, secondColumn, firstColumnValues, secondColumnValues]);
  
  const categoricalCategoricalTabs = useMemo(() => [
    {
      id: 'heatmap',
      label: 'Heatmap',
      content: (
        <HeatmapPlot
          firstColumnName={firstColumn || ''}
          secondColumnName={secondColumn || ''}
          firstValues={firstColumnValues as string[]}
          secondValues={secondColumnValues as string[]}
        />
      )
    }
  ], [firstColumn, secondColumn, firstColumnValues, secondColumnValues]);
  
  // Get the appropriate tabs based on relationship type
  const tabs = useMemo(() => {
    if (relationshipType === 'numeric-numeric') {
      return numericNumericTabs;
    } else if (relationshipType === 'numeric-categorical' || 
               relationshipType === 'categorical-numeric') {
      return numericCategoricalTabs;
    } else if (relationshipType === 'categorical-categorical') {
      return categoricalCategoricalTabs;
    }
    return [];
  }, [relationshipType, numericNumericTabs, numericCategoricalTabs, categoricalCategoricalTabs]);
  
  return (
    <div className="w-full p-5 rounded-md bg-white dark:bg-zinc-900 shadow-md mb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-['Montserrat']">Bivariate Analysis</h2>
        <div className="flex gap-2">
          <Button variant="secondary" size="small">
            <FiDownload /> Export
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={() => setIsIterating(!isIterating)}
          >
            {isIterating ? <FiPause /> : <FiPlay />} {isIterating ? 'Pause' : 'Play'}
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={getNextColumnPair}
          >
            <FiSkipForward /> Next
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center">
          <label htmlFor="first-column-select" className="inline-block text-sm font-mono mr-3 whitespace-nowrap">
            First Column:
          </label>
          <select
            id="first-column-select"
            className="flex-1 p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono"
            value={firstColumn || ''}
            onChange={(e) => setFirstColumn(e.target.value)}
          >
            <option value="">Select column</option>
            {columns.map((column: string, index: number) => (
              <option key={`first-${index}`} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center">
          <label htmlFor="second-column-select" className="inline-block text-sm font-mono mr-3 whitespace-nowrap">
            Second Column:
          </label>
          <select
            id="second-column-select"
            className="flex-1 p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono"
            value={secondColumn || ''}
            onChange={(e) => setSecondColumn(e.target.value)}
          >
            <option value="">Select column</option>
            {columns.map((column: string, index: number) => (
              <option key={`second-${index}`} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Iteration Speed Control */}
      {isIterating && (
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <label htmlFor="iteration-speed" className="text-sm font-mono whitespace-nowrap">
              Iteration Speed:
            </label>
            <input
              id="iteration-speed"
              type="range"
              min="500"
              max="10000"
              step="500"
              value={iterationSpeed}
              onChange={(e) => setIterationSpeed(Number(e.target.value))}
              className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm font-mono whitespace-nowrap">
              {(iterationSpeed / 1000).toFixed(1)}s
            </span>
          </div>
        </div>
      )}
      
      {/* Relationship type information */}
      {relationshipType && (
        <div className="mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-md text-sm font-mono">
            {relationshipType === 'numeric-numeric' && 'Analyzing relationship between two numeric columns'}
            {relationshipType === 'numeric-categorical' && 'Analyzing numeric column by categorical groups'}
            {relationshipType === 'categorical-numeric' && 'Analyzing numeric column by categorical groups'}
            {relationshipType === 'categorical-categorical' && 'Analyzing relationship between two categorical columns'}
          </div>
        </div>
      )}
      
      {/* Error states */}
      {(!firstColumn || !secondColumn) && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-md">
          Please select two columns to analyze their relationship.
        </div>
      )}
      
      {(firstColumnStats?.error || secondColumnStats?.error) && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
          Unable to analyze one or both selected columns. Please check the data format.
        </div>
      )}
      
      {/* Visualization area */}
      {relationshipType && tabs.length > 0 && (
        <div className="mt-6">
          <div className="bg-zinc-50 dark:bg-zinc-800 p-5 rounded-md">
            <TabSelector 
              tabs={tabs}
              defaultTabId={tabs[0].id}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BivariateStats;