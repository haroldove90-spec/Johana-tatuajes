import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { ClientSession } from '../types';
import { Spinner, PlusIcon, CloseIcon } from './Icons';

interface SessionGalleryProps {
    clientId: number;
}

export const SessionGallery: React.FC<SessionGalleryProps> = ({ clientId }) => {
    const [sessions, setSessions] = useState<ClientSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        session_date: new Date().toISOString().split('T')[0],
        pigments_used: '',
        needles_used: '',
        notes: '',
        before_photos: '',
        after_photos: ''
    });

    const fetchSessions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('client_sessions')
                .select('*')
                .eq('client_id', clientId)
                .order('session_date', { ascending: false });

            if (fetchError) throw fetchError;
            setSessions(data || []);
        } catch (err: any) {
            console.error('Error fetching sessions:', err);
            setError('No se pudieron cargar las sesiones.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [clientId]);

    const handleAddSession = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const beforePhotosArray = formData.before_photos.split(',').map(url => url.trim()).filter(url => url);
            const afterPhotosArray = formData.after_photos.split(',').map(url => url.trim()).filter(url => url);

            const newSession = {
                client_id: clientId,
                session_date: formData.session_date,
                pigments_used: formData.pigments_used,
                needles_used: formData.needles_used,
                notes: formData.notes,
                before_photos: beforePhotosArray,
                after_photos: afterPhotosArray
            };

            const { error: insertError } = await supabase.from('client_sessions').insert([newSession]);
            if (insertError) throw insertError;

            setIsModalOpen(false);
            setFormData({
                session_date: new Date().toISOString().split('T')[0],
                pigments_used: '',
                needles_used: '',
                notes: '',
                before_photos: '',
                after_photos: ''
            });
            fetchSessions();
        } catch (err) {
            alert('Error al guardar la sesión');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">Historial de Sesiones</h3>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-105 transition-all"
                >
                    <PlusIcon className="w-4 h-4" /> Nueva Sesión
                </button>
            </div>

            {error && <div className="text-red-500 text-xs font-black uppercase tracking-widest text-center p-4">{error}</div>}

            {sessions.length === 0 && !error ? (
                <div className="text-gray-500 text-xs font-black uppercase tracking-widest text-center p-8 border border-dashed border-white/10 rounded-3xl">
                    No hay sesiones registradas para este cliente.
                </div>
            ) : (
                sessions.map((session) => (
                    <div key={session.id} className="bg-[#050505] border border-white/5 rounded-[2rem] p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                            <h4 className="font-black text-sm uppercase tracking-widest text-brand italic">
                                Sesión del {new Date(session.session_date).toLocaleDateString()}
                            </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Pigmentos Usados</p>
                                <p className="text-sm text-white font-medium bg-black p-3 rounded-xl border border-white/5">{session.pigments_used || 'No especificado'}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Agujas Usadas</p>
                                <p className="text-sm text-white font-medium bg-black p-3 rounded-xl border border-white/5">{session.needles_used || 'No especificado'}</p>
                            </div>
                        </div>

                        {session.notes && (
                            <div className="mb-6 space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Notas de la Sesión</p>
                                <p className="text-sm text-white font-medium bg-black p-4 rounded-xl border border-white/5">{session.notes}</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            {session.before_photos && session.before_photos.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Fotos Antes</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {session.before_photos.map((url, idx) => (
                                            <div key={`before-${idx}`} className="aspect-square rounded-2xl overflow-hidden bg-black border border-white/5">
                                                <img 
                                                    src={url} 
                                                    alt={`Antes ${idx + 1}`} 
                                                    loading="lazy" 
                                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {session.after_photos && session.after_photos.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand mb-3">Fotos Después</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {session.after_photos.map((url, idx) => (
                                            <div key={`after-${idx}`} className="aspect-square rounded-2xl overflow-hidden bg-black border border-brand/20 shadow-[0_0_15px_rgba(232,21,220,0.1)]">
                                                <img 
                                                    src={url} 
                                                    alt={`Después ${idx + 1}`} 
                                                    loading="lazy" 
                                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[110] flex items-center justify-center p-6">
                    <div className="bg-[#050505] border border-white/10 w-full max-w-2xl rounded-3xl p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-brand italic uppercase tracking-tighter">Registrar Sesión</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><CloseIcon /></button>
                        </div>
                        
                        <form onSubmit={handleAddSession} className="space-y-6">
                            <div>
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Fecha de la Sesión</label>
                                <input type="date" value={formData.session_date} onChange={e => setFormData({ ...formData, session_date: e.target.value })} required className="w-full bg-black p-5 rounded-2xl border border-white/10 font-bold" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Pigmentos Usados</label>
                                    <input type="text" value={formData.pigments_used} onChange={e => setFormData({ ...formData, pigments_used: e.target.value })} className="w-full bg-black p-5 rounded-2xl border border-white/10 font-bold" placeholder="Ej: Dynamic Black, Solid Ink Red" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Agujas Usadas</label>
                                    <input type="text" value={formData.needles_used} onChange={e => setFormData({ ...formData, needles_used: e.target.value })} className="w-full bg-black p-5 rounded-2xl border border-white/10 font-bold" placeholder="Ej: 3RL, 9RM" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Fotos Antes (URLs separadas por coma)</label>
                                <textarea value={formData.before_photos} onChange={e => setFormData({ ...formData, before_photos: e.target.value })} className="w-full bg-black p-5 rounded-2xl border border-white/10 font-bold text-xs" rows={2} placeholder="https://ejemplo.com/foto1.jpg, https://ejemplo.com/foto2.jpg"></textarea>
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Fotos Después (URLs separadas por coma)</label>
                                <textarea value={formData.after_photos} onChange={e => setFormData({ ...formData, after_photos: e.target.value })} className="w-full bg-black p-5 rounded-2xl border border-white/10 font-bold text-xs" rows={2} placeholder="https://ejemplo.com/foto3.jpg, https://ejemplo.com/foto4.jpg"></textarea>
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Notas Adicionales</label>
                                <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full bg-black p-5 rounded-2xl border border-white/10 font-bold" rows={3} placeholder="Observaciones sobre la piel, sangrado, etc."></textarea>
                            </div>

                            <div className="flex gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancelar</button>
                                <button type="submit" className="flex-1 py-5 bg-brand text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20">Guardar Sesión</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
