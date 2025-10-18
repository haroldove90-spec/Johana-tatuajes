import React, { useState, useMemo, useEffect } from 'react';
import { PencilIcon, TrashIcon, CheckIcon } from './Icons';
import { getAll, add, put, deleteItem, findOrAddClient } from '../utils/db';

export interface Appointment {
    id: number;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    name: string;
    contact: string;
    idea: string;
    reminderMethod: 'email' | 'sms';
    status: 'scheduled' | 'completed';
}

export const Calendar: React.FC = () => {
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

    // --- Database Initialization ---
    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            const loadedAppointments = await getAll<Appointment>('appointments');
            setAppointments(loadedAppointments);
        } catch (error) {
            console.error("Error al cargar citas desde la base de datos:", error);
        }
    };
    
    // --- Automatic Completion Check ---
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

    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
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
        if (date < new Date(new Date().toDateString())) return;
        
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
                 setContactError(reminderMethod === 'email' ? 'Por favor, introduce un correo válido.' : 'Por favor, introduce un teléfono válido.');
            } else {
                setContactError('');
            }
        }
    };
    
    const handleReminderMethodChange = (method: 'email' | 'sms') => {
        setReminderMethod(method);
        if (formData.contact) {
            if (!validateContact(method, formData.contact)) {
                 setContactError(method === 'email' ? 'Por favor, introduce un correo válido.' : 'Por favor, introduce un teléfono válido.');
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
                    setConfirmation('¡Cita actualizada con éxito!');
                }
            } else if (selectedDate) {
                const newAppointmentData: Omit<Appointment, 'id'> = {
                    date: selectedDate.toISOString().split('T')[0],
                    reminderMethod,
                    status: 'scheduled',
                    ...formData
                };
                await add('appointments', newAppointmentData);
                const reminderTarget = reminderMethod === 'email' 
                    ? `a tu correo electrónico (${formData.contact})`
                    : `por SMS a tu teléfono (${formData.contact})`;
                setConfirmation(`¡Cita agendada! Se enviará un recordatorio ${reminderTarget} 24 horas antes.`);
            }

            await loadAppointments();
            setShowForm(false);
            setSelectedDate(null);
            setEditingAppointmentId(null);
        } catch (error) {
            console.error("Error al guardar la cita:", error);
            alert("No se pudo guardar la cita. Inténtalo de nuevo.");
        }
    };
    
    const handleEditAppointment = (appointment: Appointment) => {
        setEditingAppointmentId(appointment.id);
        setFormData({ name: appointment.name, contact: appointment.contact, idea: appointment.idea, time: appointment.time });
        setReminderMethod(appointment.reminderMethod);
        setSelectedDate(new Date(appointment.date.replace(/-/g, '\/')));
        setShowForm(true);
        setConfirmation('');
        setContactError('');
    };

    const handleDeleteAppointment = async (appointmentId: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta cita? Esta acción no se puede deshacer.')) {
            await deleteItem('appointments', appointmentId);
            await loadAppointments();
        }
    };

    const handleMarkAsCompleted = async (appointmentId: number) => {
        const appointmentToUpdate = appointments.find(app => app.id === appointmentId);
        if (appointmentToUpdate) {
            await put('appointments', { ...appointmentToUpdate, status: 'completed' });
            await loadAppointments();
        }
        if (pendingConfirmation && pendingConfirmation.id === appointmentId) {
            setPendingConfirmation(null);
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingAppointmentId(null);
        setSelectedDate(null);
    };

    const isDateBooked = (day: number) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
        return appointments.some(app => app.date === dateStr && app.status !== 'completed');
    };

    const isFormValid = useMemo(() => {
        return formData.name.trim() !== '' && formData.idea.trim() !== '' && formData.contact.trim() !== '' && formData.time.trim() !== '' && !contactError;
    }, [formData, contactError]);

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
        past.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

        return { scheduledAppointments: scheduled, pastAppointments: past };
    }, [appointments]);

    const renderCalendar = () => {
        const cells = [];
        for (let i = 0; i < startingDay; i++) {
            cells.push(<div key={`empty-${i}`} className="p-2 border border-transparent"></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const isPast = new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date(new Date().toDateString());
            const isBooked = isDateBooked(day);
            const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth();

            let cellClass = 'p-2 text-center border border-gray-200 dark:border-gray-700 transition-colors';
            if (isPast || isBooked) {
                cellClass += ' bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed line-through';
            } else {
                cellClass += ' cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/50';
            }
            if (isSelected) {
                 cellClass += ' bg-purple-500 text-white font-bold';
            }
            cells.push(
                <div key={day} className={cellClass} onClick={() => !isPast && !isBooked && handleDateClick(day)}>
                    {day}
                </div>
            );
        }
        return cells;
    };
    
    const AppointmentList: React.FC<{ 
        appointments: Appointment[]; 
        isPastList?: boolean;
        onEdit: (app: Appointment) => void;
        onDelete: (id: number) => void;
        onMarkAsCompleted: (id: number) => void;
    }> = ({ appointments, isPastList = false, onEdit, onDelete, onMarkAsCompleted }) => (
        <div className="space-y-4 mt-4 animate-fade-in">
            {appointments.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No hay citas en esta categoría.</p>
            ) : (
                appointments.map((app) => {
                    const isCompleted = app.status === 'completed';
                    const isMissed = isPastList && app.status === 'scheduled';
                    let itemClass = "p-4 rounded-lg border flex justify-between items-start transition-colors ";
                    if (isCompleted) {
                        itemClass += "bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-800/60";
                    } else if (isMissed) {
                        itemClass += "bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-800/60 opacity-80";
                    } else {
                        itemClass += "bg-gray-50 dark:bg-gray-900/50 border-gray-300 dark:border-gray-700";
                    }

                    return (
                        <div key={app.id} className={itemClass}>
                            <div className="flex-grow">
                                <p className={`font-bold ${isCompleted ? 'text-green-700 dark:text-green-300' : isMissed ? 'text-red-700 dark:text-red-300' : 'text-purple-600 dark:text-purple-300'}`}>
                                    {new Date(app.date.replace(/-/g, '\/')).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {app.time}
                                </p>
                                <p><span className="font-semibold">Cliente:</span> {app.name}</p>
                                <p><span className="font-semibold">Contacto:</span> {app.contact}</p>
                                <p className="break-words"><span className="font-semibold">Idea:</span> {app.idea}</p>
                                {isCompleted && <p className="font-semibold text-green-600 dark:text-green-400 mt-1">✓ Completada</p>}
                                {isMissed && <p className="font-semibold text-red-600 dark:text-red-400 mt-1">✗ Cita Perdida</p>}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                {app.status === 'scheduled' && (
                                     <button onClick={() => onMarkAsCompleted(app.id)} className="p-2 text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors" aria-label="Marcar como Completada">
                                        <CheckIcon />
                                    </button>
                                )}
                                <button onClick={() => onEdit(app)} className="p-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" aria-label="Editar Cita">
                                    <PencilIcon />
                                </button>
                                <button onClick={() => onDelete(app.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors" aria-label="Eliminar Cita">
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <button onClick={() => changeMonth(-1)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">&lt; Anterior</button>
                <h3 className="text-xl font-bold">{currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => changeMonth(1)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Siguiente &gt;</button>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {daysOfWeek.map(day => <div key={day} className="p-2 font-bold text-center text-purple-600 dark:text-purple-300">{day}</div>)}
                {renderCalendar()}
            </div>
            
             {confirmation && <p className="text-center text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 p-3 rounded-md animate-fade-in">{confirmation}</p>}

            {showForm && selectedDate && (
                <div className="p-6 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-700 animate-fade-in">
                    <h4 className="text-lg font-semibold mb-4">{editingAppointmentId ? 'Editar Cita' : 'Agendar cita'} para el {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                    <form onSubmit={handleBooking} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-1">Nombre:</label>
                                <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} required className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"/>
                            </div>
                            <div>
                                <label htmlFor="time" className="block text-sm font-medium mb-1">Hora de la Cita:</label>
                                <input type="time" id="time" name="time" value={formData.time} onChange={handleFormChange} required className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"/>
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-2">Método de Recordatorio:</label>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => handleReminderMethodChange('email')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${ reminderMethod === 'email' ? 'bg-purple-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600' }`} > Email </button>
                                <button type="button" onClick={() => handleReminderMethodChange('sms')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${ reminderMethod === 'sms' ? 'bg-purple-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600' }`} > SMS </button>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="contact" className="block text-sm font-medium mb-1"> {reminderMethod === 'email' ? 'Correo Electrónico:' : 'Número de Teléfono:'} </label>
                            <input type={reminderMethod === 'email' ? 'email' : 'tel'} id="contact" name="contact" value={formData.contact} onChange={handleFormChange} required className={`w-full p-2 bg-white dark:bg-gray-700 border rounded-md ${contactError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} placeholder={reminderMethod === 'email' ? 'ejemplo@correo.com' : 'Ej: 123 456 7890'} />
                             {contactError && <p className="text-red-500 text-sm mt-1">{contactError}</p>}
                        </div>
                        <div>
                            <label htmlFor="idea" className="block text-sm font-medium mb-1">Breve descripción de la idea:</label>
                            <textarea id="idea" name="idea" rows={3} value={formData.idea} onChange={handleFormChange} required className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"></textarea>
                        </div>
                        <div className="flex justify-end gap-4">
                             <button type="button" onClick={handleCancelForm} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md">Cancelar</button>
                            <button type="submit" disabled={!isFormValid} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed">
                                {editingAppointmentId ? 'Actualizar Cita' : 'Confirmar Cita'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {!showForm && !confirmation && ( <p className="text-center text-gray-500">Selecciona un día disponible en el calendario para iniciar tu reserva.</p> )}
            
            <div className="pt-6 border-t border-gray-300 dark:border-gray-700">
                <h3 className="text-xl font-bold text-center mb-4">Mis Citas</h3>
                <div className="flex justify-center gap-2 mb-4 p-1 bg-gray-200 dark:bg-gray-800 rounded-lg">
                    <button onClick={() => setActiveAppointmentView('programadas')} className={`w-full py-2 px-4 rounded-md text-sm font-semibold transition-colors ${ activeAppointmentView === 'programadas' ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-300 shadow' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-300/50 dark:hover:bg-gray-900/20' }`} > Programadas ({scheduledAppointments.length}) </button>
                    <button onClick={() => setActiveAppointmentView('pasadas')} className={`w-full py-2 px-4 rounded-md text-sm font-semibold transition-colors ${ activeAppointmentView === 'pasadas' ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-300 shadow' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-300/50 dark:hover:bg-gray-900/20' }`} > Pasadas ({pastAppointments.length}) </button>
                </div>

                {activeAppointmentView === 'programadas' ? (
                    <AppointmentList appointments={scheduledAppointments} onEdit={handleEditAppointment} onDelete={handleDeleteAppointment} onMarkAsCompleted={handleMarkAsCompleted} />
                ) : (
                    <AppointmentList appointments={pastAppointments} isPastList={true} onEdit={handleEditAppointment} onDelete={handleDeleteAppointment} onMarkAsCompleted={handleMarkAsCompleted} />
                )}
            </div>

            {pendingConfirmation && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Confirmar Cita Pasada</h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            La cita con <span className="font-semibold">{pendingConfirmation.name}</span> del día {new Date(pendingConfirmation.date.replace(/-/g, '\/')).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} a las {pendingConfirmation.time} ya ha pasado.
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">¿Se completó la cita?</p>
                        <div className="flex justify-end gap-4 pt-2">
                            <button onClick={() => setPendingConfirmation(null)} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md font-semibold">
                                Más Tarde
                            </button>
                            <button onClick={async () => { await handleDeleteAppointment(pendingConfirmation.id); setPendingConfirmation(null); }} className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700">
                                No, Eliminar
                            </button>
                            <button onClick={() => handleMarkAsCompleted(pendingConfirmation.id)} className="px-4 py-2 bg-purple-600 text-white rounded-md font-semibold hover:bg-purple-700">
                                Sí, se Completó
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};