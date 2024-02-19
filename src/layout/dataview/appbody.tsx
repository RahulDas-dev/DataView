import { FunctionComponent, ReactElement   } from 'react'
import './appbody.css';
import Message from '../../components/dataview_msg/msg';
import DataLoader from '../../components/dataloader/dataloader';



const AppBody: FunctionComponent = ():ReactElement =>{
  return (
    <div className="app-body container">
        <Message />
        <DataLoader/>
    </div>
  )
};

export default AppBody