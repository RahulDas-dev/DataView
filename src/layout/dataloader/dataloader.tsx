import { FunctionComponent, ReactElement, ChangeEvent, useCallback ,useRef, useContext, useReducer  } from 'react'
import './dataloader.css';
import Checkbox from '../../components/inputs/checkbox';
import SettingsBtn from '../../components/button/settingsbtn';
import FileBrowser from '../../components/inputs/file_browser';
import FetchUrl from '../../components/inputs/url_loader';
import ResetBtn from '../../components/button/resetbtn';

import { readCSV, DataFrame } from "danfojs";
import { DataContext } from '../../context/data_context';
import { dataLoaderReducer, init_state, ActionType } from './reducer';

const DataLoader: FunctionComponent = ():ReactElement =>{
  const file_bsrowser_ref = useRef<HTMLInputElement>(null);
  const {setDataFrame} = useContext(DataContext)
  const [state, dispatch] = useReducer(dataLoaderReducer, init_state);

  const restOperation = useCallback(() => {
    dispatch({ type: ActionType.RESET_LOADER})
    if (file_bsrowser_ref.current){
        file_bsrowser_ref.current.value = "";
    }
    setDataFrame(new DataFrame())
  },[setDataFrame])

  const handleFileBrowse = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: ActionType.RESET_FILE_AND_URL})
      if (e.target.checked){
        dispatch({ type: ActionType.SET_LOAD_SCHEM_AS_FILE})
      } else{
        dispatch({ type: ActionType.SET_LOAD_SCHEM_AS_URL})
      }
  },[])

  const handleUrlupload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: ActionType.RESET_FILE_AND_URL})
    if (e.target.checked){
        dispatch({ type: ActionType.SET_LOAD_SCHEM_AS_URL})
    } else{
        dispatch({ type: ActionType.SET_LOAD_SCHEM_AS_FILE})
    }
  },[])

  const onUrlChange = useCallback((e:ChangeEvent<HTMLInputElement>) =>{ 
      dispatch({type:ActionType.SET_FILE_URL, payload:{file_url: e.target.value}})
  },[])

  const onFileChange = useCallback((e:ChangeEvent<HTMLInputElement>) => {
    dispatch({type:ActionType.SET_FILE_OBJECT, payload: {file_object: e.target.files![0]}})
  },[])

  const onFileUpload = useCallback(async () => {
    try {
        console.log(`File Name ${state.file_object!.name.toString()}`)
        dispatch({type:ActionType.URL_LOAD_INIT})
        const fileUrl = URL.createObjectURL(state.file_object!);
        readCSV(fileUrl)
        .then(df => {
            // df.print()
            console.log(`DataFrame Shape [${df.shape}] `)
            setDataFrame(df)
        }).catch(error => {
          if (error instanceof Error){
              console.error(error.message);
              dispatch({type:ActionType.SET_ERROR, payload: {error: error.message}})
          } else{
              console.error(error);
              dispatch({type:ActionType.SET_UNKNOWN_ERROR})
          }
        })
    } catch (error: unknown) {
      if (error instanceof Error){
          console.error(error.message);
          dispatch({type:ActionType.SET_ERROR, payload: {error: error.message}})
      } else{
          console.error(error);
          dispatch({type:ActionType.SET_UNKNOWN_ERROR})
      }
    }
    finally{
      dispatch({type:ActionType.SET_RESET_BTN_VISIBLE})
    }
  },[state, setDataFrame])

  const onFileDownload = useCallback(async () => {
    if (state.file_url.length <= 0 ) {
        console.error('No Files Chosen')
        dispatch({type:ActionType.SET_ERROR, payload: {error:'No Files Chosen'}})
        return;
    }
    dispatch({type:ActionType.URL_LOAD_INIT})
    try{
      const data_Url =new URL(state.file_url);
      console.log(`File URL ${data_Url}`)
      readCSV(state.file_url)
      .then(df => {
          //df.print()
          console.log(`DataFrame Shape [${df.shape}] `)
          setDataFrame(df)
      }).catch(error => {
        if (error instanceof Error){
            console.error(error.message);
            dispatch({type:ActionType.SET_ERROR, payload: {error: error.message}})
        } else{
            console.error(error);
            dispatch({type:ActionType.SET_UNKNOWN_ERROR})
        }
      })
    } catch (error: unknown) {
        if (error instanceof Error){
            console.error(error);
            dispatch({type:ActionType.SET_ERROR, payload: {error: error.message}})
        } else{
            console.error(error);
            dispatch({type:ActionType.SET_UNKNOWN_ERROR})
        }
    }
    finally{
      dispatch({type:ActionType.SET_RESET_BTN_VISIBLE})
    }
  },[state, setDataFrame])

  return (
    <div className="dataloader">  
        <div className='settings-area'>
              <div className='block'>
                  <Checkbox label='Browse File' 
                            value={state.file_load_scheme} 
                            onChange={handleFileBrowse} 
                            disabled={state.is_chkbox_disabled}/>
                  <Checkbox label='URL Upload' 
                            value={!state.file_load_scheme} 
                            onChange={handleUrlupload} 
                            disabled={state.is_chkbox_disabled}/>
              </div>
              <SettingsBtn onClick = {()=>{}} />
        </div> 
        <div className='w-full'>
            { state.file_load_scheme && <FileBrowser  file = {state.file_object}
                                              disabled ={state.is_inputs_disabled} 
                                              onChange={onFileChange} 
                                              onUpload={onFileUpload}
                                              ref = {file_bsrowser_ref}/>}
            { !state.file_load_scheme && <FetchUrl    fileurl={state.file_url} 
                                              disabled = {state.is_inputs_disabled}
                                              onChange={onUrlChange} 
                                              onSubmit={onFileDownload} />}
        </div> 
        <div className="output-area">
            <div className='err-area'>{state.error}</div>
            <ResetBtn onClick={restOperation} invisble= {!state.is_restbtn_visible}/>
        </div>
    </div>
  )
};

export default DataLoader