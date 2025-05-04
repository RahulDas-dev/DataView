import React, { useState, ReactNode, useCallback, useMemo } from 'react';
import { DataFrame } from 'danfojs';
import { DataContext } from './dataContextValue';

interface DataProviderProps {
  children: ReactNode;
}

const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [dataFrame, setDataFrameState] = useState<DataFrame>(new DataFrame());
  
  // Memoize the setDataFrame function to prevent unnecessary re-renders
  const setDataFrame = useCallback((df: DataFrame) => {
    setDataFrameState(df);
  }, []);

  const resetDataFrame = useCallback(() => {
    setDataFrameState(new DataFrame());
  }, []);

  // Memoize the context value to prevent unnecessary re-renders in consuming components
  const contextValue = useMemo(() => ({
    dataFrame,
    setDataFrame,
    resetDataFrame
  }), [dataFrame, setDataFrame, resetDataFrame]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;