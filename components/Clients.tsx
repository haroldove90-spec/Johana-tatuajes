import React, { useState, useEffect, useMemo } from 'react';
import { Client } from '../types';
import { getAll, add, put, deleteItem } from '../utils/db';
import { PlusIcon, UserIcon, CloseIcon, PencilIcon, TrashIcon, SearchIcon } from './Icons';

export const Clients: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [formData, setFormData] = useState({ name: '', contact: '', notes: '' });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const allClients = await getAll<Client>('clients');
            setClients(allClients.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
            console.error("Error al cargar clientes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (client: Client | null = null) => {
        setEditingClient(client);
        if (client) {
            setFormData({ name: client.name, contact: client.contact, notes: client.notes });
        } else {
            setFormData({ name: '', contact: '', notes: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
        setFormData({ name: '', contact: '', notes: '' });
    };

    const handleSaveClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.contact.trim()) {
            alert("El nombre y el contacto son obligatorios.");
            return;
        }

        try {
            if (editingClient) {
                const updatedClient = { ...editingClient, ...formData };
                await put('clients', updatedClient);
            } else {
                const newClient: Omit<Client, 'id'> = {
                    ...formData,
                    createdAt: new Date().toISOString(),
                };
                await add('clients', newClient);
            }
            await loadClients();
            handleCloseModal();
        } catch (error) {
            console.error("Error al guardar cliente:", error);
            alert("Error al guardar cliente. El contacto puede que ya exista.");
        }
    };
    
    const handleDeleteClient = async (clientId: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer.')) {
            try {
                await deleteItem('clients', clientId);
                await loadClients();
            } catch (error) {
                console.error("Error al eliminar cliente:", error);
            }
        }
    };

    const filteredClients = useMemo(() => {
        return clients.filter(client =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [clients, searchTerm]);


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                 <h2 className="text-xl font-bold text-gray-800 dark:text-white">Gestión de Clientes ({filteredClients.length})</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow"
                >
                    <PlusIcon className="w-5 h-5" /><span className="ml-2 font-semibold">Añadir Cliente</span>
                </button>
            </div>
            
             <div className="relative">
                <input
                    type="text"
                    placeholder="Buscar cliente por nombre..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <SearchIcon className="w-5 h-5 text-gray-400" />
                </div>
            </div>

            {isLoading ? (
                <p>Cargando clientes...</p>
            ) : filteredClients.length > 0 ? (
                <div className="space-y-4">
                    {filteredClients.map(client => (
                        <div key={client.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg flex justify-between items-start">
                             <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                                    <UserIcon className="w-6 h-6 text-purple-600 dark:text-purple-300"/>
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{client.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{client.contact}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">{client.notes || 'Sin notas.'}</p>
                                </div>
                            </div>
                            <div className="flex flex-shrink-0 ml-2">
                                <button onClick={() => handleOpenModal(client)} className="p-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" aria-label="Editar Cliente">
                                    <PencilIcon />
                                </button>
                                <button onClick={() => handleDeleteClient(client.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors" aria-label="Eliminar Cliente">
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-8">
                    {searchTerm ? "No se encontraron clientes." : "Aún no tienes clientes. ¡Añade el primero!"}
                </p>
            )}

            {/* Client Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={handleCloseModal}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full relative p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                        <button onClick={handleCloseModal} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                            <CloseIcon />
                        </button>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {editingClient ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}
                        </h3>
                        <form onSubmit={handleSaveClient} className="space-y-4">
                            <div>
                                <label htmlFor="client-name" className="block text-sm font-medium mb-1">Nombre</label>
                                <input type="text" id="client-name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"/>
                            </div>
                             <div>
                                <label htmlFor="client-contact" className="block text-sm font-medium mb-1">Contacto (Email o Teléfono)</label>
                                <input type="text" id="client-contact" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} required className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"/>
                            </div>
                            <div>
                                <label htmlFor="client-notes" className="block text-sm font-medium mb-1">Notas</label>
                                <textarea id="client-notes" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"></textarea>
                            </div>
                            <div className="flex justify-end gap-4 pt-2">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md font-semibold">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-md font-semibold hover:bg-purple-700">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
