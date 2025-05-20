import { memo, useState, useMemo, useCallback } from 'react';
import { Button } from './Button';
import { AiOutlineEdit } from 'react-icons/ai';
import { useData } from '../hooks/useData';
import { ColumnDtype, inferDataTypes } from '../utility/Dfutility';
import RenameColumnsDialog from './ReanmeColumnDialog';
import ChangeDtypeDialog from './ChangeDtypeDialog';
import { RiFileTransferLine } from 'react-icons/ri';
import useDataStats from '../hooks/useDataStats';
import FillNullColsDialog from './FillNullColumns';


export const Preprocessing = memo(() => {
    const { dataFrame, setDataFrame } = useData();
    const [columnDataTypes, setColumnDataTypes] = useState<Record<string, ColumnDtype>>({});
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [isDtypeDialogOpen, setIsDtypeDialogOpen] = useState(false);
    const [isNullValDialogOpen, setIsNullValDialogOpen] = useState(false);
    const [dfUpdateerror, setdfUpdateerror] = useState<string | null>(null);
    const stats = useDataStats(dataFrame);
    const nullData = useMemo(() => {
      if (stats.isEmpty) return { totalNullCount: 0, nullCols: [] };
      
      // Sum up all null counts from all columns
      const totalNullCount = stats.columnsInfo.reduce((sum, col) => sum + col.nullCount, 0);
      const nullCols = stats.columnsInfo.filter(col => col.nullCount > 0).map(col => col.name);
      return { totalNullCount, nullCols };
    }, [stats]);

    const constantColumns = useMemo(() => {
      const columns = stats.columnsInfo.filter(col => col.isConstant).map(col => col.name);
      return columns.length > 0 ? columns.join(',') : null;
    }, [stats]);

    const handleSaveRenamedColumns = (renamedColumns: Record<string, string>) => {
        if (!dataFrame) return;
        let updatedDF = dataFrame;
        let isDataFrameUpdated = false;
        
        console.log('Renamed Columns:', renamedColumns);
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
          if (isDataFrameUpdated) {
            setDataFrame(updatedDF);
            console.log("DataFrame updated successfully");
          } 
        } catch (error) {
          console.error("Error applying column changes:", error);
        }
    };
    const handleSaveDtypeChange = (newDataTypes: Record<string, ColumnDtype>) => {
        if (!dataFrame) return;
        let updatedDF = dataFrame;
        let isDataFrameUpdated = false;
        try{
            setColumnDataTypes(newDataTypes);
            Object.entries(newDataTypes).forEach(([column, type]) => {
            if (!dataFrame.columns.includes(column)) {
              console.log(`Column ${column} not found in DataFrame, skipping type conversion`);
              return; // Using 'return' in forEach acts like 'continue' in a loop
            }
            if (!['float32', 'int32', 'boolean', 'string'].includes(type)) {
              console.log(`Type ${type} not supported for column ${column}, skipping`);
              return;
            }
            let currentType: string;
            try {
              currentType = updatedDF[column].dtype;
            } catch (e) {
              console.warn(`Error getting dtype for column ${column}:`, e);
              currentType = '';
            }
            if (currentType === type) {
              return;
            }
            try {
              console.log(`Converting column ${column} from ${currentType} to ${type}`);
              console.log(`Target column: ${column} with type ${type}`);
              console.log(`Updatd DF columns ${updatedDF.columns}`);
              updatedDF = updatedDF.asType(column, type);
              isDataFrameUpdated = true;
            } catch (error) {
              setdfUpdateerror(`Failed to convert column ${column} to ${type}: ${error}`);
              console.warn(`Failed to convert column ${column} to ${type}:`, error);
            }
          });
          if (isDataFrameUpdated) {
                setDataFrame(updatedDF);
                console.log("DataFrame updated successfully");
            }
        }
        catch (error) {
          console.error("Error applying column changes:", error);
        }
    }

    const handleSaveFillNull = (nullValues: Record<string, string|number>) => {
      if (!dataFrame) return;
      let updatedDF = dataFrame.copy();
      let isDataFrameUpdated = false;
      for (const [column, value] of Object.entries(nullValues)) {
        const colInfo = stats.columnsInfo.find(col => col.name === column);
        if (!colInfo || colInfo.nullCount === 0) {
          console.log(`Column ${column} has no null values, skipping fill`);
          continue;
        }
        isDataFrameUpdated = true;
        try {
          updatedDF = updatedDF.fillNa(value, { columns: [column] });
        } catch (error) {
          setdfUpdateerror(`Failed to fill null values in column ${column}: ${error}`);
          console.warn(`Failed to fill null values in column ${column}:`, error);
        }  
      }
      if (isDataFrameUpdated) {
          setDataFrame(updatedDF);
          console.log("DataFrame updated successfully");
      } else {
          console.log("No changes made to DataFrame");
      }
    }    

    const handleOpenRenameDialog = useCallback(() => {
        if (!dataFrame || dataFrame.isEmpty || dataFrame.shape[0] === 0) {
          console.error("No data available to rename columns");
          return;
        }
        setIsRenameDialogOpen(true);
    }, [dataFrame]);  

    const handleOpenDtypeDialog = useCallback(() => {
        if (!dataFrame || dataFrame.isEmpty || dataFrame.shape[0] === 0) {
          console.error("No data available to change data types");
          return;
        }
        const inferred = inferDataTypes(dataFrame);
        setColumnDataTypes(inferred);
        setIsDtypeDialogOpen(true);
    }, [dataFrame, setIsDtypeDialogOpen]);

    const handleOpenNullDialog = useCallback(() => {
        if (!dataFrame || dataFrame.isEmpty || dataFrame.shape[0] === 0) {  
          console.error("No data available to fill null values");
          return;
        }
        const inferred = inferDataTypes(dataFrame);
        setColumnDataTypes(inferred);
        setIsNullValDialogOpen(true);
    }, [dataFrame, setIsNullValDialogOpen]);

    const columns = useMemo(() => dataFrame?.columns || [], [dataFrame]);  
    return (
      <div className="w-full p-5 rounded-md bg-transparent flex flex-row flex-wrap justify-end gap-4">
        <Button variant="primary" size="small"  onClick={handleOpenRenameDialog} >
            <AiOutlineEdit  /> Rename Columns
        </Button>
        <Button variant="primary" size="small" onClick={handleOpenDtypeDialog} >
            <RiFileTransferLine  /> Change Data Types
        </Button>
        {nullData.totalNullCount > 0 && 
          <Button variant="primary" size="small"  onClick={handleOpenNullDialog} >
            <RiFileTransferLine  /> Fill Null values
          </Button>
        }

        {constantColumns && <Button variant="primary" size="small"  >
            <RiFileTransferLine  /> Drop Constant Column
          </Button>
        }
        <RenameColumnsDialog 
            isOpen={isRenameDialogOpen}
            onClose={() => {setIsRenameDialogOpen(false) ; setdfUpdateerror(null)}}
            columns={columns}
            onSave={handleSaveRenamedColumns}
            error={dfUpdateerror}
        />
        <ChangeDtypeDialog 
            isOpen={isDtypeDialogOpen}
            onClose={() => {setIsDtypeDialogOpen(false) ; setdfUpdateerror(null)}}
            columns={columns}
            onSave={handleSaveDtypeChange}
            dataTypes={columnDataTypes}
            error={dfUpdateerror}
        />
        <FillNullColsDialog 
            isOpen={isNullValDialogOpen}
            onClose={() => {setIsNullValDialogOpen(false) ; setdfUpdateerror(null)}}
            columns={nullData.nullCols}
            onSave={handleSaveFillNull}
            dataTypes={columnDataTypes}
            error={dfUpdateerror}
        />
      </div>
    );
  }
);


