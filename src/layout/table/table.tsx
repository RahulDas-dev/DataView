import { FunctionComponent, ReactElement, useContext, useEffect, useState   } from 'react'
import { DataContext } from '../../context/data_context';
import classNames from 'classnames';
import './table.css';

const DataTable: FunctionComponent = ():ReactElement =>{
    const [is_table_populated, setTableisPolulated] = useState<boolean>(true)
    const {dataframe} = useContext(DataContext)

    const headerStyle = {
        align: "center",
        fill: { color: ['lightgrey'] },
        font: { family: "Arial", size: 10, color: "black" },
        
      }
      const cellStyle = {
        align: ["center"],
        line: { color: "black", width: 0.1 }
      }

    useEffect(()=>{
        if (dataframe.size > 0){
            setTableisPolulated(true)
            dataframe.plot('table_plot_area').table({
                config: {
                  displaylogo: false,
                  responsive: true,
                  displayModeBar: false,
                  tableHeaderStyle: headerStyle,
                  tableCellStyle: cellStyle,
                  sendData: false
                },
                layout: {
                  // title: "Table displaying the Titanic dataset",
                  automargin: true,
                  // height: 200,
                  autosize: true,
                  margin: {t:0,r:0,b:0,l:0},
                  paper_bgcolor: 'gray'
                }
              })
        }else{
            setTableisPolulated(false)
        }
    },[dataframe])

    return (
        <div className={classNames('static-table', 'p-5', {'h-96': is_table_populated,
                                                    'dark:bg-neutral-700': is_table_populated,
                                                    'bg-neutral-300': is_table_populated})}>
            <div id='table_plot_area'></div>
        </div>
    )
};

export default DataTable