import { ChangeEvent, FunctionComponent, ReactElement, useCallback, useId   } from 'react'
import classNames from 'classnames'

export interface FetchUrlProps{
    fileurl: string
    onChange: (e:ChangeEvent<HTMLInputElement>) => void
    disabled: boolean
    onSubmit: () => void
}

const FetchUrl: FunctionComponent<FetchUrlProps> = ({ fileurl, onChange, disabled, onSubmit }):ReactElement =>{
    const inputId1 = useId();
    const is_url_empty = useCallback(() => fileurl.trim().length > 0 ? false: true,[fileurl])

    return (
        <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3">
                <i className="material-icon text-neutral-800 dark:text-neutral-300">link</i>
            </div>
            <input  type="text" 
                    id={inputId1}
                    className="input-box" 
                    readOnly = {disabled}
                    value={fileurl}
                    onChange={onChange}
                    placeholder="Paste Url, CSV / TSV File type allowed only ...." />
        
            <button className={classNames("btn absolute end-2 bottom-2",{'invisible': is_url_empty()})} 
                    onClick={onSubmit}
                    disabled={disabled}>Fetch Data</button> 
        </div>
      );
};

export default FetchUrl
