import { FunctionComponent, ReactElement, ChangeEvent, useRef   } from 'react'


export interface FileBrowserProps{
    filename: string
    onChange: (e:ChangeEvent<HTMLInputElement>) => void
    disabled: boolean
    onFileset: (e:ChangeEvent<HTMLInputElement>) => void
}

const FileBrowser: FunctionComponent<FileBrowserProps> = ({ filename, onChange, disabled, onFileset }):ReactElement =>{
    const file_input = useRef<HTMLInputElement>(null);
    
    /* const [btn_disabled, setDisabled] = useState<boolean>(false)

    const resetComponent = () =>{
        setFile('')
        setDisabled(false)
    }

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files!.length <= 0 ) {
            console.error('No Files Chosen')
            setErrorMessage('No Files Chosen')
            return;
        }
        try {
            const file = e.target.files![0]
            setErrorMessage('')
            setDisabled(true);
            setFile(file.name.toString())
            setFileName(file.name.toString())
            // const fileUrl = URL.createObjectURL(file);
            // const response = await fetch(fileUrl);
            // 3. get the text from the response
            // const text = await response.text();
            // 4. split the text by newline
            // const lines = text.split("\n");
            // 5. map through all the lines and split each line by comma.
            // const _data = lines.map((line) => line.split(","));
            // 6. call the onChange event
            // onChange(_data);
        } catch (error) {
            console.error(error);
            setErrorMessage('error')
        }
    } */

    return (
        <div className="relative w-full">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3">
              <i className="material-icon text-zinc-900 dark:text-neutral-300">description</i>
          </div>
          <input  type="text" 
                  className="input-box" 
                  readOnly = {disabled}
                  value={filename}
                  onChange={onChange}
                  placeholder="Browse file, CSV / TSV File type allowed only ...." />
            <button className="btn absolute end-2 bottom-2" 
                disabled={disabled} 
                onClick={() => file_input.current!.click()}>
                <input type="file" 
                      style={{display:"none"}} 
                      accept=".csv, .tsv" 
                      ref={file_input}
                      onChange={onFileset} />Browse File
            </button>  
      </div>
    );
};

export default FileBrowser