import { FunctionComponent, ReactElement, ChangeEvent, useCallback, useRef, useReducer, useState, useEffect } from 'react';
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
  const { setDataFrame } = useData();
  const [state, dispatch] = useReducer(dataLoaderReducer, init_state);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showResetButton, setShowResetButton] = useState(false);
  
  // Always keep the button in the DOM, just control its visibility
  useEffect(() => {
    if (state.is_restbtn_visible) {
      // Delay the transition to make it smooth
      const timer = setTimeout(() => {
        setShowResetButton(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setShowResetButton(false);
    }
  }, [state.is_restbtn_visible]);

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

  // Function to handle file selection
 /*  const handleFileChange = useCallback((file: File | null) => {
    dispatch({ type: ActionType.SET_FILE_OBJECT, payload: { file_object: file } });
  }, []); */

  // Separated error handling
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

  // Set loading state 
  const handleLoadingState = useCallback(() => {
    dispatch({ type: ActionType.URL_LOAD_INIT });
  }, []);

  // Function to handle successful data processing
  const handleProcessSuccess = useCallback(() => {
    // Set the reset button to be visible
    dispatch({ type: ActionType.SET_RESET_BTN_VISIBLE });
  }, []);

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
            disabled={state.is_inputs_disabled}
            onError={handleError}
            onSuccess={handleProcessSuccess}
            loadingState={handleLoadingState}
            ref={file_browser_ref}
          />
        ) : (
          <FetchUrl
            fileurl={state.file_url}
            disabled={state.is_inputs_disabled}
            onChange={onUrlChange}
            onError={handleError}
            onSuccess={handleProcessSuccess}
            loadingState={handleLoadingState}
          />
        )}
      </div>
      
      <div className="w-full flex flex-row gap-1 justify-between items-center">
        <div className={`flex justify-center items-center px-3 py-1 font-mono text-xs ${state.error ? 'text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md' : 'text-transparent'}`}>
          {state.error || 'No errors'}
        </div>
        
        {/* Always render the button but control visibility with CSS */}
        <Button
          variant="secondary"
          size="small"
          onClick={resetOperation}
          className={`whitespace-nowrap min-w-24 h-9 rounded-lg shadow-sm hover:shadow px-4 font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all duration-500 ease-in-out ${showResetButton ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <FiRefreshCw className="text-sm animate-pulse" /> Reset
        </Button>
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