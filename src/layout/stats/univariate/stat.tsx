import { FunctionComponent, ReactElement, useContext, useEffect, useId, useRef } from "react";
import { EColTypes, EcolumnProps } from "./props";
import { DisplayModeContext } from "../../../context/display_context";
import { DataContext } from "../../../context/data_context";
import { DataFrame, Series } from "danfojs";

interface StatData{
    stat: string|number
    value: number
}

const StatArea: FunctionComponent<EcolumnProps> = ({colname, dtype }):ReactElement =>{
    const statid = useId()
    const stat_ref = useRef<HTMLDivElement>(null)
    const {dataframe} = useContext(DataContext)
    const {layout, config} = useContext(DisplayModeContext)

    useEffect(()=>{
        if (dataframe.size > 0){
            layout.height = 169;
            if (dtype == EColTypes.Numerical){
                const stat: Series = dataframe[colname].describe()
                const stat_list: StatData[]  = stat.values.map(function(e, i) {
                    return {stat: String(stat.index[i]), value: Number(e)};
                });
                const stat_df = new DataFrame(stat_list)
                stat_df.plot(statid).table({config,layout})
            }else{
                console.log('Not implemented for categorical datat')
            }
        }
        else{
            const colstat_table = stat_ref.current
            while( colstat_table && colstat_table.firstChild){
                colstat_table.removeChild(colstat_table.firstChild)
            }
        }    
        return ()=>{
            const colstat_table = stat_ref.current
            while( colstat_table && colstat_table.firstChild){
                colstat_table.removeChild(colstat_table.firstChild)
            }
        }
    },[dataframe, statid, layout, config])

    
    return (
        <div className='column-stat' id={statid} ref={stat_ref}></div>
    )
}

export default StatArea