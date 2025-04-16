
// This is an addition to the existing encryption.ts file
// Add this function to the exports

export const generateFilePreview = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // For text files, read and return content
    if (
      file.type.startsWith('text/') || 
      file.type === 'application/json' ||
      file.type === 'application/javascript'
    ) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
      return;
    }
    
    // For images, PDFs and other browser-renderable files, return object URL
    if (
      file.type.startsWith('image/') || 
      file.type === 'application/pdf'
    ) {
      const objectUrl = URL.createObjectURL(file);
      resolve(objectUrl);
      return;
    }
    
    // For other file types, just create a data URL
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};
