import React, { useState, useCallback } from 'react';
import { generateTattooPreview } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { Spinner, DownloadIcon } from './Icons';

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
];

export const TattooPreviewer: React.FC = () => {
    const [tattooFile, setTattooFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);

    const [gender, setGender] = useState<'hombre' | 'mujer'>('hombre');
    const [bodyPart, setBodyPart] = useState<string>('brazo');

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
            const bodyPartText = `el ${bodyPart} de ${genderText}`;
            
            const { base64, mimeType } = await fileToBase64(tattooFile);
            const resultBase64 = await generateTattooPreview(base64, mimeType, bodyPartText);
            setResultUrl(`data:image/jpeg;base64,${resultBase64}`);
        } catch (err) {
            setError('Hubo un error al generar la vista previa. Inténtalo de nuevo.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [tattooFile, gender, bodyPart]);

    const handleDownload = () => {
        if (!resultUrl) return;
        const link = document.createElement('a');
        link.href = resultUrl;
        link.download = `vista-previa-tatuaje-${gender}-${bodyPart}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            {/* File Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-gray-600 rounded-lg">
                <div className="flex-grow">
                    <label htmlFor="tattoo-upload" className="cursor-pointer inline-flex items-center justify-center px-6 py-3 border border-gray-600 rounded-md shadow-sm text-base font-medium text-white bg-gray-700 hover:bg-gray-600">
                        <span>Seleccionar Diseño</span>
                    </label>
                    <input id="tattoo-upload" name="tattoo-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                    {tattooFile ? <p className="text-sm text-gray-400 mt-2">Archivo: {tattooFile.name}</p> : <p className="text-sm text-gray-400 mt-2">Sube el diseño del tatuaje para empezar.</p>}
                </div>
                {previewUrl && (
                    <div className="flex-shrink-0 w-24 h-24 bg-gray-900 p-1 rounded-md border border-gray-700">
                        <img src={previewUrl} alt="Vista previa del diseño" className="w-full h-full object-contain" />
                    </div>
                )}
            </div>

            {/* Form */}
            {tattooFile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-300 mb-3">Género</h4>
                        <div className="flex flex-wrap gap-2">
                            {GENDERS.map((g) => (
                                <button
                                    key={g.id}
                                    onClick={() => setGender(g.id as 'hombre' | 'mujer')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        gender === g.id
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {g.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-gray-300 mb-3">Parte del Cuerpo</h4>
                        <div className="flex flex-wrap gap-2">
                             {BODY_PARTS.map((bp) => (
                                <button
                                    key={bp.id}
                                    onClick={() => setBodyPart(bp.id)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        bodyPart === bp.id
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {bp.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Generate Button */}
            {tattooFile && (
                <div className="text-center">
                    <button
                        onClick={handleGeneratePreview}
                        disabled={isLoading}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? <><Spinner /> <span className="ml-2">Generando Vista...</span></> : 'Generar Vista Previa con IA'}
                    </button>
                </div>
            )}

            {error && <p className="text-red-400 text-center">{error}</p>}
            
            {/* Result Display */}
            {isLoading && (
                 <div className="text-center text-gray-400 flex flex-col items-center">
                    <Spinner />
                    <p className="mt-2">La IA está creando tu vista previa... esto puede tardar unos momentos.</p>
                </div>
            )}

            {resultUrl && (
                <div>
                    <h3 className="text-xl font-bold mb-4 text-center">Vista Previa Generada</h3>
                    <div className="max-w-md mx-auto">
                        <div className="group relative border border-gray-700 rounded-lg overflow-hidden">
                            <img src={resultUrl} alt={`Vista previa en ${bodyPart} de un ${gender}`} className="w-full h-auto object-cover aspect-square"/>
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={handleDownload} className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                                    <DownloadIcon />
                                    <span className="ml-2">Descargar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};