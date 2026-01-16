
import React, { useState, useEffect, useMemo } from 'react';
import { Client } from '../types';
import { getAll, add, put } from '../utils/db';
import { PlusIcon, UserIcon, CloseIcon, PencilIcon, SearchIcon } from './Icons';

export const Clients: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [formData, setFormData] = useState({ name: '', username: '', contact: '', whatsapp: '', notes: '', allergies: '' });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { loadClients(); }, []);

    const loadClients = async () => {
        try {
            const allClients = await getAll<Client>('clients');
            setClients(allClients.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };

    const handleSaveClient = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedClient) {
                await put('clients', { ...selectedClient, ...formData });
            } else {
                await add('clients', { ...formData, created_at: new Date().toISOString() });
            }
            await loadClients();
            setIsModalOpen(false);
        } catch (error) { alert("Error al guardar."); }
    };

    const filteredClients = useMemo(() => {
        return clients.filter(client => 
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            client.username?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [clients, searchTerm]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                 <div>
                    <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Expedientes Clínicos</h2>
                    <p className="text-[10px] text-brand font-black uppercase tracking-widest opacity-80">Gestión de Clientes ({filteredClients.length})</p>
                </div>
                <button
                    onClick={() => { setSelectedClient(null); setFormData({name:'', username:'', contact:'', whatsapp:'', notes:'', allergies:''}); setIsModalOpen(true); }}
                    className="w-full md:w-auto bg-brand text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand/20 active:scale-95 transition-all"
                >
                    <PlusIcon className="w-4 h-4 inline mr-2" /> Añadir Cliente
                </button>
            </div>
            
             <div className="relative group">
                <input
                    type="text"
                    placeholder="BUSCAR POR NOMBRE O USUARIO..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-6 pl-14 bg-black border border-white/5 rounded-3xl text-white font-bold placeholder-gray-700 focus:border-brand transition-all outline-none"
                />
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <SearchIcon className="w-5 h-5 text-gray-500 group-focus-within:text-brand transition-colors" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredClients.map(client => (
                    <div key={client.id} className="p-6 bg-[#050505] border border-white/5 rounded-3xl flex items-center justify-between group hover:border-brand/40 transition-all cursor-pointer shadow-2xl" onClick={() => { setSelectedClient(client); setFormData({
                        name: client.name,
                        username: client.username || '',
                        contact: client.contact,
                        whatsapp: client.whatsapp || '',
                        notes: client.notes,
                        allergies: client.allergies || ''
                    }); setIsModalOpen(true); }}>
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-brand border border-white/5 group-hover:bg-brand/10 transition-colors">
                                <UserIcon className="w-8 h-8"/>
                            </div>
                            <div>
                                <h3 className="font-black text-white text-base tracking-tight uppercase">{client.name}</h3>
                                <div className="flex flex-col gap-1 mt-1">
                                    <p className="text-[9px] text-brand font-black uppercase tracking-widest">@{client.username || 'sin_usuario'}</p>
                                    <p className="text-[10px] text-gray-500 font-bold">{client.contact}</p>
                                </div>
                                {client.whatsapp && (
                                    <a href={`https://wa.me/${client.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-[8px] font-black text-green-500 border border-green-500/20 px-2 py-1 rounded-md bg-green-500/5 hover:bg-green-500/20 transition-colors">
                                        WHATSAPP ACTIVO
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="hidden group-hover:flex items-center gap-3">
                            <button className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-brand transition-colors"><PencilIcon /></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
                    <div className="bg-[#050505] border border-white/10 w-full max-w-2xl rounded-3xl p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-brand italic uppercase tracking-tighter">{selectedClient ? 'Editar Expediente' : 'Nuevo Cliente'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><CloseIcon /></button>
                        </div>
                        
                        <form onSubmit={handleSaveClient} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Nombre Completo</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="w-full bg-black p-5 rounded-2xl border border-white/10 font-bold" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Usuario (@)</label>
                                    <input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full bg-black p-5 rounded-2xl border border-white/10 font-bold text-brand" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Correo Principal</label>
                                    <input type="email" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} required className="w-full bg-black p-5 rounded-2xl border border-white/10 font-bold" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">WhatsApp Directo</label>
                                    <input type="tel" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} className="w-full bg-black p-5 rounded-2xl border border-white/10 font-bold text-green-500" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Alergias Críticas</label>
                                <textarea value={formData.allergies} onChange={e => setFormData({ ...formData, allergies: e.target.value })} className="w-full bg-black p-5 rounded-2xl border border-red-500/20 text-red-500 font-bold" rows={2} placeholder="EJ. NÍQUEL, LÁTEX..."></textarea>
                            </div>

                            <div className="flex gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancelar</button>
                                <button type="submit" className="flex-1 py-5 bg-brand text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20">Guardar Expediente</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
