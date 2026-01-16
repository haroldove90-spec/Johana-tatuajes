
import React, { useState, useMemo, useEffect } from 'react';
import { PencilIcon, TrashIcon, CheckIcon, CloseIcon } from './Icons';
import { getAll, add, put, deleteItem, findOrAddClient } from '../utils/db';
import { Appointment } from '../types';

export const Calendar: React.FC<{ adminMode?: boolean }> = ({ adminMode = false }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', contact: '', idea: '', time: '14:00' });
    const [reminderMethod, setReminderMethod] = useState<'email' | 'sms'>('email');
    const [confirmation, setConfirmation] = useState('');
    const [contactError, setContactError] = useState('');
    const [activeAppointmentView, setActiveAppointmentView] = useState<'programadas' | 'pasadas'>('programadas');
    const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);
    const [pendingConfirmation, setPendingConfirmation] = useState<Appointment | null>(null);
    
    // State for custom delete confirmation
    const [appointmentIdToDelete, setAppointmentIdToDelete] = useState<number | null>(null);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            const loadedAppointments = await getAll<Appointment>('appointments');
            setAppointments(loadedAppointments);
        } catch (error: any) {
            console.error("Error al cargar citas:", error.message);
        }
    };
    
    useEffect(() => {
        const checkInterval = setInterval(() => {
            if (pendingConfirmation) return;
            const now = new Date();
            const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
            const appointmentToConfirm = appointments.find(app => {
                if (app.status !== 'scheduled') return false;
                const appointmentDateTime = new Date(`${app.date}T${app.time}`);
                return appointmentDateTime < fourHoursAgo;
            });
            if (appointmentToConfirm) {
                setPendingConfirmation(appointmentToConfirm);
            }
        }, 60000); 
        return () => clearInterval(checkInterval);
    }, [appointments, pendingConfirmation]);

    const daysOfWeek = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDay = firstDayOfMonth.getDay();

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
        setSelectedDate(null);
        setShowForm(false);
        setConfirmation('');
    };

    const handleDateClick = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        if (!adminMode && date < new Date(new Date().toDateString())) return;
        setSelectedDate(date);
        setShowForm(true);
        setEditingAppointmentId(null);
        setConfirmation('');
        setFormData({ name: '', contact: '', idea: '', time: '14:00' });
        setReminderMethod('email');
        setContactError('');
    };

    const validateContact = (method: 'email' | 'sms', value: string): boolean => {
        if (method === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        } else {
            const phoneRegex = /^\d[\d\s-]{8,}\d$/;
            return phoneRegex.test(value);
        }
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'contact') {
            if (!validateContact(reminderMethod, value)) {
                 setContactError(reminderMethod === 'email' ? 'Introduce un correo válido.' : 'Introduce un teléfono válido.');
            } else {
                setContactError('');
            }
        }
    };
    
    const handleReminderMethodChange = (method: 'email' | 'sms') => {
        setReminderMethod(method);
        if (formData.contact) {
            if (!validateContact(method, formData.contact)) {
                 setContactError(method === 'email' ? 'Introduce un correo válido.' : 'Introduce un teléfono válido.');
            } else {
                setContactError('');
            }
        }
    }

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateContact(reminderMethod, formData.contact)) {
            setContactError(reminderMethod === 'email' ? 'El formato del correo no es válido.' : 'El formato del teléfono no es válido.');
            return;
        }
        try {
            await findOrAddClient(formData.name, formData.contact);
            if (editingAppointmentId) {
                const appointmentToUpdate = appointments.find(app => app.id === editingAppointmentId);
                if (appointmentToUpdate) {
                    const updatedAppointment = {
                        ...appointmentToUpdate,
                        ...formData,
                        reminderMethod,
                        date: selectedDate?.toISOString().split('T')[0] || appointmentToUpdate.date
                    };
                    await put('appointments', updatedAppointment);
                    setConfirmation('Cita actualizada');
                }
            } else if (selectedDate) {
                const newAppointmentData: Omit<Appointment, 'id'> = {
                    date: selectedDate.toISOString().split('T')[0],
                    reminderMethod,
                    status: 'scheduled',
                    deposit_amount: 0,
                    deposit_paid: false,
                    price_total: 0,
                    has_consent: false,
                    ...formData
                };
                await add('appointments', newAppointmentData);
                setConfirmation('Cita agendada correctamente');
            }
            await loadAppointments();
            setShowForm(false);
            setSelectedDate(null);
            setEditingAppointmentId(null);
        } catch (error: any) {
            console.error("Error al guardar:", error.message);
        }
    };
    
    const handleEditAppointment = (appointment: Appointment) => {
        setEditingAppointmentId(appointment.id);
        setFormData({ name: appointment.name, contact: appointment.contact, idea: appointment.idea, time: appointment.time });
        setReminderMethod(appointment.reminderMethod);
        setSelectedDate(new Date(appointment.date.replace(/-/g, '/')));
        setShowForm(true);
    };

    const confirmDelete = async () => {
        if (appointmentIdToDelete !== null) {
            await deleteItem('appointments', appointmentIdToDelete);
            await loadAppointments();
            setAppointmentIdToDelete(null);
        }
    };

    const handleMarkAsCompleted = async (appointmentId: number) => {
        const appointmentToUpdate = appointments.find(app => app.id === appointmentId);
        if (appointmentToUpdate) {
            await put('appointments', { ...appointmentToUpdate, status: 'completed' });
            await loadAppointments();
        }
    };

    const isDateBooked = (day: number) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
        return appointments.some(app => app.date === dateStr && app.status !== 'completed');
    };

    const { scheduledAppointments, pastAppointments } = useMemo(() => {
        const now = new Date();
        const scheduled: Appointment[] = [];
        const past: Appointment[] = [];
        [...appointments].forEach(app => {
            const appointmentDateTime = new Date(`${app.date}T${app.time || '00:00'}`);
            if (appointmentDateTime >= now && app.status === 'scheduled') {
                scheduled.push(app);
            } else {
                past.push(app);
            }
        });
        scheduled.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
        return { scheduledAppointments: scheduled, pastAppointments: past };
    }, [appointments]);

    const renderCalendar = () => {
        const cells = [];
        for (let i = 0; i < startingDay; i++) {
            cells.push(<div key={`empty-${i}`} className="p-2 border border-transparent"></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isPast = !adminMode && currentDayDate < new Date(new Date().toDateString());
            const isBooked = isDateBooked(day);
            const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth();

            let cellClass = 'aspect-square flex items-center justify-center text-center border border-white/5 transition-all relative text-sm rounded-lg ';
            if (isPast || isBooked) {
                cellClass += ' text-gray-700 cursor-not-allowed';
            } else {
                cellClass += ' cursor-pointer hover:bg-brand/10 hover:border-brand/30';
            }
            if (isSelected) {
                 cellClass += ' bg-brand text-white font-bold border-brand shadow-[0_0_15px_rgba(232,21,220,0.5)] z-10 scale-110';
            }
            cells.push(
                <div key={day} className={cellClass} onClick={() => !isPast && !isBooked && handleDateClick(day)}>
                    {day}
                    {isBooked && !isSelected && <div className="absolute bottom-1 w-1 h-1 bg-brand/50 rounded-full"></div>}
                </div>
            );
        }
        return cells;
    };
    
    return (
        <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-brand font-black text-xl">&larr;</button>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white italic">
                        {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-brand font-black text-xl">&rarr;</button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                    {daysOfWeek.map(day => <div key={day} className="text-[10px] font-black uppercase text-center text-brand opacity-50">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {renderCalendar()}
                </div>
            </div>
            
             {confirmation && <div className="p-4 bg-brand/10 border border-brand/20 text-brand rounded-2xl text-center text-[10px] font-black uppercase tracking-widest animate-fade-in">{confirmation}</div>}

            {showForm && selectedDate && (
                <div className="p-6 bg-[#050505] rounded-3xl border border-brand/30 shadow-2xl animate-fade-in">
                    <h4 className="font-black text-xs uppercase tracking-widest text-brand mb-6 italic">RESERVAR SESIÓN • {selectedDate.toLocaleDateString()}</h4>
                    <form onSubmit={handleBooking} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Nombre Completo</label>
                                <input type="text" name="name" value={formData.name} onChange={handleFormChange} required className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white font-bold"/>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Hora Sugerida</label>
                                <input type="time" name="time" value={formData.time} onChange={handleFormChange} required className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white font-bold"/>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Notificaciones</label>
                                <div className="flex gap-1 bg-black p-1 rounded-2xl border border-white/10">
                                    <button type="button" onClick={() => handleReminderMethodChange('email')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${ reminderMethod === 'email' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-gray-500 hover:text-white' }`}>Email</button>
                                    <button type="button" onClick={() => handleReminderMethodChange('sms')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${ reminderMethod === 'sms' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-gray-500 hover:text-white' }`}>SMS</button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Dato de Contacto</label>
                            <input type={reminderMethod === 'email' ? 'email' : 'tel'} name="contact" value={formData.contact} onChange={handleFormChange} required className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white font-bold" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Descripción de la Idea</label>
                            <textarea name="idea" rows={2} value={formData.idea} onChange={handleFormChange} required className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white font-bold resize-none"></textarea>
                        </div>
                        <div className="flex gap-4">
                            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase text-gray-500 border border-white/5 hover:border-white/10 transition-all">Cancelar</button>
                            <button type="submit" className="flex-1 py-4 bg-brand text-white rounded-2xl text-[10px] font-black uppercase shadow-[0_0_20px_rgba(232,21,220,0.4)] active:scale-95 transition-all">Confirmar Cita</button>
                        </div>
                    </form>
                </div>
            )}
            
            <div className="pt-6">
                <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white italic">Mis Sesiones</h3>
                     <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                        <button onClick={() => setActiveAppointmentView('programadas')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${ activeAppointmentView === 'programadas' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-gray-500 hover:text-white' }`} > Pendientes </button>
                        <button onClick={() => setActiveAppointmentView('pasadas')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${ activeAppointmentView === 'pasadas' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-gray-500 hover:text-white' }`} > Historial </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {(activeAppointmentView === 'programadas' ? scheduledAppointments : pastAppointments).map((app) => (
                        <div key={app.id} className="p-5 bg-[#050505] border border-white/5 rounded-3xl flex justify-between items-center group hover:border-brand/40 transition-all shadow-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex flex-col items-center justify-center text-brand border border-white/5 font-black uppercase italic">
                                    <span className="text-[12px] leading-none">{new Date(app.date.replace(/-/g, '/')).getDate()}</span>
                                    <span className="text-[7px] tracking-widest">{new Date(app.date.replace(/-/g, '/')).toLocaleDateString('es-ES', { month: 'short' })}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm uppercase tracking-tight">{app.name}</h4>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{app.time} • {app.status === 'scheduled' ? 'Confirmando' : 'Realizada'}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {adminMode && <button onClick={() => handleMarkAsCompleted(app.id)} className="p-2 text-brand hover:scale-110 transition-transform"><CheckIcon /></button>}
                                <button onClick={() => handleEditAppointment(app)} className="p-2 text-gray-500 hover:text-white"><PencilIcon /></button>
                                <button onClick={() => setAppointmentIdToDelete(app.id)} className="p-2 text-red-900 hover:text-red-500"><TrashIcon /></button>
                            </div>
                        </div>
                    ))}
                    {(activeAppointmentView === 'programadas' ? scheduledAppointments : pastAppointments).length === 0 && (
                        <div className="p-10 text-center border border-dashed border-white/5 rounded-3xl opacity-20">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em]">Sin registros que mostrar</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {appointmentIdToDelete !== null && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[110] flex items-center justify-center p-6 animate-fade-in">
                    <div className="bg-[#050505] border border-brand/30 w-full max-w-sm rounded-[2.5rem] p-8 space-y-6 shadow-[0_0_50px_rgba(232,21,220,0.2)]">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                                <TrashIcon className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">¿Eliminar Cita?</h3>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2">Esta acción no se puede deshacer y liberará el horario.</p>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setAppointmentIdToDelete(null)}
                                className="flex-1 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase text-gray-400 border border-white/5 transition-all"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="flex-1 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-red-600/20 active:scale-95 transition-all"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
