import { FunctionComponent, ReactElement, useContext, useEffect, useState   } from 'react'
import { DataContext } from '../../context/data_context';
import BarChart from './barchart';
import './univaatiate.css';

interface Ctype{
    col_name: string| number
    dtype: string
}

const UnivariateState: FunctionComponent = ():ReactElement =>{
    const [table_ctype, setCtypetable] = useState<Ctype[]>([])
    const {dataframe} = useContext(DataContext)
    useEffect(()=>{
        const ctypes_:Ctype[] = dataframe.ctypes.values.map(function(e, i) {
            return {col_name: dataframe.ctypes.index[i], dtype:String(e)};
        });
        setCtypetable(ctypes_)
        return ()=>{
            setCtypetable([])
        }
    },[])

    return (
        <div className='univariate-area'>
            {
                table_ctype.map((item: Ctype) => {
                    if (['float32', 'int32', 'float64'].includes(item.dtype) ) {
                        return <BarChart name={item.col_name} key={item.col_name}/>;
                    } else if (['bool', 'string'].includes(item.dtype) ) {
                        return <div>{item.col_name}</div>;
                    }
                })    
            }   
        </div>
    )
};

export default UnivariateState