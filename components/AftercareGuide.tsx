
import React from 'react';
import { CheckIcon } from './Icons';

export const AftercareGuide: React.FC = () => {
    const steps = [
        { day: 'Día 1-3', title: 'Limpieza Crítica', desc: 'Lava 3 veces al día con jabón neutro. No talles.', color: 'blue' },
        { day: 'Día 4-10', title: 'Hidratación', desc: 'Aplica una capa delgada de crema cicatrizante cada 4 horas.', color: 'green' },
        { day: 'Día 11-30', title: 'Protección Solar', desc: 'Evita el sol directo y piscinas por completo.', color: 'purple' },
    ];

    return (
        <div className="space-y-8 max-w-lg mx-auto">
            <header className="text-center">
                <h2 className="text-3xl font-black mb-2">Manual de Curación</h2>
                <p className="text-gray-500">Sigue estos pasos para que tu tattoo luzca increíble por años.</p>
            </header>

            <div className="space-y-4">
                {steps.map((step, idx) => (
                    <div key={idx} className="flex gap-6 items-start relative p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl">
                        <div className={`w-12 h-12 rounded-2xl bg-${step.color}-100 dark:bg-${step.color}-900/20 text-${step.color}-600 flex-shrink-0 flex items-center justify-center font-black`}>
                            {idx + 1}
                        </div>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-1 block">{step.day}</span>
                            <h4 className="text-xl font-black mb-1">{step.title}</h4>
                            <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-6 bg-purple-600 rounded-3xl text-white text-center">
                <h4 className="font-black mb-2">¿Dudas Urgentes?</h4>
                <p className="text-sm opacity-90 mb-4">Usa nuestro chat directo o consulta al asistente IA.</p>
                <button className="w-full bg-white text-purple-600 py-3 rounded-2xl font-bold">Abrir Chat Directo</button>
            </div>
        </div>
    );
};
