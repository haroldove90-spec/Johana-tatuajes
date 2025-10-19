import { GoogleGenAI, Modality } from "@google/genai";

// FIX: Per coding guidelines, the API key must come from `process.env.API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTattooOutline = async (base64Image: string, mimeType: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
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
      responseModalities: [Modality.IMAGE],
    },
  });

  const candidate = response.candidates?.[0];
  if (candidate?.content?.parts) {
    for (const part of candidate.content.parts) {
      if (part.inlineData?.data) {
        return part.inlineData.data;
      }
    }
  }

  throw new Error('No se pudo generar el trazo. La respuesta de la IA no contiene una imagen.');
};

export const generateTattooPreview = async (base64Image: string, mimeType: string, bodyPart: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
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
      responseModalities: [Modality.IMAGE],
    },
  });
    
  const candidate = response.candidates?.[0];
  if (candidate?.content?.parts) {
    for (const part of candidate.content.parts) {
      if (part.inlineData?.data) {
        return part.inlineData.data;
      }
    }
  }

  throw new Error(`No se pudo generar la vista previa para ${bodyPart}. La IA no devolvió una imagen.`);
};


// FIX: The `generateImages` API only supports `numberOfImages: 1`. 
// To generate 3 designs as required by the UI, we must make 3 parallel API calls.
export const generateTattooDesigns = async (prompt: string): Promise<string[]> => {
  const fullPrompt = `Diseño de tatuaje de ${prompt}. Estilo minimalista, líneas negras, sobre fondo blanco, listo para ser tatuado.`;
  
  const designPromises = Array.from({ length: 3 }).map(() => ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: fullPrompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '1:1',
    },
  }));

  const responses = await Promise.all(designPromises);

  const images = responses.flatMap(response =>
    response.generatedImages
      ?.map(img => img.image?.imageBytes)
      .filter((bytes): bytes is string => typeof bytes === 'string') || []
  );

  if (images.length === 0) {
      throw new Error('La API no devolvió ninguna imagen.');
  }

  return images;
};

export const askAiConsultant = async (question: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: question,
    config: {
      systemInstruction: "Eres un experto tatuador y consultor de materiales con décadas de experiencia. Proporciona respuestas claras, concisas y seguras para artistas del tatuaje. Enfócate en la seguridad, las mejores prácticas y recomendaciones de materiales (tipos de agujas, tintas, máquinas) para estilos específicos.",
    },
  });
  
  const text = response.text;
  if (typeof text === 'string') {
    return text;
  }

  throw new Error('La IA no generó una respuesta de texto.');
};