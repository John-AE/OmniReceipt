import { supabase } from '@/integrations/supabase/client';
import { generateInvoiceImage } from './imageGeneration';

export const uploadInvoiceToStorage = async (
  elementId: string,
  fileName: string,
  userId: string
): Promise<string> => {
  try {
    // Generate the image blob
    const blob = await generateInvoiceImage(elementId);
    
    // Convert blob to file
    const file = new File([blob], fileName, { type: 'image/jpeg' });
    
    // Upload to Supabase storage with user folder structure
    const filePath = `${userId}/${fileName}`;
    const { data, error } = await supabase.storage
      .from('invoices')
      .upload(filePath, file, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('invoices')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading to storage:', error);
    throw error;
  }
};

export const shareJPEGViaWhatsApp = async (
  jpegUrl: string,
  message: string,
  phoneNumber: string
) => {
  try {
    // Check if running in Android app
    if ('AndroidShare' in window && (window as any).AndroidShare) {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      (window as any).AndroidShare.shareToWhatsApp(cleanPhone, jpegUrl, message);
      return;
    }
    
    const response = await fetch(jpegUrl);
    const blob = await response.blob();
    
    // For web: Create WhatsApp URL and download image
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    // Download image first
    const objectUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = objectUrl;
    downloadLink.download = 'receipt.jpg';
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(objectUrl);
    
    // Then open WhatsApp
    window.open(whatsappUrl, '_blank');
    
  } catch (error) {
    console.error('Error sharing via WhatsApp:', error);
    throw new Error('Unable to share. Please try again.');
  }
};


