import { FunctionComponent, ReactElement, useState, useMemo} from 'react';
import { useData } from '../hooks/useData';
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

  
  // Get column names - memoized
  const columns = useMemo(() => {
    return dataFrame?.columns || [];
  }, [dataFrame]);


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
            xColumnName={numericColumn || ''}
            yColumnName={categoricalColumn || ''}
            xValues={numericValues}
            yValues={categoricalValues}
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
        <div className="flex gap-8">
          <div className="flex items-center">
          <label htmlFor="first-column-select" className="inline-block text-sm font-mono mr-3 whitespace-nowrap">
            First Column:
          </label>
          <select
            id="first-column-select"
            className="flex-1 p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono"
            value={firstColumn || ''}
            onChange={(e) => {setFirstColumn(e.target.value);
              setSecondColumn(''); 
            }}
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
            disabled={!firstColumn} 
            onChange={(e) => setSecondColumn(e.target.value)}
          >
            <option value="">Select column</option>
            {columns
            .filter((column: string) => column !== firstColumn)
            .map((column: string, index: number) => (
              <option key={`second-${index}`} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>
        </div>
      </div>
      
      {/* Error states */}
      {(!firstColumn || !secondColumn) && (
        <div className="p-10 text-center text-lg space-x-1 text-zinc-500 dark:text-zinc-400">
          Please select the columns to view statistics and visualizations.
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