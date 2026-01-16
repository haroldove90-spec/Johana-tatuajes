
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Consent, Client } from '../types';
import { CheckIcon, Spinner, CloseIcon, SendIcon, PencilIcon, SaveIcon, EyeIcon } from './Icons';

interface ConsentFormsProps {
    userRole: 'admin' | 'client';
    username: string;
}

const DEFAULT_CONSENT_TEXT = `Yo, [NOMBRE_CLIENTE], acepto los términos y condiciones de Bribiesca Studio para el procedimiento de tatuaje. He sido informado de los riesgos y cuidados posteriores.

1. SOBRE LA INFORMACIÓN RECIBIDA
He sido informado(a) detalladamente por el profesional sobre la técnica, el diseño, la zona de aplicación y el proceso de cicatrización.

2. DECLARACIÓN DE SALUD Y RESPONSABILIDAD
Confirmo que he respondido con veracidad al cuestionario médico previo. Declaro que:
- No estoy bajo los efectos del alcohol o drogas.
- No padezco enfermedades infectocontagiosas no comunicadas.
- No tengo alergias conocidas a los materiales que no hayan sido mencionadas.

3. ACEPTACIÓN DE RIESGOS
Entiendo que el tatuaje conlleva riesgos de infección y cicatrización que acepto voluntariamente.

DECLARACIÓN FINAL: "Autorizo al profesional a realizar el procedimiento."`;

