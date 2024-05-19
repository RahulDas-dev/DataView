import { FunctionComponent, ReactElement, useContext, useEffect, useState   } from 'react'
import { DataContext } from '../../../context/data_context';
import './univaatiate.css';
import ColumnDisplay from './display';
import { EColTypes, EcolumnProps } from './props';


const UnivariateState: FunctionComponent = ():ReactElement =>{
    const [table_ctype, setCtypetable] = useState<EcolumnProps[]>([])
    const {dataframe} = useContext(DataContext)
    useEffect(()=>{
        const ctypes_:EcolumnProps[] = dataframe.ctypes.values.map(function(e, i) {
            let _dtype = EColTypes.Numerical
            if (['float32', 'int32', 'float64'].includes(String(e))){
                _dtype = EColTypes.Numerical
            } else{
                _dtype = EColTypes.Categorical
            }
            let _expended = (i == 0) ? true: false
            return {colname: dataframe.ctypes.index[i], dtype:_dtype, expand: _expended };
        });
        setCtypetable(ctypes_)
        return ()=>{
            setCtypetable([])
        }
    },[dataframe])

    return (
        <div className='univariate-area'>
            {
                table_ctype.map((item: EcolumnProps) => {
                    return <ColumnDisplay key={item.colname} 
                                            colname={item.colname} 
                                            dtype = {item.dtype} 
                                            expand ={item.expand} />;
                })    
            }   
        </div>
    )
};

export default UnivariateState