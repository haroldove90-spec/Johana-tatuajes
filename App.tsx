
import React, { useState } from 'react';
import type { Feature } from './types';
import { OutlineCreator } from './components/OutlineCreator';
import { TattooPreviewer } from './components/TattooPreviewer';
import { DesignGenerator } from './components/DesignGenerator';
import { LogoIcon, OutlineIcon, PreviewIcon, GenerateIcon, BackIcon } from './components/Icons';

const FeatureSelector: React.FC<{ onSelect: (feature: Feature) => void }> = ({ onSelect }) => {
    const features = [
        { id: 'outline' as Feature, icon: <OutlineIcon />, title: 'Crear Trazo', description: 'Sube un dibujo para crear su trazo para tatuaje.' },
        { id: 'preview' as Feature, icon: <PreviewIcon />, title: 'Probar Tatuaje', description: 'Visualiza cómo se vería un diseño en diferentes partes del cuerpo.' },
        { id: 'generate' as Feature, icon: <GenerateIcon />, title: 'Generar Diseño', description: 'Crea diseños de tatuajes únicos a partir de tus ideas.' },
    ];

    return (
        <div className="space-y-6">
            {features.map((feature) => (
                <button
                    key={feature.id}
                    onClick={() => onSelect(feature.id)}
                    className="w-full flex items-center p-6 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-700/70 hover:border-purple-400 transition-all duration-300 transform hover:scale-105"
                >
                    <div className="mr-6 text-purple-400">{feature.icon}</div>
                    <div>
                        <h3 className="text-xl font-bold text-left text-white">{feature.title}</h3>
                        <p className="text-gray-400 text-left">{feature.description}</p>
                    </div>
                </button>
            ))}
        </div>
    );
};

const App: React.FC = () => {
    const [activeFeature, setActiveFeature] = useState<Feature | null>(null);

    const renderFeature = () => {
        switch (activeFeature) {
            case 'outline':
                return <OutlineCreator />;
            case 'preview':
                return <TattooPreviewer />;
            case 'generate':
                return <DesignGenerator />;
            default:
                return <FeatureSelector onSelect={setActiveFeature} />;
        }
    };
    
    const getTitle = () => {
        switch (activeFeature) {
            case 'outline':
                return 'Creador de Trazos';
            case 'preview':
                return 'Visualizador de Tatuajes';
            case 'generate':
                return 'Generador de Diseños';
            default:
                return 'Herramientas de IA';
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 flex flex-col items-center">
            <div className="w-full max-w-4xl">
                <header className="text-center mb-10">
                    <div className="inline-flex items-center justify-center space-x-4">
                        <LogoIcon />
                        <h1 className="text-5xl md:text-6xl font-playfair text-white">Johana Tatuajes</h1>
                    </div>
                </header>

                <main className="bg-gray-800 rounded-xl shadow-2xl shadow-purple-900/20 border border-gray-700 p-6 md:p-10 transition-all duration-500">
                    <div className="flex items-center mb-8">
                       {activeFeature && (
                            <button onClick={() => setActiveFeature(null)} className="mr-4 p-2 rounded-full hover:bg-gray-700 transition-colors">
                                <BackIcon />
                            </button>
                        )}
                        <h2 className="text-3xl font-bold text-purple-300">{getTitle()}</h2>
                    </div>
                    {renderFeature()}
                </main>
                
                <footer className="text-center mt-10 text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Johana Tatuajes. Potenciado por IA.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;
