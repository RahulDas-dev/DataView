import { FunctionComponent, ReactElement, useState, useCallback, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { Button } from './Button';
import { useSettings } from '../hooks/useSettings';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsDialog: FunctionComponent<SettingsDialogProps> = ({
  isOpen,
  onClose
}): ReactElement | null => {
  const { settings, updateSettings } = useSettings();
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage);
  const [maxColsToShow, setMaxColsToShow] = useState(settings.maxColsToShow);
  const [columnsWidth, setColumnWidth] = useState(settings.columnsWidth);
  const [columnsSpererator, setColumnSpererator] = useState(settings.columnsSpererator);

  // Reset form values when dialog opens
  useEffect(() => {
    if (isOpen) {
      setRowsPerPage(settings.rowsPerPage);
      setMaxColsToShow(settings.maxColsToShow);
      setColumnWidth(settings.columnsWidth);
      setColumnSpererator(settings.columnsSpererator);
    }
  }, [isOpen, settings]);

  const handleSave = useCallback(() => {
    updateSettings({
      rowsPerPage,
      maxColsToShow,
      columnsWidth,
      columnsSpererator
    });
    onClose();
  }, [rowsPerPage, maxColsToShow, columnsWidth,columnsSpererator, updateSettings, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-['Montserrat'] ">Data View Settings</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>
        
        <div className="space-y-4 overflow-y-auto h-72 custom-scrollbar">
          <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="rows-per-page" className="block text-sm mb-1">
              Rows Per Page:
            </label>
            <input
              id="rows-per-page"
              type="number"
              min="5"
              max="100"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="w-24  h-8 p-2 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-sm font-mono"
            />
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 text-right font-mono ">
              Choose between 5-100 rows per page
            </p>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="max-cols" className="block text-sm mb-1">
                Maximum Columns to Show:
              </label>
              <input
                id="max-cols"
                type="number"
                min="4"
                max="50"
                value={maxColsToShow}
                onChange={(e) => setMaxColsToShow(Number(e.target.value))}
                className="w-24 h-8 p-2 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-sm font-mono"
              />
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 text-right font-mono ">
                Choose between 4-50 columns before horizontal scroll is enabled
              </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="column-width" className="block text-sm mb-1">
                Column Width (pixels):
              </label>
              <input
                id="column-width"
                type="number"
                min="80"
                max="300"
                value={columnsWidth}
                onChange={(e) => setColumnWidth(Number(e.target.value))}
                className="w-24 h-8 p-2 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-sm font-mono"
              />
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 text-right font-mono ">
                Adjust the width of table columns (80-300px)
              </p>
          </div>

          <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="column-width" className="block text-sm mb-1">
              Column Seperator:
            </label>
            <input
              id="column-width"
              type="string"
              value={columnsSpererator}
              maxLength={1}
              onChange={(e) => {
                // Limit to a single character
                if (e.target.value.length <= 1) {
                  setColumnSpererator(e.target.value);
                }
              }}
              className="w-24 h-8 p-2 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-sm font-mono"
            />
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 text-right font-mono ">
            Character(s) to use when separating column data in exports
            </p>
          </div>
        </div>
        
        

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="secondary" size="small" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="small" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsDialog;