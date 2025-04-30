import { useMemo } from 'react';
import { DataFrame } from 'danfojs';

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
    console.log("DataStats Debug:", { 
      hasDataFrame: !!dataFrame,
      hasShape: dataFrame ? !!dataFrame.shape : false,
      isShapeArray: dataFrame && dataFrame.shape ? Array.isArray(dataFrame.shape) : false,
      rows: dataFrame && dataFrame.shape ? dataFrame.shape[0] : 'none',
      cols: dataFrame && dataFrame.shape ? dataFrame.shape[1] : 'none',
      hasColumns: dataFrame ? !!dataFrame.columns : false,
      isColumnsArray: dataFrame && dataFrame.columns ? Array.isArray(dataFrame.columns) : false,
      columnCount: dataFrame && dataFrame.columns ? dataFrame.columns.length : 'none'
    });

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
      
      // Calculate duplicate rows
      let duplicateRows = 0;
      try {
        // Create a duplicate count using the DataFrame's duplicated method if available
        const duplicated = dataFrame.duplicated();
        duplicateRows = duplicated.sum();
      } catch (error) {
        console.warn('Error calculating duplicate rows:', error);
        // Fallback method if duplicated() is not available
        const uniqueRows = dataFrame.dropDuplicates().shape[0];
        duplicateRows = rows - uniqueRows;
      }
      
      // Calculate duplicate percentage
      const duplicatePercentage = rows > 0 ? (duplicateRows / rows) * 100 : 0;
      
      // Get column information including dtype and null counts
      const columnsInfo = dataFrame.columns.map(column => {
        let nullCount = 0;
        try {
          // Count nulls in the column
          nullCount = dataFrame.column(column).isNa().sum();
        } catch (error) {
          console.warn(`Error counting nulls in column ${column}:`, error);
        }
        
        return {
          name: column,
          dtype: dataFrame.dtypes[column] || 'unknown',
          nullCount,
          nullPercentage: rows > 0 ? (nullCount / rows) * 100 : 0
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