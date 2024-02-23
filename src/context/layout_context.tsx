import { createContext, useContext, useEffect, useState } from "react";
import { DisplayModeContext } from "./display_context";


export interface ILayout{
    // title: "Table displaying the Titanic dataset",
    automargin: boolean,
    // height: 200,
    autosize: boolean,
    margin: {t:number, r:number, b:number, l:number},
    paper_bgcolor: string
}

export interface IHeaderStyle {
    align: string,
    fill: { color: string[] },
    font: { family: string, size: number, color: string },
}

export interface ICellStyle {
    align: string[],
    line: { color: string, width: number }
}

export interface Iconfig {
    displaylogo: boolean,
    responsive: boolean,
    displayModeBar: boolean,
    tableHeaderStyle: IHeaderStyle,
    tableCellStyle: ICellStyle,
    sendData: boolean
}


export type LayoutContextType = {
    layout: ILayout
    config: Iconfig
};


export const LayoutContext = createContext<LayoutContextType>({
    layout: {
        // title: "Table displaying the Titanic dataset",
        automargin: true,
        // height: 200,
        autosize: true,
        margin: {t:0,r:0,b:0,l:0},
        paper_bgcolor: 'gray'
    },
    config: {
        displaylogo: false,
        responsive: true,
        displayModeBar: false,
        tableHeaderStyle: {
            align: "center",
            fill: { color: ['lightgrey'] },
            font: { family: "Arial", size: 10, color: "black" },    
        },
        tableCellStyle:  {
            align: ["center"],
            line: { color: "black", width: 0.1 }
        },
        sendData: false
      },
});


const LayoutContextProvider = ({children}:{children: JSX.Element}) => {
    const {display_mode} = useContext(DisplayModeContext);
    const [layout, setLayout] = useState<ILayout>({
        automargin: true,
        autosize: true,
        margin: {t:0,r:0,b:0,l:0},
        paper_bgcolor: 'gray'
    })
    const [config, setConfig] = useState<Iconfig>({
        displaylogo: false,
        responsive: true,
        displayModeBar: false,
        tableHeaderStyle: {
            align: "center",
            fill: { color: ['lightgrey'] },
            font: { family: "Poppins", size: 10, color: "black" },    
        },
        tableCellStyle:  {
            align: ["left"],
            line: { color: "black", width: 0.1 }
        },
        sendData: false
      })

    useEffect(()=>{
        setLayout(()=>{
            return {
                ...layout,
                paper_bgcolor: display_mode=="dark" ? "black": "white"
            }
        })
        setConfig(()=>{
            return {
                ...config,
                tableHeaderStyle: {
                    ...config.tableHeaderStyle,
                    font: { ...config.tableHeaderStyle.font, 
                            color: display_mode=="dark" ? "white": "black"
                        },    
                },
                tableCellStyle:  {
                    ...config.tableCellStyle,
                    line: { ...config.tableCellStyle.line,
                            color: display_mode=="dark" ? "white": "black", 
                    }
                }
              }
        })
    },[display_mode])

    const context_values = {layout, config }
    
    return  <LayoutContext.Provider value={context_values}>
                {children}
            </LayoutContext.Provider>
  };


  export default LayoutContextProvider