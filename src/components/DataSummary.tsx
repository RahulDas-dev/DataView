import { FunctionComponent, ReactElement, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { useTheme } from '../hooks/useTheme';
import useDataStats from '../hooks/useDataStats';
import NullValuesHeatmap from './charts/NullValsHeatmap';
import NullValsBarPolt from './charts/NullValsBarPolt';
import TabSelector from './common/TabSelector';

const DataSummary: FunctionComponent = (): ReactElement => {
  const { dataFrame } = useData();
  const stats = useDataStats(dataFrame);
  const { isDark } = useTheme();
  console.log("isDark:", isDark);
  // Calculate total null percentage
  const totalNullStats = useMemo(() => {
    if (stats.isEmpty) return { totalNullCount: 0, totalNullPercentage: 0 };
    
    // Sum up all null counts from all columns
    const totalNullCount = stats.columnsInfo.reduce((sum, col) => sum + col.nullCount, 0);
    
    // Calculate total data points (rows × columns)
    const totalDataPoints = stats.totalRows * stats.totalColumns;
    
    // Calculate percentage
    const totalNullPercentage = totalDataPoints > 0 
      ? (totalNullCount / totalDataPoints) * 100 
      : 0;
      
    return { totalNullCount, totalNullPercentage };
  }, [stats]);

  const NullcountPlotTabs = useMemo(() => [
    {
      id: 'nullcountplot',
      label: 'Null Count Plot',
      content: (
        <NullValsBarPolt columnsInfo={stats.columnsInfo}/>
      )
    },
    {
      id: 'nullheatmap',
      label: 'Null Values HeatMap',
      content: (
        <NullValuesHeatmap dataFrame={dataFrame} />
      )
    }
  ], [stats.columnsInfo, dataFrame]);

  return (
    <div className="w-full p-5 rounded-md bg-white dark:bg-zinc-900 shadow-md mb-6">
      <h2 className="text-xl font-['Montserrat']  mb-4">Data Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side - Summary metrics in a single card */}
          <div className="bg-zinc-50 dark:bg-zinc-800 p-5 rounded-md flex flex-col">
            <h3 className="text-lg font-['Montserrat'] font-medium mb-4">Summary Metrics</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="space-y-2 font-mono text-sm text-zinc-600 dark:text-zinc-300">Total Rows:</span>
                <span className="font-mono text-sm">{stats.totalRows.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="space-y-2 font-mono text-sm text-zinc-600 dark:text-zinc-300">Total Columns:</span>
                <span className="font-mono text-sm">{stats.totalColumns.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="space-y-2 font-mono text-sm text-zinc-600 dark:text-zinc-300">Duplicate Rows:</span>
                <span className="font-mono text-sm">
                  {stats.duplicateRows.toLocaleString()} 
                  <span className="text-xs ml-1 text-zinc-500 dark:text-zinc-400">
                    ({stats.duplicatePercentage.toFixed(2)}%)
                  </span>
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="space-y-2 font-mono text-sm text-zinc-600 dark:text-zinc-300">Total Null Values:</span>
                <span className="font-mono text-sm">
                  {totalNullStats.totalNullCount.toLocaleString()}
                  <span className="text-xs ml-1 text-zinc-500 dark:text-zinc-400">
                    ({totalNullStats.totalNullPercentage.toFixed(2)}%)
                  </span>
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="space-y-2 font-mono text-sm text-zinc-600 dark:text-zinc-300">Data Quality:</span>
                <span className="font-mono text-sm">
                  {(100 - stats.columnsInfo.reduce((acc, col) => acc + col.nullPercentage, 0) / stats.totalColumns).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Right side - Column information with fixed height and scrollbar */}
          <div className="bg-zinc-50 dark:bg-zinc-800 p-5 rounded-md flex flex-col">
            <h3 className="text-lg font-['Montserrat'] font-medium mb-3">Column Information</h3>
            
            <div className="overflow-y-auto h-48 custom-scrollbar">
              <table className="min-w-full border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-zinc-100 dark:bg-zinc-800">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">
                      Column Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">
                      Data Type
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">
                      Null Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.columnsInfo.map((col, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <td className="px-4 py-2 text-xs font-mono border-b border-zinc-100 dark:border-zinc-800">
                        {col.name}
                      </td>
                      <td className="px-4 py-2 text-xs font-mono border-b border-zinc-100 dark:border-zinc-800">
                        <span className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                          {col.dtype}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs font-mono border-b border-zinc-100 dark:border-zinc-800">
                        {col.nullCount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
       
       { 
        totalNullStats.totalNullCount > 0 && (   
        <div className="mt-6 grid grid-cols-1 gap-6">
            <div className="bg-zinc-50 dark:bg-zinc-800 p-5 rounded-md">
              <TabSelector 
                tabs={NullcountPlotTabs}
                defaultTabId="nullcountplot"
                title="Null Value Analysis"
              />
            </div>
        </div>  )} 
    </div>
  );
};

export default DataSummary;