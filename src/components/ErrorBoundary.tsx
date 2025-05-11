import { Component, ReactNode } from 'react';
import { Button } from './Button';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  extractErrorLocation(): string {
    if (!this.state.error || !this.state.error.stack) {
      return 'Unknown location';
    }
    
    // Extract filename and line number from the stack trace
    const stackLines = this.state.error.stack.split('\n');
    // Look for lines that aren't about ErrorBoundary
    const relevantLine = stackLines.find(line => 
      !line.includes('ErrorBoundary') && 
      (line.includes('.tsx') || line.includes('.ts'))
    );
    
    if (relevantLine) {
      // Extract meaningful parts
      const match = relevantLine.match(/\((.*):(\d+):(\d+)\)/) || 
                    relevantLine.match(/at\s(.*):(\d+):(\d+)/);
      if (match) {
        const [, file, line, column] = match;
        const fileName = file.split('/').pop();
        return `${fileName}:${line}:${column}`;
      }
    }
    
    return 'Unknown location';
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="w-full max-w-2xl p-8 rounded-lg bg-white dark:bg-zinc-900 border border-red-300 dark:border-red-800 shadow-2xl">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <FiAlertCircle size={32} className="text-red-500 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-red-800 dark:text-red-300 text-xl font-['Montserrat'] font-semibold mb-3 flex items-center">
                  Application Error
                </h3>
                
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 p-5 rounded-md overflow-hidden">
                  {/* Remove max-height restriction and improve container */}
                  <div className="overflow-auto max-h-[50vh]">
                    <div className="text-red-700 dark:text-red-300 text-base mb-3 font-mono font-bold">
                      {this.state.error?.message}
                    </div>
                    
                    <div className="text-red-600 dark:text-red-400 text-sm font-mono">
                      <div className="mb-2">
                        <span className="font-bold">Location: </span>
                        {this.extractErrorLocation()}
                      </div>
                      
                      {this.state.errorInfo && (
                        <div className="whitespace-pre-wrap mt-3 border-t border-red-200 dark:border-red-800 pt-3">
                          <div className="font-bold mb-1">Component Stack:</div>
                          {this.state.errorInfo.componentStack}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button onClick={this.handleReset} variant="danger" size="small" className="px-5 py-2">
                    <FiRefreshCw className="mr-2" /> Reset Application
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
