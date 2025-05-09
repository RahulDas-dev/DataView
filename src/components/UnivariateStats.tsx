import { FunctionComponent, ReactElement, useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import useColumnStats, { NumericStats, BooleanStats, CategoricalStats } from '../hooks/useColumnStats';
import HistogramPlot from './charts/HistogramPlot';
import KDEPlot from './charts/KDEPlot';
import BoxPlot from './charts/BoxPlot';
import ViolinPlot from './charts/ViolinPlot';
import CountPlot from './charts/CountPlot';
import PieChart from './charts/PieChart';
import TabSelector from './common/TabSelector';
import BasicStatsInfo, { CategoricalStatsInfo, NumericStatsInfo } from './StatisticsInfo';

const UnivariateStats: FunctionComponent = (): ReactElement => {
  const { dataFrame } = useData();
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  //const [showChartModal, setShowChartModal] = useState(false);
  
  // Get column names - memoized
  const columns = useMemo(() => {
    return dataFrame?.columns || [];
  }, [dataFrame]);
  
  
  // Use our hook for all statistics computations
  const stats = useColumnStats(dataFrame, selectedColumn);
  
  // Get column values for the chart
  const columnValues = useMemo(() => {
    if (!dataFrame || !selectedColumn) return [];
    try {
      return dataFrame[selectedColumn]?.values || [];
    } catch (e) {
      console.error("Error getting column values:", e);
      return [];
    }
  }, [dataFrame, selectedColumn]);
  
  // Get top 10 frequencies for display
  const topFrequencies = useMemo(() => {
    if (!stats || stats.error) return [];
    if (stats.numeric) return [];
    
    const freqs = (stats as CategoricalStats | BooleanStats).frequencies;
    return freqs && Array.isArray(freqs) ? freqs.slice(0, 10) : [];
  }, [stats]);
  
  // Distribution tab options for numerical data
  const distributionTabs = useMemo(() => [
    {
      id: 'histogram',
      label: 'Histogram + KDE',
      content: (
        <HistogramPlot 
          columnName={selectedColumn || ''}
          columnValues={columnValues as number[]}
          binCount={30}
        />
      )
    },
    {
      id: 'kde',
      label: 'KDE Plot',
      content: (
        <KDEPlot 
          columnName={selectedColumn || ''}
          columnValues={columnValues as number[]}
          smoothingFactor={1.0}
        />
      )
    }
  ], [selectedColumn, columnValues]);
  
  // Box and Violin tab options for numerical data
  const boxViolinTabs = useMemo(() => [
    {
      id: 'boxplot',
      label: 'Box Plot',
      content: (
        <BoxPlot 
          columnName={selectedColumn || ''}
          columnValues={columnValues as number[]}
        />
      )
    },
    {
      id: 'violin',
      label: 'Violin Plot',
      content: (
        <ViolinPlot 
          columnName={selectedColumn || ''}
          columnValues={columnValues as number[]}
        />
      )
    }
  ], [selectedColumn, columnValues]);
  
  // Count plot tab options for categorical data
  const countPlotTabs = useMemo(() => [
    {
      id: 'countplot',
      label: 'Count Plot',
      content: (
        <CountPlot 
          columnName={selectedColumn || ''}
          categoryValues={columnValues as string[]}
          maxCategories={20}
        />
      )
    }
  ], [selectedColumn, columnValues]);
  
  // Pie chart tab options for categorical data
  const pieChartTabs = useMemo(() => [
    {
      id: 'piechart',
      label: 'Pie Chart',
      content: (
        <PieChart 
          columnName={selectedColumn || ''}
          categoryValues={columnValues as string[]}
          maxCategories={10}
        />
      )
    }
  ], [selectedColumn, columnValues]);
  
  return (
    <div className="w-full p-5 rounded-md bg-white dark:bg-zinc-900 shadow-md mb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-['Montserrat']">Univariate Statistics</h2>
        <div className="flex gap-2  items-center">
          <label htmlFor="column-select" className="inline-block text-sm font-mono mr-3 whitespace-nowrap">
            Select Column:
          </label>
          <select
            id="column-select"
            className="flex-1 max-w-64 p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono"
            value={selectedColumn || ''}
            onChange={(e) => setSelectedColumn(e.target.value)}
          > 
            <option value="" >Select a Column</option>
            {columns.map((column: string, index: number) => (
              <option key={index} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>
      </div>
      {!selectedColumn && (
        <div className="p-10 text-center text-lg space-x-1 text-zinc-500 dark:text-zinc-400">
          Please select a column to view statistics and visualizations.
        </div>
      )}
      {selectedColumn && (
      <>
      {stats && !stats.error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BasicStatsInfo stats={stats} />
          {(stats.categorical || stats.boolean) ? (
            <CategoricalStatsInfo 
              topFrequencies={topFrequencies} 
              totalCount={stats.count} 
            />
            ) : stats.numeric ? (
              <NumericStatsInfo stats={stats as NumericStats} />
            ) : null}
        </div>
      )}
      
      {stats && stats.error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
          Unable to calculate statistics for this column. Please check the data format.
        </div>
      )}
      { 
        stats && stats.numeric && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-50 dark:bg-zinc-800 p-5 rounded-md">
              <h3 className="text-lg font-['Montserrat'] font-medium mb-3">Distribution</h3>
              <TabSelector 
                tabs={distributionTabs}
                defaultTabId="histogram"
              />
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800 p-5 rounded-md">
              <h3 className="text-lg font-['Montserrat'] font-medium mb-3">Distribution Plot</h3>
              <TabSelector 
                tabs={boxViolinTabs}
                defaultTabId="boxplot"
              />
            </div>
        </div> )
      }
      { 
        stats && (stats.categorical || stats.boolean) && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-50 dark:bg-zinc-800 p-5 rounded-md">
              <h3 className="text-lg font-['Montserrat'] font-medium mb-3">Frequency</h3>
              <TabSelector 
                tabs={countPlotTabs}
                defaultTabId="countplot"
              />
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800 p-5 rounded-md">
              <h3 className="text-lg font-['Montserrat'] font-medium mb-3">Proportion</h3>
              <TabSelector 
                tabs={pieChartTabs}
                defaultTabId="piechart"
              />
            </div>
        </div> )
      }
      </>
    )}
    </div>
  );
};

export default UnivariateStats;