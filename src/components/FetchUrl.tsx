import { ChangeEvent, ReactElement, useState, useEffect, useCallback } from 'react';
import { HiOutlineGlobeAlt, HiOutlinePlay } from 'react-icons/hi2';
import { Button } from './Button';
import { useData } from '../hooks/useData';
import { validateUrl } from '../utility/FileUtility';

interface FetchUrlProps {
  fileurl: string;
  disabled: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onError: (error: unknown) => void;
  onSuccess?: () => void;  // Added success callback
  loadingState?: () => void;
  className?: string;
}


const FetchUrl = ({
  fileurl,
  disabled,
  onChange,
  onError,
  onSuccess,
  loadingState,
  className = ''
}: FetchUrlProps): ReactElement => {
  const { setDataFrame } = useData();
  const [validationError, setvalidationError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Validate URL whenever it changes
  useEffect(() => {
    if (fileurl) {
      setvalidationError(validateUrl(fileurl));
    } else {
      setvalidationError('');
    }
  }, [fileurl]);

  const handleUrlSubmit = useCallback(async () => {
    // Validate URL before proceeding
    const validationErr_ = validateUrl(fileurl);
    setvalidationError(validationErr_);
    if (validationErr_ !== '') {
      onError(new Error(validationErr_));
      return;
    }
    
    if (loadingState) loadingState();
    setIsProcessing(true);
    
    try {
      console.log(`File URL ${fileurl}`);
      
      // Using dynamic import for readCSV with destructuring for better tree-shaking
      const { readCSV } = await import('danfojs');
      const df = await readCSV(fileurl);
      if (!df || df.isEmpty || df.shape[0] === 0) {
        setIsProcessing(false); // Ensure button is re-enabled on error
        onError(new Error('DataFrame is empty'));
        return;
      }
      console.log(`DataFrame Shape [${df.shape}] `);
      // Update the DataFrame in the context
      setDataFrame(df);
      setIsProcessing(false);
      
      // Call onSuccess callback to notify parent component
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      setIsProcessing(false);
      onError(error);
    }
  }, [fileurl, setDataFrame, onError, onSuccess, loadingState]);

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      <div className="w-full flex flex-col md:flex-row gap-3 items-center">
        <div className="w-full flex-1 relative">
          <div className="flex items-center">
            <div className="h-9 px-4 bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-700 dark:hover:bg-zinc-600 border border-zinc-300 dark:border-zinc-600 rounded-l-lg flex items-center text-zinc-700 dark:text-zinc-200 text-sm font-mono">
              <HiOutlineGlobeAlt className="mr-2 text-lg" />
              Enter URL
            </div>
            <input
              type="text"
              value={fileurl}
              onChange={onChange}
              disabled={disabled || isProcessing}
              placeholder="No URL entered"
              className={`flex-1 h-9 px-3 py-0 bg-white dark:bg-zinc-800 border border-l-0 border-zinc-300 dark:border-zinc-600 rounded-r-lg text-sm font-mono outline-none focus:outline-none focus:ring-0 disabled:opacity-70 disabled:cursor-not-allowed transition-colors text-zinc-600 dark:text-zinc-300 ${validationError && fileurl ? 'border-red-500 dark:border-red-400' : ''}`}
            />
          </div>
        </div>
        <Button
          variant="primary"
          size="small"
          onClick={handleUrlSubmit}
          disabled={!fileurl || disabled || !validationError || isProcessing}
          className="whitespace-nowrap min-w-24 h-9 rounded-lg shadow-sm hover:shadow px-4 font-medium transition-all"
        >
          <HiOutlinePlay className="text-lg" /> {isProcessing ? 'Processing...' : 'Process'}
        </Button>
      </div>
      {validationError && fileurl && (
        <div className="text-red-500 text-xs font-mono px-2">
          {validationError}
        </div>
      )}
    </div>
  );
};

export default FetchUrl;