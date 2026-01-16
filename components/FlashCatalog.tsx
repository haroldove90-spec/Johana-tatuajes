
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../utils/supabase';
import { FlashSet } from '../types';
import { Spinner, PlusIcon, CloseIcon, UploadIcon, CheckIcon } from './Icons';

export const FlashCatalog: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
    const [items, setItems] = useState<FlashSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [reservingId, setReservingId] = useState<number | null>(null);
    const [filterOnlyAvailable, setFilterOnlyAvailable] = useState(false);
    
    // Form state for new flash
    const [isSaving, setIsSaving] = useState(false);
    const [newFlash, setNewFlash] = useState({
        title: '',
        price: 0,
        size_cm: 10,
        image_url: '',
        is_repeatable: false
    });

    const fetchFlash = async () => {
        setLoading(true);
        const { data } = await supabase.from('flash_sets').select('*').order('created_at', { ascending: false });
        if (data) setItems(data);
        setLoading(false);
    };

    useEffect(() => { fetchFlash(); }, []);

    const handleReserve = async (item: FlashSet) => {
        setReservingId(item.id);
        // Simulación de proceso de contacto/apartado
        setTimeout(async () => {
            const { error } = await supabase
                .from('flash_sets')
                .update({ is_available: false })
                .eq('id', item.id);
            
            if (!error) {
                alert(`¡Diseño "${item.title}" apartado con éxito! Johana te contactará para agendar.`);
                fetchFlash();
            }
            setReservingId(null);
        }, 1500);
    };

    const handleAddFlash = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFlash.title || !newFlash.image_url) return;
        
        setIsSaving(true);
        const { error } = await supabase.from('flash_sets').insert([{
            ...newFlash,
            is_available: true,
            created_at: new Date().toISOString()
        }]);

        if (!error) {
            setShowAddModal(false);
            setNewFlash({ title: '', price: 0, size_cm: 10, image_url: '', is_repeatable: false });
            fetchFlash();
        } else {
            alert("Error al guardar: " + error.message);
        }
        setIsSaving(false);
    };

    const filteredItems = useMemo(() => {
        return items.filter(item => filterOnlyAvailable ? item.is_available : true);
    }, [items, filterOnlyAvailable]);

    if (loading) return <div className="flex justify-center p-20"><Spinner /></div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Flash Designs</h2>
                    <p className="text-[10px] text-brand font-black uppercase tracking-widest opacity-80">Diseños Listos para Tatuar</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => setFilterOnlyAvailable(!filterOnlyAvailable)}
                        className={`flex-1 md:flex-none px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${filterOnlyAvailable ? 'bg-brand text-white border-brand' : 'bg-white/5 text-gray-400 border-white/10 hover:border-brand/40'}`}
                    >
                        {filterOnlyAvailable ? 'Mostrando Disponibles' : 'Todos los Diseños'}
                    </button>
                    {isAdmin && (
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="bg-brand text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                        >
                            <PlusIcon className="w-4 h-4 inline mr-2" /> Nuevo Flash
                        </button>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.length === 0 && (
                    <div className="col-span-full text-center py-32 opacity-30">
                        <p className="uppercase font-black tracking-[0.3em] text-[10px]">No hay diseños coincidentes</p>
                    </div>
                )}
                {filteredItems.map(item => (
                    <div key={item.id} className="group relative bg-[#050505] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl transition-all hover:border-brand/40">
                        <div className="relative aspect-square bg-white/5 overflow-hidden">
                            <img 
                                src={item.image_url} 
                                alt={item.title} 
                                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!item.is_available ? 'grayscale opacity-50' : ''}`} 
                            />
                            
                            {/* SELLO DE VENDIDO / APARTADO (Icono distintivo mejorado) */}
                            {!item.is_available && (
                                <div className="absolute inset-0 flex items-center justify-center z-10 animate-fade-in pointer-events-none">
                                    <div className="relative flex flex-col items-center justify-center rotate-[-15deg]">
                                        <div className="absolute inset-0 bg-brand/30 blur-3xl rounded-full"></div>
                                        <div className="w-28 h-28 rounded-full border-[8px] border-brand flex flex-col items-center justify-center mb-2 bg-black/70 backdrop-blur-md shadow-[0_0_50px_rgba(232,21,220,0.6)] border-dashed">
                                            <CheckIcon />
                                            <span className="text-[10px] font-black text-brand tracking-[0.3em] mt-1">ADJUDICADO</span>
                                        </div>
                                        <div className="bg-brand text-white font-black text-[12px] px-8 py-2 rounded-lg shadow-2xl uppercase tracking-[0.4em] ring-4 ring-black/50">
                                            VENDIDO
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {item.is_repeatable && (
                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[8px] font-black uppercase text-brand tracking-widest z-20">
                                    Repetible
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6">
                            <h4 className="font-black text-white text-[12px] uppercase tracking-tight truncate mb-3">{item.title}</h4>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1">Inversión</p>
                                    <span className="text-brand font-black text-xl italic">${item.price}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1">Medida</p>
                                    <span className="text-[11px] text-white font-black uppercase tracking-widest">{item.size_cm}cm</span>
                                </div>
                            </div>
                            
                            {item.is_available && !isAdmin && (
                                <button 
                                    onClick={() => handleReserve(item)}
                                    disabled={reservingId !== null}
                                    className="w-full mt-5 py-4 bg-brand text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand/10 hover:bg-brand/90 transition-all flex justify-center items-center gap-2"
                                >
                                    {reservingId === item.id ? <Spinner /> : 'Apartar Ahora'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL PARA AÑADIR NUEVO FLASH */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
                    <div className="bg-[#050505] border border-white/10 w-full max-w-xl rounded-[3rem] p-10 space-y-8 shadow-2xl">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-black text-brand italic uppercase tracking-tighter">Publicar Nuevo Flash</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white transition-colors">
                                <CloseIcon />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddFlash} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Título del Diseño</label>
                                    <input 
                                        type="text" 
                                        value={newFlash.title} 
                                        onChange={e => setNewFlash({...newFlash, title: e.target.value})} 
                                        required 
                                        className="w-full bg-black p-5 rounded-2xl border border-white/10 font-bold" 
                                        placeholder="EJ. NEO TRADITIONAL TIGER"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Precio ($)</label>
                                    <input 
                                        type="number" 
                                        value={newFlash.price} 
                                        onChange={e => setNewFlash({...newFlash, price: Number(e.target.value)})} 
                                        required 
                                        min="0"
                                        className="w-full bg-black p-5 rounded-2xl border border-white/10 font-bold text-brand" 
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Tamaño Sugerido (cm)</label>
                                    <input 
                                        type="number" 
                                        value={newFlash.size_cm} 
                                        onChange={e => setNewFlash({...newFlash, size_cm: Number(e.target.value)})} 
                                        required 
                                        className="w-full bg-black p-5 rounded-2xl border border-white/10 font-bold" 
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">URL de la Imagen</label>
                                    <input 
                                        type="url" 
                                        value={newFlash.image_url} 
                                        onChange={e => setNewFlash({...newFlash, image_url: e.target.value})} 
                                        required 
                                        className="w-full bg-black p-5 rounded-2xl border border-white/10 font-bold text-blue-400" 
                                        placeholder="https://ejemplo.com/flash.jpg"
                                    />
                                </div>

                                <div className="col-span-2 flex items-center gap-4 p-5 bg-white/5 rounded-2xl">
                                    <input 
                                        type="checkbox" 
                                        id="repeatable" 
                                        checked={newFlash.is_repeatable} 
                                        onChange={e => setNewFlash({...newFlash, is_repeatable: e.target.checked})} 
                                        className="w-6 h-6 rounded-lg accent-brand"
                                    />
                                    <label htmlFor="repeatable" className="text-[10px] font-black uppercase text-gray-300 tracking-widest">¿Este diseño se puede repetir?</label>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-5 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest">Descartar</button>
                                <button type="submit" disabled={isSaving} className="flex-1 py-5 bg-brand text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand/20">
                                    {isSaving ? <Spinner /> : 'Subir al Catálogo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
