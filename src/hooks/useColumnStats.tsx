import { useMemo } from 'react';
import { DataFrame } from 'danfojs';

// Type definitions for our statistics return values
export interface BaseStats {
  count: number;
  nullCount: number;
  dataType: string;
  numeric: boolean;
  boolean: boolean;
  categorical: boolean;
  error: boolean;
}

export interface CategoricalStats extends BaseStats {
  numeric: false;
  boolean: false;
  categorical: true;
  unique: number;
  mode: { value: string; frequency: number };
  frequencies: [string, number][];
}

export interface NumericStats extends BaseStats {
  numeric: true;
  boolean: false;
  categorical: false;
  min: number;
  max: number;
  mean: number;
  median: number;
  std: number;
  var: number;
  q1?: number;
  q3?: number;
}

export interface BooleanStats extends BaseStats {
  boolean: true;
  numeric: false;
  categorical: false;
  unique: number;
  mode: { value: string; frequency: number };
  frequencies: [string, number][];
  trueCount: number;
  falseCount: number;
}

export type ColumnStats = CategoricalStats | NumericStats | BooleanStats;

// Check if a data type is numeric based on danfojs dtype
const isNumericType = (dtype: string): boolean => {
  return ['float32', 'float64', 'int32', 'int64', 'int16', 'int8', 'uint8', 'uint16'].includes(dtype);
};

// Check if a data type is boolean
const isBooleanType = (dtype: string): boolean => {
  return dtype === 'boolean';
};

// Check if a data type is categorical
const isCategoricalType = (dtype: string): boolean => {
  return dtype === 'string' || dtype === 'object';
};
  
// Safely execute a method on a column series and provide a fallback value
const safelyExecute = <T,>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch (error) {
    console.warn(`Error executing function: ${error}`);
    return fallback;
  }
};

/**
 * Hook for computing statistics for a column in a dataframe
 * @param dataFrame The dataframe containing the column
 * @param selectedColumn The name of the column to compute statistics for
 * @returns An object containing various statistics for the column
 */
