import { FunctionComponent, ReactElement } from 'react';
import { useData } from '../hooks/useData';
import DataLoader from './DataLoader';
import DataSummary from './DataSummary';
import DataTable from './DataTable';
import UnivariateStats from './UnivariateStats';

const Appbody: FunctionComponent = (): ReactElement => {
  const { dataFrame } = useData();
  const is_table_populated = dataFrame && dataFrame.shape && dataFrame.shape[0] > 0;

  return (
    <div className="app-body container">
      <div className="mt-20 text-justify">
        <h1 className="text-xl text-center mb-2 font-['Montserrat'] font-semibold">Welcome to DataView App!</h1>
        <h3 className="mb-10 text-center font-['Montserrat']">Explore, Modify, Analyze Data...</h3>
        <ul className="pl-8 tracking-wide list-disc text-sm space-y-1 font-['Montserrat']">
          <li>Effortless Data Loading - Instantly load data from any URL or CSV file</li>
          <li>Intuitive Modification - Easily tweak and tailor your data to your exact specifications.</li>
          <li>Comprehensive Statistics - Dive deep into a variety of statistics generated from your customized data.</li>
          <li>Empowerment Through Data - Harness the power of easy data manipulation for enhanced productivity.</li>
        </ul>
      </div>
      <DataLoader />
      {is_table_populated && <DataTable />}
      {is_table_populated && <DataSummary />}
      {is_table_populated && <UnivariateStats />}
    </div>
  );
};

export default Appbody;