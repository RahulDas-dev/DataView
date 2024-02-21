import { FunctionComponent, ReactElement   } from 'react'
import { useSelector } from 'react-redux';
import { RootState } from '../../store';


const DataTable: FunctionComponent = ():ReactElement =>{
    const data = useSelector((state: RootState)=> state.data)
    console.log(data)
    return (
        <div>
            This is Table
        </div>
    )
};

export default DataTable