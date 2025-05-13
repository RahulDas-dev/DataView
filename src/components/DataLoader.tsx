import { FunctionComponent, ReactElement, useCallback, useRef, useReducer, ChangeEvent } from 'react';
import { FiSettings } from 'react-icons/fi';
import { Button } from './Button';
import { useData } from '../hooks/useData';
import RadioCheckbox from './RadioCheckbox';
import FileBrowser, { FileBrowserHandle } from './FileBrowser';
import FetchUrl from './FetchUrl';
import SettingsDialog from './SettingsDialog';
import { validateFile, validateUrl } from '../utility/FileUtility';
import { dataLoaderReducer, init_state, ActionType } from '../reducers/dataLoaderReducer';
import useSettings from '../hooks/useSettings';
import { ParseConfig } from 'papaparse';
import { DataFrame, readCSV, readExcel, readJSON } from 'danfojs';


const DataLoader: FunctionComponent = (): ReactElement => {
  const fileBrowserRef = useRef<FileBrowserHandle>(null);
  const { setDataFrame, resetDataFrame } = useData();
  const [state, dispatch] = useReducer(dataLoaderReducer, init_state);
  const { settings } = useSettings()
  const { 
    uploadType, 
    isSettingsOpen, 
    showResetButton, 
    disableProcesBtn, 
    disableFileInput, 
    disableCheckBox, 
    error, 
    fileInput,
    fileUrl,
  } = state;

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        
        const validationErr_ = validateFile(e.target.files[0], settings.allowedFileExtensions);
        if (validationErr_) {
          dispatch({ 
            type: ActionType.PROCESS_ERROR, 
            payload: { error: new Error(validationErr_) }
          });
          return;
        }
        dispatch({ 
          type: ActionType.SET_FILE_OBJECT, 
          payload: { file_object: e.target.files[0] } 
        });
    } else {
      dispatch({ 
        type: ActionType.SET_FILE_OBJECT, 
        payload: { file_object: null } 
      });
    }
  }, [settings.allowedFileExtensions]);

  const handleUrlChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ 
      type: ActionType.SET_FILE_URL, 
      payload: { file_url: e.target.value } 
    });
  }, []);

  const handleInputBlur = useCallback(() => {
    if (fileUrl) {
      const validationErr_ = validateUrl(fileUrl, settings.allowedFileExtensions);
      if (validationErr_) {
        dispatch({ 
          type: ActionType.PROCESS_ERROR, 
          payload: { error: new Error(validationErr_) }
        });
        return;
      }
    } else {
      dispatch({ 
        type: ActionType.SET_FILE_URL, 
        payload: { file_url: '' } 
      });
    }
  }, [fileUrl, settings]);

  const processFile = useCallback(async () => {
    dispatch({ type: ActionType.PROCESS_START });
    
    const validationErr_ = validateFile(fileInput, settings.allowedFileExtensions);
    if (validationErr_) {
      dispatch({ 
        type: ActionType.PROCESS_ERROR, 
        payload: { error: new Error(validationErr_) }
      });
      return;
    }

    const is_csv = fileInput?.name.endsWith('.csv')
    const is_xlsx = fileInput?.name.endsWith('.xlsx') || fileInput?.name.endsWith('.xls')
    const is_json = fileInput?.name.endsWith('.json')
    try {
      console.log(`Processing file: ${fileInput?.name}`);
      const startTime = performance.now();      
      
      dispatch({ 
        type: ActionType.PROCESS_LOADING, 
        payload: { status: 'Parsing CSV data...' } 
      });
      // const fileUrl = URL.createObjectURL(fileInput!);
      // const { readCSV, readExcel, readJSON, DataFrame } = await import('danfojs');
      let df = new DataFrame();
      if ( is_csv) {
        df = await readCSV(fileInput, {worker: true, delimiter: settings.columnsSpererator}  as ParseConfig)
      } else if (is_xlsx) {
        df = await readExcel(fileInput) as DataFrame;
      }  else if (is_json) {
        df = await readJSON(fileInput ) as DataFrame;
      }
      else{
        df = await readCSV(fileUrl, {worker: true} as ParseConfig )
      }
      if (!df || df.isEmpty || df.shape[0] === 0) {
        dispatch({
          type: ActionType.PROCESS_ERROR,
          payload: { error: new Error('Empty DataFrame')}
        });
        return 
      } else {
        setDataFrame(df);
        dispatch({ type: ActionType.PROCESS_SUCCESS });
      }
      const endTime = performance.now();
      console.log(`Processing time: ${(endTime - startTime).toFixed(2)}ms`);
    } catch (error) {
      dispatch({
        type: ActionType.PROCESS_ERROR,
        payload: { error: new Error(`Error processing file: ${error instanceof Error ? error.message : String(error)}`) }
      });
    }
  }, [fileInput,fileUrl, settings, setDataFrame]);

  const processUrl = useCallback(async () => {
    dispatch({ type: ActionType.PROCESS_START });
    const validationErr_ = validateUrl(fileUrl, settings.allowedFileExtensions);
    if (validationErr_) {
      dispatch({ 
        type: ActionType.PROCESS_ERROR, 
        payload: { error: new Error(validationErr_) }
      });
      return;
    }
    try {
      console.log(`Processing URL: ${fileUrl}`);
      const startTime = performance.now();
      dispatch({ 
        type: ActionType.PROCESS_LOADING, 
        payload: { status: 'Fetching data from URL...' } 
      });
      const df = await readCSV(fileUrl);
      if (!df || df.isEmpty || df.shape[0] === 0) {
        dispatch({
          type: ActionType.PROCESS_ERROR,
          payload: { error: new Error('Empty DataFrame')}
        });
        return;
      } else{
        setDataFrame(df);
        dispatch({ type: ActionType.PROCESS_SUCCESS });
      }
      const endTime = performance.now();
      console.log(`Processing time: ${(endTime - startTime).toFixed(2)}ms`);
    } catch (error: unknown) {
      dispatch({ 
        type: ActionType.PROCESS_ERROR, 
        payload: { error: new Error('Failed to process URL: ' + (error instanceof Error ? error.message : String(error))) }
      });
    }
  }, [fileUrl,settings, setDataFrame]);

  const handleReset = useCallback(() => {
    dispatch({ type: ActionType.RESET });
    if (fileBrowserRef.current) {
      fileBrowserRef.current.reset();
    }
    resetDataFrame();
  }, [resetDataFrame]);

  const handleCloseettings = useCallback(() => {
    dispatch({ 
      type: ActionType.SET_SETTINGS_CLOSE, 
      payload: { isOpen: false } 
    });
    }, []);
  
  const handleSettingsOpen = useCallback(() => {
    dispatch({ 
      type: ActionType.SET_SETTINGS_OPEN, 
      payload: { isOpen: true } 
    });
  }, []);  

  const toggleCheckboxSelection = useCallback((value: 'file'| 'url') => {
    //file_browser_ref.current=null;
    dispatch({ 
      type: ActionType.SET_UPLOAD_TYPE, 
      payload: { uploadType: value } 
    });
  }, []);

  return (
    <div className="w-full my-20 p-6 rounded-lg bg-transparent flex flex-col justify-center items-center gap-6">
      <div className="w-full flex flex-row justify-between items-center">
        <div className="flex gap-4">
          <RadioCheckbox
            label="Browse File"
            value={uploadType==='file'? true : false}
            onChange={()=> toggleCheckboxSelection('file')}
            disabled={disableCheckBox}
            name="loader-type"
          />
          <RadioCheckbox
            label="URL Upload"
            value={uploadType==='url'? true : false}
            onChange={()=> toggleCheckboxSelection('url')}
            disabled={disableCheckBox}
            name="loader-type"
          />
        </div>
        <Button
          variant="icon"
          size="small"
          onClick={handleSettingsOpen}
          aria-label="Settings"
          className="p-2 rounded-full transition-colors"
        >
          <FiSettings className="text-lg" />
        </Button>
      </div>
      
      <div className="w-full">
        {uploadType=='file' ? (
          <FileBrowser
            disableInput={disableFileInput}
            disablebtn={disableProcesBtn}
            showResetbtn={showResetButton}
            onFileChange={handleFileChange}
            processFile={processFile}
            onReset={handleReset}
            ref={fileBrowserRef}
          />
        ) : (
          <FetchUrl
            disableInput={disableFileInput}
            disablebtn={disableProcesBtn}
            showResetbtn={showResetButton}
            onUrlChange={handleUrlChange}
            onUrlBlur={handleInputBlur}
            processUrl={processUrl}
            onReset={handleReset}
            ref={fileBrowserRef}
          />
        )}
      </div>
      
      <div className="w-full flex flex-row gap-1 justify-between items-center">
        <div className={`flex justify-center items-center px-3 py-1 font-mono text-xs ${error ? 'text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md' : 'text-transparent'}`}>
          {error?.message || 'No errors'}
        </div>
      </div>
      
      {isSettingsOpen &&       
        <SettingsDialog
          isOpen={isSettingsOpen}
          onClose={handleCloseettings}
        />
      }
    </div>
  );
};

export default DataLoader;