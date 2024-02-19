import { FunctionComponent, ReactElement, useState, ChangeEvent, useCallback   } from 'react'
import './dataloader.css';
import Checkbox from '../inputs/checkbox';
import SettingsBtn from '../button/settingsbtn';
import FileBrowser from '../inputs/file_browser';
import FetchUrl from '../inputs/url_loader';
import ResetBtn from '../button/resetbtn';


const DataLoader: FunctionComponent = ():ReactElement =>{

  const [fileLoadScheme, setFls] = useState<boolean>(true)
  const [filename, setFilename] = useState<string>('')
  const [chkbox_disabled, setChkBoxDisabled] = useState<boolean>(false)
  const [btn_disabled, setBtnDisabled] = useState<boolean>(false)

  const [error, setError] =useState<string>('')

  const is_filename_empty = useCallback(() => filename.trim().length > 0 ? false: true,[filename])

  const restOperation = useCallback(() => {
    setChkBoxDisabled(false)
    setBtnDisabled(false)
    setError('')
    setFilename('')
    console.log('Reset the input fileds')
  },[])

  const handleFileBrowse = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      setFilename('')
      if (e.target.checked){
        setFls(true)
      } else{
        setFls(false)
      }
  },[])

  const handleUrlupload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFilename('')
    if (e.target.checked){
      setFls(false)
    } else{
      setFls(true)
    }
  },[])

  const onUrlChange = useCallback((e:ChangeEvent<HTMLInputElement>) => setFilename(e.target.value),[])

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files!.length <= 0 ) {
        setFilename('')
        console.error('No Files Chosen')
        setError('No Files Chosen')
        return;
    }
    try {
        const file = e.target.files![0]
        setError('')
        setBtnDisabled(true);
        setChkBoxDisabled(true)
        setFilename(file.name.toString())
        console.log(`File Name ${file.name.toString()}`)
        /* 
        const fileUrl = URL.createObjectURL(file);
        const response = await fetch(fileUrl);
        const text = await response.text();
        const lines = text.split("\n");
        const _data = lines.map((line) => line.split(","));
        onChange(_data);
        */
    } catch (error) {
        console.error(error);
        setError('error')
    }
    finally{
      
    }
  }

  const fetch_url = async () => {
    console.log(`File URL ${filename}`)
    if (filename.length <= 0 ) {
        console.error('No Files Chosen')
        setError('No Files Chosen')
        return;
    }
    setError('') 
    setBtnDisabled(true)
    setChkBoxDisabled(true)
    setFilename(filename)
    console.log(`File URL ${filename}`)
    try{
      const response = await fetch(filename);
      const text = await response.text();
      const lines = text.split("\n");
      const _data = lines.map((line) => line.split(","))
    } catch (error) {
      console.error(error);
      setError('error')
    }
    finally{
      
    }
  }

  return (
    <div className="dataloader">  
        <div className='settings-area'>
              <div className='block'>
                  <Checkbox label='Browse File' 
                            value={fileLoadScheme} 
                            onChange={handleFileBrowse} 
                            disabled={chkbox_disabled}/>
                  <Checkbox label='URL Upload' 
                            value={!fileLoadScheme} 
                            onChange={handleUrlupload} 
                            disabled={chkbox_disabled}/>
              </div>
              <SettingsBtn onClick = {()=>{}} />
        </div> 
        <div className='w-full'>
            { fileLoadScheme && <FileBrowser  filename={filename} 
                                              disabled ={btn_disabled} 
                                              onChange={onFileChange} />}
            { !fileLoadScheme && <FetchUrl    fileurl={filename} 
                                              disabled = {btn_disabled}
                                              onChange={onUrlChange} 
                                              onSubmit={fetch_url} />}
        </div> 
        <div className="output-area">
            <div className='err-area'>
              { error && <span className='err-msg'>{error}</span> }
            </div>
            <ResetBtn onClick={restOperation} invisble= {is_filename_empty()}/>
        </div>
    </div>
  )
};

export default DataLoader