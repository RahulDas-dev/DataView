import { FunctionComponent, ReactElement, useCallback, useRef, useReducer, ChangeEvent } from 'react';
import { FiRefreshCw, FiSettings } from 'react-icons/fi';
import { Button } from './Button';
import { useData } from '../hooks/useData';
import RadioCheckbox from './RadioCheckbox';
import FileBrowser, { FileBrowserHandle } from './FileBrowser';
import FetchUrl from './FetchUrl';
import SettingsDialog from './SettingsDialog';
import { validateFile, validateUrl } from '../utility/FileUtility';
import { dataLoaderReducer, init_state, ActionType } from '../utility/dataLoaderReducer';
import useSettings from '../hooks/useSettings';
import { Data } from 'plotly.js-dist-min';

const DataLoader: FunctionComponent = (): ReactElement => {
  //const file_browser_ref = useRef<HTMLInputElement>(null);
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
    //isLoading,
    // loadingStatus
  } = state;

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        
        const validationErr_ = validateFile(e.target.files[0]);
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
  }, []);

  const handleUrlChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ 
      type: ActionType.SET_FILE_URL, 
      payload: { file_url: e.target.value } 
    });
    /* if (file_browser_ref.current) {
      file_browser_ref.current.value = e.target.value;
    } */
  }, []);

  const handleInputBlur = useCallback(() => {
    if (fileUrl) {
      const validationErr_ = validateUrl(fileUrl);
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
  }, [fileUrl]);

  const processFile = useCallback(async () => {
    dispatch({ type: ActionType.PROCESS_START });
    
    const validationErr_ = validateFile(fileInput);
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
      const fileUrl = URL.createObjectURL(fileInput!);
      const { DataFrame , readCSV, readExcel , readJSON } = await import('danfojs')
      let df = new DataFrame();
      if ( is_csv) {
        df = await readCSV(fileUrl, {worker: true})
      } else if (is_xlsx) {
        df = await readExcel(fileUrl, {worker: true} )
      }  else if (is_json) {
        df = await readJSON(fileUrl, {worker: true} )
      }
      else{
        df = await readCSV(fileUrl, {worker: true} )
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
  }, [settings, fileInput, setDataFrame]);

  const processUrl = useCallback(async () => {
    dispatch({ type: ActionType.PROCESS_START });
    const validationErr_ = validateUrl(fileUrl);
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
      const { readCSV } = await import('danfojs');
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
  }, [fileUrl, setDataFrame]);

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
    <div className="w-full my-20 p-6 rounded-lg bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex flex-col justify-center items-center gap-6 shadow-md transition-all duration-300 ease-in-out hover:shadow-lg">
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
          className="bg-zinc-200 dark:bg-zinc-700 p-2 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
        >
          <FiSettings className="text-lg" />
        </Button>
      </div>
      
      <div className="w-full">
        {uploadType=='file' ? (
          <FileBrowser
            disableInput={disableFileInput}
            disablebtn={disableProcesBtn}
            onFileChange={handleFileChange}
            processFile={processFile}
            ref={fileBrowserRef}
          />
        ) : (
          <FetchUrl
            disableInput={disableFileInput}
            disablebtn={disableProcesBtn}
            onUrlChange={handleUrlChange}
            onUrlBlur={handleInputBlur}
            processUrl={processUrl}
            ref={fileBrowserRef}
          />
        )}
      </div>
      
      <div className="w-full flex flex-row gap-1 justify-between items-center">
        <div className={`flex justify-center items-center px-3 py-1 font-mono text-xs ${error ? 'text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md' : 'text-transparent'}`}>
          {error?.message || 'No errors'}
        </div>
        
        {/* Always render the button but control visibility with CSS */}
        <Button
          variant="secondary"
          size="small"
          onClick={handleReset}
          className={`whitespace-nowrap min-w-24 h-9 rounded-lg shadow-sm hover:shadow px-4 font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all duration-500 ease-in-out ${showResetButton ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <FiRefreshCw className="text-sm animate-pulse" /> Reset
        </Button>
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