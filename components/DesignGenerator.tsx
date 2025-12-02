import React, { useState, useCallback } from 'react';
import { generateTattooDesigns } from '../services/geminiService';
import { Spinner, DownloadIcon, SaveIcon, CloseIcon } from './Icons';
import { TattooStyle, TATTOO_STYLES } from '../data/gallery';
import { saveToGallery } from '../utils/galleryUtils';

export const DesignGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [results, setResults] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    // Save to Gallery Modal state
    const [imageToSave, setImageToSave] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveData, setSaveData] = useState({ title: '', description: '', style: 'Realismo' as TattooStyle });
    const [saveSuccess, setSaveSuccess] = useState('');


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

    // --- Save to Gallery Logic ---
    const handleOpenSaveModal = (base64Image: string) => {
        setSaveSuccess('');
        setSaveData({ title: '', description: '', style: 'Realismo' as TattooStyle });
        setImageToSave(`data:image/jpeg;base64,${base64Image}`);
    };
    
    const handleCloseSaveModal = () => {
        setImageToSave(null);
    };

    const handleSaveToGallery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageToSave || !saveData.title.trim()) {
            alert("El título es obligatorio.");
            return;
        }

        setIsSaving(true);
        try {
            await saveToGallery({
                src: imageToSave,
                alt: saveData.title,
                description: saveData.description,
                style: saveData.style,
                type: 'image',
            });
            setSaveSuccess('¡Diseño guardado en la galería con éxito!');
            setTimeout(() => {
                handleCloseSaveModal();
            }, 2000);
        } catch (error) {
            console.error(error);
            alert((error as Error).message || "No se pudo guardar la imagen.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Describe el diseño del tatuaje que quieres:
                </label>
                <textarea
                    id="prompt"
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500"
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
            
            {error && <p className="text-red-500 text-center">{error}</p>}

            {isLoading && (
                 <div className="text-center text-gray-500 dark:text-gray-400">
                    <p>La IA está creando tus diseños... esto puede tardar un momento.</p>
                </div>
            )}

            {results.length > 0 && (
                <div className="animate-fade-in">
                    <h3 className="text-xl font-bold mb-4 text-center">Tus Diseños Generados</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {results.map((base64Image, index) => (
                             <div key={index} className="space-y-3">
                                <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                                    <img src={`data:image/jpeg;base64,${base64Image}`} alt={`Diseño generado ${index + 1}`} className="w-full h-auto object-cover aspect-square"/>
                                </div>
                                <div className="flex justify-center gap-2">
                                     <button onClick={() => handleDownload(base64Image, index)} className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm">
                                        <DownloadIcon />
                                        <span className="ml-2">Descargar</span>
                                    </button>
                                     <button onClick={() => handleOpenSaveModal(base64Image)} className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                                        <SaveIcon />
                                        <span className="ml-2">Guardar</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Save to Gallery Modal */}
            {imageToSave && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={handleCloseSaveModal}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full relative p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                         <button onClick={handleCloseSaveModal} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                            <CloseIcon />
                        </button>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Guardar Diseño en Galería</h3>
                        
                        {saveSuccess ? (
                             <div className="text-center p-8">
                                <p className="text-green-600 dark:text-green-400 font-semibold">{saveSuccess}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSaveToGallery} className="space-y-4">
                                <img src={imageToSave} alt="Diseño a guardar" className="w-full h-auto max-h-48 object-contain rounded-md bg-gray-200 dark:bg-gray-900"/>
                                <div>
                                    <label htmlFor="save-title" className="block text-sm font-medium mb-1">Título</label>
                                    <input type="text" id="save-title" value={saveData.title} onChange={e => setSaveData({...saveData, title: e.target.value})} required className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"/>
                                </div>
                                <div>
                                    <label htmlFor="save-description" className="block text-sm font-medium mb-1">Descripción (opcional)</label>
                                    <textarea id="save-description" value={saveData.description} onChange={e => setSaveData({...saveData, description: e.target.value})} rows={2} className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"></textarea>
                                </div>
                                <div>
                                    <label htmlFor="save-style" className="block text-sm font-medium mb-1">Estilo</label>
                                    <select id="save-style" value={saveData.style} onChange={e => setSaveData({...saveData, style: e.target.value as TattooStyle})} className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                        {TATTOO_STYLES.map(style => <option key={style} value={style}>{style}</option>)}
                                    </select>
                                </div>
                                <div className="flex justify-end gap-4 pt-2">
                                    <button type="button" onClick={handleCloseSaveModal} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md font-semibold">Cancelar</button>
                                     <button type="submit" disabled={isSaving} className="px-4 py-2 bg-purple-600 text-white rounded-md font-semibold hover:bg-purple-700 disabled:bg-purple-400 flex items-center justify-center">
                                        {isSaving && <Spinner />}
                                        <span className={isSaving ? 'ml-2' : ''}>Guardar</span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};