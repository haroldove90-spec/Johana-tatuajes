import React, { useState, useCallback } from 'react';
import { generateTattooPreview } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { Spinner, DownloadIcon, SaveIcon, CloseIcon } from './Icons';
import { TattooStyle, TATTOO_STYLES } from '../data/gallery';
import { saveToGallery } from '../utils/galleryUtils';

const GENDERS = [
    { id: 'hombre', label: 'Hombre' },
    { id: 'mujer', label: 'Mujer' },
];

const BODY_PARTS = [
    { id: 'brazo', label: 'Brazo' },
    { id: 'pierna', label: 'Pierna' },
    { id: 'espalda', label: 'Espalda' },
    { id: 'muslo', label: 'Muslo' },
    { id: 'pantorrilla', label: 'Pantorrilla' },
    { id: 'otro', label: 'Otro...' },
];

export const TattooPreviewer: React.FC = () => {
    const [tattooFile, setTattooFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);

    const [gender, setGender] = useState<'hombre' | 'mujer'>('hombre');
    const [bodyPart, setBodyPart] = useState<string>('brazo');
    const [customBodyPart, setCustomBodyPart] = useState('');
    
    // Save to Gallery Modal state
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveData, setSaveData] = useState({ title: '', description: '', style: 'Realismo' as TattooStyle });
    const [saveSuccess, setSaveSuccess] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setTattooFile(file);
            setResultUrl(null);
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGeneratePreview = useCallback(async () => {
        if (!tattooFile) {
            setError('Por favor, sube un diseño de tatuaje primero.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResultUrl(null);

        try {
            const genderText = gender === 'mujer' ? 'una mujer' : 'un hombre';
            const bodyPartText = bodyPart === 'otro' && customBodyPart.trim()
                ? customBodyPart.trim()
                : `el ${bodyPart} de ${genderText}`;
            
            const { base64, mimeType } = await fileToBase64(tattooFile);
            const resultBase64 = await generateTattooPreview(base64, mimeType, bodyPartText);
            setResultUrl(`data:image/jpeg;base64,${resultBase64}`);
        } catch (err) {
            setError('Hubo un error al generar la vista previa. Inténtalo de nuevo.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [tattooFile, gender, bodyPart, customBodyPart]);

    const handleDownload = () => {
        if (!resultUrl) return;
        const link = document.createElement('a');
        link.href = resultUrl;
        link.download = `vista-previa-tatuaje-${gender}-${bodyPart}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    // --- Save to Gallery Logic ---
    const handleOpenSaveModal = () => {
        setSaveSuccess('');
        setSaveData({ title: '', description: '', style: 'Realismo' });
        setIsSaveModalOpen(true);
    };

    const handleSaveToGallery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resultUrl || !saveData.title.trim()) {
            alert("El título es obligatorio.");
            return;
        }
        
        setIsSaving(true);
        try {
            await saveToGallery({
                src: resultUrl,
                alt: saveData.title,
                description: saveData.description,
                style: saveData.style,
                type: 'image',
            });
            setSaveSuccess('¡Vista previa guardada en la galería con éxito!');
            setTimeout(() => {
                setIsSaveModalOpen(false);
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
            {/* File Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-gray-400 dark:border-gray-600 rounded-lg">
                <div className="flex-grow">
                    <label htmlFor="tattoo-upload" className="cursor-pointer inline-flex items-center justify-center px-6 py-3 border border-gray-400 dark:border-gray-600 rounded-md shadow-sm text-base font-medium text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
                        <span>Seleccionar Diseño</span>
                    </label>
                    <input id="tattoo-upload" name="tattoo-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                    {tattooFile ? <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Archivo: {tattooFile.name}</p> : <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Sube el diseño del tatuaje para empezar.</p>}
                </div>
                {previewUrl && (
                    <div className="flex-shrink-0 w-24 h-24 bg-gray-200 dark:bg-gray-900 p-1 rounded-md border border-gray-300 dark:border-gray-700">
                        <img src={previewUrl} alt="Vista previa del diseño" className="w-full h-full object-contain" />
                    </div>
                )}
            </div>

            {/* Form */}
            {tattooFile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-700">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Género</h4>
                        <div className="flex flex-wrap gap-2">
                            {GENDERS.map((g) => (
                                <button
                                    key={g.id}
                                    onClick={() => setGender(g.id as 'hombre' | 'mujer')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        gender === g.id
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {g.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Parte del Cuerpo</h4>
                        <div className="flex flex-wrap gap-2">
                             {BODY_PARTS.map((bp) => (
                                <button
                                    key={bp.id}
                                    onClick={() => setBodyPart(bp.id)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        bodyPart === bp.id
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {bp.label}
                                </button>
                            ))}
                        </div>
                        {bodyPart === 'otro' && (
                            <div className="mt-4 animate-fade-in">
                                <input
                                    type="text"
                                    value={customBodyPart}
                                    onChange={(e) => setCustomBodyPart(e.target.value)}
                                    placeholder="Ej: el tobillo, la muñeca"
                                    className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500" />
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Generate Button */}
            {tattooFile && (
                <div className="text-center">
                    <button
                        onClick={handleGeneratePreview}
                        disabled={isLoading || (bodyPart === 'otro' && !customBodyPart.trim())}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? <><Spinner /> <span className="ml-2">Generando Vista...</span></> : 'Generar Vista Previa con IA'}
                    </button>
                </div>
            )}

            {error && <p className="text-red-500 text-center">{error}</p>}
            
            {/* Result Display */}
            {isLoading && (
                 <div className="text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                    <Spinner />
                    <p className="mt-2">La IA está creando tu vista previa... esto puede tardar unos momentos.</p>
                </div>
            )}

            {resultUrl && (
                <div className="animate-fade-in">
                    <h3 className="text-xl font-bold mb-4 text-center">Vista Previa Generada</h3>
                    <div className="max-w-md mx-auto">
                        <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                            <img src={resultUrl} alt={`Vista previa en ${bodyPart} de un ${gender}`} className="w-full h-auto object-cover aspect-square"/>
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            <button onClick={handleDownload} className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                                <DownloadIcon />
                                <span className="ml-2">Descargar</span>
                            </button>
                            <button onClick={handleOpenSaveModal} className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                                <SaveIcon />
                                <span className="ml-2">Guardar en Galería</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Save to Gallery Modal */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setIsSaveModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full relative p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setIsSaveModalOpen(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                            <CloseIcon />
                        </button>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Guardar en Galería</h3>
                        {saveSuccess ? (
                            <div className="text-center p-8">
                                <p className="text-green-600 dark:text-green-400 font-semibold">{saveSuccess}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSaveToGallery} className="space-y-4">
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
                                    <button type="button" onClick={() => setIsSaveModalOpen(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md font-semibold">Cancelar</button>
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