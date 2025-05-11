import { FunctionComponent, ReactElement, useMemo } from 'react';
import { useData } from '../hooks/useData';
import TabSelector from './common/TabSelector';
import CorrelationMatrix from './charts/PearsonCorrelationMatrix';

/**
 * Component for multivariate analysis between multiple columns
 */
const MultivariateStats: FunctionComponent = (): ReactElement => {
  const { dataFrame } = useData();
  
  // Get numeric columns only
  const numericColumns = useMemo(() => {
    if (!dataFrame) return [];
    
    return dataFrame.columns.filter(column => {
      if (['string', 'boolean'].includes(dataFrame[column].dtype)) return false;
      return true;
    });
  }, [dataFrame]);
  
  // Define tabs
  const correlationTabs = useMemo(() => [
    {
      id: 'correlationheatmap',
      label: 'Correlation Heatmap',
      content: <CorrelationMatrix />
    }
  ], []);
  
  return (
    <div className="w-full p-5 rounded-md bg-white dark:bg-zinc-900 shadow-md mb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-['Montserrat']">Multivariate Statistics</h2>
      </div>

      {/* Visualization area */}
      {numericColumns.length > 0 && (
        <div className="mt-6">
          <div className="bg-zinc-50 dark:bg-zinc-800 p-5 rounded-md">
            <TabSelector 
              tabs={correlationTabs}
              defaultTabId="correlationheatmap"
              title="Correlation Analysis"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MultivariateStats;