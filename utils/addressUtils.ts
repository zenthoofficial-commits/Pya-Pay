// This utility file centralizes functions for formatting and cleaning addresses.

/**
 * Cleans a full address string by removing Google Plus Codes and returning the 
 * most relevant parts for display.
 * @param address The full address string from the Geocoding API.
 * @returns A cleaner, more readable address string.
 */
export const getCleanAddress = (address: string): string => {
    if (!address || address === 'Unknown Address') return 'နေရာ မသိပါ';
    
    // Regular expression to match and remove a Google Plus Code from the start of the string.
    const plusCodeRegex = /^[A-Z0-9]{4}\+[A-Z0-9]{2,}(\s*,)?\s*/i;
    const addressWithoutPlusCode = address.replace(plusCodeRegex, '');

    const parts = addressWithoutPlusCode.split(',').map(p => p.trim()).filter(Boolean);

    // Return the first one or two most relevant parts for a clear, concise address.
    if (parts.length > 0) {
        return parts.slice(0, 2).join(', ');
    }
    
    return addressWithoutPlusCode || 'နေရာ မသိပါ';
};

/**
 * Extracts a short, relevant location name (like a township or area) from a full address,
 * intended for concise displays like trip history lists.
 * @param address The full address string from the Geocoding API.
 * @returns A short location name.
 */
export const getShortLocationName = (address: string): string => {
    if (!address || address === 'Unknown Address') return 'နေရာ မသိပါ';
    
    // Regular expression to match and remove a Google Plus Code from the start of the string.
    const plusCodeRegex = /^[A-Z0-9]{4}\+[A-Z0-9]{2,}(\s*,)?\s*/i;
    const addressWithoutPlusCode = address.replace(plusCodeRegex, '');
    
    let parts = addressWithoutPlusCode.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) return 'နေရာ မသိပါ';

    // List of common city/country names to filter out from the end
    const cityCountry = ['Yangon', 'Mandalay', 'Naypyidaw', 'Myanmar', 'Burma', 'ရန်ကုန်', 'မန္တလေး', 'နေပြည်တော်'];
    
    // Remove city/country from the end
    if (parts.length > 1) {
        const lastPart = parts[parts.length - 1];
        if (cityCountry.some(c => lastPart.toLowerCase().includes(c.toLowerCase()))) {
            parts.pop();
        }
    }
    
    if (parts.length > 0) {
        // Return the last remaining part, which is often the township or a specific area
        return parts[parts.length - 1];
    }

    return addressWithoutPlusCode || 'နေရာ မသိပါ';
};