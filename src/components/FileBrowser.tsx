import { ChangeEvent, forwardRef, ReactElement, useCallback, useImperativeHandle, useRef} from 'react';
import { HiOutlineDocument, HiOutlinePlay } from 'react-icons/hi2';
import { Button } from './Button';

interface FileBrowserProps {
  disableInput: boolean;
  disablebtn: boolean;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  processFile: () => void;
}

export interface FileBrowserHandle {
  reset: () => void;
}

const FileBrowser = forwardRef<FileBrowserHandle, FileBrowserProps>(
  ({ disableInput, disablebtn, onFileChange, processFile}, ref): ReactElement => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const displayInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        // Reset the hidden file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        if (displayInputRef.current) {
          displayInputRef.current.value = '';
        }
      }
    }));

    const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      onFileChange(e);
      if (e.target.files && e.target.files.length > 0) {
        if (displayInputRef.current) {
          displayInputRef.current.value = e.target.files[0].name;
        }
      }
    }, [onFileChange]);

    return (
      <div className="w-full flex flex-col md:flex-row gap-3 items-center">
        <div className="w-full flex-1 relative">
          <div className="flex items-center">
            <div className="relative w-full overflow-hidden rounded-lg">
              {/* This label will trigger the file input when clicked */}
              <label 
                htmlFor="file-upload" 
                className="absolute left-0 top-0 bottom-0 flex items-center justify-center px-4 border border-zinc-300 dark:border-zinc-600 text-sm font-mono z-10 rounded-l-lg transition-colors
                  bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 cursor-pointer
                  disabled:bg-zinc-200 disabled:dark:bg-zinc-800 disabled:text-zinc-400 disabled:dark:text-zinc-500 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:dark:border-zinc-700 disabled:opacity-70"
              >
                <div className="flex items-center">
                  <HiOutlineDocument className="mr-1 text-lg disabled:opacity-50" />
                  Choose file
                </div>
              </label>
              <input
                type="text"
                readOnly
                ref={displayInputRef}
                disabled={disableInput}
                placeholder="No File selected"
                className="w-full flex-1 h-9 px-3 pl-38 py-0 bg-white dark:bg-zinc-800 border border-l-0 border-zinc-300 dark:border-zinc-600 rounded-r-lg text-sm font-mono outline-none focus:outline-none focus:ring-0 transition-colors text-zinc-600 dark:text-zinc-300
                disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:dark:bg-zinc-900 
                disabled:border-zinc-200 disabled:dark:border-zinc-700 disabled:text-zinc-400 disabled:dark:text-zinc-500"
              />
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={disableInput}
                className="sr-only" /* Hide the actual file input */
              />
            </div>
          </div>
        </div>
        <Button
          variant="primary"
          size="small"
          onClick={processFile}
          disabled={disablebtn}
          className="whitespace-nowrap min-w-24 h-9 rounded-lg shadow-sm hover:shadow px-4 font-medium transition-all"
        >
          <HiOutlinePlay className="text-lg" /> Process
        </Button>
      </div>
    );
  }
);

export default FileBrowser;