import React, { memo } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'icon' | 'secondary' | 'danger' | 'link';
  children: React.ReactNode;
  size?: 'small' | 'normal';
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export const Button = memo(
  ({
    variant = 'primary',
    size = 'normal',
    children,
    className = '',
    disabled,
    tooltip,
    tooltipPosition = 'top',
    ...props
  }: ButtonProps) => {
    // Use the new Tailwind CSS classes
    const baseClass = 'btn h-9'; // Added h-9 to make all buttons match input height
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;

    // Add tooltip classes if tooltip text is provided
    const tooltipClasses = tooltip ? `tooltip tooltip-${tooltipPosition}` : '';

    return (
      <button
        className={`${baseClass} ${variantClass} ${sizeClass} ${tooltipClasses} ${className}`}
        data-tooltip={tooltip}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);
