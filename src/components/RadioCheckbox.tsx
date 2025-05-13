import { forwardRef, ReactElement } from 'react';

interface RadioCheckboxProps {
  label: string;
  value: boolean;
  onChange: () => void;
  disabled?: boolean;
  name?: string;
  className?: string;
}

const RadioCheckbox = forwardRef<HTMLInputElement, RadioCheckboxProps>(
  ({ label, value, onChange, disabled = false, name, className = '' }, ref): ReactElement => {
    return (
      <div 
        className={`flex items-center gap-2 ${className} cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 ${disabled ? 'pointer-events-none' : ''}`}
        onClick={() => !disabled && onChange()}
      >
        <div className="relative flex items-center">
          <input
            type="radio"
            ref={ref}
            name={name || "radio-group"}
            checked={value}
            onChange={() => {}} // Controlled by the onClick handler on the div
            disabled={disabled}
            className="sr-only" // Hide the default radio but keep functionality
          />
          <div className="w-4 h-4 border rounded-full flex items-center justify-center border-zinc-400 dark:border-zinc-500 transition-all duration-200
            disabled:border-zinc-400 disabled:bg-zinc-200 disabled:dark:border-zinc-600 disabled:dark:bg-zinc-700"
          >
            {value && (
              <div className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100 disabled:opacity-50"></div>
            )}
          </div>
        </div>
        <label 
          className="text-sm font-mono select-none text-zinc-700 dark:text-zinc-300
            disabled:text-zinc-400 disabled:dark:text-zinc-500"
        >
          {label}
        </label>
      </div>
    );
  }
);

RadioCheckbox.displayName = 'RadioCheckbox';

export default RadioCheckbox;