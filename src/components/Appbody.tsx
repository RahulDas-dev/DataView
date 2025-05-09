import { FunctionComponent, ReactElement, useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import DataLoader from './DataLoader';
import DataSummary from './DataSummary';
import DataTable from './DataTable';
import UnivariateStats from './UnivariateStats';
import BivariateStats from './BivariateStats';

const Appbody: FunctionComponent = (): ReactElement => {
  const { dataFrame } = useData();
  const [is_table_populated, setIsTablePopulated] = useState(false);
  
  useEffect(() => {
    const hasData = dataFrame && 
                    Array.isArray(dataFrame.shape) && 
                    dataFrame.shape.length >= 2 && 
                    dataFrame.shape[0] > 0;
    
    setIsTablePopulated(hasData);
    if (hasData) {
      console.log("Data loaded successfully:", `${dataFrame.shape[0]} rows, ${dataFrame.shape[1]} columns`);
    }
  }, [dataFrame]);

  return (
    <div className="app-body container">
      <div className="mt-20 text-justify">
        <br /><br /><br /><br />
        <h1 className="text-xl text-center mb-2 font-['Montserrat'] font-semibold">Welcome to DataView App!</h1>
        <h3 className="mb-10 text-center font-['Montserrat']">Explore, Modify, Analyze Data ...</h3>
        <br />
      </div>
      <DataLoader />
      {is_table_populated && <DataTable />}
      {is_table_populated && <DataSummary />}
      {is_table_populated && <UnivariateStats />}
      {is_table_populated && <BivariateStats />} 
    </div>
  );
};

export default Appbody;