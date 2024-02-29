import { FunctionComponent, ReactElement, useContext, useEffect, useId, useRef } from 'react'
import { DataContext } from '../../context/data_context';
// import { DisplayModeContext } from '../../context/display_context';
import { DataFrame, Series } from 'danfojs';

interface IchartProp{
    name: string|number
}

interface StatData{
    stat: string|number
    value: number
}


const BarChart: FunctionComponent<IchartProp> = ({name}):ReactElement =>{
    const plot_ref = useRef<HTMLDivElement>(null)
    const stat_ref = useRef<HTMLDivElement>(null)
    const graphid = useId()
    const statid = useId()
    const {dataframe} = useContext(DataContext)
    // const {layout, config} = useContext(DisplayModeContext)

    useEffect(()=>{
        const layout = {
            margin: {t:0,r:0,b:50,l:50, autoexpand: false, pad:0 },
            width: 600,
            height: 200,
            plot_bgcolor:'rgb(350 250 250)',
            yaxis: {
              title: "Frequency",
            },
            xaxis: {
              title: name,
            },
        };

        const config1 = {
            displayModeBar: false,
            displaylogo: false,
        };
        if (dataframe.size > 0){
            dataframe[name].plot(graphid).hist({ layout, config1 })
            plot_ref.current!.scrollIntoView({block: "start", inline: "nearest", behavior: 'smooth'});
            const stat: Series = dataframe[name].describe()
            const stat_list: StatData[]  = stat.values.map(function(e, i) {
                return {stat: String(stat.index[i]), value: Number(e)};
            });
            const stat_df = new DataFrame(stat_list)
            stat_df.plot(statid).table()

        }else{
            const graph = plot_ref.current
            while( graph && graph.firstChild){
                graph.removeChild(graph.firstChild)
            }
        }
    },[dataframe])

    return (
        <div className='chart-area'>
            <div className='chart-header'>{name}</div>
            <div className='chart-section'>
                <div className='chart-stat' id={statid} ref={stat_ref}></div>
                <div className='chart-body' id={graphid} ref={plot_ref}></div>
            </div>
            
        </div>
    )
};

export default BarChart