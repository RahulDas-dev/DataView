import { FunctionComponent, ReactElement } from 'react';
import { useData } from '../hooks/useData';
import useDataStats from '../hooks/useDataStats';
import { FiDatabase, FiGrid, FiCopy, FiInfo } from 'react-icons/fi';

const DataSummary: FunctionComponent = (): ReactElement => {
  const { dataFrame } = useData();
  const stats = useDataStats(dataFrame);

  return (
    <div className="w-full p-5 rounded-md bg-white dark:bg-zinc-900 shadow-md mb-6">
      <h2 className="text-xl font-['Montserrat'] font-semibold mb-4">Data Summary</h2>
      
      {stats.isEmpty ? (
        <div className="text-zinc-500 dark:text-zinc-400 text-sm font-mono">
          No data loaded. Please load a CSV file to view statistics.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main summary metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-md flex flex-col">
              <div className="flex items-center text-zinc-600 dark:text-zinc-300 mb-2">
                <FiDatabase className="mr-2" />
                <span className="text-sm font-medium">Total Rows</span>
              </div>
              <div className="font-mono text-lg font-bold">{stats.totalRows.toLocaleString()}</div>
            </div>
            
            <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-md flex flex-col">
              <div className="flex items-center text-zinc-600 dark:text-zinc-300 mb-2">
                <FiGrid className="mr-2" />
                <span className="text-sm font-medium">Total Columns</span>
              </div>
              <div className="font-mono text-lg font-bold">{stats.totalColumns.toLocaleString()}</div>
            </div>
            
            <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-md flex flex-col">
              <div className="flex items-center text-zinc-600 dark:text-zinc-300 mb-2">
                <FiCopy className="mr-2" />
                <span className="text-sm font-medium">Duplicate Rows</span>
              </div>
              <div className="font-mono text-lg font-bold">
                {stats.duplicateRows.toLocaleString()} 
                <span className="text-xs ml-1 text-zinc-500 dark:text-zinc-400">
                  ({stats.duplicatePercentage.toFixed(2)}%)
                </span>
              </div>
            </div>
            
            <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-md flex flex-col">
              <div className="flex items-center text-zinc-600 dark:text-zinc-300 mb-2">
                <FiInfo className="mr-2" />
                <span className="text-sm font-medium">Data Quality</span>
              </div>
              <div className="font-mono text-lg font-bold">
                {(100 - stats.columnsInfo.reduce((acc, col) => acc + col.nullPercentage, 0) / stats.totalColumns).toFixed(2)}%
              </div>
            </div>
          </div>
          
          {/* Column data types and null counts */}
          <div className="overflow-x-auto">
            <h3 className="text-lg font-['Montserrat'] font-medium mb-3">Column Information</h3>
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800">
                  <th className="px-4 py-2 text-left text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">
                    Column Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">
                    Data Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">
                    Null Count
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">
                    Null %
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
                    <td className="px-4 py-2 text-xs font-mono border-b border-zinc-100 dark:border-zinc-800">
                      {col.nullPercentage.toFixed(2)}%
                      <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1 mt-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${col.nullPercentage}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSummary;