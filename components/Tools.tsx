import React from 'react';
import { DashboardIcon, ConsultantIcon } from './Icons';

interface ToolsProps {
    onSelectFeature: (feature: any) => void;
}

export const Tools: React.FC<ToolsProps> = ({ onSelectFeature }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <header className="mb-8">
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                    Caja de <span className="text-brand">Herramientas</span>
                </h2>
                <p className="text-xs text-gray-500 font-black uppercase tracking-widest mt-2">
                    Utilidades avanzadas para tu estudio
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                    onClick={() => onSelectFeature('stencil')}
                    className="bg-[#050505] p-6 rounded-3xl border border-white/5 hover:border-brand/50 transition-all cursor-pointer group shadow-2xl"
                >
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand mb-4 group-hover:scale-110 transition-transform">
                        <DashboardIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Preparador de Stencil</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-relaxed">Convierte diseños a líneas y escala para impresión a 300 DPI exactos.</p>
                </div>

                <div 
                    onClick={() => onSelectFeature('designer')}
                    className="bg-[#050505] p-6 rounded-3xl border border-white/5 hover:border-brand/50 transition-all cursor-pointer group shadow-2xl"
                >
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand mb-4 group-hover:scale-110 transition-transform">
                        <DashboardIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Diseñador IA</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-relaxed">Genera 4 variantes de diseños únicos con Inteligencia Artificial.</p>
                </div>

                <div 
                    onClick={() => onSelectFeature('outline')}
                    className="bg-[#050505] p-6 rounded-3xl border border-white/5 hover:border-brand/50 transition-all cursor-pointer group shadow-2xl"
                >
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand mb-4 group-hover:scale-110 transition-transform">
                        <DashboardIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Trazo Maestro</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-relaxed">Extrae líneas de cualquier imagen para crear stencils rápidos.</p>
                </div>

                <div 
                    onClick={() => onSelectFeature('preview')}
                    className="bg-[#050505] p-6 rounded-3xl border border-white/5 hover:border-brand/50 transition-all cursor-pointer group shadow-2xl"
                >
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand mb-4 group-hover:scale-110 transition-transform">
                        <DashboardIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Probador AR</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-relaxed">Visualiza cómo quedará el tatuaje en la piel del cliente.</p>
                </div>

                <div 
                    onClick={() => onSelectFeature('gallery')}
                    className="bg-[#050505] p-6 rounded-3xl border border-white/5 hover:border-brand/50 transition-all cursor-pointer group shadow-2xl"
                >
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand mb-4 group-hover:scale-110 transition-transform">
                        <DashboardIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Marca de Agua</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-relaxed">Toma fotos y protege tu trabajo con el logotipo del estudio.</p>
                </div>

                <div 
                    onClick={() => onSelectFeature('consultant')}
                    className="bg-[#050505] p-6 rounded-3xl border border-white/5 hover:border-brand/50 transition-all cursor-pointer group shadow-2xl md:col-span-2"
                >
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand mb-4 group-hover:scale-110 transition-transform">
                        <ConsultantIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Asistente PRO (Técnico)</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-relaxed">Consultas sobre técnicas, agujas, voltajes y pigmentos.</p>
                </div>
            </div>
        </div>
    );
};
