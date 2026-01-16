
import React, { useState } from 'react';
import { CheckIcon, CareIcon } from './Icons';

export const AftercareGuide: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        { day: 'Día 1-3', title: 'Higiene Crítica', desc: 'Lava tu tatuaje 3 veces al día con jabón neutro. Usa tus manos limpias, nunca esponjas. Seca con toques suaves de papel absorbente.', detail: 'Evita el sol y no sumerjas el tatuaje en piscinas o mar.' },
        { day: 'Día 4-10', title: 'Hidratación PRO', desc: 'Aplica una capa muy delgada de pomada recomendada 3-4 veces al día. La piel debe verse hidratada, no empapada.', detail: 'Si sientes picazón, no rasques. Golpea suavemente la zona.' },
        { day: 'Día 11-30', title: 'Protección Total', desc: 'Tu piel ya sanó por fuera, pero sigue sanando por dentro. Usa bloqueador solar de alta protección si vas a estar en exteriores.', detail: 'El sol es el mayor enemigo de los pigmentos. Cuídalo de por vida.' },
    ];

    const simulateReminder = () => {
        alert("🔔 RECORDATORIO ENVIADO: Es hora de lavar tu tatuaje y aplicar una capa ligera de crema. ¡Mantén esa pieza impecable!");
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-lg mx-auto">
            <header className="text-center">
                <div className="inline-block p-4 bg-brand/10 border border-brand/20 rounded-full mb-4">
                    <CareIcon className="w-8 h-8 text-brand" />
                </div>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Manual Post-Tattoo</h2>
                <p className="text-[10px] text-brand font-black uppercase tracking-widest mt-1">Sigue estos pasos para un resultado perfecto</p>
            </header>

            <div className="space-y-4">
                {steps.map((step, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => setActiveStep(idx)}
                        className={`p-6 bg-[#050505] border rounded-[2rem] transition-all cursor-pointer shadow-2xl ${activeStep === idx ? 'border-brand/40' : 'border-white/5'}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[9px] font-black uppercase text-brand tracking-widest">{step.day}</span>
                            {activeStep === idx && <CheckIcon className="w-4 h-4 text-brand" />}
                        </div>
                        <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2 italic">{step.title}</h4>
                        <p className="text-sm text-gray-400 leading-relaxed font-medium">{step.desc}</p>
                        
                        {activeStep === idx && (
                            <div className="mt-4 pt-4 border-t border-white/5 animate-fade-in">
                                <p className="text-[10px] text-gray-500 font-bold leading-relaxed">{step.detail}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button 
                onClick={simulateReminder}
                className="w-full py-5 bg-brand text-white font-black rounded-2xl uppercase tracking-widest shadow-[0_0_30px_rgba(232,21,220,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-xs"
            >
                Activar Notificaciones de Cuidado
            </button>

            <div className="p-8 bg-brand/5 border border-brand/20 rounded-[2.5rem] text-center">
                <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-2">¿Algo no va bien?</h5>
                <p className="text-[10px] text-gray-500 font-bold mb-4 italic">Si notas enrojecimiento excesivo o calor en la zona, contáctanos de inmediato.</p>
                <button className="text-[9px] font-black text-brand uppercase border-b-2 border-brand/20 hover:border-brand transition-all">Chat Directo con el Artista</button>
            </div>
        </div>
    );
};
