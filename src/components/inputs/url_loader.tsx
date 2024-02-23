import { ChangeEvent, FunctionComponent, ReactElement, useEffect, useId, useState   } from 'react'
import classNames from 'classnames'

export interface FetchUrlProps{
    fileurl: string
    onChange: (e:ChangeEvent<HTMLInputElement>) => void
    disabled: boolean
    onSubmit: () => void
}

const FetchUrl: FunctionComponent<FetchUrlProps> = ({ fileurl, onChange, disabled, onSubmit }):ReactElement =>{
    const inputId1 = useId();

    const [is_url_empty, setEmptyState] = useState<boolean>(true)

    useEffect(()=>{
        if (fileurl.trim().length > 0 ){
            setEmptyState(false)
        } else{
            setEmptyState(true)
        }
        return () =>{
            setEmptyState(true)
        }
    },[fileurl])

    return (
        <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center me-4 py-2 px-4 bg-neutral-800 rounded-l-md">
                <i className="material-icon bg-neutral-800 text-neutral-300 dark:text-neutral-300">link</i>
            </div>
            <input  type="text" 
                    id={inputId1}
                    className="input-box pr-32" 
                    disabled = {disabled}
                    value={fileurl}
                    onChange={onChange}
                    placeholder="Paste Url, CSV/TSV File type allowed only ...." />
        
            <button className={classNames("btn absolute end-1 bottom-1",{'invisible': is_url_empty})} 
                    onClick={onSubmit}
                    disabled={disabled}>Fetch Data</button> 
        </div>
      );
};

export default FetchUrl
