
import React, { useState, useCallback } from 'react';
import { generateTattooDesigns } from '../services/geminiService';
import { Spinner, DownloadIcon, SaveIcon, CloseIcon, StarIcon } from './Icons';
import { TattooStyle, TATTOO_STYLES } from '../data/gallery';
import { saveToGallery } from '../utils/galleryUtils';

export const DesignGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [quality, setQuality] = useState<'fast' | 'pro'>('fast');
    const [results, setResults] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [imageToSave, setImageToSave] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveData, setSaveData] = useState({ title: '', description: '', style: 'Realismo' as TattooStyle });
    const [saveSuccess, setSaveSuccess] = useState('');

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Describe el diseño.');
            return;
        }

        if (quality === 'pro') {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await (window as any).aistudio.openSelectKey();
                // Proseguir asumiendo que el usuario seleccionó la llave
            }
        }

        setIsLoading(true);
        setError(null);
        setResults([]);

        try {
            const designs = await generateTattooDesigns(prompt, quality);
            setResults(designs);
        } catch (err) {
            setError('Error en la generación. Los modelos Pro requieren una API Key de pago.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, quality]);

    return (
        <div className="space-y-8 animate-fade-in">
            <header>
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Generador de Arte</h2>
                <p className="text-[10px] text-brand font-black uppercase tracking-widest mt-1">IA Generativa de Vanguardia</p>
            </header>

            <div className="bg-[#050505] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-6 bg-black border border-white/10 rounded-3xl font-bold text-white placeholder-gray-700 focus:border-brand transition-all outline-none h-32"
                    placeholder="Ej: Un samurái cyberpunk con detalles en neón púrpura, estilo geométrico..."
                />

                <div className="flex gap-4">
                    <button 
                        onClick={() => setQuality('fast')}
                        className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${quality === 'fast' ? 'bg-white text-black border-white' : 'bg-black text-gray-500 border-white/10'}`}
                    >
                        Boceto Rápido
                    </button>
                    <button 
                        onClick={() => setQuality('pro')}
                        className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${quality === 'pro' ? 'bg-brand text-white border-brand shadow-[0_0_20px_rgba(232,21,220,0.4)]' : 'bg-black text-gray-500 border-white/10'}`}
                    >
                        <StarIcon className="w-4 h-4" /> Calidad Pro (1K)
                    </button>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full py-6 bg-white text-black font-black rounded-3xl uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all disabled:opacity-20 text-xs"
                >
                    {isLoading ? <Spinner /> : 'CREAR DISEÑO'}
                </button>
            </div>
            
            {error && <p className="text-brand text-center text-[10px] font-black bg-brand/10 p-4 rounded-2xl animate-shake">{error}</p>}

            {results.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                    {results.map((base64Image, index) => (
                         <div key={index} className="group relative bg-[#050505] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
                            <img src={`data:image/jpeg;base64,${base64Image}`} className="w-full aspect-square object-cover" />
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 p-6">
                                <button onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = `data:image/jpeg;base64,${base64Image}`;
                                    link.download = `bribiesca-pro-${index}.jpg`;
                                    link.click();
                                }} className="w-full py-3 bg-white text-black font-black text-[10px] uppercase rounded-xl">Descargar</button>
                                <button onClick={() => {
                                    setImageToSave(`data:image/jpeg;base64,${base64Image}`);
                                }} className="w-full py-3 bg-brand text-white font-black text-[10px] uppercase rounded-xl">Guardar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {imageToSave && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-fade-in" onClick={() => setImageToSave(null)}>
                    <div className="bg-[#050505] border border-white/10 w-full max-w-md rounded-[3rem] p-10 space-y-8" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-black text-brand italic uppercase">Guardar en Galería</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setIsSaving(true);
                            await saveToGallery({ src: imageToSave, ...saveData, type: 'image' });
                            setIsSaving(false);
                            setImageToSave(null);
                        }} className="space-y-4">
                            <input type="text" placeholder="TÍTULO" required onChange={e => setSaveData({...saveData, title: e.target.value})} className="w-full bg-black p-5 rounded-2xl border border-white/10 text-white font-bold" />
                            <textarea placeholder="DESCRIPCIÓN" onChange={e => setSaveData({...saveData, description: e.target.value})} className="w-full bg-black p-5 rounded-2xl border border-white/10 text-white font-bold h-24" />
                            <select onChange={e => setSaveData({...saveData, style: e.target.value as TattooStyle})} className="w-full bg-black p-5 rounded-2xl border border-white/10 text-white font-bold">
                                {TATTOO_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <button disabled={isSaving} className="w-full py-5 bg-brand text-white font-black rounded-2xl shadow-xl">{isSaving ? <Spinner /> : 'CONFIRMAR'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
