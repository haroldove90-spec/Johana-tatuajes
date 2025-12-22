
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Spinner, CalendarIcon, InventoryIcon, UserIcon } from './Icons';

export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ appointments: 0, revenue: 0, lowStock: 0, newClients: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const { data: apps } = await supabase.from('appointments').select('*');
            const { data: stock } = await supabase.from('inventory').select('*').lt('quantity', 'min_stock');
            const { data: clients } = await supabase.from('clients').select('*');
            
            setStats({
                appointments: apps?.filter(a => a.status === 'scheduled').length || 0,
                revenue: apps?.filter(a => a.status === 'completed').length * 150 || 0, // Mock revenue calculation
                lowStock: stock?.length || 0,
                newClients: clients?.length || 0
            });
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) return <div className="flex justify-center p-20"><Spinner /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Panel de Control</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Citas Hoy" value={stats.appointments} icon={<CalendarIcon />} color="blue" />
                <StatCard title="Ingresos Sem." value={`$${stats.revenue}`} icon={<InventoryIcon />} color="green" />
                <StatCard title="Stock Bajo" value={stats.lowStock} icon={<InventoryIcon />} color="red" />
                <StatCard title="Clientes" value={stats.newClients} icon={<UserIcon />} color="purple" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><CalendarIcon className="w-5 h-5"/> Próximas Sesiones</h3>
                    <p className="text-gray-500 text-sm">No hay citas críticas para las próximas 2 horas.</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><InventoryIcon className="w-5 h-5"/> Alertas de Stock</h3>
                    {stats.lowStock > 0 ? (
                        <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg text-sm">
                            Tienes {stats.lowStock} productos por debajo del mínimo.
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">Inventario al día.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }: any) => (
    <div className={`p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm`}>
        <div className={`w-10 h-10 rounded-xl bg-${color}-100 dark:bg-${color}-900/20 flex items-center justify-center mb-3 text-${color}-600`}>
            {icon}
        </div>
        <p className="text-xs text-gray-500 uppercase tracking-tighter">{title}</p>
        <p className="text-2xl font-black mt-1">{value}</p>
    </div>
);
