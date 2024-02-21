import { FunctionComponent, ReactElement   } from 'react'
import './appbody.css';
import Message from '../../components/dataview_msg/msg';
import DataLoader from '../dataloader/dataloader';
import DataTable from '../table/table';



const AppBody: FunctionComponent = ():ReactElement =>{
  return (
    <div className="app-body container">
        <Message />
        <DataLoader/>
        <DataTable/>
    </div>
  )
};

export default AppBody