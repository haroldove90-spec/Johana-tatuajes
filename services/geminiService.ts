
import { GoogleGenAI } from "@google/genai";

export const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

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

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
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

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
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
    model: "gemini-3-pro-image-preview",
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
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: fullPrompt }] },
      config: {
        imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
      },
    });
    const images = response.candidates?.[0]?.content?.parts
      ?.filter(p => p.inlineData)
      ?.map(p => p.inlineData!.data) || [];
    return images;
  } else {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: fullPrompt,
      config: { numberOfImages: 3, outputMimeType: 'image/jpeg' },
    });
    return response.generatedImages.map(img => img.image.imageBytes);
  }
};
