import { FunctionComponent, ReactElement } from 'react';

interface ProgressBarProps {
  /**
   * The current progress percentage (0-100)
   * If not provided, an indeterminate animation will be shown
   */
  progress?: number;
  
  /**
   * Optional status text to display below the progress bar
   */
  statusText?: string;
  
  /**
   * The height of the progress bar in pixels
   * @default 4
   */
  height?: number;
  
  /**
   * The color theme for the progress bar
   * @default "blue"
   */
  colorTheme?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  
  /**
   * Additional CSS classes to apply to the container
   */
  className?: string;
}

/**
 * A reusable progress bar component that can display determinate or indeterminate progress
 */
const ProgressBar: FunctionComponent<ProgressBarProps> = ({
  progress,
  statusText,
  height = 4,
  colorTheme = 'blue',
  className = '',
}): ReactElement => {
  // Determine if we should show determinate or indeterminate progress
  const isDeterminate = typeof progress === 'number' && !isNaN(progress);
  
  // Calculate width percentage for determinate progress
  const widthPercentage = isDeterminate ? Math.min(Math.max(progress, 0), 100) + '%' : '100%';
  
  // Select gradient based on color theme
  const gradients = {
    blue: 'bg-gradient-to-r from-blue-400 to-indigo-500',
    green: 'bg-gradient-to-r from-emerald-400 to-green-500',
    amber: 'bg-gradient-to-r from-amber-400 to-orange-500',
    red: 'bg-gradient-to-r from-red-400 to-rose-500',
    purple: 'bg-gradient-to-r from-purple-400 to-fuchsia-500',
  };
  
  const gradient = gradients[colorTheme];
  
  return (
    <div className={`w-full flex flex-col items-center gap-1 ${className}`}>
      <div 
        className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden" 
        style={{ height: `${height}px` }}
      >
        <div 
          className={`h-full ${gradient} rounded-full ${!isDeterminate ? 'animate-pulse' : ''}`}
          style={{ 
            width: widthPercentage,
            animationDuration: !isDeterminate ? '1.5s' : '0s'
          }}
        />
      </div>
      
      {statusText && (
        <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {statusText}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;