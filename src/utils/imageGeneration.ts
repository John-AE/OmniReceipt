import html2canvas from 'html2canvas';
import { downloadImage } from '@/utils/downloadUtils';

export const generateInvoiceImage = async (elementId: string): Promise<Blob> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Invoice element not found');
  }

  // Get actual content height (not fixed container height)
  const actualHeight = element.scrollHeight;
  const actualWidth = element.scrollWidth;

  // Create canvas with high quality settings
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    allowTaint: false,
    width: actualWidth,
    height: actualHeight,
    windowHeight: actualHeight,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image'));
        }
      },
      'image/jpeg',
      0.9
    );
  });
};

// Export the cross-platform downloadImage function from downloadUtils
export { downloadImage } from '@/utils/downloadUtils';

export const shareImageViaWhatsApp = async (blob: Blob, message: string, phoneNumber: string) => {
  try {
    // Check if running in Android app
    if ('AndroidShare' in window && (window as any).AndroidShare) {
      const objectUrl = URL.createObjectURL(blob);
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      (window as any).AndroidShare.shareToWhatsApp(cleanPhone, objectUrl, message);
      return;
    }
    
    // For web: Create WhatsApp URL and download image
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    // Download image first using the cross-platform function
    downloadImage(blob, 'receipt.jpg');
    
    // Then open WhatsApp
    window.open(whatsappUrl, '_blank');
      
  } catch (error) {
    console.error('Error sharing via WhatsApp:', error);
    throw new Error('Unable to share. Please try again.');
  }
};


