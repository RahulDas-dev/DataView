import { FunctionComponent, ReactElement, useState, useEffect } from 'react';
import { FiX, FiSave} from 'react-icons/fi';
import { Button } from './Button';

interface ColumnInfo {
  originalName: string;
  newName: string;
}

interface RenameColumnsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  columns: string[];
  onSave: (renamedColumns: Record<string, string>) => void;
  error: string | null;
}


const RenameColumnsDialog: FunctionComponent<RenameColumnsDialogProps> = ({
  isOpen,
  onClose,
  columns,
  onSave,
  error = null
}): ReactElement | null => {
  const [columnInfo, setColumnInfo] = useState<ColumnInfo[]>([]);
  
  // Initialize column info when dialog opens or columns change
  useEffect(() => {
    if (isOpen && columns.length > 0) {
      setColumnInfo(
        columns.map(col => ({
          originalName: col,
          newName: col
        }))
      );
    }
  }, [isOpen, columns]);

  if (!isOpen) return null;

  const handleNameChange = (index: number, newName: string) => {
    const updatedInfo = [...columnInfo];
    updatedInfo[index].newName = newName;
    setColumnInfo(updatedInfo);
  };

  const handleSubmit = () => {
    // Convert the array back to the expected format
    const renamedColumns: Record<string, string> = {};
    
    columnInfo.forEach(info => {
      // Only include columns where the name has changed
      if (info.originalName !== info.newName) {
        renamedColumns[info.originalName] = info.newName;
      }
    });
    console.log('Renamed Columns:', renamedColumns);
    onSave(renamedColumns);
    onClose();
  };

  const validateNames = (): boolean => {
    // Check for duplicate names
    const newNames = columnInfo.map(info => info.newName);
    const hasDuplicates = newNames.some((name, index) => 
      newNames.indexOf(name) !== index
    );
    
    // Check for empty names
    const hasEmptyNames = newNames.some(name => !name.trim());
    
    return !hasDuplicates && !hasEmptyNames;
  };

  const isValid = validateNames();

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex justify-center items-center px-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-['Montserrat'] ">Rename Columns</h2>
          <Button variant="icon" size="small" onClick={onClose} aria-label="Close">
            <FiX className="text-lg" />
          </Button>
        </div>
        
        <div className="overflow-y-auto p-4  h-80 custom-scrollbar flex-grow">

          
          <div className="grid grid-cols-12 gap-x-4 font-semibold text-sm mb-2 px-2">
            <div className="col-span-6">Name</div>
            <div className="col-span-6">New Name</div>
          </div>
          
          <div className="space-y-4">
            {columnInfo.map((info, index) => (
              <div key={info.originalName} className="grid grid-cols-12 gap-x-4 items-center">
                <div className="col-span-6 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-sm font-mono overflow-hidden text-ellipsis whitespace-nowrap" title={info.originalName}>
                  {info.originalName}
                </div>
                
                <div className="col-span-6">
                    <input
                        type="text"
                        value={info.newName}
                        onChange={(e) => handleNameChange(index, e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded outline-none focus:ring-2 focus:ring-gray-500 dark:bg-zinc-800 dark:text-zinc-200"
                    />
                </div>
              </div>
            ))}
          </div>
          
          {!isValid && (
            <div className="mt-4 text-sm text-red-500">
              Column names must be unique and cannot be empty.
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-end gap-2">
            {error && (
            <div className={`flex justify-center items-center px-3 py-1 font-mono text-xs ${error ? 'text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md' : 'text-transparent'}`}>
                {error}
            </div>
            )}
            <Button variant="secondary" size="small" onClick={onClose}>
                Cancel
            </Button>
            <Button 
                variant="primary" 
                size="small" 
                onClick={handleSubmit}
                disabled={!isValid}
            >
            <FiSave className="mr-1" /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RenameColumnsDialog;