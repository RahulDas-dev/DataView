import { FunctionComponent, ReactElement, useContext, useEffect, useState   } from 'react'
import './appbody.css';
import Message from '../../components/dataview_msg/msg';
import DataLoader from '../dataloader/dataloader';
import DataTable from '../table/table';
import UnivariateState from '../stats/univariate/univariate';
import { DataContext } from '../../context/data_context';



const AppBody: FunctionComponent = ():ReactElement =>{
  const [is_table_populated, setTableisPolulated] = useState<boolean>(true)
  const {dataframe} = useContext(DataContext)
  
  useEffect(()=>{
    if (dataframe.size > 0){
      setTableisPolulated(true)
    }else{
        setTableisPolulated(false)
    }
  },[dataframe])

  
  return (
    
      <div className="app-body container">
          <Message />
          <DataLoader/>
          {
            is_table_populated && <DataTable/>
          }
          {
            is_table_populated && <UnivariateState/>
          }
      </div>
  )
};

export default AppBody