const useColumnStats = (dataFrame: DataFrame, selectedColumn: string | null): ColumnStats => {
  return useMemo(() => {
    // Return empty stats if dataFrame or selectedColumn isn't available yet
    if (!selectedColumn || !dataFrame) {
      return {
        count: 0,
        nullCount: 0,
        dataType: 'Unknown',
        numeric: false,
        boolean: false,
        categorical: true, // Make it categorical by default
        error: false,
        unique: 0,
        mode: { value: 'N/A', frequency: 0 },
        frequencies: []
      } as CategoricalStats; // Explicitly cast to CategoricalStats
    }
    
    try {
      // Get column series - danfojs handles null checks automatically
      const columnSeries = dataFrame[selectedColumn];
      
      // Get data type using danfojs native method
      let dataType = 'Unknown';
      
      try {
        dataType = dataFrame.$getColumnDtype(selectedColumn);
      } catch (dtypeError) {
        // Fallback to manual type detection if needed
        console.warn("Error getting column dtype:", dtypeError);
        const values = columnSeries.values;
        
        // Take only the first 50 non-null values for type detection to improve performance
        const sampleSize = 50;
        const sampleValues = values
          .filter((val: unknown) => val !== null && val !== undefined)
          .slice(0, sampleSize);
        
        // Manual type detection if $getColumnDtype fails - check just the sample
        const numericValues = sampleValues.filter((val: unknown) => !isNaN(Number(val)));
        const isNumeric = numericValues.length > 0 && numericValues.length === sampleValues.length;
        
        const boolValues = sampleValues.filter((val: unknown) => 
          val === true || val === false || val === 'true' || val === 'false' || val === 1 || val === 0);
        const isBoolean = boolValues.length > 0 && boolValues.length === sampleValues.length;
        
        dataType = isNumeric ? 'float32' : (isBoolean ? 'boolean' : 'string');
      }
      
      // Get count - works for all column types
      const count = safelyExecute(() => columnSeries.count(), 0);
      
      // Get null count using isna().sum()
      const nullCount = safelyExecute(() => {
        if (typeof columnSeries.isna === 'function') {
          return columnSeries.isna().sum();
        }
        return 0;
      }, 0);
      
      // Get unique values count - useful for all data types
      const uniqueCount = safelyExecute(() => columnSeries.nunique(), 0);
      
      // Initialize frequency variables
      let frequencies: [string, number][] = [];
      let mode = { value: "N/A", frequency: 0 };
      
      // Get frequency counts - only needed for categorical and boolean data
      if (!isNumericType(dataType)) {
        try {
          // Use direct valueCounts() on the column for more efficient frequency counting
          const valuesCounts = columnSeries.valueCounts();
          if (valuesCounts && valuesCounts.index && valuesCounts.values) {
            // Convert to array of [value, count] pairs
            frequencies = valuesCounts.index.map((value: string| number, idx: number) => {
              return [String(value), valuesCounts.values[idx]];
            }).slice(0, 10); // Get top 10 most frequent values
            
            // Get most frequent value (mode)
            if (frequencies.length > 0) {
              mode = { value: frequencies[0][0], frequency: frequencies[0][1] };
            }
          }
        } catch (freqError) {
          console.warn("Error calculating value counts:", freqError);
          frequencies = [];
        }
      }
      
      // Determine which type of statistics to calculate based on the column type
      if (isNumericType(dataType)) {
        // Use danfojs built-in methods for numeric stats
        const min = safelyExecute(() => columnSeries.min(), 0);
        const max = safelyExecute(() => columnSeries.max(), 0);
        const mean = safelyExecute(() => columnSeries.mean(), 0);
        const median = safelyExecute(() => columnSeries.median(), 0);
        const std = safelyExecute(() => columnSeries.std(), 0);
        const variance = safelyExecute(() => columnSeries.var(), 0);
        
        // Calculate quartiles (if possible)
        let q1, q3;
        try {
          // Some danfojs versions support quantile or describe
          if (typeof columnSeries.quantile === 'function') {
            q1 = columnSeries.quantile(0.25);
            q3 = columnSeries.quantile(0.75);
          } else if (typeof dataFrame.describe === 'function') {
            const desc = dataFrame.describe();
            const q1Idx = desc.index.indexOf('25%');
            const q3Idx = desc.index.indexOf('75%');
            if (q1Idx !== -1 && q3Idx !== -1) {
              q1 = desc.iloc({ rows: [q1Idx] }).values[0][selectedColumn];
              q3 = desc.iloc({ rows: [q3Idx] }).values[0][selectedColumn];
            }
          }
        } catch (quartileError) {
          console.warn("Error calculating quartiles:", quartileError);
        }
        
        return {
          count,
          nullCount,
          dataType,
          numeric: true,
          boolean: false,
          categorical: false,
          min,
          max,
          mean,
          median,
          std,
          var: variance,
          q1,
          q3,
          error: false
        };
      } 
      
      // For boolean columns
      else if (isBooleanType(dataType)) {
        // Extract true and false counts from the frequencies already computed
        let trueCount = 0;
        let falseCount = 0;
        
        // Look through the already computed frequencies to find true/false values
        frequencies.forEach(([value, count]) => {
          const lowerValue = String(value).toLowerCase();
          if (lowerValue === 'true' || lowerValue === '1') {
            trueCount = count;
          } else if (lowerValue === 'false' || lowerValue === '0') {
            falseCount = count;
          }
        });
        
        return {
          count,
          nullCount,
          unique: uniqueCount,
          dataType,
          numeric: false,
          boolean: true,
          categorical: false,
          mode,
          frequencies,
          trueCount,
          falseCount,
          error: false
        };
      }
      
      // For categorical columns
      else if (isCategoricalType(dataType)) {
        return {
          count,
          nullCount,
          unique: uniqueCount,
          dataType,
          numeric: false,
          boolean: false,
          categorical: true,
          mode,
          frequencies,
          error: false
        };
      }
      
      // Default case should not be reached if type detection is working
      return {
        count,
        nullCount,
        dataType,
        numeric: false,
        boolean: false,
        categorical: true,
        error: false,
        unique: uniqueCount,
        mode: { value: "N/A", frequency: 0 },
        frequencies: []
      } as CategoricalStats;
      
    } catch (error) {
      console.error("Error calculating statistics:", error);
      return {
        count: 0,
        nullCount: 0,
        dataType: 'Unknown',
        numeric: false,
        boolean: false,
        categorical: true, // Make it categorical by default for error state
        error: true,
        unique: 0,
        mode: { value: 'Error', frequency: 0 },
        frequencies: []
      } as CategoricalStats;
    }
  }, [dataFrame, selectedColumn]);
};

export default useColumnStats;