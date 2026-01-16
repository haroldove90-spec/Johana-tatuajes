
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { askAiConsultant } from '../services/geminiService';
import { Spinner, UserIcon, BotIcon, SendIcon, CameraIcon, GlobeIcon, MicIcon, CloseIcon } from './Icons';
import { fileToBase64 } from '../utils/fileUtils';

interface ConversationTurn {
    role: 'user' | 'model';
    content: string;
    image?: string;
    sources?: any[];
}

const HISTORY_STORAGE_KEY = 'aiConsultantHistory';

const ModelResponse: React.FC<{ turn: ConversationTurn }> = ({ turn }) => {
    const { content, sources } = turn;
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
        if (line.trim() !== '') {
            const parts = line.split(/(\*\*.*?\*\*)/g);
            elements.push(
                <p key={`p-${index}`} className="text-sm leading-relaxed">
                    {parts.map((part, i) =>
                        part.startsWith('**') && part.endsWith('**') ? (
                            <strong key={i} className="text-brand font-black">{part.slice(2, -2)}</strong>
                        ) : (
                            part
                        )
                    )}
                </p>
            );
        }
    });

    return (
        <div className="space-y-3">
            <div className="space-y-2">{elements}</div>
            {sources && sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                    <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-1">
                        <GlobeIcon className="w-3 h-3" /> Fuentes Consultadas
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {sources.map((src, idx) => (
                            <a key={idx} href={src.web?.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] bg-white/5 hover:bg-brand/10 px-2 py-1 rounded-md border border-white/5 text-gray-400 transition-colors">
                                {src.web?.title || 'Fuente Externa'}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const AiConsultant: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [conversation, setConversation] = useState<ConversationTurn[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<{ data: string, mimeType: string, preview: string } | null>(null);
    
    const conversationEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (saved) setConversation(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(conversation));
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation, isLoading]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const { base64, mimeType } = await fileToBase64(file);
            setSelectedImage({ data: base64, mimeType, preview: `data:${mimeType};base64,${base64}` });
        }
    };

    const handleAsk = useCallback(async () => {
        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt && !selectedImage) return;

        // Check for mandatory API key selection for Gemini 3 Pro series
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await (window as any).aistudio.openSelectKey();
            // Proceeding assuming key selection was successful as per guidelines race condition rule
        }
        
        setIsLoading(true);
        setError(null);
        
        const userTurn: ConversationTurn = { 
            role: 'user', 
            content: trimmedPrompt || "Analiza esta imagen.",
            image: selectedImage?.preview 
        };
        
        setConversation(prev => [...prev, userTurn]);
        setPrompt('');
        const currentImage = selectedImage;
        setSelectedImage(null);

        try {
            const response = await askAiConsultant(trimmedPrompt, currentImage ? { data: currentImage.data, mimeType: currentImage.mimeType } : undefined);
            setConversation(prev => [...prev, { role: 'model', content: response.text, sources: response.sources }]);
        } catch (err: any) {
            // Handle specific API key error by resetting selection
            if (err.message?.includes("Requested entity was not found")) {
                await (window as any).aistudio.openSelectKey();
            }
            setError('Error en la consultoría. Los modelos Pro requieren una API Key de pago configurada.');
            setConversation(prev => prev.slice(0, -1));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, selectedImage]);

    return (
        <div className="flex flex-col h-[calc(100dvh-200px)] animate-fade-in">
            <header className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center gap-2">
                        Consultoría Pro <span className="text-[10px] bg-brand text-white px-2 py-0.5 rounded-full not-italic tracking-normal">G3 PRO IMAGE</span>
                    </h2>
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Análisis Multimodal y Grounding</p>
                </div>
                <button 
                    onClick={() => setConversation([])} 
                    className="text-[9px] font-black text-gray-500 hover:text-red-500 uppercase tracking-widest transition-colors"
                >
                    Borrar Historial
                </button>
            </header>

            <div className="flex-grow overflow-y-auto space-y-6 mb-4 bg-black/40 p-6 rounded-[2rem] border border-white/5 custom-scrollbar">
                {conversation.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                        <BotIcon className="w-12 h-12 text-brand" />
                        <p className="text-[10px] uppercase font-black tracking-[0.2em] max-w-[200px]">
                            Envía una foto de tu tatuaje o haz una pregunta técnica compleja. Requiere API Key propia.
                        </p>
                    </div>
                )}
                {conversation.map((turn, index) => (
                    <div key={index} className={`flex items-start gap-4 ${turn.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border ${turn.role === 'user' ? 'bg-brand/10 border-brand/20 text-brand' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                            {turn.role === 'user' ? <UserIcon className="w-5 h-5"/> : <BotIcon className="w-5 h-5"/>}
                        </div>
                        <div className={`max-w-[85%] space-y-3`}>
                            {turn.image && (
                                <img src={turn.image} className="w-48 rounded-2xl border border-brand/20 shadow-2xl" alt="Consulta visual" />
                            )}
                            <div className={`p-5 rounded-3xl ${turn.role === 'user' ? 'bg-brand text-white font-bold' : 'bg-[#0a0a0a] border border-white/10 text-gray-300'}`}>
                                {turn.role === 'model' ? <ModelResponse turn={turn} /> : <p className="text-sm">{turn.content}</p>}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Spinner />
                        </div>
                        <p className="text-[10px] font-black uppercase text-brand animate-pulse tracking-widest">Consultando con la red...</p>
                    </div>
                )}
                <div ref={conversationEndRef} />
            </div>

            <div className="relative space-y-4">
                {selectedImage && (
                    <div className="absolute bottom-full left-0 mb-4 animate-fade-in">
                        <div className="relative group">
                            <img src={selectedImage.preview} className="w-20 h-20 object-cover rounded-2xl border-2 border-brand shadow-2xl" />
                            <button 
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-lg"
                            >
                                <CloseIcon className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="flex items-end gap-3 bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-3 focus-within:border-brand/40 transition-all shadow-2xl">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-gray-500 hover:text-brand transition-colors"
                        title="Adjuntar Foto"
                    >
                        <CameraIcon />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="sr-only" />
                    
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Escribe tu consulta profesional..."
                        className="flex-grow bg-transparent border-none focus:ring-0 p-3 text-sm font-medium resize-none max-h-32"
                        rows={1}
                    />
                    
                    <button 
                        onClick={handleAsk}
                        disabled={isLoading || (!prompt.trim() && !selectedImage)}
                        className="p-4 bg-brand text-white rounded-2xl shadow-xl active:scale-90 transition-all disabled:opacity-30"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex justify-center gap-6">
                    <button className="flex items-center gap-2 text-[9px] font-black text-gray-600 uppercase tracking-widest hover:text-brand transition-colors">
                        <MicIcon className="w-4 h-4" /> Live Assist
                    </button>
                </div>
            </div>
        </div>
    );
};
