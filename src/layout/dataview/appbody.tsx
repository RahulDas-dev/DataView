import { FunctionComponent, ReactElement   } from 'react'
import './appbody.css';
import Message from '../../components/dataview_msg/msg';
import DataLoader from '../dataloader/dataloader';
import DataTable from '../table/table';
import LayoutContextProvider from '../../context/layout_context';



const AppBody: FunctionComponent = ():ReactElement =>{
  return (
    <LayoutContextProvider>
      <div className="app-body container">
          <Message />
          <DataLoader/>
          <DataTable/>
      </div>
    </LayoutContextProvider>
  )
};

export default AppBody