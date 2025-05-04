import { createContext } from 'react';
import { DataFrame } from 'danfojs';

export interface DataContextType {
  dataFrame: DataFrame;
  setDataFrame: (df: DataFrame) => void;
  resetDataFrame: () => void;
}

// Create context with default values
export const DataContext = createContext<DataContextType>({
  dataFrame: new DataFrame(),
  setDataFrame: () => {},
  resetDataFrame: () => {},
});
