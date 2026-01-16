
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { MedicalHistory, Client } from '../types';
import { Spinner, PlusIcon, SearchIcon, CloseIcon, SaveIcon, DownloadIcon, PrintIcon } from './Icons';
import { jsPDF } from 'jspdf';

const CONDITIONS_LIST = [
    "Diabetes", "Hipertensión", "Epilepsia", "COVID-19", "Hepatitis A, B o C", "Influenza", "VIH/SIDA"
];

export const MedicalHistoryManager: React.FC = () => {
    const [histories, setHistories] = useState<MedicalHistory[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<MedicalHistory | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<MedicalHistory>({
        client_name: '',
        birth_date: '',
        age: '',
        sex: 'M',
        address: '',
        phone: '',
        occupation: '',
        residence: '',
        schooling: '',
        email: '',
        conditions: [],
        allergies_detail: '',
        appointment_motive: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data: hist } = await supabase.from('medical_histories').select('*').order('created_at', { ascending: false });
        const { data: clie } = await supabase.from('clients').select('*').order('name');
        if (hist) setHistories(hist);
        if (clie) setClients(clie);
        setLoading(false);
    };

    const handleConditionToggle = (cond: string) => {
        setFormData(prev => ({
            ...prev,
            conditions: prev.conditions.includes(cond) 
                ? prev.conditions.filter(c => c !== cond) 
                : [...prev.conditions, cond]
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const { error } = await supabase.from('medical_histories').insert([formData]);
        if (!error) {
            alert("Historial Clínico Guardado.");
            setIsModalOpen(false);
            fetchData();
        } else {
            alert("Error: " + error.message);
        }
        setIsSaving(false);
    };

    const exportToPDF = (item: MedicalHistory) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("BRIBIESCA STUDIO - FICHA CLÍNICA", 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Expediente N: ${item.id} | Fecha: ${new Date(item.created_at!).toLocaleDateString()}`, 105, 28, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);
        doc.setFont("helvetica", "bold");
        doc.text("DATOS PERSONALES", 20, 45);
        doc.setFont("helvetica", "normal");
        doc.text(`Nombre: ${item.client_name}`, 20, 52);
        doc.text(`F. Nacimiento: ${item.birth_date} | Edad: ${item.age} | Sexo: ${item.sex}`, 20, 59);
        doc.text(`Dirección: ${item.address}`, 20, 66);
        doc.text(`Teléfono: ${item.phone} | Ocupación: ${item.occupation}`, 20, 73);
        doc.text(`Residencia: ${item.residence} | Escolaridad: ${item.schooling}`, 20, 80);
        doc.text(`Email: ${item.email}`, 20, 87);
        doc.setFont("helvetica", "bold");
        doc.text("INFORMACIÓN DE SALUD", 20, 100);
        doc.setFont("helvetica", "normal");
        doc.text(`Condiciones registradas: ${item.conditions.join(', ') || 'Ninguna'}`, 20, 107);
        doc.text(`Alergias: ${item.allergies_detail || 'No declaradas'}`, 20, 114);
        doc.setFont("helvetica", "bold");
        doc.text("MOTIVO DE LA CITA", 20, 127);
        doc.setFont("helvetica", "normal");
        doc.setLineWidth(0.1);
        doc.rect(20, 132, 170, 40);
        doc.text(item.appointment_motive || 'Sin descripción', 25, 138, { maxWidth: 160 });
        doc.save(`Historial_${item.client_name.replace(' ', '_')}.pdf`);
    };

    const handlePrint = (item: MedicalHistory) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head><title>Imprimir Historial</title><style>body{font-family:sans-serif;padding:40px;} h1{text-align:center;border-bottom:2px solid #000;padding-bottom:10px;} .field{margin-bottom:10px;} label{font-weight:bold;}</style></head>
                    <body>
                        <h1>BRIBIESCA STUDIO - FICHA CLÍNICA</h1>
                        <div class="field"><label>Nombre:</label> ${item.client_name}</div>
                        <div class="field"><label>Edad/Sexo:</label> ${item.age} / ${item.sex}</div>
                        <div class="field"><label>Salud:</label> ${item.conditions.join(', ')}</div>
                        <div class="field"><label>Alergias:</label> ${item.allergies_detail}</div>
                        <div class="field"><label>Motivo:</label><p>${item.appointment_motive}</p></div>
                        <br><br><br>
                        <div style="display:flex;justify-content:space-around">
                            <p>_____________________<br>Firma Cliente</p>
                            <p>_____________________<br>Firma Artista</p>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const filtered = histories.filter(h => h.client_name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Historial Clínico</h2>
                    <p className="text-[10px] text-brand font-black uppercase tracking-widest mt-1">Archivo de Salud del Studio</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto bg-brand text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                    <PlusIcon className="w-4 h-4" /> Nueva Ficha
                </button>
            </header>

            <div className="relative">
                <input 
                    type="text" 
                    placeholder="BUSCAR EXPEDIENTE POR NOMBRE..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-[#050505] p-5 pl-14 rounded-3xl border border-white/5 font-bold text-white focus:border-brand outline-none shadow-2xl"
                />
                <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? <Spinner /> : filtered.map(item => (
                    <div key={item.id} className="bg-[#050505] p-6 rounded-[2rem] border border-white/5 group hover:border-brand/40 transition-all shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-black text-white text-base uppercase italic">{item.client_name}</h4>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Registrado el {new Date(item.created_at!).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setViewMode(item)} className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors" title="Ver Detalles">
                                    <SearchIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => exportToPDF(item)} className="p-3 bg-white/5 rounded-xl text-brand hover:scale-110 transition-transform" title="Descargar PDF">
                                    <DownloadIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {item.conditions.slice(0, 3).map(c => (
                                <span key={c} className="text-[7px] font-black uppercase bg-brand/10 text-brand px-2 py-1 rounded-md border border-brand/20">{c}</span>
                            ))}
                            {item.conditions.length > 3 && <span className="text-[7px] text-gray-600 font-black">+{item.conditions.length - 3} MÁS</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL FULL SCREEN CORREGIDO: NUEVA FICHA */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black z-[999] flex flex-col animate-fade-in overflow-hidden">
                    {/* Contenedor Principal del Modal */}
                    <div className="flex-1 flex flex-col bg-[#050505] w-full max-w-5xl mx-auto h-[100dvh] overflow-hidden sm:h-[95vh] sm:rounded-[3rem] sm:my-auto border border-white/10 shadow-2xl">
                        
                        {/* 1. Header Fijo (80px aprox) */}
                        <div className="flex-shrink-0 h-20 sm:h-24 p-6 sm:px-10 border-b border-white/5 flex justify-between items-center bg-black/80 backdrop-blur-xl z-20">
                            <div>
                                <h3 className="text-lg sm:text-2xl font-black text-brand italic uppercase tracking-tighter leading-none">Nueva Ficha Clínica</h3>
                                <p className="text-[9px] text-gray-500 uppercase font-black tracking-[0.4em] mt-2 italic">Registro de Salud Pro</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/5 rounded-full text-gray-400 hover:text-white transition-all active:scale-90">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* 2. Cuerpo con Scroll (Altura calculada dinámicamente) */}
                        <div className="flex-grow overflow-y-auto custom-scrollbar p-6 sm:p-12 lg:p-16 min-h-0 bg-[#050505]">
                            <form id="medical-form-final" onSubmit={handleSave} className="space-y-12 pb-10">
                                <section className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand font-black text-lg">1</div>
                                        <h5 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Identificación del Paciente</h5>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest block mb-2">Nombre Completo</label>
                                            <input type="text" list="client-list" value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} required className="w-full bg-[#0a0a0a] p-5 rounded-2xl border border-white/10 font-bold text-white focus:border-brand" />
                                            <datalist id="client-list">
                                                {clients.map(c => <option key={c.id} value={c.name} />)}
                                            </datalist>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest block mb-2">F. Nacimiento</label>
                                            <input type="date" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} className="w-full bg-[#0a0a0a] p-5 rounded-2xl border border-white/10 font-bold text-white" />
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:col-span-3">
                                            <div>
                                                <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest block mb-2">Edad</label>
                                                <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full bg-[#0a0a0a] p-5 rounded-2xl border border-white/10 font-bold text-white" />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest block mb-2">Sexo</label>
                                                <select value={formData.sex} onChange={e => setFormData({...formData, sex: e.target.value})} className="w-full bg-[#0a0a0a] p-5 rounded-2xl border border-white/10 font-bold text-white">
                                                    <option value="M">Masculino</option>
                                                    <option value="F">Femenino</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest block mb-2">Teléfono</label>
                                                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#0a0a0a] p-5 rounded-2xl border border-white/10 font-bold text-white" />
                                            </div>
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest block mb-2">Dirección</label>
                                            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-[#0a0a0a] p-5 rounded-2xl border border-white/10 font-bold text-white" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-3">
                                            <input type="text" placeholder="OCUPACIÓN" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} className="w-full bg-[#0a0a0a] p-5 rounded-2xl border border-white/10 font-bold uppercase text-white" />
                                            <input type="text" placeholder="RESIDENCIA" value={formData.residence} onChange={e => setFormData({...formData, residence: e.target.value})} className="w-full bg-[#0a0a0a] p-5 rounded-2xl border border-white/10 font-bold uppercase text-white" />
                                            <input type="text" placeholder="ESCOLARIDAD" value={formData.schooling} onChange={e => setFormData({...formData, schooling: e.target.value})} className="w-full bg-[#0a0a0a] p-5 rounded-2xl border border-white/10 font-bold uppercase text-white" />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest block mb-2">Email</label>
                                            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#0a0a0a] p-5 rounded-2xl border border-white/10 font-bold text-brand" />
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand font-black text-lg">2</div>
                                        <h5 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Historial Clínico</h5>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {CONDITIONS_LIST.map(cond => (
                                            <button 
                                                key={cond} 
                                                type="button"
                                                onClick={() => handleConditionToggle(cond)}
                                                className={`p-4 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center text-center h-16 ${formData.conditions.includes(cond) ? 'bg-brand border-brand text-white shadow-lg scale-105' : 'bg-white/5 border-white/10 text-gray-400 hover:border-brand/40'}`}
                                            >
                                                {cond}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-8">
                                        <label className="text-[10px] font-black uppercase text-red-500/60 tracking-widest block mb-3 italic">Alergias Conocidas</label>
                                        <input type="text" value={formData.allergies_detail} onChange={e => setFormData({...formData, allergies_detail: e.target.value})} className="w-full bg-[#0a0a0a] p-5 rounded-2xl border border-red-500/20 text-red-500 font-bold placeholder:text-red-900/40" placeholder="Especifique alergias..." />
                                    </div>
                                </section>

                                <section className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand font-black text-lg">3</div>
                                        <h5 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Motivo de la Cita</h5>
                                    </div>
                                    <textarea 
                                        value={formData.appointment_motive} 
                                        onChange={e => setFormData({...formData, appointment_motive: e.target.value})}
                                        className="w-full bg-[#0a0a0a] p-6 rounded-[2rem] border border-white/10 font-bold min-h-[150px] text-base italic leading-relaxed text-white focus:border-brand outline-none"
                                        placeholder="Diseño, tamaño y zona del cuerpo..."
                                    ></textarea>
                                </section>
                            </form>
                        </div>

                        {/* 3. Footer Fijo (100px aprox) */}
                        <div className="flex-shrink-0 p-6 sm:px-10 border-t border-white/5 bg-black/90 backdrop-blur-xl flex flex-col sm:flex-row gap-4 z-20">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 sm:py-5 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-white/10 transition-colors">Cancelar</button>
                            <button type="submit" form="medical-form-final" disabled={isSaving} className="flex-1 py-4 sm:py-5 bg-brand text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand/20 active:scale-95 transition-all">
                                {isSaving ? <Spinner /> : <><SaveIcon className="w-5 h-5 mr-2 inline"/> Archivar Expediente</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL VIEW: VER FICHA - REPARADO PARA ALTURA MÁXIMA */}
            {viewMode && (
                <div className="fixed inset-0 bg-black/98 z-[999] flex flex-col animate-fade-in overflow-hidden">
                    <div className="flex-1 flex flex-col bg-[#050505] w-full max-w-4xl mx-auto h-[100dvh] sm:h-[90vh] sm:rounded-[4rem] sm:my-auto overflow-hidden border border-brand/20 shadow-2xl">
                        
                        <div className="flex-shrink-0 p-6 sm:p-10 border-b border-white/5 flex justify-between items-center bg-black/60 backdrop-blur-xl">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-tighter">Expediente Médico</h3>
                                <p className="text-[10px] text-brand font-black uppercase tracking-widest mt-2 italic">Modo Lectura • Bribiesca Studio</p>
                            </div>
                            <button onClick={() => setViewMode(null)} className="p-3 text-gray-500 hover:text-white transition-colors">
                                <CloseIcon className="w-8 h-8" />
                            </button>
                        </div>
                        
                        <div className="flex-grow overflow-y-auto p-6 sm:p-14 custom-scrollbar space-y-12 min-h-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm">
                                <div className="space-y-8">
                                    <div>
                                        <p className="text-brand font-black text-[10px] uppercase tracking-widest mb-3 italic">Titular</p>
                                        <p className="text-2xl font-black text-white uppercase tracking-tighter">{viewMode.client_name}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5 shadow-inner">
                                        <div>
                                            <p className="text-gray-600 font-black text-[9px] uppercase tracking-widest mb-1">Nacimiento</p>
                                            <p className="text-white font-bold">{viewMode.birth_date}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 font-black text-[9px] uppercase tracking-widest mb-1">Edad/Sexo</p>
                                            <p className="text-white font-bold">{viewMode.age} / {viewMode.sex}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 font-black text-[9px] uppercase tracking-widest mb-2 italic">Contacto</p>
                                        <p className="text-white font-bold text-base">{viewMode.phone}</p>
                                        <p className="text-brand/80 font-bold mt-1 italic">{viewMode.email}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-10">
                                    <div>
                                        <p className="text-brand font-black text-[10px] uppercase tracking-widest mb-4 italic">Cuadro Clínico</p>
                                        <div className="flex flex-wrap gap-2">
                                            {viewMode.conditions.length > 0 ? viewMode.conditions.map(c => (
                                                <span key={c} className="bg-white/5 px-4 py-2 rounded-xl text-[9px] font-black uppercase text-gray-400 border border-white/5">{c}</span>
                                            )) : <span className="text-gray-700 italic">Sin registros</span>}
                                        </div>
                                    </div>
                                    <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-[2rem] shadow-inner">
                                        <p className="text-red-500 font-black text-[9px] uppercase tracking-widest mb-2 italic flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> Alergias
                                        </p>
                                        <p className="text-red-400 font-bold uppercase leading-tight text-sm">{viewMode.allergies_detail || 'NINGUNA'}</p>
                                    </div>
                                </div>

                                <div className="md:col-span-2 p-10 bg-black rounded-[3rem] border border-white/10 shadow-inner">
                                    <p className="text-brand font-black text-[10px] uppercase tracking-widest mb-4 italic">Memorándum</p>
                                    <p className="text-white italic leading-relaxed text-lg font-medium whitespace-pre-line">{viewMode.appointment_motive}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-shrink-0 p-6 sm:p-10 border-t border-white/5 bg-black/90 backdrop-blur-xl flex flex-col sm:flex-row gap-4">
                            <button onClick={() => handlePrint(viewMode)} className="flex-1 py-5 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-4 border border-white/5 hover:bg-white/10 transition-colors">
                                <PrintIcon className="w-6 h-6"/> Imprimir
                            </button>
                            <button onClick={() => exportToPDF(viewMode)} className="flex-1 py-5 bg-brand text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all">
                                <DownloadIcon className="w-6 h-6"/> PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