export const ConsentForms: React.FC<ConsentFormsProps> = ({ userRole, username }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [pendingConsents, setPendingConsents] = useState<Consent[]>([]);
    const [signedConsents, setSignedConsents] = useState<Consent[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<number | string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [activeConsent, setActiveConsent] = useState<Consent | null>(null);
    const [consentText, setConsentText] = useState(DEFAULT_CONSENT_TEXT);
    const [toast, setToast] = useState<string | null>(null);
    const [viewOnlyMode, setViewOnlyMode] = useState(false);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        if (userRole === 'admin') {
            fetchClients();
        } else {
            fetchAllConsents();
            
            // Suscripción Realtime - Sincronización instantánea de contratos
            const channel = supabase
                .channel(`consents_realtime_${username.toLowerCase()}`)
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'consents',
                    filter: `client_username=eq.${username.toLowerCase()}`
                }, (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setToast("¡TIENES UN NUEVO DOCUMENTO!");
                    }
                    fetchAllConsents();
                })
                .subscribe();

            return () => { supabase.removeChannel(channel); };
        }
    }, [userRole, username]);

    const fetchClients = async () => {
        const { data } = await supabase.from('clients').select('*').order('name');
        if (data) setClients(data);
    };

    const fetchAllConsents = async () => {
        if (!username) return;
        setIsLoadingData(true);
        const cleanUser = username.trim().toLowerCase();

        const { data, error } = await supabase
            .from('consents')
            .select('*')
            .eq('client_username', cleanUser)
            .order('created_at', { ascending: false });
        
        if (error) console.error("Error Supabase:", error);
        
        if (data) {
            setPendingConsents(data.filter(c => c.status === 'pending'));
            setSignedConsents(data.filter(c => c.status === 'signed'));
        }
        setIsLoadingData(false);
    };

    const handleSendToClient = async () => {
        if (!selectedClientId) return alert("Selecciona un cliente");
        
        const client = clients.find(c => c.id === Number(selectedClientId));
        
        if (!client?.username) {
            return alert(`ERROR: @${client?.name} NO TIENE USUARIO. Asígnale uno en 'Fichas' antes.`);
        }

        setIsSaving(true);
        const clientUser = client.username.trim().toLowerCase();
        const finalizedText = consentText.replace('[NOMBRE_CLIENTE]', client?.name || '');

        const { error } = await supabase.from('consents').insert([{
            client_id: client?.id,
            client_username: clientUser,
            client_name: client?.name,
            content: finalizedText,
            status: 'pending',
            created_at: new Date().toISOString()
        }]);

        if (!error) {
            alert(`¡Documento enviado correctamente a @${clientUser}!`);
            setSelectedClientId('');
        } else {
            alert("Error al enviar: " + error.message);
        }
        setIsSaving(false);
    };

    const startDrawing = (e: any) => {
        if (viewOnlyMode) return;
        setIsDrawing(true);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            const rect = canvasRef.current?.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            ctx.moveTo(x, y);
        }
    };

    const draw = (e: any) => {
        if (!isDrawing || !canvasRef.current || viewOnlyMode) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#E815DC';
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => setIsDrawing(false);

    const handleSaveSignature = async () => {
        if (!activeConsent || !canvasRef.current) return;
        setIsSaving(true);
        const signatureBase64 = canvasRef.current.toDataURL('image/png');
        const { error } = await supabase
            .from('consents')
            .update({ 
                signature: signatureBase64, 
                status: 'signed',
                signed_at: new Date().toISOString()
            })
            .eq('id', activeConsent.id);

        if (!error) {
            alert("Firma guardada. El estudio ha sido notificado.");
            setActiveConsent(null);
            fetchAllConsents();
        } else {
            alert("Error: " + error.message);
        }
        setIsSaving(false);
    };

    const openConsent = (consent: Consent, isHistory: boolean = false) => {
        setActiveConsent(consent);
        setViewOnlyMode(isHistory);
        setToast(null);
    };

    if (userRole === 'admin') {
        return (
            <div className="space-y-8 animate-fade-in pb-20">
                <header>
                    <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Panel de Firmas</h2>
                    <p className="text-[10px] text-brand font-black uppercase tracking-widest mt-1">Gestión de Documentación Legal</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-[#050505] p-6 rounded-3xl border border-white/5 shadow-2xl">
                            <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3">Enviar contrato a:</label>
                            <select 
                                value={selectedClientId} 
                                onChange={(e) => setSelectedClientId(e.target.value)}
                                className="w-full bg-black p-5 rounded-2xl border border-white/10 text-white font-bold text-sm focus:border-brand transition-all"
                            >
                                <option value="">ELIGE UN CLIENTE...</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} {c.username ? `(@${c.username})` : '(SIN USUARIO)'}
                                    </option>
                                ))}
                            </select>
                            {selectedClientId && !clients.find(c => c.id === Number(selectedClientId))?.username && (
                                <p className="mt-4 text-[9px] text-red-500 font-black uppercase leading-tight">⚠️ El cliente seleccionado no tiene @usuario. Asígnale uno en 'Fichas' primero.</p>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-[#050505] p-6 rounded-3xl border border-white/5 shadow-2xl">
                            <textarea 
                                value={consentText}
                                onChange={(e) => setConsentText(e.target.value)}
                                className="w-full h-[300px] bg-black p-6 rounded-2xl border border-white/10 text-gray-300 font-medium leading-relaxed resize-none focus:border-brand transition-all custom-scrollbar italic"
                            ></textarea>
                        </div>
                        <button 
                            onClick={handleSendToClient}
                            disabled={isSaving || !selectedClientId || !clients.find(c => c.id === Number(selectedClientId))?.username}
                            className="w-full py-6 bg-brand text-white font-black rounded-2xl uppercase tracking-widest shadow-xl flex justify-center items-center gap-4 text-xs disabled:opacity-20"
                        >
                            {isSaving ? <Spinner /> : <><SendIcon className="w-5 h-5"/> ENVIAR CONTRATO A LA APP</>}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-10 animate-fade-in pb-20 relative">
            {toast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-brand text-white px-8 py-5 rounded-3xl shadow-[0_0_50px_rgba(232,21,220,0.6)] animate-bounce border-2 border-white/20 flex items-center gap-4">
                    <CheckIcon className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{toast}</span>
                    <button onClick={() => setToast(null)} className="ml-2 opacity-50"><CloseIcon className="w-4 h-4" /></button>
                </div>
            )}

            {!activeConsent ? (
                <>
                    <div className="space-y-6">
                        <header className="flex items-center justify-between">
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] italic">Firmas Pendientes</h2>
                            <button onClick={fetchAllConsents} className="text-[8px] font-black text-brand uppercase border border-brand/20 px-3 py-1 rounded-full hover:bg-brand/10 transition-colors">
                                {isLoadingData ? 'Sincronizando...' : 'Actualizar'}
                            </button>
                        </header>
                        
                        {pendingConsents.length === 0 ? (
                            <div className="p-16 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-[#050505] flex flex-col items-center gap-4">
                                <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">No hay documentos nuevos</p>
                                <div className="mt-4 p-5 bg-white/[0.03] rounded-2xl border border-white/10 w-full max-w-xs shadow-inner">
                                    <p className="text-[8px] text-gray-500 font-black uppercase mb-1 tracking-widest">Diagnóstico de Enlace:</p>
                                    <p className="text-[12px] text-brand font-black">ID: @{username.toLowerCase()}</p>
                                    <p className="text-[7px] text-gray-600 mt-2 uppercase leading-tight font-bold">El administrador debe seleccionar un cliente con este nombre de usuario exacto para que aparezcan tus firmas aquí.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {pendingConsents.map(c => (
                                    <button key={c.id} onClick={() => openConsent(c)} className="w-full p-8 bg-brand/5 border-2 border-brand/40 rounded-[2.5rem] flex justify-between items-center group transition-all shadow-[0_0_40px_rgba(232,21,220,0.1)] active:scale-95">
                                        <div className="text-left">
                                            <p className="text-[9px] text-brand font-black uppercase tracking-[0.2em] mb-1">¡REQUIERE FIRMA!</p>
                                            <h3 className="text-white font-black uppercase text-base tracking-tight italic">Consentimiento de Salud</h3>
                                            <p className="text-[9px] text-gray-600 uppercase mt-1 font-bold">Recibido {new Date(c.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="w-14 h-14 bg-brand text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <PencilIcon className="w-6 h-6" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <header className="flex items-center gap-4">
                            <div className="h-0.5 flex-grow bg-white/5"></div>
                            <h2 className="text-sm font-black text-gray-700 uppercase tracking-[0.3em] italic">Historial Legal</h2>
                            <div className="h-0.5 flex-grow bg-white/5"></div>
                        </header>
                        {signedConsents.length > 0 ? (
                            <div className="grid gap-3">
                                {signedConsents.map(c => (
                                    <div key={c.id} onClick={() => openConsent(c, true)} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex justify-between items-center hover:bg-white/[0.05] cursor-pointer group transition-all">
                                        <div>
                                            <h4 className="text-xs font-black text-white uppercase group-hover:text-brand transition-colors">Contrato Completado</h4>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase mt-1 italic">Firmado el {new Date(c.signed_at!).toLocaleDateString()}</p>
                                        </div>
                                        <EyeIcon className="text-gray-700 w-5 h-5 group-hover:text-white transition-colors" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-[9px] font-black uppercase text-gray-800 tracking-widest py-4">No hay contratos registrados</p>
                        )}
                    </div>
                </>
            ) : (
                <div className="bg-[#050505] p-10 rounded-[3rem] border border-brand/30 shadow-2xl space-y-8 relative animate-fade-in">
                    <button onClick={() => setActiveConsent(null)} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    <div className="text-center md:text-left">
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">
                            {viewOnlyMode ? 'Documento de Archivo' : 'Firmar Documento'}
                        </h3>
                        <p className="text-[10px] text-brand font-black uppercase tracking-widest">Bribiesca Studio Digital Consent</p>
                    </div>
                    
                    <div className="bg-black p-8 rounded-3xl border border-white/5 text-sm text-gray-400 leading-relaxed max-h-[350px] overflow-y-auto custom-scrollbar italic shadow-inner">
                        {activeConsent.content}
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase text-gray-600 tracking-[0.3em] text-center">
                            {viewOnlyMode ? 'ESTA ES TU FIRMA REGISTRADA' : 'DIBUJA TU FIRMA CON EL DEDO'}
                        </p>
                        <div className={`bg-white rounded-[2rem] h-64 overflow-hidden touch-none border-4 border-brand/10 shadow-2xl ${viewOnlyMode ? 'pointer-events-none opacity-90' : 'cursor-crosshair'}`}>
                            {viewOnlyMode && activeConsent.signature ? (
                                <img src={activeConsent.signature} className="w-full h-full object-contain p-6" alt="Firma" />
                            ) : (
                                <canvas 
                                    ref={canvasRef}
                                    width={600}
                                    height={256}
                                    className="w-full h-full"
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseOut={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                ></canvas>
                            )}
                        </div>
                        {!viewOnlyMode && (
                            <button onClick={() => { const ctx = canvasRef.current?.getContext('2d'); if (canvasRef.current && ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); }} className="block mx-auto text-[9px] font-black text-brand/60 uppercase tracking-widest border-b border-brand/20 hover:text-brand transition-colors">LIMPIAR Y REPETIR</button>
                        )}
                    </div>
                    {!viewOnlyMode && (
                        <button onClick={handleSaveSignature} disabled={isSaving} className="w-full py-6 bg-brand text-white font-black rounded-2xl uppercase tracking-widest shadow-xl flex justify-center items-center gap-3 active:scale-95 transition-all text-xs">
                            {isSaving ? <Spinner /> : <><SaveIcon className="w-5 h-5"/> VALIDAR Y ENVIAR AL STUDIO</>}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
