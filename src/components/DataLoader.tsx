import { FunctionComponent, ReactElement, ChangeEvent, useCallback, useRef, useReducer, useEffect, useState } from 'react';
import { FiRefreshCw, FiSettings } from 'react-icons/fi';
import { Button } from './Button';
import { DataFrame } from "danfojs";
import { useData } from '../hooks/useData';
import RadioCheckbox from './RadioCheckbox';
import FileBrowser from './FileBrowser';
import FetchUrl from './FetchUrl';
import SettingsDialog from './SettingsDialog';
import { dataLoaderReducer, init_state, ActionType } from '../reducers/dataLoaderReducer';

const DataLoader: FunctionComponent = (): ReactElement => {
  const file_browser_ref = useRef<HTMLInputElement>(null);
  const { dataFrame, setDataFrame } = useData();
  const [state, dispatch] = useReducer(dataLoaderReducer, init_state);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Validate dataFrame and set error if invalid - but only after a loading attempt
  useEffect(() => {
    if (state.is_restbtn_visible && dataFrame && (!dataFrame.shape || dataFrame.shape[0] === 0)) {
      dispatch({ type: ActionType.SET_ERROR, payload: { error: 'No data available or empty dataset' } });
    } else if (state.error) {
      dispatch({ type: ActionType.CLEAR_ERROR });
    }
  }, [dataFrame, state.is_restbtn_visible, state.error]);
  
  // URL validation function
  const validateUrl = (url: string): { valid: boolean; message: string } => {
    // Check if URL is empty
    if (url.trim() === '') {
      return { valid: false, message: 'No URL provided' };
    }

    try {
      // Try to create a URL object to validate format
      const urlObj = new URL(url);
      
      // Check protocol - only http/https allowed
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return { valid: false, message: 'URL must use http or https protocol' };
      }
      
      // Check file extension for CSV
      if (!url.toLowerCase().endsWith('.csv')) {
        return { valid: false, message: 'URL must point to a CSV file' };
      }
      
      return { valid: true, message: '' };
    } catch (e: unknown) {
      console.error(e);
      return { valid: false, message: 'Invalid URL format' };
    }
  };

  const resetOperation = useCallback(() => {
    dispatch({ type: ActionType.RESET_LOADER });
    if (file_browser_ref.current) {
      file_browser_ref.current.value = "";
    }
    setDataFrame(new DataFrame());
  }, [setDataFrame]);

  const handleFileBrowse = useCallback(() => {
    if (!state.file_load_scheme) {
      dispatch({ type: ActionType.RESET_FILE_AND_URL });
      dispatch({ type: ActionType.SET_LOAD_SCHEM_AS_FILE });
    }
  }, [state.file_load_scheme]);

  const handleUrlUpload = useCallback(() => {
    if (state.file_load_scheme) {
      dispatch({ type: ActionType.RESET_FILE_AND_URL });
      dispatch({ type: ActionType.SET_LOAD_SCHEM_AS_URL });
    }
  }, [state.file_load_scheme]);

  const onUrlChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: ActionType.SET_FILE_URL, payload: { file_url: e.target.value } });
  }, []);

  const onFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      dispatch({ type: ActionType.SET_FILE_OBJECT, payload: { file_object: e.target.files[0] } });
    }
  }, []);

  // Function to process CSV data - separated for clarity and reuse
  const processDataFrame = useCallback((df: DataFrame) => {
    console.log(`DataFrame Shape [${df.shape}] `);
    setDataFrame(df);
    dispatch({ type: ActionType.SET_RESET_BTN_VISIBLE });
  }, [setDataFrame]);

  // Separated error handling for better maintainability
  const handleError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      console.error(error.message);
      dispatch({ type: ActionType.SET_ERROR, payload: { error: error.message } });
    } else {
      console.error(error);
      dispatch({ type: ActionType.SET_UNKNOWN_ERROR });
    }
    dispatch({ type: ActionType.SET_RESET_BTN_VISIBLE });
  }, []);

  const onFileUpload = useCallback(async () => {
    try {
      if (!state.file_object) return;
      
      console.log(`File Name ${state.file_object.name}`);
      dispatch({ type: ActionType.URL_LOAD_INIT });
      
      const fileUrl = URL.createObjectURL(state.file_object);
      
      // Using dynamic import for readCSV
      const danfojs = await import('danfojs');
      danfojs.readCSV(fileUrl)
        .then(processDataFrame)
        .catch(handleError);
    } catch (error: unknown) {
      handleError(error);
    }
  }, [state.file_object, processDataFrame, handleError]);

  const onFileDownload = useCallback(async () => {
    // Validate URL before proceeding
    const validationResult = validateUrl(state.file_url);
    if (!validationResult.valid) {
      console.error(validationResult.message);
      dispatch({ type: ActionType.SET_ERROR, payload: { error: validationResult.message } });
      return;
    }
    
    dispatch({ type: ActionType.URL_LOAD_INIT });
    
    try {
      console.log(`File URL ${state.file_url}`);
      
      // Using dynamic import for readCSV with destructuring for better tree-shaking
      const { readCSV } = await import('danfojs');
      readCSV(state.file_url)
        .then(processDataFrame)
        .catch(handleError);
    } catch (error: unknown) {
      handleError(error);
    }
  }, [state.file_url, processDataFrame, handleError]);

  // Handlers for settings dialog
  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  return (
    <div className="w-full my-20 p-6 rounded-lg bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex flex-col justify-center items-center gap-6 shadow-md transition-all duration-300 ease-in-out hover:shadow-lg">
      <div className="w-full flex flex-row justify-between items-center">
        <div className="flex gap-4">
          <RadioCheckbox
            label="Browse File"
            value={state.file_load_scheme}
            onChange={handleFileBrowse}
            disabled={state.is_chkbox_disabled}
            name="loader-type"
          />
          <RadioCheckbox
            label="URL Upload"
            value={!state.file_load_scheme}
            onChange={handleUrlUpload}
            disabled={state.is_chkbox_disabled}
            name="loader-type"
          />
        </div>
        <Button
          variant="icon"
          size="small"
          onClick={handleOpenSettings}
          aria-label="Settings"
          className="bg-zinc-200 dark:bg-zinc-700 p-2 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
        >
          <FiSettings className="text-lg" />
        </Button>
      </div>
      
      <div className="w-full">
        {state.file_load_scheme ? (
          <FileBrowser
            file={state.file_object}
            disabled={state.is_inputs_disabled}
            onChange={onFileChange}
            onUpload={onFileUpload}
            ref={file_browser_ref}
          />
        ) : (
          <FetchUrl
            fileurl={state.file_url}
            disabled={state.is_inputs_disabled}
            onChange={onUrlChange}
            onSubmit={onFileDownload}
          />
        )}
      </div>
      
      <div className="w-full flex flex-row gap-1 justify-between items-center">
        <div className={`flex justify-center items-center px-3 py-1 font-mono text-xs ${state.error ? 'text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md' : 'text-transparent'}`}>
          {state.error || 'No errors'}
        </div>
        {state.is_restbtn_visible && (
          <Button
            variant="secondary"
            size="small"
            onClick={resetOperation}
            className="hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all duration-300"
          >
            <FiRefreshCw className="text-sm animate-pulse" /> Reset
          </Button>
        )}
      </div>
      
      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
      />
    </div>
  );
};

export default DataLoader;