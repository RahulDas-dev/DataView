import { DataFrame, Series } from 'danfojs';

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
 */
export function duplicated(
    df: DataFrame,
    options?: { subset?: string[]; keep?: 'first' | 'last' | false }
): Series {
    const { subset, keep } = { subset: df.columns, keep: 'first', ...options };
    console.log(`Duplicated Debug: subset=${subset}, keep=${keep}`);
    console.log(subset, typeof (subset));
    // Validate parameters at the top of the function
    const validKeepValues = ['first', 'last', false];
    if (!validKeepValues.includes(keep)) {
        throw Error("ParamError: keep must be 'first', 'last', or false.");
    }

    if (!Array.isArray(subset)) {
        throw Error('ParamError: subset must be an array of column names.');
    }

    // Validate columns exist in the DataFrame
    subset.forEach((col) => {
        if (!df.columns.includes(col)) {
            throw Error(`ParamError: column '${col}' not found in DataFrame.`);
        }
    });

    //const dataToCheck = df.values.map((row: any) => subset.map(col => row[df.columns.indexOf(col)]));
    const dataToCheck = df.loc({ columns: subset }).values as unknown[];
    const seen = new Set<string>();
    const duplicates = new Array(df.shape[0]).fill(false);

    const hashRow = (row: unknown): string => JSON.stringify(row);

    if (keep === 'first') {
        dataToCheck.forEach((row, index) => {
            const hash = hashRow(row);
            if (seen.has(hash)) {
                duplicates[index] = true;
            } else {
                seen.add(hash);
            }
        });
    } else if (keep === 'last') {
        // Process in reverse order for 'last'
        for (let index = dataToCheck.length - 1; index >= 0; index--) {
            const hash = hashRow(dataToCheck[index]);
            if (seen.has(hash)) {
                duplicates[index] = true;
            } else {
                seen.add(hash);
            }
        }
    } else if (keep === false) {
        // First pass: identify all values that have duplicates
        const valueCounts = new Map<string, number>();
        dataToCheck.forEach((row) => {
            const hash = hashRow(row);
            valueCounts.set(hash, (valueCounts.get(hash) || 0) + 1);
        });

        // Second pass: mark all rows with duplicated values
        dataToCheck.forEach((row, index) => {
            const hash = hashRow(row);
            if (valueCounts.get(hash)! > 1) {
                duplicates[index] = true;
            }
        });
    }

    return new Series(duplicates);
}

// Adjust the import path based on your project structure
