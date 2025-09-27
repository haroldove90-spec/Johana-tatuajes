
import React, { useState, useCallback } from 'react';
import { generateTattooOutline } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { Spinner, DownloadIcon } from './Icons';

declare const jspdf: any;

export const OutlineCreator: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setResultUrl(null);
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateOutline = useCallback(async () => {
        if (!imageFile) {
            setError('Por favor, selecciona una imagen primero.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResultUrl(null);

        try {
            const { base64, mimeType } = await fileToBase64(imageFile);
            const resultBase64 = await generateTattooOutline(base64, mimeType);
            setResultUrl(`data:image/png;base64,${resultBase64}`);
        } catch (err) {
            setError('Hubo un error al generar el trazo. Inténtalo de nuevo.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [imageFile]);

    const handleDownloadPdf = () => {
        if (!resultUrl) return;
        const pdf = new jspdf.jsPDF();
        const img = new Image();
        img.src = resultUrl;
        img.onload = () => {
            const imgProps = pdf.getImageProperties(img);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('trazo-tatuaje.pdf');
        };
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center justify-center px-6 py-3 border border-gray-600 rounded-md shadow-sm text-base font-medium text-white bg-gray-700 hover:bg-gray-600">
                    <span>Seleccionar Imagen</span>
                </label>
                <input id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                {imageFile && <p className="text-sm text-gray-400 mt-2">Archivo: {imageFile.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="w-full p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <h4 className="font-bold mb-2 text-center text-gray-300">Original</h4>
                    {previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-auto object-contain rounded-md max-h-80" /> : <div className="h-80 flex items-center justify-center text-gray-500">Vista previa de la imagen</div>}
                </div>
                <div className="w-full p-4 bg-gray-900 rounded-lg border border-gray-700">
                     <h4 className="font-bold mb-2 text-center text-gray-300">Trazo Generado</h4>
                    <div className="w-full h-80 flex items-center justify-center rounded-md bg-white">
                        {isLoading && <Spinner />}
                        {resultUrl && <img src={resultUrl} alt="Generated Outline" className="w-full h-auto object-contain rounded-md max-h-80" />}
                        {!isLoading && !resultUrl && <div className="text-gray-500 p-4 text-center">Aquí aparecerá el trazo generado por la IA.</div>}
                    </div>
                </div>
            </div>

            {error && <p className="text-red-400 text-center">{error}</p>}
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                    onClick={handleGenerateOutline}
                    disabled={!imageFile || isLoading}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? <><Spinner /> <span className="ml-2">Generando...</span></> : 'Generar Trazo'}
                </button>
                {resultUrl && (
                     <button
                        onClick={handleDownloadPdf}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-purple-500 rounded-md shadow-sm text-base font-medium text-purple-300 bg-transparent hover:bg-purple-500/20 disabled:opacity-50 transition-colors"
                    >
                        <DownloadIcon />
                        <span className="ml-2">Descargar PDF</span>
                    </button>
                )}
            </div>
        </div>
    );
};
