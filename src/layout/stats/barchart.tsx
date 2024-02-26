import { FunctionComponent, ReactElement, useContext, useEffect, useId, useRef } from 'react'
import { DataContext } from '../../context/data_context';
import { DisplayModeContext } from '../../context/display_context';

interface IchartProp{
    name: string|number
}

const BarChart: FunctionComponent<IchartProp> = ({name}):ReactElement =>{
    const plot_ref = useRef<HTMLDivElement>(null)
    const graphid = useId()
    const {dataframe} = useContext(DataContext)
    const {layout, config} = useContext(DisplayModeContext)
    useEffect(()=>{
        if (dataframe.size > 0){
            dataframe[name].plot(graphid).hist({config,layout})
            plot_ref.current!.scrollIntoView({block: "start", inline: "nearest", behavior: 'smooth'});
        }else{
            const graph = plot_ref.current
            while( graph && graph.firstChild){
                graph.removeChild(graph.firstChild)
            }
        }
    },[dataframe])

    return (
        <div className='chart-area'>
            <div className='charrt-header'>{name}</div>
            <div className='chart-section'>
                <div className='chart-stat'></div>
                <div className='main-chart' id={graphid} ref={plot_ref}></div>
            </div>
            
        </div>
    )
};

export default BarChart