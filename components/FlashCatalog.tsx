
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { FlashSet } from '../types';
import { Spinner, PlusIcon, SaveIcon } from './Icons';

export const FlashCatalog: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
    const [items, setItems] = useState<FlashSet[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFlash = async () => {
        const { data } = await supabase.from('flash_sets').select('*').order('created_at', { ascending: false });
        if (data) setItems(data);
        setLoading(false);
    };

    useEffect(() => { fetchFlash(); }, []);

    if (loading) return <Spinner />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Diseños Disponibles (Flash Sets)</h2>
                {isAdmin && <button className="bg-purple-600 px-4 py-2 rounded-lg text-white font-bold flex items-center gap-2"><PlusIcon /> Subir Diseño</button>}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {items.length === 0 && <p className="col-span-full text-center text-gray-500 py-20">No hay diseños disponibles en este momento.</p>}
                {items.map(item => (
                    <div key={item.id} className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm transition-all hover:scale-[1.02]">
                        <img src={item.image_url} alt={item.title} className="w-full aspect-square object-cover" />
                        <div className="p-4">
                            <h4 className="font-bold truncate">{item.title}</h4>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-purple-600 font-black">${item.price}</span>
                                <span className="text-xs text-gray-400">{item.size_cm}cm aprox.</span>
                            </div>
                            {!isAdmin && (
                                <button className="w-full mt-4 py-2 bg-gray-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-purple-600 transition-colors">Apartar Diseño</button>
                            )}
                            {isAdmin && (
                                <div className="flex gap-2 mt-4">
                                    <button className="flex-1 py-2 border border-gray-200 dark:border-gray-800 rounded-xl text-xs">Editar</button>
                                    <button className={`w-8 h-8 rounded-full border flex items-center justify-center ${item.is_available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>✓</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
