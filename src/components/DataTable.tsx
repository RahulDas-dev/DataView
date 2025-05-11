import { FunctionComponent, ReactElement, useState, useMemo, useCallback, useRef } from 'react';
import { useData } from '../hooks/useData';
import { useSettings } from '../hooks/useSettings';
import { Button } from './Button';
import { FiDownload } from 'react-icons/fi';
import { AiOutlineEdit } from 'react-icons/ai';
import RenameColumnsDialog from './ReanmeColumnDialog';
import { ColumnDtype, inferDataTypes } from '../utility/Dfutility';


const DataTable: FunctionComponent = (): ReactElement => {
  const { dataFrame, setDataFrame } = useData();
  const { settings } = useSettings();
  const [page, setPage] = useState(1);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [columnDataTypes, setColumnDataTypes] = useState<Record<string, ColumnDtype>>({});
  const csvLinkRef = useRef<HTMLAnchorElement>(null);
  const [dfUpdateerror, setdfUpdateerror] = useState<string | null>(null);
  const { rowsPerPage, columnsWidth } = settings;
  // Memoize column names
  const columns = useMemo(() => dataFrame?.columns || [], [dataFrame]);
  
  // Memoize pagination data
  const { totalRows, totalPages, startIdx, endIdx } = useMemo(() => {
    const totalRows = dataFrame && dataFrame.shape ? dataFrame.shape[0] : 0;
    const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
    const startIdx = (page - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, totalRows);
    
    return { totalRows, totalPages, startIdx, endIdx };
  }, [dataFrame, page, rowsPerPage]);
  
  // Memoize rows for current page to avoid recalculation on every render
  const rows = useMemo(() => {
    if (!dataFrame || !dataFrame.shape || dataFrame.shape[0] === 0) {
      return [];
    }
    return dataFrame.iloc({rows: [`${startIdx}:${endIdx}`]}).values as Array<Array<unknown>>;
    
  }, [dataFrame,startIdx, endIdx]);
  
  // Memoize pagination handler functions
  const handlePrevPage = useCallback(() => {
    setPage(Math.max(1, page - 1));
  }, [page]);
  
  const handleNextPage = useCallback(() => {
    setPage(Math.min(totalPages, page + 1));
  }, [page, totalPages]);
  
  // Export to CSV
  const handleExport = useCallback(() => {
    if (!dataFrame || !dataFrame.shape || dataFrame.shape[0] === 0) {
      console.error("No data available to export");
      return;
    }
    try {
      // Create CSV content
      const headers = columns.join(',');
      const rows = [];
      // Use dataFrame for all data
      for (let i = 0; i < dataFrame.shape[0]; i++) {
        const rowData = [];
        for (const col of columns) {
          // Handle commas and quotes in data
          let value = String(dataFrame.at(i, col) || '');
          // Escape quotes and wrap in quotes if contains comma or quote
          if (value.includes('"') || value.includes(',')) {
            value = '"' + value.replace(/"/g, '""') + '"';
          }
          rowData.push(value);
        }
        rows.push(rowData.join(','));
      }
      const csvContent = [headers, ...rows].join('\n');
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      if (csvLinkRef.current) {
        csvLinkRef.current.href = url;
        csvLinkRef.current.download = 'data_export.csv';
        csvLinkRef.current.click();
        
        // Clean up
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
      }
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  }, [dataFrame, columns]);

  const handleOpenRenameDialog = useCallback(() => {
    if (!dataFrame || dataFrame.isEmpty || dataFrame.shape[0] === 0) {
      console.error("No data available to rename columns");
      return;
    }
    // Infer data types if not already set
    const inferred = inferDataTypes(dataFrame);
    setColumnDataTypes(inferred);
    setIsRenameDialogOpen(true);
  }, [dataFrame, setColumnDataTypes]);
  
  const handleSaveRenamedColumns = (renamedColumns: Record<string, string>, newDataTypes: Record<string, ColumnDtype>) => {
    if (!dataFrame) return;
    let updatedDF = dataFrame;
    let isDataFrameUpdated = false;
    
    console.log('Renamed Columns:', renamedColumns);
    console.log('New Data Types:', newDataTypes);
    try {      
      // Apply column renaming
      if (Object.keys(renamedColumns).length > 0) {
        const hasActualChanges = Object.entries(renamedColumns).some(
          ([oldName, newName]) => oldName !== newName
        );
        if (hasActualChanges) {
          updatedDF = updatedDF.rename(renamedColumns);
          console.log("Columns renamed successfully");
          isDataFrameUpdated = true;
        } 
      }
      
      // Save the updated data types
      setColumnDataTypes(newDataTypes);
      
      // Apply type conversions (this would depend on your DataFrame library's capabilities)
      // This is a simplified example - you may need to adjust based on your actual implementation
      Object.entries(newDataTypes).forEach(([column, type]) => {
        if (!dataFrame.columns.includes(column)) {
          console.log(`Column ${column} not found in DataFrame, skipping type conversion`);
          return; // Using 'return' in forEach acts like 'continue' in a loop
        }
        if (!['float32', 'int32', 'boolean', 'string'].includes(type)) {
          console.log(`Type ${type} not supported for column ${column}, skipping`);
          return;
        }
        const targetColumn = renamedColumns[column] || column;
        let currentType: string;
        try {
          currentType = updatedDF[targetColumn].dtype;
        } catch (e) {
          console.warn(`Error getting dtype for column ${targetColumn}:`, e);
          currentType = '';
        }
        if (currentType === type) {
          return;
        }
        try {
          console.log(`Converting column ${targetColumn} from ${currentType} to ${type}`);
          console.log(` column ${column} -Target column: ${targetColumn} with type ${type}`);
          console.log(` Updatd DF columns ${updatedDF.columns}`);
          updatedDF = updatedDF.asType(targetColumn, type);
          isDataFrameUpdated = true;
        } catch (error) {
          setdfUpdateerror(`Failed to convert column ${targetColumn} to ${type}: ${error}`);
          console.warn(`Failed to convert column ${targetColumn} to ${type}:`, error);
        }
      });
      
      if (isDataFrameUpdated) {
        setDataFrame(updatedDF);
        console.log("DataFrame updated successfully");
      }
      
    } catch (error) {
      console.error("Error applying column changes:", error);
    }
  };
  
  // Calculate column widths
  const columnWidths = useMemo(() => {
    // Create a fixed width for all columns
    return columns.reduce((acc, column) => {
      acc[column] = columnsWidth;
      return acc;
    }, {} as Record<string, number>);
  }, [columns, columnsWidth]);
  
  return (
    <div className="w-full p-5 rounded-md bg-white dark:bg-zinc-900 shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-['Montserrat'] ">Data Table</h2>
        <div className="flex gap-2">
          <Button variant="secondary" size="small" onClick={handleOpenRenameDialog}>
            <AiOutlineEdit  /> Rename Columns & Change Data Types
          </Button>
          <Button variant="secondary" size="small" onClick={handleExport}>
            <FiDownload /> Export
          </Button>
          
          <a ref={csvLinkRef} className="hidden"></a>
        </div>
      </div>
      
      {/* Table container with fixed column widths */}
      <div className="relative">
        <div className="overflow-x-auto custom-scrollbar" style={{ 
          maxWidth: '100%', 
          overflowY: 'hidden',
          position: 'relative'
        }}>
          <table className="border-collapse table-fixed" style={{ width: `${Object.keys(columnWidths).length * columnsWidth}px` }}>
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800">
                {columns.map((column: string, index: number) => (
                  <th 
                    key={index} 
                    className="px-4 py-2 text-left text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700 whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ 
                      width: `${columnWidths[column]}px`,
                      maxWidth: `${columnWidths[column]}px`
                    }}
                  >
                    <div className="tooltip tooltip-top w-full h-full" data-tooltip={column}>
                      {column}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((row: Array<unknown>, rowIndex: number) => (
                  <tr 
                    key={rowIndex} 
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    {columns.map((column: string, colIndex: number) => (
                      <td 
                        key={colIndex} 
                        className="px-4 py-2 text-xs font-mono border-b border-zinc-100 dark:border-zinc-800 whitespace-nowrap overflow-hidden text-ellipsis"
                        style={{ 
                          width: `${columnWidths[column]}px`,
                          maxWidth: `${columnWidths[column]}px`
                        }}
                      >
                        <div 
                          className="tooltip tooltip-top w-full overflow-hidden text-ellipsis" 
                          data-tooltip={String(row[colIndex] ?? '')}
                        >
                          {String(row[colIndex] ?? '')}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan={columns.length || 1} 
                    className="px-4 py-6 text-center text-sm font-mono text-zinc-500 dark:text-zinc-400"
                  >
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {totalRows > 0 && totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-xs font-mono">
            Showing {startIdx + 1} to {endIdx} of {totalRows} entries
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="small" 
              onClick={handlePrevPage}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button 
              variant="secondary" 
              size="small" 
              onClick={handleNextPage}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      <RenameColumnsDialog 
        isOpen={isRenameDialogOpen}
        onClose={() => {setIsRenameDialogOpen(false) ; setdfUpdateerror(null)}}
        columns={columns}
        onSave={handleSaveRenamedColumns}
        dataTypes={columnDataTypes}
        error={dfUpdateerror}
      />
    </div>
  );
};

export default DataTable;