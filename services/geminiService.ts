import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateTattooOutline = async (base64Image: string, mimeType: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: 'Crea solo el trazo de este dibujo para un tatuaje, en fondo blanco y con líneas negras bien definidas. El resultado debe ser una imagen limpia y clara, ideal para usar como plantilla de tatuaje.',
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error('No se pudo generar el trazo. La respuesta de la IA no contiene una imagen.');
};

export const generateTattooPreview = async (base64Image: string, mimeType: string, bodyPart: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: `Coloca este diseño de tatuaje de forma fotorrealista en ${bodyPart}. La imagen resultante debe ser de alta calidad, mostrando cómo se vería el tatuaje sobre la piel en un entorno bien iluminado.`,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });
    
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error(`No se pudo generar la vista previa para ${bodyPart}. La IA no devolvió una imagen.`);
};


export const generateTattooDesigns = async (prompt: string): Promise<string[]> => {
  const fullPrompt = `Diseño de tatuaje de ${prompt}. Estilo minimalista, líneas negras, sobre fondo blanco, listo para ser tatuado.`;
  
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: fullPrompt,
    config: {
      numberOfImages: 3,
      outputMimeType: 'image/jpeg',
      aspectRatio: '1:1',
    },
  });

  if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error('La API no devolvió ninguna imagen.');
  }

  return response.generatedImages.map(img => img.image.imageBytes);
};