import classNames from 'classnames';
import { ReactElement, ChangeEvent, useId, forwardRef, useState, useEffect  } from 'react'


export interface FileBrowserProps{
    file : File|null
    onChange: (e:ChangeEvent<HTMLInputElement>) => void
    disabled: boolean
    onUpload: ()=> void
}

const FileBrowser = forwardRef<HTMLInputElement,FileBrowserProps>(({file, onChange, disabled, onUpload }, fref):ReactElement =>{
    const inputId  = useId();  
    const [is_file_empty, setEmptyState] = useState<boolean>(true)

    useEffect(()=>{
        if (file == null){
            setEmptyState(true)
        } else{
            setEmptyState(false)
        }
        return () =>{
            setEmptyState(true)
        }
    },[file])

    return (
        <div className="relative w-full">

            <label htmlFor="file-input" className="sr-only">Choose file</label>
            <input type="file"
                ref={fref} 
                id={inputId} 
                disabled={disabled}
                placeholder="Browse file, CSV / TSV File type allowed only ...."
                accept=".csv, .tsv" 
                onChange={onChange}
                className="input-file" />

            <button className={classNames("btn absolute end-1 bottom-1",{'invisible': is_file_empty })} 
                    onClick={onUpload}
                    disabled={disabled}>Fetch Data</button>        
        </div>
    );
});

export default FileBrowser
