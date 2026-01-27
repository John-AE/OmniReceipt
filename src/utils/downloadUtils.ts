// utils/downloadUtils.ts

/**
 * Detects if the app is running in an Android WebView
 */
export const isAndroidApp = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof (window as any).Android !== 'undefined' && 
         typeof (window as any).Android.downloadImage === 'function';
};

/**
 * Downloads a CSV file - works on both web and Android
 */
export const downloadCSV = (csvContent: string, fileName: string): void => {
  // Ensure filename has .csv extension
  const csvFileName = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
  
  if (isAndroidApp()) {
    // Use Android bridge for CSV download
    try {
      (window as any).Android.downloadCSV(csvContent, csvFileName);
    } catch (error) {
      console.error('Android CSV download failed:', error);
      // Fallback to web method
      downloadCSVWeb(csvContent, csvFileName);
    }
  } else {
    // Use web method for browser
    downloadCSVWeb(csvContent, csvFileName);
  }
};

/**
 * Web-based CSV download using blob
 */
const downloadCSVWeb = (csvContent: string, fileName: string): void => {
  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Web CSV download failed:', error);
    throw new Error('Failed to download CSV file');
  }
};

/**
 * Downloads an XML file - works on both web and Android
 */
export const downloadXML = (xmlContent: string, fileName: string): void => {
  // Ensure filename has .xml extension
  const xmlFileName = fileName.endsWith('.xml') ? fileName : `${fileName}.xml`;
  
  if (isAndroidApp()) {
    // Use Android bridge for XML download
    try {
      (window as any).Android.downloadFile(xmlContent, xmlFileName, 'application/xml');
    } catch (error) {
      console.error('Android XML download failed:', error);
      // Fallback to web method
      downloadXMLWeb(xmlContent, xmlFileName);
    }
  } else {
    // Use web method for browser
    downloadXMLWeb(xmlContent, xmlFileName);
  }
};

/**
 * Web-based XML download using blob
 */
const downloadXMLWeb = (xmlContent: string, fileName: string): void => {
  try {
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Web XML download failed:', error);
    throw new Error('Failed to download XML file');
  }
};

/**
 * Downloads an image - works on both web and Android
 */
export const downloadImage = (blob: Blob, fileName: string): void => {
  // Ensure filename has image extension
  const imageFileName = fileName.includes('.') ? fileName : `${fileName}.jpg`;
  
  if (isAndroidApp()) {
    // Convert blob to base64 for Android
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1]; // Remove data:image/jpeg;base64, prefix
      try {
        (window as any).Android.downloadImage(base64Data, imageFileName);
      } catch (error) {
        console.error('Android image download failed:', error);
        // Fallback to web method
        downloadImageWeb(blob, imageFileName);
      }
    };
    reader.readAsDataURL(blob);
  } else {
    // Use web method for browser
    downloadImageWeb(blob, imageFileName);
  }
};

/**
 * Web-based image download using blob
 */
const downloadImageWeb = (blob: Blob, fileName: string): void => {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = fileName;
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Web image download failed:', error);
    throw new Error('Failed to download image file');
  }
};

/**
 * Creates CSV content from array of objects
 */
export const createCSVContent = (data: any[]): string => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Get all unique keys from the data
  const headers = Array.from(
    new Set(data.flatMap(item => Object.keys(item)))
  );

  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(item =>
      headers.map(header => {
        const value = item[header];
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value !== null && value !== undefined ? value : '';
      }).join(',')
    )
  ].join('\n');

  return csvContent;
};

