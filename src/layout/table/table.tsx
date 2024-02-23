import { FunctionComponent, ReactElement, useContext, useEffect, useRef, useState   } from 'react'
import { DataContext } from '../../context/data_context';
import classNames from 'classnames';
import './table.css';
import { LayoutContext } from '../../context/layout_context';

const DataTable: FunctionComponent = ():ReactElement =>{
    const table_ref = useRef<HTMLDivElement>(null)
    const [is_table_populated, setTableisPolulated] = useState<boolean>(true)
    const {dataframe} = useContext(DataContext)
    const {layout, config} = useContext(LayoutContext)
    useEffect(()=>{
        if (dataframe.size > 0){
            setTableisPolulated(true)
            dataframe.plot('table_plot_area').table({config,layout})
        }else{
            setTableisPolulated(false)
            const table = table_ref.current
            while( table && table.firstChild){
              table.removeChild(table.firstChild)
            }
        }
        return () => {
          setTableisPolulated(false)
          const table = table_ref.current
          while( table && table.firstChild){
              table.removeChild(table.firstChild)
          }
        }
    },[dataframe, layout, config])

    return (
        <div className={classNames('static-table', {'h-96': is_table_populated,
                                                    //'dark:bg-neutral-700': is_table_populated,
                                                    //'bg-neutral-300': is_table_populated
                                                  })}>
            <div id='table_plot_area' ref={table_ref}></div>
        </div>
    )
};

export default DataTable