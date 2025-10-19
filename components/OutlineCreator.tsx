import React, { useState, useCallback, useRef } from 'react';
import { generateTattooOutline } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { Spinner, DownloadIcon, PrintIcon, SaveIcon, CloseIcon } from './Icons';
import { TattooStyle, TATTOO_STYLES } from '../data/gallery';
import { saveToGallery } from '../utils/galleryUtils';
import { jsPDF } from 'jspdf';


export const OutlineCreator: React.FC = () => {
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const resultImageRef = useRef<HTMLImageElement>(null);

    // Sizing state
    const [outlineHeight, setOutlineHeight] = useState(15); // in cm
    const [aspectRatio, setAspectRatio] = useState(1);

    // Save to Gallery Modal state
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [saveData, setSaveData] = useState({ title: '', description: '', style: 'Realismo' as TattooStyle });
    const [saveSuccess, setSaveSuccess] = useState('');


    const handleFileChange = (file: File | null) => {
        if (file) {
            setSourceFile(file);
            setResultUrl(null);
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSourcePreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetState = () => {
        setSourceFile(null);
        setSourcePreviewUrl(null);
        setResultUrl(null);
        setError(null);
        setOutlineHeight(15);
    };

    const handleGenerateOutline = useCallback(async () => {
        if (!sourceFile) {
            setError('Por favor, sube un dibujo primero.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResultUrl(null);

        try {
            const { base64, mimeType } = await fileToBase64(sourceFile);
            const resultBase64 = await generateTattooOutline(base64, mimeType);
            setResultUrl(`data:image/jpeg;base64,${resultBase64}`);
        } catch (err) {
            setError('Hubo un error al generar el trazo. Inténtalo de nuevo.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [sourceFile]);
    
    // --- Sizing and Export Logic ---
    const handleResultImageLoad = () => {
        if (resultImageRef.current) {
            const { naturalWidth, naturalHeight } = resultImageRef.current;
            setAspectRatio(naturalWidth / naturalHeight);
        }
    };

    const calculatedWidth = (outlineHeight * aspectRatio).toFixed(1);

    const handleDownloadImage = () => {
        if (!resultUrl) return;
        const link = document.createElement('a');
        link.href = resultUrl;
        link.download = `trazo-tatuaje.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadPdf = () => {
        if (!resultUrl) return;
        // jsPDF uses mm, so convert cm to mm
        const widthMm = parseFloat(calculatedWidth) * 10;
        const heightMm = outlineHeight * 10;
        const pdf = new jsPDF(widthMm > heightMm ? 'l' : 'p', 'mm', [widthMm, heightMm]);
        pdf.addImage(resultUrl, 'JPEG', 0, 0, widthMm, heightMm);
        pdf.save(`trazo-${heightMm}mm.pdf`);
    };

    const handlePrint = () => {
        if (!resultUrl) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head><title>Imprimir Trazo</title></head>
                    <body style="margin:0; padding:0;">
                        <img src="${resultUrl}" style="height:${outlineHeight}cm; width:${calculatedWidth}cm;" onload="window.print(); window.close();" />
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

     // --- Save to Gallery Logic ---
    const handleOpenSaveModal = () => {
        setSaveSuccess('');
        setSaveData({ title: '', description: '', style: 'Realismo' });
        setIsSaveModalOpen(true);
    };

    const handleSaveToGallery = (e: React.FormEvent) => {
        e.preventDefault();
        if (!resultUrl || !saveData.title.trim()) {
            alert("El título es obligatorio.");
            return;
        };

        try {
            saveToGallery({
                src: resultUrl,
                alt: saveData.title,
                description: saveData.description,
                style: saveData.style,
                type: 'image',
            });
            setSaveSuccess('¡Trazo guardado en la galería con éxito!');
            setTimeout(() => {
                setIsSaveModalOpen(false);
            }, 2000);
        } catch (error) {
            console.error(error);
            alert((error as Error).message || "No se pudo guardar la imagen.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Source Image Panel */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-center text-gray-600 dark:text-gray-300">1. Sube tu Dibujo</h3>
                    <div className="aspect-square bg-gray-200 dark:bg-gray-900 rounded-lg flex items-center justify-center border border-gray-300 dark:border-gray-700 p-2">
                        {sourcePreviewUrl ? (
                            <img src={sourcePreviewUrl} alt="Dibujo original" className="max-h-full max-w-full object-contain rounded-md" />
                        ) : (
                             <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg p-4">
                                <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 hover:bg-gray-300/50 dark:hover:bg-gray-800/50 transition-colors rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-500 mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                    <span className="font-medium text-purple-600 dark:text-purple-300">Seleccionar archivo</span>
                                    <span className="text-sm text-gray-500 mt-1">o arrástralo aquí</span>
                                </label>
                                <input id="image-upload" name="image-upload" type="file" accept="image/*" className="sr-only" onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
                            </div>
                        )}
                    </div>
                     {sourceFile && (
                        <div className="text-center">
                            <button onClick={resetState} className="text-sm text-red-500 hover:underline mt-1">
                                Empezar de nuevo
                            </button>
                        </div>
                     )}
                </div>

                {/* Result Image Panel */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-center text-gray-600 dark:text-gray-300">2. Obtén el Trazo</h3>
                    <div className="aspect-square bg-gray-200 dark:bg-gray-900 rounded-lg flex items-center justify-center border border-gray-300 dark:border-gray-700 relative group p-2">
                        {isLoading && (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 rounded-lg">
                                <Spinner />
                                <p className="text-white mt-2">Generando trazo...</p>
                            </div>
                        )}
                        {resultUrl ? (
                            <img ref={resultImageRef} src={resultUrl} onLoad={handleResultImageLoad} alt="Trazo generado" className="max-h-full max-w-full object-contain rounded-md" />
                        ) : (
                           !isLoading && <p className="text-gray-500 text-center px-4">El trazo para tu tatuaje aparecerá aquí.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Generate Button or Sizing Controls */}
            <div className="pt-2">
                {sourceFile && !resultUrl && !isLoading && (
                    <div className="text-center">
                        <button
                            onClick={handleGenerateOutline}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                        >
                            Crear Trazo con IA
                        </button>
                    </div>
                )}
                 {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </div>

            {resultUrl && !isLoading && (
                <div className="space-y-6 pt-4 border-t border-gray-300 dark:border-gray-700 animate-fade-in">
                    <h3 className="text-lg font-semibold text-center text-gray-600 dark:text-gray-300">3. Ajusta y Exporta</h3>
                    {/* Sizing Controls */}
                    <div className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg border border-gray-300 dark:border-gray-700">
                        <label htmlFor="height-slider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ajustar Altura: <span className="font-bold text-purple-600 dark:text-purple-300">{outlineHeight.toFixed(1)} cm</span></label>
                        <input
                            id="height-slider"
                            type="range"
                            min="1"
                            max="30"
                            step="0.5"
                            value={outlineHeight}
                            onChange={(e) => setOutlineHeight(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                         <p className="text-center text-lg text-gray-700 dark:text-gray-300 mt-2">
                            Tamaño final: <span className="font-bold text-purple-600 dark:text-purple-300">{outlineHeight.toFixed(1)} cm</span> de alto x <span className="font-bold text-purple-600 dark:text-purple-300">{calculatedWidth} cm</span> de ancho
                        </p>
                    </div>
                    {/* Export Buttons */}
                    <div className="flex flex-wrap justify-center gap-4">
                        <button onClick={handleDownloadImage} className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                            <DownloadIcon /><span className="ml-2">Descargar Imagen</span>
                        </button>
                        <button onClick={handleDownloadPdf} className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                            <DownloadIcon /><span className="ml-2">Descargar PDF</span>
                        </button>
                        <button onClick={handleOpenSaveModal} className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                           <SaveIcon /><span className="ml-2">Guardar en Galería</span>
                        </button>
                        <button onClick={handlePrint} className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                           <PrintIcon /><span className="ml-2">Imprimir</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Save to Gallery Modal */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsSaveModalOpen(false)}>
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
                                    <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-md font-semibold hover:bg-purple-700">Guardar</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};