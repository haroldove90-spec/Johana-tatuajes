import React, { useState, useRef } from 'react';
import { Spinner, UploadIcon, DownloadIcon } from './Icons';
import { jsPDF } from 'jspdf';

export const StencilPrepper: React.FC = () => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [processedImageSrc, setProcessedImageSrc] = useState<string | null>(null);
    const [sizeCm, setSizeCm] = useState<number>(15);
    const [isProcessing, setIsProcessing] = useState(false);
    const [threshold, setThreshold] = useState<number>(128);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImageSrc(event.target?.result as string);
                setProcessedImageSrc(null); // Reset processed image when new image is uploaded
            };
            reader.readAsDataURL(file);
        }
    };

    const applyThreshold = () => {
        if (!imageSrc || !canvasRef.current) return;
        setIsProcessing(true);

        const img = new Image();
        img.onload = () => {
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                // Calculate grayscale value
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold) ? 255 : 0;
                
                // Set to black or white
                data[i] = data[i + 1] = data[i + 2] = v;
                // Keep alpha as is
            }

            ctx.putImageData(imageData, 0, 0);
            setProcessedImageSrc(canvas.toDataURL('image/png'));
            setIsProcessing(false);
        };
        img.src = imageSrc;
    };

    const exportToPDF = () => {
        if (!processedImageSrc) return;

        // 300 DPI standard
        // 1 inch = 2.54 cm
        // DPI = dots per inch -> 300 dots / 2.54 cm = 118.11 dots per cm
        const pixelsPerCm = 118.11;
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'cm',
            format: 'a4'
        });

        const img = new Image();
        img.onload = () => {
            // Calculate aspect ratio
            const aspectRatio = img.height / img.width;
            
            // Calculate dimensions in cm based on user input for width
            const printWidthCm = sizeCm;
            const printHeightCm = sizeCm * aspectRatio;

            // Resize image to exactly 300 DPI for the target size
            const targetWidthPx = Math.round(printWidthCm * pixelsPerCm);
            const targetHeightPx = Math.round(printHeightCm * pixelsPerCm);

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = targetWidthPx;
            tempCanvas.height = targetHeightPx;
            const tempCtx = tempCanvas.getContext('2d');
            
            if (tempCtx) {
                // Use high quality image smoothing
                tempCtx.imageSmoothingEnabled = true;
                tempCtx.imageSmoothingQuality = 'high';
                tempCtx.drawImage(img, 0, 0, targetWidthPx, targetHeightPx);
                
                const highResImage = tempCanvas.toDataURL('image/png', 1.0);
                
                // Add high-res image to PDF at the exact physical size
                pdf.addImage(highResImage, 'PNG', 1, 1, printWidthCm, printHeightCm);
                pdf.save('stencil.pdf');
            }
        };
        img.src = processedImageSrc;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="mb-8">
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                    Preparador de <span className="text-brand">Stencil</span>
                </h2>
                <p className="text-xs text-gray-500 font-black uppercase tracking-widest mt-2">
                    Convierte diseños a líneas y escala para impresión
                </p>
            </header>

            <div className="bg-[#050505] border border-white/5 rounded-[2rem] p-8 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Controls Section */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                                1. Subir Diseño
                            </label>
                            <label className="flex items-center justify-center w-full p-8 border-2 border-dashed border-white/10 rounded-3xl hover:border-brand/50 hover:bg-brand/5 transition-all cursor-pointer group">
                                <div className="text-center">
                                    <UploadIcon className="w-8 h-8 text-gray-500 group-hover:text-brand mx-auto mb-2 transition-colors" />
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">
                                        Seleccionar Imagen
                                    </span>
                                </div>
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                        </div>

                        {imageSrc && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                                        2. Ajustar Contraste (Threshold)
                                    </label>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="255" 
                                        value={threshold} 
                                        onChange={(e) => setThreshold(Number(e.target.value))}
                                        className="w-full accent-brand"
                                    />
                                    <div className="flex justify-between text-[9px] text-gray-500 font-black mt-1">
                                        <span>Más Oscuro</span>
                                        <span>Valor: {threshold}</span>
                                        <span>Más Claro</span>
                                    </div>
                                    <button 
                                        onClick={applyThreshold}
                                        disabled={isProcessing}
                                        className="w-full mt-4 py-4 bg-white/10 text-white font-black rounded-2xl uppercase tracking-[0.2em] hover:bg-white/20 transition-all text-[10px]"
                                    >
                                        {isProcessing ? <Spinner /> : 'Aplicar Filtro'}
                                    </button>
                                </div>

                                {processedImageSrc && (
                                    <div className="space-y-4 animate-fade-in pt-4 border-t border-white/10">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                                                3. Tamaño Real de Impresión (Ancho en cm)
                                            </label>
                                            <input 
                                                type="number" 
                                                value={sizeCm} 
                                                onChange={(e) => setSizeCm(Number(e.target.value))}
                                                min="1"
                                                max="20"
                                                className="w-full p-4 bg-black border border-white/10 rounded-2xl text-white font-bold"
                                            />
                                        </div>
                                        <button 
                                            onClick={exportToPDF}
                                            className="w-full py-4 bg-brand text-white font-black rounded-2xl uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(232,21,220,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 text-[10px]"
                                        >
                                            <DownloadIcon className="w-4 h-4" /> Exportar PDF a {sizeCm}cm
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Preview Section */}
                    <div className="bg-black/50 rounded-3xl p-6 border border-white/5 flex flex-col items-center justify-center min-h-[400px]">
                        {processedImageSrc ? (
                            <div className="text-center w-full">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand mb-4">Vista Previa del Stencil</p>
                                <img src={processedImageSrc} alt="Stencil Preview" className="max-w-full max-h-[400px] object-contain mx-auto bg-white rounded-xl" />
                            </div>
                        ) : imageSrc ? (
                            <div className="text-center w-full">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Imagen Original</p>
                                <img src={imageSrc} alt="Original" className="max-w-full max-h-[400px] object-contain mx-auto rounded-xl opacity-50" />
                            </div>
                        ) : (
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Sube una imagen para comenzar</p>
                        )}
                        {/* Hidden canvas for processing */}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>

                </div>
            </div>
        </div>
    );
};
