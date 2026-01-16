
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { InventoryItem } from '../types';
import { Spinner, PlusIcon, TrashIcon } from './Icons';

export const InventoryManager: React.FC = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInventory = async () => {
        const { data } = await supabase.from('inventory').select('*').order('category');
        if (data) setItems(data);
        setLoading(false);
    };

    useEffect(() => { fetchInventory(); }, []);

    const updateStock = async (id: number, val: number) => {
        if (val < 0) return;
        await supabase.from('inventory').update({ quantity: val }).eq('id', id);
        fetchInventory();
    };

    if (loading) return (
        <div className="flex justify-center items-center h-40">
            <Spinner />
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand">Gestión de Insumos</h2>
                <button className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-105 transition-all">
                    <PlusIcon className="w-4 h-4" /> Nuevo
                </button>
            </div>
            
            <div className="bg-black border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/[0.03] text-[9px] uppercase font-black text-gray-500 tracking-widest border-b border-white/5">
                            <tr>
                                <th className="px-6 py-5">Material</th>
                                <th className="px-6 py-5 text-center">Stock</th>
                                <th className="px-6 py-5 text-center">Mín.</th>
                                <th className="px-6 py-5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {items.map(item => (
                                <tr key={item.id} className={`transition-colors hover:bg-white/[0.02] ${item.quantity < item.min_stock ? 'bg-brand/[0.04]' : 'bg-black'}`}>
                                    <td className="px-6 py-6">
                                        <p className="font-bold text-white text-sm tracking-tight">{item.item_name}</p>
                                        <p className="text-[9px] text-brand/60 uppercase tracking-widest mt-1 font-black">{item.category}</p>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center justify-center gap-3">
                                            <button 
                                                onClick={() => updateStock(item.id, item.quantity - 1)} 
                                                className="w-9 h-9 rounded-xl border border-white/10 bg-black flex items-center justify-center text-gray-400 hover:border-brand hover:text-brand transition-all font-black text-xl"
                                            >-</button>
                                            <span className={`w-12 text-center font-black text-xl tracking-tighter ${item.quantity < item.min_stock ? 'text-brand animate-pulse' : 'text-white'}`}>
                                                {item.quantity}
                                            </span>
                                            <button 
                                                onClick={() => updateStock(item.id, item.quantity + 1)} 
                                                className="w-9 h-9 rounded-xl border border-white/10 bg-black flex items-center justify-center text-gray-400 hover:border-brand hover:text-brand transition-all font-black text-xl"
                                            >+</button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <span className="text-[11px] font-black text-gray-600 bg-white/5 px-3 py-1 rounded-full border border-white/5">{item.min_stock}</span>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <button className="text-gray-700 hover:text-brand transition-all p-2 hover:scale-125">
                                            <TrashIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {items.length === 0 && (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-black">
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Sin materiales registrados</p>
                </div>
            )}
        </div>
    );
};
