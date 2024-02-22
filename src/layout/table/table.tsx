import { FunctionComponent, ReactElement, useContext, useEffect, useState   } from 'react'
import { DataContext } from '../../context/data_context';
import classNames from 'classnames';

const DataTable: FunctionComponent = ():ReactElement =>{
    const [is_table_populated, setTableisPolulated] = useState<boolean>(true)
    const {dataframe} = useContext(DataContext)

    const layout = {
        header: {
            align: "center",
            line: {width: 1, color: 'rgb(50, 50, 50)'},
            fill: {color: "pink"},
            font: {family: "Arial", size: 12, color: "white"}
        },
        cells: {
            align: "center",
            line: {color: "black", width: 1},
            font: {family: "Arial", size: 50, color: ["black"]}
        }  
    }


    useEffect(()=>{
        if (dataframe.size > 0){
            setTableisPolulated(true)
            dataframe.plot('table_plot_area').table({
               layout
            })
        }else{
            setTableisPolulated(false)
        }
    },[dataframe])

    return (
        <div className='static-table'>
            <div className={classNames("block",{'h-96': is_table_populated })} id='table_plot_area'></div>
        </div>
    )
};

export default DataTable