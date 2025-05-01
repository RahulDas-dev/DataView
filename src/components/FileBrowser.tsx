import { ChangeEvent, forwardRef, ReactElement, use, useCallback, useEffect, useReducer, useState } from 'react';
import { HiOutlineDocument, HiOutlinePlay } from 'react-icons/hi2';
import { Button } from './Button';
import { useData } from '../hooks/useData';
import { validateFile } from '../utility/FileUtility';
import { ActionType, dataLoaderReducer, init_state } from '../reducers/dataLoaderReducer';

interface FileBrowserProps {
  disabled: boolean;
  onError: (error: unknown) => void;
  onSuccess?: () => void;  // Added success callback
  loadingState?: () => void;
  className?: string;
}

const FileBrowser = forwardRef<HTMLInputElement, FileBrowserProps>(
  ({ disabled, onError, onSuccess, loadingState, className = '' }, ref): ReactElement => {
    const { setDataFrame } = useData();
    const [state, dispatch] = useReducer(dataLoaderReducer, init_state);
    const [disabledBtn, setDisabledBtn] = useState(true);
    const [disabledInput, setdisabledInput] = useState(false);

    const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const validationErr_ = validateFile(e.target.files[0]);
          if (validationErr_) {
            onError(new Error(validationErr_));
            return;
          }
          dispatch({ type: ActionType.SET_FILE_OBJECT, payload: { file_object: e.target.files[0] } });
          setDisabledBtn(false);
      } else {
        dispatch({ type: ActionType.SET_FILE_OBJECT, payload: { file_object: null } });
        setdisabledInput(true);
      }
    }, []);

    const processFile = useCallback(async () => {
      // Validate file exists before proceeding
      const validationErr_ = validateFile(state.file_object);
      if (validationErr_) {
        onError(new Error(validationErr_));
        return;
      }
      
      try {
        console.log(`File Name ${state.file_object?.name}`);
        if (loadingState) loadingState();
        setDisabledBtn(true);
        setdisabledInput(true);
        // Create a URL for the file
        const fileUrl = URL.createObjectURL(state.file_object!);
        
        // Using dynamic import for readCSV
        const danfojs = await import('danfojs');
        const df = await danfojs.readCSV(fileUrl);
        if (!df || df.isEmpty || df.shape[0] === 0) {
          setDisabledBtn(false); // Ensure button is re-enabled on error
          setdisabledInput(false);
          onError(new Error('DataFrame is empty'));
          return;
        }
        console.log(`DataFrame Shape [${df.shape}] `);
        // Update the DataFrame in the context
        setDataFrame(df);
        setDisabledBtn(true);
        setdisabledInput(true);
        // Call onSuccess callback to notify parent component
        if (onSuccess) onSuccess();
      } catch (error: unknown) {
        setDisabledBtn(false);
        setdisabledInput(false);
        onError(error);
      }
    }, [state.file_object, onError, onSuccess, setDataFrame, loadingState]);

    return (
      <div className={`w-full flex flex-col md:flex-row gap-3 items-center ${className}`}>
        <div className="w-full flex-1 relative">
          <div className="flex items-center">
            <label 
              className="flex items-center justify-center h-9 px-4 bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600 cursor-pointer transition-colors rounded-l-lg text-sm font-mono"
            >
              <HiOutlineDocument className="mr-2 text-lg" />
              Choose file
              <input
                type="file"
                ref={ref}
                accept=".csv"
                onChange={handleFileChange}
                disabled={disabledInput||disabled}
                className="hidden"
              />
            </label>
            <div className="flex-1 h-9 px-3 bg-white dark:bg-zinc-800 border border-l-0 border-zinc-300 dark:border-zinc-600 rounded-r-lg flex items-center text-sm font-mono truncate text-zinc-600 dark:text-zinc-300">
              {state.file_object ? state.file_object.name : "No file chosen"}
            </div>
          </div>
        </div>
        <Button
          variant="primary"
          size="small"
          onClick={processFile}
          disabled={disabledBtn||disabled}
          className="whitespace-nowrap min-w-24 h-9 rounded-lg shadow-sm hover:shadow px-4 font-medium transition-all"
        >
          <HiOutlinePlay className="text-lg" /> Process
        </Button>
      </div>
    );
  }
);

export default FileBrowser;