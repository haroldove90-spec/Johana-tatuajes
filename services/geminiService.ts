
import { GoogleGenAI } from "@google/genai";

export const getAiClient = () => {
  let apiKey = '';
  
  try {
    // Vite statically replaces this if it exists
    apiKey = process.env.GEMINI_API_KEY as string;
  } catch (e) {
    // Ignore ReferenceError if process is not defined
  }

  if (!apiKey || apiKey === 'undefined') {
    try {
      // Vite statically replaces this if the user selected a key
      apiKey = process.env.API_KEY as string;
    } catch (e) {
      // Ignore ReferenceError
    }
  }
  
  if (!apiKey || apiKey === 'undefined') {
    throw new Error("No se encontró una API Key válida. Si estás en la versión publicada, asegúrate de configurar las variables de entorno.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateTattooOutline = async (base64Image: string, mimeType: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: mimeType } },
        { text: 'Crea solo el trazo de este dibujo para un tatuaje, en fondo blanco y con líneas negras bien definidas.' },
      ],
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (part?.inlineData?.data) return part.inlineData.data;
  throw new Error('No se pudo generar el trazo.');
};

// --- Added generateTattooPreview implementation ---
export const generateTattooPreview = async (base64Image: string, mimeType: string, bodyPart: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: mimeType } },
        { text: `Aplica este diseño de tatuaje de forma realista sobre ${bodyPart}. El resultado debe verse como una fotografía real de un tatuaje en la piel, respetando la anatomía, las sombras y la textura dérmica.` },
      ],
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (part?.inlineData?.data) return part.inlineData.data;
  throw new Error('No se pudo generar la vista previa.');
};

// Use gemini-3-pro-image-preview for grounding with images as required by guidelines
export const askAiConsultant = async (question: string, image?: { data: string, mimeType: string }): Promise<{text: string, sources?: any[]}> => {
  const ai = getAiClient();
  const parts: any[] = [{ text: question }];
  
  if (image) {
    parts.unshift({ inlineData: { data: image.data, mimeType: image.mimeType } });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: { parts },
    config: {
      systemInstruction: "Eres el consultor técnico senior de Bribiesca Studio. Analiza imágenes de piel o tatuajes con precisión médica/artística. Usa Google Search para validar normativas o tendencias actuales.",
      tools: [{ googleSearch: {} }]
    },
  });
  
  return {
    text: response.text || "No pude procesar la respuesta.",
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};

export const generateTattooDesigns = async (prompt: string, quality: 'fast' | 'pro' = 'fast'): Promise<string[]> => {
  const ai = getAiClient();
  const fullPrompt = `Diseño de tatuaje de ${prompt}. Estilo artístico profesional sobre fondo blanco.`;

  if (quality === 'pro') {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: { parts: [{ text: fullPrompt }] },
      config: {
        imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
      },
    });
    const images = (response.candidates?.[0]?.content?.parts
      ?.filter(p => p.inlineData && p.inlineData.data)
      ?.map(p => p.inlineData!.data) || []) as string[];
    
    if (images.length === 0) {
      throw new Error('No se generaron imágenes. Intenta con otro prompt.');
    }
    return images;
  } else {
    // Generate 1 image for fast quality to avoid rate limits
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: fullPrompt }] },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      },
    });
    const parts = response.candidates?.[0]?.content?.parts;
    const images: string[] = [];
    if (parts) {
      parts.filter(p => p.inlineData && p.inlineData.data).forEach(p => images.push(p.inlineData!.data as string));
    }
    if (images.length === 0) {
      throw new Error('No se generaron imágenes. Intenta con otro prompt.');
    }
    return images;
  }
};
