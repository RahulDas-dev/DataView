import { ChangeEvent, FunctionComponent, ReactElement   } from 'react'


export interface FetchUrlProps{
    fileurl: string
    onChange: (e:ChangeEvent<HTMLInputElement>) => void
    disabled: boolean
    onSubmit: () => void
}

const FetchUrl: FunctionComponent<FetchUrlProps> = ({ fileurl, onChange, disabled, onSubmit }):ReactElement =>{
    /* const [filename, setFile] = useState<string>('')
    const [btn_disabled, setDisabled] = useState<boolean>(false)

    const resetComponent = () =>{
        setFile('')
        setDisabled(false)
    }
    
    const fetch_from_url = async () => {
        if (filename.length <= 0 ) {
            console.error('No Files Chosen')
            setErrorMessage('No Files Chosen')
            return;
        }
        setErrorMessage('') 
        setDisabled(true)
        setFile(filename)
        setFileName(filename)
        console.log(`File URL ${filename}`)
        fetch(filename)
        .then(()=>{
        console.log('Fetching Complete ....')
        }).catch((error) => {
        console.error(error)
        setError(error)
        }) 
    } */

    return (
        <div className="relative w-full">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3">
              <i className="material-icon text-zinc-900 dark:text-neutral-300">link</i>
          </div>
          <input  type="text" 
                  className="input-box" 
                  readOnly = {disabled}
                  value={fileurl}
                  onChange={onChange}
                  placeholder="Paste Url, CSV / TSV File type allowed only ...." />
            
            <button className="btn absolute end-2 bottom-2" 
                    onClick={onSubmit}
                    disabled={disabled}>Fetch Data</button> 
      </div>
      );
};

export default FetchUrl