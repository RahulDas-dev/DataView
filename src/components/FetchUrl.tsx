import { ChangeEvent, ReactElement } from 'react';
import { HiOutlineGlobeAlt, HiOutlinePlay } from 'react-icons/hi2';
import { Button } from './Button';

interface FetchUrlProps {
  fileurl: string;
  disabled: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  className?: string;
}

const FetchUrl = ({
  fileurl,
  disabled,
  onChange,
  onSubmit,
  className = ''
}: FetchUrlProps): ReactElement => {
  return (
    <div className={`w-full flex flex-col md:flex-row gap-3 items-center ${className}`}>
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
            disabled={disabled}
            placeholder="No URL entered"
            className="flex-1 h-9 px-3 py-0 bg-white dark:bg-zinc-800 border border-l-0 border-zinc-300 dark:border-zinc-600 rounded-r-lg text-sm font-mono outline-none focus:outline-none focus:ring-0 disabled:opacity-70 disabled:cursor-not-allowed transition-colors text-zinc-600 dark:text-zinc-300"
          />
        </div>
      </div>
      <Button
        variant="primary"
        size="small"
        onClick={onSubmit}
        disabled={!fileurl || disabled}
        className="whitespace-nowrap min-w-24 h-9 rounded-lg shadow-sm hover:shadow px-4 font-medium transition-all"
      >
        <HiOutlinePlay className="text-lg" /> Process
      </Button>
    </div>
  );
};

export default FetchUrl;