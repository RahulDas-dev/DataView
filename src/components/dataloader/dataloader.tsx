import { FunctionComponent, ReactElement, useRef, useState, ChangeEvent   } from 'react'
import './dataloader.css';
import classNames from 'classnames'
import Checkbox from '../checkbox/checkbox';
import FileBrowser from '../filebrowser/file_browser';
import FetchUrl from '../url_loader';




const DataLoader: FunctionComponent = ():ReactElement =>{

  const [fileLoadScheme, setFls] = useState<boolean>(true)
  const [filename, setFilename] = useState<string>('')
  const [chkbox_disabled, setChkBoxDisabled] = useState<boolean>(false)
  const [btn_disabled, setBtnDisabled] = useState<boolean>(false)
  const [error, setError] =useState<string>('')

  const is_filename_empty = (fname: string) => fname.trim().length > 0 ? false: true

  const restOperation = () => {
    setChkBoxDisabled(false)
    setBtnDisabled(false)
    setError('')
  }

  const handleFileBrowse = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked){
      setFls(true)
    } else{
      setFls(false)
    }
  }

  const handleUrlupload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked){
      setFls(false)
    } else{
      setFls(true)
    }
  }

  return (
    <div className="dataloader">  
      <div className='settings-area'>
        <div>
          <Checkbox label='Browse File' value={fileLoadScheme}  onChange={handleFileBrowse} disabled={chkbox_disabled}/>
          <Checkbox label='URL Upload'  value={!fileLoadScheme} onChange={handleUrlupload} disabled={chkbox_disabled}/>
        </div>
        <button className="btn-icon block">
            <i className="material-icon text-zinc-900 dark:text-neutral-300">settings</i>
        </button>
      </div> 
      <div className='w-full'>
        { fileLoadScheme && <FileBrowser  filename={filename} 
                                          disabled ={btn_disabled} 
                                          onChange={} 
                                          onFileset={}/> }
        { !fileLoadScheme && <FetchUrl  fileurl={filename} 
                                        disabled = {btn_disabled}
                                        onChange={} 
                                        onSubmit={setFilename} />}
      </div> 
      <div className="output-area">
        <div className='text-red-500 font-mono px-2'>
          {error}
        </div>
        <button className={classNames("btn","mr-2",{'invisible': is_filename_empty(filename)})} onClick={restOperation}>
          Reset<i className="material-icon dark:text-zinc-900 text-neutral-300 pl-2">restart_alt</i>   
        </button>
      </div>
    </div>
  )
};

export default DataLoader