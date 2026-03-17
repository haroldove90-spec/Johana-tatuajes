import React, { useState } from 'react';
import { getAiClient } from '../services/geminiService';
import { Spinner, DownloadIcon } from './Icons';

type Style = 'Ninguno' | 'Realista' | 'Tradicional' | 'Sketch';

export const AiDesigner: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState<Style>('Ninguno');
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setImages([]);

        try {
            const ai = getAiClient();
            const stylePrompt = style !== 'Ninguno' ? `, estilo de tatuaje ${style}` : '';
            const fullPrompt = `${prompt}${stylePrompt}, diseño de tatuaje, fondo blanco limpio, alta calidad`;

            const newImages: string[] = [];
            
            // Generate 4 images sequentially to avoid rate limits
            for (let i = 0; i < 4; i++) {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: {
                        parts: [{ text: fullPrompt }]
                    }
                });
                
                if (response.candidates && response.candidates[0]?.content?.parts) {
                    for (const part of response.candidates[0].content.parts) {
                        if (part.inlineData && part.inlineData.data) {
                            newImages.push(part.inlineData.data);
                        }
                    }
                }
            }
            
            setImages(newImages);
        } catch (err: any) {
            console.error(err);
            setError(`Error: ${err.message || 'Error al generar los diseños. Por favor, intenta de nuevo.'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="mb-8">
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                    Diseñador <span className="text-brand">IA</span>
                </h2>
                <p className="text-xs text-gray-500 font-black uppercase tracking-widest mt-2">
                    Genera ideas de tatuajes con Inteligencia Artificial
                </p>
            </header>

            <div className="bg-[#050505] border border-white/5 rounded-[2rem] p-8 shadow-2xl">
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                            Describe tu idea
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full p-6 bg-black border border-white/10 rounded-3xl font-bold text-white placeholder-gray-700 focus:border-brand transition-all outline-none h-32 resize-none"
                            placeholder="Ej: Un león rugiendo con corona, detalles geométricos..."
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                            Refinar Estilo
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {(['Ninguno', 'Realista', 'Tradicional', 'Sketch'] as Style[]).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStyle(s)}
                                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                        style === s 
                                            ? 'bg-brand text-white border-brand shadow-[0_0_15px_rgba(232,21,220,0.4)]' 
                                            : 'bg-black text-gray-500 border-white/10 hover:border-white/30'
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className="w-full py-6 bg-white text-black font-black rounded-3xl uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all disabled:opacity-20 text-xs"
                    >
                        {isLoading ? <Spinner /> : 'GENERAR 4 VARIANTES'}
                    </button>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                    {images.map((base64, idx) => (
                        <div key={idx} className="group relative bg-[#050505] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl aspect-square">
                            <img 
                                src={`data:image/jpeg;base64,${base64}`} 
                                alt={`Diseño ${idx + 1}`} 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6">
                                <a 
                                    href={`data:image/jpeg;base64,${base64}`}
                                    download={`tattoo-design-${idx + 1}.jpg`}
                                    className="p-4 bg-brand text-white rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(232,21,220,0.5)]"
                                >
                                    <DownloadIcon className="w-6 h-6" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
