import React from 'react';
import { NumericStats, BooleanStats, CategoricalStats } from '../hooks/useColumnStats';


interface BasicStatsInfoProps {
  stats: NumericStats | BooleanStats | CategoricalStats;
}

const BasicStatsInfo: React.FC<BasicStatsInfoProps> = ({ stats }) => {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-md h-64 overflow-y-auto custom-scrollbar">
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
  );
};

export default BasicStatsInfo;



interface CategoricalStatsInfoProps {
  topFrequencies: [string, number][];
  totalCount: number;
}

export const CategoricalStatsInfo: React.FC<CategoricalStatsInfoProps> = ({ topFrequencies, totalCount }) => {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-md">
      <h3 className="text-lg font-['Montserrat'] font-medium mb-3">Frequency Distribution</h3>
      <div className="h-48 overflow-y-auto custom-scrollbar">
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
                  {Number((frequency / totalCount) * 100).toFixed(2)}%
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
    </div>
  );
};



interface NumericStatsInfoProps {
  stats: NumericStats;
}

export const NumericStatsInfo: React.FC<NumericStatsInfoProps> = ({ stats }) => {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-md">
      <h3 className="text-lg font-['Montserrat'] font-medium mb-3">Numeric Statistics</h3>
      <ul className="space-y-2 font-mono text-sm">
        <li className="flex justify-between">
          <span>Min:</span>
          <span>{typeof stats.min === 'number' ? stats.min.toFixed(4) : Number(stats.min).toFixed(4)}</span>
        </li>
        <li className="flex justify-between">
          <span>Max:</span>
          <span>{typeof stats.max === 'number' ? stats.max.toFixed(4) : Number(stats.max).toFixed(4)}</span>
        </li>
        <li className="flex justify-between">
          <span>Mean:</span>
          <span>{typeof stats.mean === 'number' ? stats.mean.toFixed(4) : Number(stats.mean).toFixed(4)}</span>
        </li>
        <li className="flex justify-between">
          <span>Median:</span>
          <span>{typeof stats.median === 'number' ? stats.median.toFixed(4) : Number(stats.median).toFixed(4)}</span>
        </li>
        <li className="flex justify-between">
          <span>Std Dev:</span>
          <span>{typeof stats.std === 'number' ? stats.std.toFixed(4) : Number(stats.std).toFixed(4)}</span>
        </li>
        <li className="flex justify-between">
          <span>Variance:</span>
          <span>{typeof stats.var === 'number' ? stats.var.toFixed(4) : Number(stats.var).toFixed(4)}</span>
        </li>
      </ul>
    </div>
  );
};
