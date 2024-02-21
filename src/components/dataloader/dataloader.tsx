import { FunctionComponent, ReactElement, useState, ChangeEvent, useCallback ,useRef  } from 'react'
import './dataloader.css';
import Checkbox from '../inputs/checkbox';
import SettingsBtn from '../button/settingsbtn';
import FileBrowser from '../inputs/file_browser';
import FetchUrl from '../inputs/url_loader';
import ResetBtn from '../button/resetbtn';


const DataLoader: FunctionComponent = ():ReactElement =>{

  const [fileLoadScheme, setFls] = useState<boolean>(true)
  const [file_url, setFileurl] = useState<string>('')
  const [file_object, setFileobject] = useState<File|null>(null)
  const [is_chkbox_disabled, setChkBoxDisabled] = useState<boolean>(false)
  const [is_inputs_disabled, setInputsDisabled] = useState<boolean>(false)
  const [is_restbtn_visible, setBtnVisibility] = useState<boolean>(false)
  const file_bsrowser_ref = useRef<HTMLInputElement>(null);

  const [error, setError] =useState<string>('')

  const restOperation = useCallback(() => {
    setChkBoxDisabled(false)
    setInputsDisabled(false)
    setError('')
    setFileurl('')
    setFileobject(null)
    setBtnVisibility(false)
    if (file_bsrowser_ref.current){
        console.log('Reset the input fileds')
        file_bsrowser_ref.current.value = "";
    }
  },[])

  const handleFileBrowse = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFileurl('')
    setFileobject(null)
      if (e.target.checked){
        setFls(true)
      } else{
        setFls(false)
      }
  },[])

  const handleUrlupload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFileurl('')
    setFileobject(null)
    if (e.target.checked){
      setFls(false)
    } else{
      setFls(true)
    }
  },[])

  const onUrlChange = useCallback((e:ChangeEvent<HTMLInputElement>) => setFileurl(e.target.value),[])

  const onFileChange = useCallback((e:ChangeEvent<HTMLInputElement>) => setFileobject(e.target.files![0]),[])

  const onFileUpload = async () => {
    try {
        setError('')
        setInputsDisabled(true);
        setChkBoxDisabled(true)
        console.log(`File Name ${file_object!.name.toString()}`)
        const fileUrl = URL.createObjectURL(file_object!);
        const response = await fetch(fileUrl);
        const text = await response.text();
        const lines = text.split("\n");
        const _data = lines.map((line) => line.split(","));
        console.log(`Total Number of Sample ${_data.length}`)
    } catch (error: any) {
      if (error instanceof Error){
          console.error(error.message);
          setError(error.message)
      } else{
          console.error(error);
          setError('Some Unknown Error .....')
      }
    }
    finally{
      setBtnVisibility(true)
    }
  }

  const onFileDownload = async () => {
    if (file_url.length <= 0 ) {
        console.error('No Files Chosen')
        setError('No Files Chosen')
        return;
    }
    setError('') 
    setInputsDisabled(true)
    setChkBoxDisabled(true)
    
    try{
      const data_Url =new URL(file_url);
      console.log(`File URL ${data_Url}`)
      const response = await fetch(data_Url);
      const text = await response.text();
      const lines = text.split("\n");
      const _data = lines.map((line) => line.split(","))
      console.log(`Total Number of Sample ${_data.length}`)
    } catch (error: any) {
        if (error instanceof Error){
            console.error(error);
            setError(error.message)
        } else{
            console.error(error);
            setError('Some Unknown Error .....')
        }
    }
    finally{
      setBtnVisibility(true)
    }
  }

  return (
    <div className="dataloader">  
        <div className='settings-area'>
              <div className='block'>
                  <Checkbox label='Browse File' 
                            value={fileLoadScheme} 
                            onChange={handleFileBrowse} 
                            disabled={is_chkbox_disabled}/>
                  <Checkbox label='URL Upload' 
                            value={!fileLoadScheme} 
                            onChange={handleUrlupload} 
                            disabled={is_chkbox_disabled}/>
              </div>
              <SettingsBtn onClick = {()=>{}} />
        </div> 
        <div className='w-full'>
            { fileLoadScheme && <FileBrowser  file = {file_object}
                                              disabled ={is_inputs_disabled} 
                                              onChange={onFileChange} 
                                              onUpload={onFileUpload}
                                              ref = {file_bsrowser_ref}/>}
            { !fileLoadScheme && <FetchUrl    fileurl={file_url} 
                                              disabled = {is_inputs_disabled}
                                              onChange={onUrlChange} 
                                              onSubmit={onFileDownload} />}
        </div> 
        <div className="output-area">
            <div className='err-area'>{error}</div>
            <ResetBtn onClick={restOperation} invisble= {!is_restbtn_visible}/>
        </div>
    </div>
  )
};

export default DataLoader