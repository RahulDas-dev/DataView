import { FunctionComponent, ReactElement, useState, useEffect } from 'react';
import { FiX, FiSave} from 'react-icons/fi';
import { Button } from './Button';
import { ColumnDtype } from '../utility/Dfutility';

interface ColumnInfo {
  colName: string;
  dataType: ColumnDtype;
  newdataType: ColumnDtype;
}

interface ChangeDtypeProps {
  isOpen: boolean;
  onClose: () => void;
  columns: string[];
  onSave: (dataTypes: Record<string, ColumnDtype> ) => void;
  dataTypes?: Record<string, ColumnDtype>;
  error: string | null;
}

const DATA_TYPE_OPTIONS = [
  'string', 
  'int32',
  'float32',
  'boolean',
];

const ChangeDtypeDialog: FunctionComponent<ChangeDtypeProps> = ({
  isOpen,
  onClose,
  columns,
  onSave,
  dataTypes = {},
  error = null
}): ReactElement | null => {
  const [columnInfo, setColumnInfo] = useState<ColumnInfo[]>([]);
  
  // Initialize column info when dialog opens or columns change
  useEffect(() => {
    if (isOpen && columns.length > 0) {
      setColumnInfo(
        columns.map(col => ({
          colName: col,
          dataType: dataTypes[col] || 'string',
          newdataType: dataTypes[col] || 'string'
        }))
      );
    }
  }, [isOpen, columns, dataTypes]);

  if (!isOpen) return null;

  const handleTypeChange = (index: number, dataType: ColumnDtype) => {
    const updatedInfo = [...columnInfo];
    updatedInfo[index].newdataType = dataType;
    setColumnInfo(updatedInfo);
  };

  const handleSubmit = () => {
    const newDataTypes: Record<string, ColumnDtype> = {};
    
    columnInfo.forEach(info => {
      if (info.dataType !== info.newdataType) {
        newDataTypes[info.colName] = info.newdataType;
    }
    });
    console.log('New Data Types:', newDataTypes);
    onSave(newDataTypes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex justify-center items-center px-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-['Montserrat'] ">Modify DataTypes</h2>
          <Button variant="icon" size="small" onClick={onClose} aria-label="Close">
            <FiX className="text-lg" />
          </Button>
        </div>
        
        <div className="overflow-y-auto p-4  h-80 custom-scrollbar flex-grow">

          
          <div className="grid grid-cols-12 gap-x-4 font-semibold text-sm mb-2 px-2">
            <div className="col-span-4">Name</div>
            <div className="col-span-4">Data Type</div>
            <div className="col-span-4">New Data Type</div>
          </div>
          
          <div className="space-y-4">
            {columnInfo.map((info, index) => (
              <div key={info.colName} className="grid grid-cols-12 gap-x-4 items-center">
                <div className="col-span-4 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-sm font-mono overflow-hidden text-ellipsis whitespace-nowrap" title={info.colName}>
                  {info.colName}
                </div>
                <div className="col-span-4">
                    <div className="col-span-2 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-sm font-mono overflow-hidden text-ellipsis whitespace-nowrap" title={info.colName}>
                    {info.dataType}
                    </div>
                </div>
                <div className="col-span-4">
                    <select
                        value={info.newdataType}
                        onChange={(e) => handleTypeChange(index, e.target.value as ColumnDtype)}
                        className="w-full px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded outline-none focus:ring-2 focus:ring-gray-500 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                        {DATA_TYPE_OPTIONS.map(type => (
                        <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
              </div>
            ))}
          </div>
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
                disabled={false}
            >
            <FiSave className="mr-1" /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChangeDtypeDialog;