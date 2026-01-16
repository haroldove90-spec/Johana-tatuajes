
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Consent, MedicalHistory } from '../types';
import { Spinner, CalendarIcon, InventoryIcon, ClientsIcon, CheckIcon, PencilIcon, MedicalIcon } from './Icons';

// Fix: Added missing StatCard component used in the dashboard
const StatCard = ({ title, value, icon, color = "text-white" }: any) => (
    <div className="bg-[#050505] p-6 rounded-[2rem] border border-white/5 shadow-2xl flex flex-col items-center justify-center text-center group hover:border-brand/30 transition-all">
        <div className="p-4 bg-white/5 rounded-2xl mb-4 text-brand group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">{title}</p>
        <p className={`text-2xl font-black italic tracking-tighter uppercase ${color}`}>{value}</p>
    </div>
);

export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ appointments: 0, revenue: 0, lowStock: 0, newClients: 0 });
    const [notifications, setNotifications] = useState<Consent[]>([]);
    const [alert, setAlert] = useState<{ type: 'firma' | 'historial', name: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        
        // Canal para Firmas (Updates en consents)
        const consentSub = supabase
            .channel('consents_signs')
            .on('postgres_changes', { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'consents',
                filter: 'status=eq.signed'
            }, (payload) => {
                const updated = payload.new as Consent;
                triggerSystemNotification('NUEVA FIRMA', `El cliente ${updated.client_name} ha firmado su consentimiento.`);
                triggerAlert('firma', updated.client_name);
                fetchDashboardData();
            })
            .subscribe();

        // Canal para Historiales Médicos (Nuevos envíos)
        const medicalSub = supabase
            .channel('medical_alerts')
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'medical_histories' 
            }, (payload) => {
                const newHistory = payload.new as MedicalHistory;
                triggerSystemNotification('NUEVO HISTORIAL', `Recibiste la ficha clínica de ${newHistory.client_name}.`);
                triggerAlert('historial', newHistory.client_name);
                fetchDashboardData();
            })
            .subscribe();

        return () => { 
            supabase.removeChannel(consentSub);
            supabase.removeChannel(medicalSub);
        };
    }, []);

    const triggerSystemNotification = (title: string, body: string) => {
        if ("Notification" in window && Notification.permission === "granted") {
            // Fix: 'vibrate' property removed from NotificationOptions as it's not a valid property for the Notification constructor.
            new Notification(title, {
                body,
                icon: 'https://tritex.com.mx/Bribiesca%20logo%2002.jpg',
            });
        }
    };

    const triggerAlert = (type: 'firma' | 'historial', name: string) => {
        setAlert({ type, name });
        try { new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3').play(); } catch(e) {}
        setTimeout(() => setAlert(null), 8000);
    };

    const fetchDashboardData = async () => {
        const { data: apps } = await supabase.from('appointments').select('*');
        const { data: stock } = await supabase.from('inventory').select('*').lt('quantity', 'min_stock');
        const { data: clients } = await supabase.from('clients').select('*');
        const { data: signs } = await supabase
            .from('consents')
            .select('*')
            .eq('status', 'signed')
            .order('signed_at', { ascending: false })
            .limit(5);

        if (signs) setNotifications(signs);
        setStats({
            appointments: apps?.length || 0,
            revenue: apps?.reduce((acc, curr) => acc + (curr.price_total || 0), 0) || 0,
            lowStock: stock?.length || 0,
            newClients: clients?.length || 0
        });
        setLoading(false);
    };

    if (loading) return <div className="flex justify-center p-20"><Spinner /></div>;

    return (
        <div className="space-y-8 animate-fade-in relative pb-20">
            {alert && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-brand text-white px-8 py-5 rounded-3xl shadow-[0_0_50px_rgba(232,21,220,0.6)] animate-bounce border-2 border-white/20 flex items-center gap-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        {alert.type === 'firma' ? <PencilIcon className="w-4 h-4" /> : <MedicalIcon className="w-4 h-4" />}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest">
                            {alert.type === 'firma' ? 'NOTIFICACIÓN DE FIRMA' : 'SISTEMA: FICHA MÉDICA'}
                        </p>
                        <p className="text-xs font-bold">{alert.name.toUpperCase()}</p>
                    </div>
                </div>
            )}

            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Studio Intelligence</h2>
                    <p className="text-[10px] text-brand font-black uppercase tracking-[0.4em]">Panel de Control en Vivo</p>
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="CITAS" value={stats.appointments} icon={<CalendarIcon />} />
                <StatCard title="INGRESOS" value={`$${stats.revenue}`} icon={<CheckIcon />} />
                <StatCard title="STOCK BAJO" value={stats.lowStock} icon={<InventoryIcon />} color={stats.lowStock > 0 ? 'text-brand' : 'text-white'} />
                <StatCard title="CLIENTES" value={stats.newClients} icon={<ClientsIcon />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-[#050505] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
                    <h3 className="font-black mb-8 flex items-center gap-4 text-white uppercase tracking-widest text-[11px]">
                        <div className="w-2.5 h-2.5 bg-brand rounded-full animate-pulse"></div> Actividad Reciente
                    </h3>
                    <div className="space-y-4">
                        {notifications.length === 0 ? (
                            <p className="text-center py-10 opacity-20 text-[10px] font-black uppercase">Sin firmas hoy</p>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className="p-5 bg-white/[0.03] rounded-2xl border border-white/5 flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                                            <PencilIcon className="w-4 h-4"/>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white uppercase">{n.client_name}</p>
                                            <p className="text-[9px] text-gray-500 font-bold">{new Date(n.signed_at!).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <img src={n.signature} className="h-6 invert opacity-50" alt="Sig" />
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className="bg-[#050505] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
                    <h3 className="font-black mb-8 flex items-center gap-4 text-white uppercase tracking-widest text-[11px]">
                        <InventoryIcon className="w-5 h-5 text-brand"/> Suministros Críticos
                    </h3>
                    {stats.lowStock > 0 ? (
                        <div className="p-8 text-center border-2 border-brand/20 rounded-[2rem] bg-brand/[0.03] animate-pulse">
                            <p className="text-brand font-black text-[11px] uppercase tracking-widest">Atención: Reponer Stock</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 opacity-20">
                            <CheckIcon className="w-10 h-10 mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Almacén lleno</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};
