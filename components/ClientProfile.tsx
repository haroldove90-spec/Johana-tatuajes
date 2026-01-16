
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Client } from '../types';
import { Spinner, UserIcon, CheckIcon, FlashIcon, PencilIcon, SaveIcon, CloseIcon, EyeIcon, EyeOffIcon } from './Icons';

export const ClientProfile: React.FC<{ username: string }> = ({ username }) => {
    const [clientData, setClientData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [updateStatus, setUpdateStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    // Edit Form State
    const [editForm, setEditForm] = useState({
        name: '',
        whatsapp: '',
        password: ''
    });

    useEffect(() => {
        fetchProfile();
    }, [username]);

    const fetchProfile = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('username', username)
            .single();
        
        if (data) {
            setClientData(data);
            setEditForm({
                name: data.name,
                whatsapp: data.whatsapp || '',
                password: data.password || ''
            });
        }
        setLoading(false);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateStatus('saving');
        
        const { error } = await supabase
            .from('clients')
            .update({
                name: editForm.name,
                whatsapp: editForm.whatsapp,
                password: editForm.password
            })
            .eq('username', username);

        if (!error) {
            setUpdateStatus('success');
            setTimeout(() => {
                setIsEditing(false);
                setUpdateStatus('idle');
                fetchProfile();
            }, 1500);
        } else {
            setUpdateStatus('error');
            setTimeout(() => setUpdateStatus('idle'), 3000);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Spinner /></div>;

    return (
        <div className="space-y-8 animate-fade-in max-w-md mx-auto">
            <header className="text-center relative">
                {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="absolute right-0 top-0 p-3 bg-white/5 border border-white/10 rounded-2xl text-brand hover:scale-110 transition-all shadow-xl"
                    >
                        <PencilIcon />
                    </button>
                )}
                
                <div className="w-24 h-24 bg-brand/10 border-2 border-brand/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(232,21,220,0.2)]">
                    <UserIcon className="w-12 h-12 text-brand" />
                </div>
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                    {clientData?.name || username}
                </h2>
                <p className="text-[10px] text-brand font-black uppercase tracking-widest mt-1">
                    {clientData?.role === 'admin' ? 'Administrador del Studio' : 'Miembro Exclusivo Bribiesca'}
                </p>
            </header>

            {isEditing ? (
                <form onSubmit={handleUpdate} className="bg-[#050505] p-8 rounded-[2.5rem] border border-brand/30 shadow-2xl space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-black text-brand uppercase tracking-widest italic">EDITAR PERFIL</h3>
                        <button type="button" onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-white">
                            <CloseIcon />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Nombre Completo</label>
                            <input 
                                type="text" 
                                value={editForm.name} 
                                onChange={e => setEditForm({...editForm, name: e.target.value})}
                                className="w-full bg-black p-4 rounded-2xl border border-white/10 font-bold text-white text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">WhatsApp</label>
                            <input 
                                type="tel" 
                                value={editForm.whatsapp} 
                                onChange={e => setEditForm({...editForm, whatsapp: e.target.value})}
                                className="w-full bg-black p-4 rounded-2xl border border-white/10 font-bold text-green-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Nueva Contraseña</label>
                            <div className="relative">
                                <input 
                                    type={showPass ? "text" : "password"} 
                                    value={editForm.password} 
                                    onChange={e => setEditForm({...editForm, password: e.target.value})}
                                    className="w-full bg-black p-4 rounded-2xl border border-white/10 font-bold text-brand text-sm pr-12"
                                    required
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
                                >
                                    {showPass ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={updateStatus === 'saving'}
                        className="w-full py-5 bg-brand text-white font-black rounded-2xl uppercase tracking-widest shadow-xl flex justify-center items-center gap-3 active:scale-95 transition-all text-[11px]"
                    >
                        {updateStatus === 'saving' ? <Spinner /> : (
                            updateStatus === 'success' ? <><CheckIcon /> ACTUALIZADO</> : <><SaveIcon className="w-4 h-4" /> GUARDAR CAMBIOS</>
                        )}
                    </button>
                </form>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#050505] p-6 rounded-3xl border border-white/5 text-center shadow-2xl">
                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Puntos acumulados</p>
                            <div className="flex items-center justify-center gap-2">
                                <FlashIcon className="w-4 h-4 text-brand" />
                                <span className="text-3xl font-black text-white italic">{clientData?.loyalty_points || 0}</span>
                            </div>
                        </div>
                        <div className="bg-[#050505] p-6 rounded-3xl border border-white/5 text-center shadow-2xl">
                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Nivel</p>
                            <span className="text-sm font-black text-brand uppercase tracking-tighter italic">
                                {clientData?.role === 'admin' ? 'SYSTEM OWNER' : 'Ink Master Jr.'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-[#050505] p-6 rounded-3xl border border-white/5 space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Correo</span>
                            <span className="text-xs font-bold text-white">{clientData?.contact}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">WhatsApp</span>
                            <span className="text-xs font-bold text-green-500">{clientData?.whatsapp || 'No registrado'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Miembro desde</span>
                            <span className="text-xs font-bold text-gray-400">
                                {clientData?.created_at ? new Date(clientData.created_at).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                    </div>

                    <section className="space-y-4">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1 h-4 bg-brand rounded-full"></div> Mi Historial de Tatuajes
                        </h3>
                        {clientData?.ink_history && clientData.ink_history.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {clientData.ink_history.map((url: string, i: number) => (
                                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/5 bg-white/5 group relative">
                                        <img src={url} alt="Tattoo" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center border border-dashed border-white/10 rounded-[2.5rem] opacity-30">
                                <p className="text-[9px] font-black uppercase tracking-widest">Aún no tienes tatuajes registrados</p>
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};
