import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Downloads a DOM element as a high-fidelity image (PNG or JPEG)
 */
export async function downloadAsImage(elementId: string, filename: string, format: 'jpeg' | 'png') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found for export.`);
    return;
  }

  try {
    // Generate high DPI canvas
    const canvas = await html2canvas(element, {
      scale: 3.5, // Ultra-high-resolution scale to suit professional large prints like B2
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: -window.scrollY // Fix canvas shifting issues in scrollable screens
    });

    const fileExtension = format === 'jpeg' ? 'jpg' : 'png';
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    
    const dataUrl = canvas.toDataURL(mimeType, 1.0);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${filename}_B2_Portrait.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to convert DOM to image:', error);
  }
}

/**
 * Downloads a DOM element as a B2 Portrait PDF document (500mm x 707mm)
 */
export async function downloadAsPDFB2(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found for export.`);
    return;
  }

  try {
    // Generate high resolution canvas
    const canvas = await html2canvas(element, {
      scale: 3.5, // Keeps graphics and text extremely crisp on large printable layouts
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: -window.scrollY
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    // Initializing PDF with B2 standard dimension limits (500mm x 707mm portrait scale)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [500, 707] // B2 size is exactly 500mm by 707mm
    });

    const pdfWidth = 500;
    const pdfHeight = 707;

    // Proportional content fit bounds calculation
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let finalWidth = pdfWidth;
    let finalHeight = imgHeight;
    let xOffset = 0;
    let yOffset = 0;

    if (imgHeight > pdfHeight) {
      // Scale down proportionally to prevent overflow of height limits
      finalHeight = pdfHeight;
      finalWidth = (canvas.width * pdfHeight) / canvas.height;
      xOffset = (pdfWidth - finalWidth) / 2;
    } else {
      // Vertically center content when smaller than the canvas depth
      yOffset = (pdfHeight - imgHeight) / 2;
    }

    pdf.addImage(imgData, 'JPEG', xOffset, yOffset, finalWidth, finalHeight, undefined, 'FAST');
    pdf.save(`${filename}_B2_Portrait.pdf`);
  } catch (error) {
    console.error('Failed to convert DOM to PDF:', error);
  }
}
