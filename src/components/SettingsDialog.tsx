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

  // Reset form values when dialog opens
  useEffect(() => {
    if (isOpen) {
      setRowsPerPage(settings.rowsPerPage);
      setMaxColsToShow(settings.maxColsToShow);
    }
  }, [isOpen, settings]);

  const handleSave = useCallback(() => {
    updateSettings({
      rowsPerPage,
      maxColsToShow
    });
    onClose();
  }, [rowsPerPage, maxColsToShow, updateSettings, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          aria-label="Close"
        >
          <FiX size={20} />
        </button>
        
        <h2 className="text-xl font-['Montserrat'] font-semibold mb-4">Data View Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="rows-per-page" className="block text-sm font-mono mb-1">
              Rows Per Page:
            </label>
            <input
              id="rows-per-page"
              type="number"
              min="5"
              max="100"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="w-full p-2 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-sm font-mono"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Choose between 5-100 rows per page
            </p>
          </div>
          
          <div>
            <label htmlFor="max-cols" className="block text-sm font-mono mb-1">
              Maximum Columns to Show:
            </label>
            <input
              id="max-cols"
              type="number"
              min="4"
              max="50"
              value={maxColsToShow}
              onChange={(e) => setMaxColsToShow(Number(e.target.value))}
              className="w-full p-2 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-sm font-mono"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Choose between 4-50 columns before horizontal scroll is enabled
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