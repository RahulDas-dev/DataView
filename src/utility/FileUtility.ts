import { DataFrame } from 'danfojs';

// URL validation function
export const validateUrl = (url: string, allowedExtensions: string[]): string => {
  // Check if URL is empty
  if (url.trim() === '') {
    return 'No URL provided';
  }

  try {
    // Try to create a URL object to validate format
    const urlObj = new URL(url);
    // Check protocol - only http/https allowed
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return 'URL must use http or https protocol';
    }
    const fileName = url.toLowerCase().toLowerCase();
    const isValid = allowedExtensions.some(ext => fileName.endsWith(ext));
    if (!isValid) {
      return 'Selected file must be a CSV, XLS, XLSX, or JSON file';
    }
    return '';
  } catch (e: unknown) {
    console.error(e);
    return 'Invalid URL format';
  }
};

export const validateFile = (file: File | null, allowedExtensions: string[]): string => {
  if (!file) {
    return 'No file selected';
  }
  // Allow .csv, .xls, .xlsx, .json extensions
  const fileName = file.name.toLowerCase();
  const isValid = allowedExtensions.some(ext => fileName.endsWith(ext));
  if (!isValid) {
    return 'Selected file must be a CSV, XLS, XLSX, or JSON file';
  }

  return '';
};

/**
 * Parse CSV data into a DataFrame
 * @param csvData The CSV data as a string
 * @returns The parsed DataFrame and any potential error
 */
export const parseCSVToDataFrame = async (
  csvData: string
): Promise<{ df: DataFrame | null; error: Error | null }> => {
  try {
    // Parse CSV data with Danfojs
    const df = new DataFrame(csvData);

    // Verify that the DataFrame is valid
    if (df && df.shape && df.shape[0] > 0 && df.shape[1] > 0) {
      console.log('Valid DataFrame created:', df.shape);
      return { df, error: null };
    } else {
      console.error('Created DataFrame is invalid:', df);
      return {
        df: null,
        error: new Error('Failed to create valid DataFrame from data'),
      };
    }
  } catch (error) {
    console.error('Error parsing CSV data:', error);
    return {
      df: null,
      error: new Error(
        `Error parsing CSV data: ${error instanceof Error ? error.message : String(error)}`
      ),
    };
  }
};
