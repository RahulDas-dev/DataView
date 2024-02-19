import { FunctionComponent, ReactElement, ChangeEvent, useId   } from 'react'


export interface FileBrowserProps{
    filename: string
    onChange: (e:ChangeEvent<HTMLInputElement>) => void
    disabled: boolean
}

const FileBrowser: FunctionComponent<FileBrowserProps> = ({ filename, onChange, disabled }):ReactElement =>{
    const inputId  = useId();    

    return (
        <div className="relative w-full">

            <label htmlFor="file-input" className="sr-only">Choose file</label>
            <input type="file" 
                id={inputId} 
                value={filename}
                disabled={disabled}
                placeholder="Browse file, CSV / TSV File type allowed only ...."
                accept=".csv, .tsv" 
                onChange={onChange}
                className="input-file" />
      </div>
    );
};

export default FileBrowser
