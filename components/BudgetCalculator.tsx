
import React, { useState } from 'react';

export const BudgetCalculator: React.FC = () => {
    const [size, setSize] = useState(10);
    const [style, setStyle] = useState('Lineal');
    const [color, setColor] = useState(false);

    const calculate = () => {
        let base = size * 10;
        if (style === 'Realista') base *= 2.5;
        if (style === 'Sombreado') base *= 1.8;
        if (color) base += 50;
        return Math.round(base);
    };

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl">
            <h2 className="text-2xl font-black mb-6 text-purple-600">Calculadora de Presupuesto</h2>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-gray-500">Tamaño aprox. ({size} cm)</label>
                    <input type="range" min="3" max="40" value={size} onChange={e => setSize(parseInt(e.target.value))} 
                           className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-gray-500">Estilo Artístico</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['Lineal', 'Sombreado', 'Realista'].map(s => (
                            <button key={s} onClick={() => setStyle(s)} 
                                    className={`py-2 text-sm rounded-xl border transition-all ${style === s ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 dark:border-gray-800'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                    <span className="font-bold text-gray-600">Incluye Color</span>
                    <button onClick={() => setColor(!color)} className={`w-12 h-6 rounded-full transition-colors relative ${color ? 'bg-purple-600' : 'bg-gray-300'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${color ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
                    <p className="text-gray-500 text-sm mb-1 uppercase tracking-widest font-bold">Rango Estimado</p>
                    <h3 className="text-5xl font-black text-gray-900 dark:text-white">${calculate()} - ${Math.round(calculate() * 1.2)}</h3>
                    <p className="text-[10px] text-gray-400 mt-4 leading-tight italic">
                        *Este es un precio base orientativo. El costo final se confirma con el artista tras evaluar el diseño final.
                    </p>
                </div>
            </div>
        </div>
    );
};
