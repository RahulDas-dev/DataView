import { ChangeEvent, forwardRef, ReactElement } from 'react';
import { HiOutlineDocument, HiOutlinePlay } from 'react-icons/hi2';
import { Button } from './Button';

interface FileBrowserProps {
  file: File | null;
  disabled: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  className?: string;
}

const FileBrowser = forwardRef<HTMLInputElement, FileBrowserProps>(
  ({ file, disabled, onChange, onUpload, className = '' }, ref): ReactElement => {
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
                onChange={onChange}
                disabled={disabled}
                className="hidden"
              />
            </label>
            <div className="flex-1 h-9 px-3 bg-white dark:bg-zinc-800 border border-l-0 border-zinc-300 dark:border-zinc-600 rounded-r-lg flex items-center text-sm font-mono truncate text-zinc-600 dark:text-zinc-300">
              {file ? file.name : "No file chosen"}
            </div>
          </div>
        </div>
        <Button
          variant="primary"
          size="small"
          onClick={onUpload}
          disabled={!file || disabled}
          className="whitespace-nowrap min-w-24 h-9 rounded-lg shadow-sm hover:shadow px-4 font-medium transition-all"
        >
          <HiOutlinePlay className="text-lg" /> Process
        </Button>
      </div>
    );
  }
);

FileBrowser.displayName = 'FileBrowser';

export default FileBrowser;