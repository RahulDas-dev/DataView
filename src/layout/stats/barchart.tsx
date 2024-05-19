import { FunctionComponent, ReactElement, useContext, useEffect, useId, useRef } from 'react'
import { DataContext } from '../../context/data_context';
import { DisplayModeContext } from '../../context/display_context';
import { DataFrame, Series } from 'danfojs';
import Checkbox from '../../components/inputs/checkbox';

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
    const {layout, config} = useContext(DisplayModeContext)
    // const {layout, config} = useContext(DisplayModeContext)

    useEffect(()=>{
        const layout_g = {
            margin: {t:0,r:0,b:50,l:50, autoexpand: false, pad:0 },
            height: 250,
            autosize: true,
            plot_bgcolor:'rgb(350 250 250)',
            yaxis: {
              title: "Frequency",
            },
            xaxis: {
              title: name,
            },
            bargap: 0.25, 
            barmode: "overlay", 
        };
        layout.height = 250;
        const config_g = {
            displayModeBar: false,
            displaylogo: false,
            responsive: true,
            sendData: false,
            marker: {
                color: "rgba(200, 200, 102, 0.7)",
                line: {
                    color:  "rgba(100, 200, 102, 1)", 
                    width: 1,
                }
            },
            opacity: 0.75, 
        };
        if (dataframe.size > 0){
            dataframe[name].plot(graphid).hist({ layout:layout_g, config:config_g })
            plot_ref.current!.scrollIntoView({block: "start", inline: "nearest", behavior: 'smooth'});
            const stat: Series = dataframe[name].describe()
            const stat_list: StatData[]  = stat.values.map(function(e, i) {
                return {stat: String(stat.index[i]), value: Number(e)};
            });
            const stat_df = new DataFrame(stat_list)
            stat_df.plot(statid).table({config,layout})

        }else{
            const graph = plot_ref.current
            while( graph && graph.firstChild){
                graph.removeChild(graph.firstChild)
            }
        }
    },[dataframe, graphid, statid])

    return (
        <div className='chart-area'>
            <div className='chart-header'>{name}</div>
            <div className='chart-section'>
                <div className='chart-stat' id={statid} ref={stat_ref}></div>
                <div className='chart-body'>
                    <div className='chart-option'>
                        <Checkbox label='Histogram' 
                                value={true} 
                                onChange={()=>{}} 
                                disabled={false}/>
                        <Checkbox label='Box Plot' 
                                value={false} 
                                onChange={()=>{}} 
                                disabled={false}/>
                    </div>
                    <div className='plot-area' id={graphid} ref={plot_ref}></div>
                </div>
                
            </div>
            
        </div>
    )
};

export default BarChart