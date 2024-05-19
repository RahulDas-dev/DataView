import { createContext, useState, useLayoutEffect } from "react";
import { ILayout, Iconfig, inittail_config, inittail_layout } from "./layout_params";

export type TDisplayMode = "dark" | "light";

export type DisplayModeContextType = {
    display_mode : TDisplayMode
    layout: ILayout
    config: Iconfig
    toggleDisplayMode: ()=> void
};

export const DisplayModeContext = createContext<DisplayModeContextType>({
    display_mode: 'light',
    layout: inittail_layout,
    config: inittail_config,
    toggleDisplayMode: () => {} 
});

const get_initial_dm: ()=>TDisplayMode = () => {
    return window.matchMedia("(prefres-color-scheme: dark)").matches? 'dark': 'light'
}

const DisplayModeContextProvider = ({children}:{children: JSX.Element}) => {
    const [display_mode, setDisplayMode] = useState<TDisplayMode>(get_initial_dm());
    const [layout, setLayout] = useState<ILayout>(inittail_layout)
    const [config, setConfig] = useState<Iconfig>(inittail_config)

    useLayoutEffect(()=>{
        const root = window.document.documentElement
        if (display_mode == "dark"){
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        setLayout(()=>{
            return {
                ...layout,
                font: { ...layout.font, color:  display_mode=="dark" ? "white":"black" },
                paper_bgcolor: display_mode=="dark" ? "black": "white"
            }
        })
        setConfig(()=>{
            return {
                ...config,
                tableHeaderStyle: {
                    ...config.tableHeaderStyle,
                    fill: { color: display_mode=="dark" ?  "rgb(64 64 64)" :"rgb(212 212 212)" },
                    font: { ...config.tableHeaderStyle.font, 
                            color: display_mode=="dark" ? "rgb(212 212 212)": "rgb(38 38 38)"
                        },  
                        
                },
                tableCellStyle:  {
                    ...config.tableCellStyle,
                    line: { ...config.tableCellStyle.line,
                            color: display_mode=="dark" ? "white": "black", 
                    },
                    fill:{ color: display_mode=="dark" ? "rgb(82 82 82)": "rgb(245 245 245)" },
                    font: { ...config.tableCellStyle.font, 
                        color: display_mode=="dark" ? "rgb(212 212 212)": "rgb(38 38 38)"
                    },  
                }
              }
        })
    },[display_mode]);
    
    const toggleDisplayMode: ()=> void = () => setDisplayMode((prev)=>(prev=='light'?'dark':'light'))

    /* const context_values = useMemo(
        () => ({display_mode, toggleDisplayMode}),
        [display_mode, toggleDisplayMode]
    ) */

    const context_values = {display_mode,layout,config, toggleDisplayMode }

    return <DisplayModeContext.Provider value={context_values}>
                {children}
            </DisplayModeContext.Provider>
  };


  export default DisplayModeContextProvider