import { useEffect, useState }  from "react";


export type TColorScheme = "dark" | "light";

const get_initial_cs: ()=>TColorScheme = () => {
    return window.matchMedia("(prefres-color-scheme: dark)").matches? 'dark': 'light'
}

export const useColorScheme:()=>[TColorScheme, ()=> void] = () => {
    const [color_scheme, setCs] = useState<TColorScheme>(get_initial_cs)

    useEffect(()=>{
        const root = window.document.documentElement
        if (color_scheme == "dark"){
            root.classList.remove('light');
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
            root.classList.add('light');
        }
    },[color_scheme]);

    const toggleCs: ()=> void = () => setCs((prev)=>(prev=='light'?'dark':'light'))

    return [color_scheme, toggleCs]
}