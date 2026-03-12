import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { Spinner, DownloadIcon, CameraIcon } from './Icons';

export const Gallery: React.FC = () => {
    const [photos, setPhotos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
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
                if (!ctx) return;

                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0);

                const logo = new Image();
                logo.crossOrigin = "Anonymous";
                logo.onload = async () => {
                    const logoWidth = canvas.width * 0.2;
                    const logoHeight = (logo.height / logo.width) * logoWidth;
                    const padding = canvas.width * 0.05;
                    const x = canvas.width - logoWidth - padding;
                    const y = canvas.height - logoHeight - padding;

                    ctx.globalAlpha = 0.7;
                    ctx.drawImage(logo, x, y, logoWidth, logoHeight);
                    ctx.globalAlpha = 1.0;

                    const watermarkedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                    
                    try {
                        await supabase.from('gallery_photos').insert([{ image_data: watermarkedBase64 }]);
                        fetchPhotos();
                    } catch (err) {
                        console.error("Error saving photo", err);
                        alert("Error al guardar la foto");
                    } finally {
                        setIsProcessing(false);
                    }
                };
                logo.onerror = () => {
                    alert("Error al cargar el logotipo para la marca de agua.");
                    setIsProcessing(false);
                };
                logo.src = 'https://appdesignmex.com/bribiescaicono.png';
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processWatermark(file);
        }
    };

    const handleShare = async (base64Data: string) => {
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
                alert('La función de compartir no está soportada en este navegador.');
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
                        <div key={photo.id} className="relative group aspect-square rounded-2xl overflow-hidden bg-[#050505] border border-white/5 shadow-xl">
                            <img src={photo.image_data} alt="Tattoo" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <a 
                                    href={photo.image_data} 
                                    download={`bribiesca_tattoo_${photo.id}.jpg`}
                                    className="p-3 bg-white/10 hover:bg-brand text-white rounded-full transition-colors"
                                    title="Descargar"
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                </a>
                                <button 
                                    onClick={() => handleShare(photo.image_data)}
                                    className="p-3 bg-white/10 hover:bg-brand text-white rounded-full transition-colors"
                                    title="Compartir"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
