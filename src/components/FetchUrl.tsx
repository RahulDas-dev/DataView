import { ChangeEvent, ReactElement, forwardRef, useImperativeHandle, useRef } from 'react';
import { HiOutlineGlobeAlt, HiOutlinePlay } from 'react-icons/hi2';
import { Button } from './Button';
import { FiRefreshCw } from 'react-icons/fi';

interface FetchUrlProps {
  disableInput: boolean;
  disablebtn: boolean;
  showResetbtn: boolean;
  onUrlChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onUrlBlur: () => void;
  processUrl: () => void;
  onReset: () => void;
}

export interface FileBrowserHandle {
  reset: () => void;
}

const FetchUrl = forwardRef<FileBrowserHandle, FetchUrlProps>(({
  disableInput,
  disablebtn,
  showResetbtn,
  onUrlChange,
  onUrlBlur,
  processUrl,
  onReset}, ref): ReactElement => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => ({
      reset: () => {
        // Reset the hidden file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }));
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full flex flex-col md:flex-row gap-3 items-center">
        <div className="w-full flex-1 relative">
          <div className="flex items-center">
            <div className="min-w-36 h-9 px-5 border border-zinc-300 dark:border-zinc-600 rounded-l-lg flex items-center text-sm font-mono transition-colors
              bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-zinc-100 dark:text-zinc-800 cursor-pointer
              disabled:bg-zinc-200 disabled:dark:bg-zinc-800 disabled:text-zinc-400 disabled:dark:text-zinc-500 
              disabled:cursor-not-allowed disabled:border-zinc-200 disabled:dark:border-zinc-700 disabled:opacity-70">
              <HiOutlineGlobeAlt className="mr-2 text-lg disabled:opacity-50" />
              Enter URL
            </div>
            <input
              type="text"
              ref={fileInputRef}
              onChange={onUrlChange}
              onBlur={onUrlBlur}
              disabled={disableInput}
              placeholder="No URL entered"
              className="flex-1 h-9 px-3 py-0 bg-white dark:bg-zinc-800 border border-l-0 border-zinc-300 dark:border-zinc-600 rounded-r-md text-sm font-mono outline-none focus:outline-none focus:ring-0 transition-colors text-zinc-600 dark:text-zinc-300
                disabled:opacity-70 disabled:cursor-not-allowed 
                disabled:border-zinc-200 disabled:dark:border-zinc-700 disabled:text-zinc-500 disabled:dark:text-zinc-500"
            />
          </div>
        </div>
        <div className='flex items-center gap-2 min-w-24'>
          {!disablebtn && <Button
            variant="primary"
            size="small"
            onClick={processUrl}
            disabled={disablebtn}
            className="whitespace-nowrap h-9 min-w-24"
          >
            <HiOutlinePlay className="text-lg" /> Process
          </Button>}
          {showResetbtn && 
            <Button
              variant="primary"
              size="small"
              onClick={onReset}
              className="whitespace-nowrap h-9 min-w-24"
            >
              <FiRefreshCw className="text-sm animate-pulse" /> Reset
            </Button>
          }
        </div>
      </div>
    </div>
  );
});

export default FetchUrl;