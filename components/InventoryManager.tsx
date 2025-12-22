
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { InventoryItem } from '../types';
import { Spinner, SaveIcon, PlusIcon, TrashIcon } from './Icons';

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
        await supabase.from('inventory').update({ quantity: val }).eq('id', id);
        fetchInventory();
    };

    if (loading) return <Spinner />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestión de Insumos</h2>
                <button className="flex items-center gap-2 bg-purple-600 px-4 py-2 rounded-lg text-white font-bold"><PlusIcon /> Nuevo</button>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500">
                        <tr>
                            <th className="px-6 py-4">Item</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4">Min.</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {items.map(item => (
                            <tr key={item.id} className={item.quantity < item.min_stock ? 'bg-red-50/50 dark:bg-red-900/5' : ''}>
                                <td className="px-6 py-4 font-medium">{item.item_name}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => updateStock(item.id, item.quantity - 1)} className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800">-</button>
                                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                                        <button onClick={() => updateStock(item.id, item.quantity + 1)} className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800">+</button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{item.min_stock}</td>
                                <td className="px-6 py-4 text-right"><button className="text-red-500"><TrashIcon /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
