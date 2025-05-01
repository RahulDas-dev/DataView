// URL validation function
export const validateUrl = (url: string): string => {
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
        // Check file extension for CSV
        if (!url.toLowerCase().endsWith('.csv')) {
            return 'URL must point to a CSV file';
        }
        return '';
    } catch (e: unknown) {
        console.error(e);
        return 'Invalid URL format';
    }
};

export const validateFile = (file: File | null): string => {
    if (!file) {
        return 'No file selected';
    }
    // Check file extension for CSV
    if (!file.name.toLowerCase().endsWith('.csv')) {
        return 'Selected file must be a CSV file';
    }

    return '';
};
