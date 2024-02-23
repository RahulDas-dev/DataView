import { createContext, useState, useLayoutEffect } from "react";

export type TDisplayMode = "dark" | "light";

export type DisplayModeContextType = {
    display_mode : TDisplayMode
    toggleDisplayMode: ()=> void
};

export const DisplayModeContext = createContext<DisplayModeContextType>({
    display_mode: 'light',
    toggleDisplayMode: () => {} 
});

const get_initial_dm: ()=>TDisplayMode = () => {
    return window.matchMedia("(prefres-color-scheme: dark)").matches? 'dark': 'light'
}

const DisplayModeContextProvider = ({children}:{children: JSX.Element}) => {
    const [display_mode, setDisplayMode] = useState<TDisplayMode>(get_initial_dm());
    
    useLayoutEffect(()=>{
        const root = window.document.documentElement
        if (display_mode == "dark"){
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    },[display_mode]);
    
    const toggleDisplayMode: ()=> void = () => setDisplayMode((prev)=>(prev=='light'?'dark':'light'))

    /* const context_values = useMemo(
        () => ({display_mode, toggleDisplayMode}),
        [display_mode, toggleDisplayMode]
    ) */

    const context_values = {display_mode, toggleDisplayMode }

    return <DisplayModeContext.Provider value={context_values}>
                {children}
            </DisplayModeContext.Provider>
  };


  export default DisplayModeContextProvider