import { FunctionComponent, ReactElement, useContext, useEffect, useId, useRef, useState } from "react";
import Checkbox from "../../../components/inputs/checkbox";
import { DataContext } from "../../../context/data_context";
import './plot.css';
import { EcolumnProps, EColTypes } from "./props";

enum EPlotType{
    histogram = "histogram",
    boxplot = "boxplot",
    violinplot = "violine",
    densityplot = 'densityplot',
    barplot = 'barplot'
}


const PlotArea: FunctionComponent<EcolumnProps> = ({colname, dtype }):ReactElement =>{
    const graphid = useId()
    const plot_ref = useRef<HTMLDivElement>(null)
    const {dataframe} = useContext(DataContext)
    const [plotOption, SetPlotOption] = useState<EPlotType>(EPlotType.histogram)

    useEffect(()=>{
        const layout = {
            margin: {t:0,r:0,b:30,l:50, autoexpand: false, pad:0 },
            height: 200,
            autosize: true,
            plot_bgcolor:'rgb(350 250 250)',
            yaxis: {
              title: "Frequency",
            },
            xaxis: {
              title: colname,
            },
            bargap: 0.25, 
            barmode: "overlay", 
        };
        const config = {
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
            if (dtype == EColTypes.Numerical){
                if (plotOption == EPlotType.histogram)
                    dataframe[colname].plot(graphid).hist({ layout, config})
                else if (plotOption == EPlotType.boxplot){
                    dataframe[colname].plot(graphid).box({ layout, config })
                }else if (plotOption == EPlotType.violinplot){
                    dataframe[colname].plot(graphid).violin({ layout, config})
                }
            // plot_ref.current!.scrollIntoView({block: "start", inline: "nearest", behavior: 'smooth'});
            } else if (dtype == EColTypes.Categorical) {
                SetPlotOption(EPlotType.barplot)
                dataframe[colname].plot(graphid).bar({ layout, config})
            } else{
                const graph = plot_ref.current
                while( graph && graph.firstChild){
                    graph.removeChild(graph.firstChild)
                }
            }
        } else {
            const graph = plot_ref.current
            while( graph && graph.firstChild){
                graph.removeChild(graph.firstChild)
            }
        }
        return ()=>{
            const graph = plot_ref.current
            while( graph && graph.firstChild){
                graph.removeChild(graph.firstChild)
            }
        }
    },[dataframe, graphid, plotOption, colname])
    
    return (
        <div className='chart-body'>
            <div className='chart-option'>
                {dtype == EColTypes.Numerical && <Checkbox label='Histogram' 
                        value={plotOption == EPlotType.histogram} 
                        onChange={() => SetPlotOption(EPlotType.histogram)} 
                        disabled={false}/>
                }        
                {dtype == EColTypes.Numerical && <Checkbox label='Box Plot' 
                        value={plotOption == EPlotType.boxplot} 
                        onChange={() => SetPlotOption(EPlotType.boxplot)} 
                        disabled={false}/>
                }        
                {dtype == EColTypes.Numerical && <Checkbox label='Violin Plot' 
                        value={plotOption == EPlotType.violinplot} 
                        onChange={() => SetPlotOption(EPlotType.violinplot)} 
                        disabled={false}/>
                }    
                {dtype == EColTypes.Categorical && <Checkbox label='Bar Plot' 
                        value={true} 
                        onChange={() => SetPlotOption(EPlotType.violinplot)} 
                        disabled={true}/>
                }                             
            </div>
            <div className='plot-area' id={graphid} ref={plot_ref}></div>
        </div>
    )
}

export default PlotArea