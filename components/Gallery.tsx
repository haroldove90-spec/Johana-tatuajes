import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { Spinner, DownloadIcon, CameraIcon, TrashIcon, CloseIcon } from './Icons';

export const Gallery: React.FC = () => {
    const [photos, setPhotos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchPhotos = async () => {
        setIsLoading(true);
        const { data } = await supabase.from('gallery_photos').select('*').order('created_at', { ascending: false });
        if (data) setPhotos(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPhotos();
    }, []);

    const processWatermark = (file: File) => {
        setIsProcessing(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    setIsProcessing(false);
                    return;
                }

                // 1. Redimensionar la imagen para evitar que sea gigante
                let targetWidth = img.width;
                let targetHeight = img.height;
                const MAX_SIZE = 1280;
                
                if (targetWidth > MAX_SIZE || targetHeight > MAX_SIZE) {
                    if (targetWidth > targetHeight) {
                        targetHeight = (targetHeight / targetWidth) * MAX_SIZE;
                        targetWidth = MAX_SIZE;
                    } else {
                        targetWidth = (targetWidth / targetHeight) * MAX_SIZE;
                        targetHeight = MAX_SIZE;
                    }
                }

                canvas.width = targetWidth;
                canvas.height = targetHeight;

                // 2. Dibujar la foto original redimensionada
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                // Función para guardar la imagen final
                const saveImage = async () => {
                    try {
                        const watermarkedBase64 = canvas.toDataURL('image/jpeg', 0.85);
                        await supabase.from('gallery_photos').insert([{ image_data: watermarkedBase64 }]);
                        fetchPhotos();
                    } catch (err) {
                        console.error("Error saving photo", err);
                    } finally {
                        setIsProcessing(false);
                    }
                };

                // 3. Dibujar marca de agua repetida en diagonal
                const drawRepeatedWatermark = () => {
                    const text = "BRIBIESCA";
                    const fontSize = Math.max(30, targetWidth * 0.06);
                    ctx.font = `900 ${fontSize}px Arial, sans-serif`;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; // Blanco semi-transparente más visible
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                    ctx.shadowBlur = 4;
                    ctx.shadowOffsetX = 2;
                    ctx.shadowOffsetY = 2;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    ctx.save();
                    // Mover el origen al centro y rotar 45 grados
                    ctx.translate(targetWidth / 2, targetHeight / 2);
                    ctx.rotate(-Math.PI / 4);

                    // Calcular el área a cubrir (la diagonal de la imagen)
                    const diagonal = Math.sqrt(targetWidth * targetWidth + targetHeight * targetHeight);
                    const stepX = ctx.measureText(text).width * 1.5; // Espaciado horizontal
                    const stepY = fontSize * 3; // Espaciado vertical

                    // Dibujar el texto en un patrón de cuadrícula que cubra toda la diagonal
                    for (let x = -diagonal; x <= diagonal; x += stepX) {
                        for (let y = -diagonal; y <= diagonal; y += stepY) {
                            ctx.fillText(text, x, y);
                        }
                    }
                    ctx.restore();
                };

                drawRepeatedWatermark();
                saveImage();
            };
            
            img.onerror = () => {
                setIsProcessing(false);
            };
            img.src = e.target?.result as string;
        };
        
        reader.onerror = () => {
            setIsProcessing(false);
        };
        reader.readAsDataURL(file);
    };

    const handleDelete = async () => {
        if (!photoToDelete) return;
        try {
            await supabase.from('gallery_photos').delete().eq('id', photoToDelete);
            setPhotoToDelete(null);
            fetchPhotos();
        } catch (error) {
            console.error('Error deleting photo:', error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processWatermark(file);
        }
    };

    const handleShare = async (e: React.MouseEvent, base64Data: string) => {
        e.stopPropagation(); // Evitar que se abra el modal de pantalla completa
        try {
            const res = await fetch(base64Data);
            const blob = await res.blob();
            const file = new File([blob], 'tattoo_watermark.jpg', { type: 'image/jpeg' });
            
            if (navigator.share) {
                await navigator.share({
                    title: 'Bribiesca Tattoo',
                    text: 'Mira mi último trabajo',
                    files: [file]
                });
            } else {
                console.warn('La función de compartir no está soportada en este navegador.');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                        Marca de <span className="text-brand">Agua</span>
                    </h2>
                    <p className="text-xs text-gray-500 font-black uppercase tracking-widest mt-2">
                        Protege tus trabajos
                    </p>
                </div>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="flex items-center gap-2 bg-brand text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-105 transition-all disabled:opacity-50"
                >
                    {isProcessing ? <Spinner /> : <><CameraIcon className="w-5 h-5" /> Tomar Foto</>}
                </button>
                <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                />
            </header>

            {isLoading ? (
                <div className="flex justify-center py-20"><Spinner /></div>
            ) : photos.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-[#050505]">
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">No hay fotos en la galería</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo) => (
                        <div 
                            key={photo.id} 
                            onClick={() => setSelectedPhoto(photo.image_data)}
                            className="relative group aspect-square rounded-2xl overflow-hidden bg-[#050505] border border-white/5 shadow-xl cursor-pointer"
                        >
                            <img src={photo.image_data} alt="Tattoo" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <a 
                                    href={photo.image_data} 
                                    download={`bribiesca_tattoo_${photo.id}.jpg`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-2 bg-white/10 hover:bg-brand text-white rounded-full transition-colors"
                                    title="Descargar"
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                </a>
                                <button 
                                    onClick={(e) => handleShare(e, photo.image_data)}
                                    className="p-2 bg-white/10 hover:bg-brand text-white rounded-full transition-colors"
                                    title="Compartir"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                </button>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPhotoToDelete(photo.id);
                                    }}
                                    className="p-2 bg-white/10 hover:bg-red-500 text-white rounded-full transition-colors"
                                    title="Eliminar"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Pantalla Completa */}
            {selectedPhoto && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
                    <button 
                        className="absolute top-6 right-6 text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50" 
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    <img 
                        src={selectedPhoto} 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                        alt="Tattoo Fullscreen" 
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}

            {/* Modal de Confirmación de Eliminación */}
            {photoToDelete && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-[#111] border border-white/10 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl">
                        <TrashIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">¿Eliminar Foto?</h3>
                        <p className="text-gray-400 text-xs mb-6">Esta acción no se puede deshacer. La foto se borrará permanentemente de tu galería.</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setPhotoToDelete(null)}
                                className="flex-1 py-3 rounded-xl bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
