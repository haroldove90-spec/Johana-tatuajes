
import React, { useState, useCallback } from 'react';
import { generateTattooDesigns } from '../services/geminiService';
import { Spinner, DownloadIcon } from './Icons';

export const DesignGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [results, setResults] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Por favor, describe el tatuaje que deseas.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResults([]);

        try {
            const designs = await generateTattooDesigns(prompt);
            setResults(designs);
        } catch (err) {
            setError('Hubo un error al generar los diseños. Inténtalo de nuevo.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    const handleDownload = (base64Image: string, index: number) => {
        const link = document.createElement('a');
        link.href = `data:image/jpeg;base64,${base64Image}`;
        link.download = `diseno-tatuaje-${index + 1}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
                    Describe el diseño del tatuaje que quieres:
                </label>
                <textarea
                    id="prompt"
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Ej: un león con corona y rosas, estilo geométrico"
                />
            </div>

            <div className="text-center">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? <><Spinner /> <span className="ml-2">Generando...</span></> : 'Generar 3 Diseños'}
                </button>
            </div>
            
            {error && <p className="text-red-400 text-center">{error}</p>}

            {isLoading && (
                 <div className="text-center text-gray-400">
                    <p>La IA está creando tus diseños... esto puede tardar un momento.</p>
                </div>
            )}

            {results.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold mb-4 text-center">Tus Diseños Generados</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {results.map((base64Image, index) => (
                            <div key={index} className="group relative border border-gray-700 rounded-lg overflow-hidden">
                                <img src={`data:image/jpeg;base64,${base64Image}`} alt={`Diseño generado ${index + 1}`} className="w-full h-auto object-cover aspect-square"/>
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDownload(base64Image, index)} className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                                        <DownloadIcon />
                                        <span className="ml-2">Descargar</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
