import { ChangeEvent, ReactElement, forwardRef, useImperativeHandle, useRef } from 'react';
import { HiOutlineGlobeAlt, HiOutlinePlay } from 'react-icons/hi2';
import { Button } from './Button';

interface FetchUrlProps {
  disableInput: boolean;
  disablebtn: boolean;
  onUrlChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onUrlBlur: () => void;
  processUrl: () => void;
}

export interface FileBrowserHandle {
  reset: () => void;
}

const FetchUrl = forwardRef<FileBrowserHandle, FetchUrlProps>(({
  disableInput,
  disablebtn,
  onUrlChange,
  onUrlBlur,
  processUrl}, ref): ReactElement => {
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
            <div className="h-9 px-5 border border-zinc-300 dark:border-zinc-600 rounded-l-lg flex items-center text-sm font-mono transition-colors
              bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 cursor-pointer
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
              className="flex-1 h-9 px-3 py-0 bg-white dark:bg-zinc-800 border border-l-0 border-zinc-300 dark:border-zinc-600 rounded-r-lg text-sm font-mono outline-none focus:outline-none focus:ring-0 transition-colors text-zinc-600 dark:text-zinc-300
                disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:dark:bg-zinc-900 
                disabled:border-zinc-200 disabled:dark:border-zinc-700 disabled:text-zinc-400 disabled:dark:text-zinc-500"
            />
          </div>
        </div>
        <Button
          variant="primary"
          size="small"
          onClick={processUrl}
          disabled={disablebtn}
          className="whitespace-nowrap min-w-24 h-9 rounded-lg shadow-sm hover:shadow px-4 font-medium transition-all"
        >
          <HiOutlinePlay className="text-lg" /> Process
        </Button>
      </div>
    </div>
  );
});

export default FetchUrl;