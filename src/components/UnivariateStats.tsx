import { FunctionComponent, ReactElement, useState, useMemo, useEffect } from 'react';
import { useData } from '../hooks/useData';
import useColumnStats, { NumericStats, BooleanStats, CategoricalStats } from '../hooks/useColumnStats';
import { Button } from './Button';
import { FiBarChart2, FiDownload } from 'react-icons/fi';

const UnivariateStats: FunctionComponent = (): ReactElement => {
  const { dataFrame } = useData();
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  
  // Get column names - memoized
  const columns = useMemo(() => {
    return dataFrame?.columns || [];
  }, [dataFrame]);
  
  // Set first column by default if none is selected
  useEffect(() => {
    if (!selectedColumn && columns.length > 0) {
      setSelectedColumn(columns[0]);
    }
  }, [columns, selectedColumn]);
  
  // Use our new hook for all statistics computations
  const stats = useColumnStats(dataFrame, selectedColumn);
  
  // Get top 10 frequencies for display
  const topFrequencies = useMemo(() => {
    if (!stats || stats.error) return [];
    if (stats.numeric) return [];
    
    const freqs = (stats as CategoricalStats | BooleanStats).frequencies;
    return freqs && Array.isArray(freqs) ? freqs.slice(0, 10) : [];
  }, [stats]);
  
  return (
    <div className="w-full p-5 rounded-md bg-white dark:bg-zinc-900 shadow-md mb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-['Montserrat'] font-semibold">Univariate Statistics</h2>
        <div className="flex gap-2">
          <Button variant="secondary" size="small">
            <FiBarChart2 /> Chart
          </Button>
          <Button variant="secondary" size="small">
            <FiDownload /> Export Stats
          </Button>
        </div>
      </div>
      
        <div className="mb-4 flex items-center">
        <label htmlFor="column-select" className="inline-block text-sm font-mono mr-3 whitespace-nowrap">
          Select Column:
        </label>
        <select
          id="column-select"
          className="flex-1 max-w-64 p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono"
          value={selectedColumn || ''}
          onChange={(e) => setSelectedColumn(e.target.value)}
        >
          {columns.map((column: string, index: number) => (
            <option key={index} value={column}>
              {column}
            </option>
          ))}
        </select>
      </div>
      
      {stats && !stats.error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-md">
            <h3 className="text-lg font-['Montserrat'] font-medium mb-3">Basic Information</h3>
            <ul className="space-y-2 font-mono text-sm">
              <li className="flex justify-between">
                <span>Count:</span>
                <span>{stats.count}</span>
              </li>
              <li className="flex justify-between">
                <span>Null Count:</span>
                <span>{stats.nullCount}</span>
              </li>
              <li className="flex justify-between">
                <span>Data Type:</span>
                <span>{stats.dataType}</span>
              </li>
              <li className="flex justify-between">
                <span>Is Categorical:</span>
                <span>{stats.categorical ? 'Yes' : 'No'}</span>
              </li>
              {(stats.categorical || stats.boolean) && (
                <>
                  <li className="flex justify-between">
                    <span>Unique Values:</span>
                    <span>{(stats as CategoricalStats | BooleanStats).unique}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Most Frequent:</span>
                    <span>
                      {(stats as CategoricalStats | BooleanStats).mode.value} ({(stats as CategoricalStats | BooleanStats).mode.frequency} times)
                    </span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Show frequency distribution for categorical and boolean data OR numeric statistics for numeric data */}
          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-md">
            {/* Frequency Distribution for categorical and boolean data */}
            {(stats.categorical || stats.boolean) && (
              <>
                <h3 className="text-lg font-['Montserrat'] font-medium mb-3">Frequency Distribution</h3>
                <div className="h-[calc(100%-2.5rem)] overflow-y-auto custom-scrollbar">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-zinc-100 dark:bg-zinc-700">
                        <th className="sticky top-0 bg-zinc-100 dark:bg-zinc-700 px-4 py-2 text-left text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                          Value
                        </th>
                        <th className="sticky top-0 bg-zinc-100 dark:bg-zinc-700 px-4 py-2 text-left text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                          Frequency
                        </th>
                        <th className="sticky top-0 bg-zinc-100 dark:bg-zinc-700 px-4 py-2 text-left text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topFrequencies.map(([value, frequency]: [string, number], index: number) => (
                        <tr key={index} className="hover:bg-zinc-100 dark:hover:bg-zinc-700">
                          <td className="px-4 py-2 text-xs font-mono">{value}</td>
                          <td className="px-4 py-2 text-xs font-mono">{frequency}</td>
                          <td className="px-4 py-2 text-xs font-mono">
                            {Number((frequency / stats.count) * 100).toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                      {topFrequencies.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-center p-4 text-zinc-500 dark:text-zinc-400 text-sm">
                            No frequency data available for this column.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            
            {/* Numeric Statistics for numeric data */}
            {stats.numeric && (
              <>
                <h3 className="text-lg font-['Montserrat'] font-medium mb-3">Numeric Statistics</h3>
                <ul className="space-y-2 font-mono text-sm">
                  <li className="flex justify-between">
                    <span>Min:</span>
                    <span>{typeof (stats as NumericStats).min === 'number' ? (stats as NumericStats).min.toFixed(4) : Number((stats as NumericStats).min).toFixed(4)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Max:</span>
                    <span>{typeof (stats as NumericStats).max === 'number' ? (stats as NumericStats).max.toFixed(4) : Number((stats as NumericStats).max).toFixed(4)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Mean:</span>
                    <span>{typeof (stats as NumericStats).mean === 'number' ? (stats as NumericStats).mean.toFixed(4) : Number((stats as NumericStats).mean).toFixed(4)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Median:</span>
                    <span>{typeof (stats as NumericStats).median === 'number' ? (stats as NumericStats).median.toFixed(4) : Number((stats as NumericStats).median).toFixed(4)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Std Dev:</span>
                    <span>{typeof (stats as NumericStats).std === 'number' ? (stats as NumericStats).std.toFixed(4) : Number((stats as NumericStats).std).toFixed(4)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Variance:</span>
                    <span>{typeof (stats as NumericStats).var === 'number' ? (stats as NumericStats).var.toFixed(4) : Number((stats as NumericStats).var).toFixed(4)}</span>
                  </li>
                </ul>
              </>
            )}
          </div>
        </div>
      )}
      
      {stats && stats.error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
          Unable to calculate statistics for this column. Please check the data format.
        </div>
      )}
    </div>
  );
};

export default UnivariateStats;