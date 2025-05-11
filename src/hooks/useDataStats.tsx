import { useMemo } from 'react';
import { DataFrame } from 'danfojs';
import { duplicated } from '../utility/Dfutility';

interface DataStats {
  totalRows: number;
  totalColumns: number;
  duplicateRows: number;
  duplicatePercentage: number;
  columnsInfo: Array<{
    name: string;
    dtype: string;
    nullCount: number;
    nullPercentage: number;
    isConstant: boolean;
  }>;
  isEmpty: boolean;
}

/**
 * A hook that calculates various statistics about a DataFrame
 * @param dataFrame The DataFrame to analyze
 * @returns Object containing various count statistics
 */
const useDataStats = (dataFrame: DataFrame | null): DataStats => {
  return useMemo(() => {
    // Default empty state
    const emptyStats: DataStats = {
      totalRows: 0,
      totalColumns: 0,
      duplicateRows: 0,
      duplicatePercentage: 0,
      columnsInfo: [],
      isEmpty: true
    };

    // DEBUG: Log dataFrame properties to help diagnose issues

    // More robust check for valid dataFrame with data
    if (!dataFrame) {
      console.log("DataStats: No dataFrame");
      return emptyStats;
    }
    
    // Check if dataFrame has shape property and it's a valid array
    if (!dataFrame.shape || !Array.isArray(dataFrame.shape)) {
      console.log("DataStats: Missing shape property or not an array");
      return emptyStats;
    }
    
    // Check if dataFrame has rows and columns
    if (dataFrame.shape[0] === 0 || dataFrame.shape[1] === 0) {
      console.log("DataStats: Empty shape - no rows or columns");
      return emptyStats;
    }
    
    // Check if columns array exists and has items
    if (!dataFrame.columns || !Array.isArray(dataFrame.columns) || dataFrame.columns.length === 0) {
      console.log("DataStats: Missing columns or empty columns array");
      return emptyStats;
    }

    try {
      // Calculate total rows and columns
      const [rows, cols] = dataFrame.shape;
      
      // Calculate duplicate rows using our custom function
      let duplicateRows = 0;
      try {
        const duplicatedSeries = duplicated(dataFrame);
        duplicateRows = duplicatedSeries.values.filter(Boolean).length;
      } catch (error) {
        console.warn('Error calculating duplicate rows:', error);
        // Fallback method if duplicated() still fails
        try {
          // Simple hash-based approach as fallback
          const uniqueRows = new Set();
          for (let i = 0; i < rows; i++) {
            const rowValues = dataFrame.values[i];
            uniqueRows.add(JSON.stringify(rowValues));
          }
          duplicateRows = rows - uniqueRows.size;
        } catch (fallbackError) {
          console.warn('Error in fallback duplicate calculation:', fallbackError);
          duplicateRows = 0;
        }
      }
      
      // Calculate duplicate percentage
      const duplicatePercentage = rows > 0 ? (duplicateRows / rows) * 100 : 0;
      
      // Get column information including dtype and null counts
      const columnsInfo = dataFrame.columns.map(column => {
        let nullCount = 0;
        let isConstant = false;
        try {
          // Count nulls in the column
          nullCount = dataFrame[column].isNa().values.filter(Boolean).length;
          if (['string','boolean'].includes(dataFrame[column].dtype)) {
              isConstant = dataFrame[column].nUnique() === 1;
          }else {
            isConstant = dataFrame[column].std() === 0;
          }
        } catch (error) {
          console.warn(`Error counting nulls in column ${column}:`, error);
        }
        
        return {
          name: column,
          dtype: dataFrame[column].dtype,
          nullCount,
          nullPercentage: rows > 0 ? (nullCount / rows) * 100 : 0,
          isConstant
        };
      });
      
      return {
        totalRows: rows,
        totalColumns: cols,
        duplicateRows,
        duplicatePercentage,
        columnsInfo,
        isEmpty: false
      };
    } catch (error) {
      console.error('Error calculating data statistics:', error);
      return emptyStats;
    }
  }, [dataFrame]);
};

export default useDataStats;