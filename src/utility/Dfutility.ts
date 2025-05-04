/* eslint-disable @typescript-eslint/no-unused-vars */
import { DataFrame, Series, Utils } from 'danfojs';

/**
 * Identifies duplicate rows in the DataFrame.
 *
 * @param df The DataFrame to check for duplicates
 * @param options.subset Array of column names to consider for duplicate checking. Defaults to all columns.
 * @param options.keep Determines which duplicates to mark as False:
 * - 'first' (default): Marks duplicates except for the first occurrence.
 * - 'last': Marks duplicates except for the last occurrence.
 * - false: Marks all duplicates as True.
 * @returns Series of boolean values indicating duplicate rows.
 *
 * @example
 * ```typescript
 * import { DataFrame } from 'danfojs';
 * import { duplicated } from './utility/Dfutility';
 *
 * // Create a DataFrame with duplicate rows
 * const df = new DataFrame({
 *   'A': [1, 2, 2, 3, 3],
 *   'B': ['a', 'b', 'b', 'c', 'c']
 * });
 *
 * // Find duplicates keeping first occurrence (default)
 * const dups = duplicated(df);
 * // Returns: [false, false, true, false, true]
 *
 * // Find duplicates keeping last occurrence
 * const dupsLast = duplicated(df, { keep: 'last' });
 * // Returns: [false, true, false, true, false]
 *
 * // Find duplicates based on specific columns
 * const dupsSubset = duplicated(df, { subset: ['B'] });
 * // Returns: [false, false, true, false, true]
 * ```
 */
export function duplicated(
  df: DataFrame,
  options?: { subset?: string[]; keep?: 'first' | 'last' | false }
): Series {
  // Use default parameters with a cleaner approach
  const subset = options?.subset ?? df.columns;
  const keep = options?.keep ?? 'first';

  // Validate parameters at the top of the function
  const validKeepValues = ['first', 'last', false];
  if (!validKeepValues.includes(keep)) {
    throw new Error("ParamError: keep must be 'first', 'last', or false.");
  }

  if (!Array.isArray(subset)) {
    throw new Error('ParamError: subset must be an array of column names.');
  }

  // Validate columns exist in the DataFrame
  subset.forEach((col) => {
    if (!df.columns.includes(col)) {
      throw new Error(`ParamError: column '${col}' not found in DataFrame.`);
    }
  });

  // Get the data to check for duplicates
  const dataToCheck = df.loc({ columns: subset }).values as unknown[];
  const rowCount = df.shape[0];
  const duplicates = new Array(rowCount).fill(false);

  // More efficient hashing function for row data
  const hashRow = (row: unknown): string => JSON.stringify(row);

  if (keep === 'first') {
    // Track seen hashes for 'first' option
    const seen = new Set<string>();

    for (let index = 0; index < rowCount; index++) {
      const hash = hashRow(dataToCheck[index]);
      if (seen.has(hash)) {
        duplicates[index] = true;
      } else {
        seen.add(hash);
      }
    }
  } else if (keep === 'last') {
    // Track seen hashes for 'last' option
    const seen = new Set<string>();

    // Process in reverse order for 'last'
    for (let index = rowCount - 1; index >= 0; index--) {
      const hash = hashRow(dataToCheck[index]);
      if (seen.has(hash)) {
        duplicates[index] = true;
      } else {
        seen.add(hash);
      }
    }
  } else {
    // One-pass approach for keep === false
    const valueCounts = new Map<string, number[]>();

    // Track all indices for each hash
    for (let index = 0; index < rowCount; index++) {
      const hash = hashRow(dataToCheck[index]);
      if (!valueCounts.has(hash)) {
        valueCounts.set(hash, []);
      }
      valueCounts.get(hash)?.push(index);
    }

    // Mark all duplicates
    for (const [_, indices] of valueCounts.entries()) {
      if (indices.length > 1) {
        indices.forEach((index) => {
          duplicates[index] = true;
        });
      }
    }
  }

  return new Series(duplicates);
}

export type ColumnDtype = 'string' | 'int32' | 'float32' | 'boolean';

/**
 * Infers data types for columns in a DataFrame
 *
 * @param df The DataFrame to analyze
 * @param options Configuration options
 * @param options.subset Array of column names to infer types for. Defaults to all columns.
 * @returns An object mapping column names to their inferred data types
 *
 * @example
 * ```typescript
 * import { DataFrame } from 'danfojs';
 * import { inferDataTypes } from './utility/Dfutility';
 *
 * const df = new DataFrame({
 *   'id': [1, 2, 3, 4, 5],
 *   'name': ['John', 'Jane', 'Bob', 'Alice', 'Tom'],
 *   'score': [95.5, 87.2, 90.0, 82.7, 91.3],
 *   'passed': [true, true, true, false, true],
 *   'enrolled_date': ['2022-01-15', '2022-02-10', '2022-01-20', '2022-03-01', '2022-02-15']
 * });
 *
 * const types = inferDataTypes(df);
 * // Returns: {
 * //   id: 'integer',
 * //   name: 'string',
 * //   score: 'float',
 * //   passed: 'boolean',
 * //   enrolled_date: 'date'
 * // }
 * ```
 */
export function inferDataTypes(
  df: DataFrame,
  options?: { subset?: string[] }
): Record<string, ColumnDtype> {
  const subset = options?.subset ?? df.columns;
  const types: Record<string, ColumnDtype> = {};

  if (!df || !df.columns || df.shape[0] === 0) return types;
  const utilis = new Utils();
  for (const column of subset) {
    if (!df.columns.includes(column)) {
      console.warn(`Column '${column}' not found in DataFrame`);
      continue;
    }
    let dataType: ColumnDtype = 'string';
    try {
      dataType = df[column].dtype as ColumnDtype;
    } catch (dtypeError) {
      // Fallback to manual type detection if needed
      console.warn('Error getting column dtype:', dtypeError);
      dataType = utilis.inferDtype(df[column].values)[0] as ColumnDtype;
    } finally {
      types[column] = dataType;
    }
  }

  return types;
}
