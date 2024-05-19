import { FunctionComponent, ReactElement, useState} from 'react'
import PlotArea from './plot';
import { EcolumnProps } from './props';

import './display.css';
import ExpandBtn from '../../../components/button/expandbtn';
import StatArea from './stat';


const ColumnDisplay: FunctionComponent<EcolumnProps> = ({colname, dtype, expand}):ReactElement =>{
    const [isExpended, setExpended] = useState<boolean>(expand)
    

    
    return (
        <div className='column-display'>
            <div className='column-header'>
                <div className='column-title'>{colname}</div>
                <div className='column-expand'>
                    <ExpandBtn onClick = {()=>{setExpended(!isExpended)}} expanded = {isExpended}/>
                </div>
            </div>
            {
                isExpended && <div className='chart-section'>
                    <StatArea colname={colname} dtype = {dtype} expand ={isExpended} />
                    <PlotArea colname={colname} dtype = {dtype} expand ={isExpended}/>
                </div>
            }
        </div>
    )
};

export default ColumnDisplay