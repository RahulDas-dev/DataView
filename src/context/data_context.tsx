import { DataFrame } from "danfojs";
import { createContext, useMemo, useState } from "react";


export type DataContextType = {
    dataframe: DataFrame
    setDataFrame : (data: DataFrame) => void
};


export const DataContext = createContext<DataContextType>({
    dataframe: new DataFrame(),
    setDataFrame: (data: DataFrame) => data,
});


const DataContextProvider = ({children}:{children: JSX.Element}) => {
    const [dataframe, setDataFrame] = useState<DataFrame>(new DataFrame());

    const context_values = useMemo(
        () => ({dataframe, setDataFrame}),
        [dataframe, setDataFrame]
    )
    
    return <DataContext.Provider value={context_values}>
                {children}
            </DataContext.Provider>
  };


  export default DataContextProvider