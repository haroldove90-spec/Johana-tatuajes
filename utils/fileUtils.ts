
export const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      if (!result) {
        reject(new Error("Failed to read file."));
        return;
      }
      try {
        const parts = result.split(',');
        if (parts.length !== 2) {
          throw new Error("Invalid Data URL format.");
        }
        const base64 = parts[1];
        const mimeType = parts[0].split(';')[0].split(':')[1];
        if (!mimeType) {
            throw new Error("Could not determine MIME type from Data URL.");
        }
        resolve({ base64, mimeType });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
  });
};
