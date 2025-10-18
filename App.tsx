import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import type { Feature } from './types';
import { OutlineCreator } from './components/OutlineCreator';
import { TattooPreviewer } from './components/TattooPreviewer';
import { DesignGenerator } from './components/DesignGenerator';
import { AiConsultant } from './components/AiConsultant';
import { DailyTips } from './components/DailyTips';
import { Gallery } from './components/Gallery';
import { Calendar } from './components/Calendar';
import { Clients } from './components/Clients';
import { LogoIcon, OutlineIcon, PreviewIcon, GenerateIcon, ConsultantIcon, GalleryIcon, CalendarIcon, SunIcon, MoonIcon, HomeIcon, BackIcon, ClientsIcon } from './components/Icons';

const CreativeToolsSelector: React.FC<{ onSelect: (feature: Feature) => void }> = ({ onSelect }) => {
    const features = [
        { id: 'outline' as Feature, icon: <OutlineIcon />, title: 'Crear Trazo', description: 'Transforma un dibujo en una plantilla.' },
        { id: 'preview' as Feature, icon: <PreviewIcon />, title: 'Probar Tatuaje', description: 'Visualiza un diseño en la piel.' },
        { id: 'generate' as Feature, icon: <GenerateIcon />, title: 'Generar Diseño', description: 'Crea arte único a partir de ideas.' },
    ];

    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-300 mb-4">Herramientas Creativas</h3>
            <div className="grid grid-cols-1 gap-4">
                {features.map((feature) => (
                    <button
                        key={feature.id}
                        onClick={() => onSelect(feature.id)}
                        className="w-full flex items-center p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-700/70 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 transform hover:scale-[1.02]"
                    >
                        <div className="mr-5 text-purple-500 dark:text-purple-400">{feature.icon}</div>
                        <div>
                            <h4 className="text-lg font-bold text-left text-gray-900 dark:text-white">{feature.title}</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-left text-sm">{feature.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const HomeScreen: React.FC<{ onSelectTool: (feature: Feature) => void }> = ({ onSelectTool }) => (
    <div className="space-y-10">
        <DailyTips />
        <CreativeToolsSelector onSelect={onSelectTool} />
    </div>
);

const BottomNavBar = React.forwardRef<HTMLElement, { activeFeature: Feature; onSelect: (feature: Feature) => void; isToolActive: boolean }>(
    ({ activeFeature, onSelect, isToolActive }, ref) => {
        const navItems = [
            { id: 'home' as Feature, icon: <HomeIcon />, label: 'Inicio' },
            { id: 'gallery' as Feature, icon: <GalleryIcon />, label: 'Galería' },
            { id: 'calendar' as Feature, icon: <CalendarIcon />, label: 'Agenda' },
            { id: 'clients' as Feature, icon: <ClientsIcon />, label: 'Clientes' },
            { id: 'consultant' as Feature, icon: <ConsultantIcon />, label: 'Asistente' },
        ];

        return (
            <nav ref={ref} className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 z-10">
                <div className="max-w-4xl mx-auto grid grid-cols-5">
                    {navItems.map(item => {
                        const isActive = !isToolActive && activeFeature === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onSelect(item.id)}
                                className={`flex flex-col items-center justify-center py-2 px-1 text-center transition-colors duration-200 ${
                                    isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400'
                                }`}
                            >
                                <div className="w-7 h-7">{item.icon}</div>
                                <span className="text-xs font-medium mt-1">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        );
    }
);
BottomNavBar.displayName = 'BottomNavBar';


const App: React.FC = () => {
    const [activeFeature, setActiveFeature] = useState<Feature>('home');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [isToolActive, setIsToolActive] = useState(false);
    const navBarRef = useRef<HTMLElement>(null);
    const [navBarHeight, setNavBarHeight] = useState(0);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    useLayoutEffect(() => {
        const updateHeight = () => {
            if (navBarRef.current) {
                setNavBarHeight(navBarRef.current.offsetHeight);
            }
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);
        
        const resizeObserver = new ResizeObserver(updateHeight);
        const currentNavBar = navBarRef.current;
        if (currentNavBar) {
            resizeObserver.observe(currentNavBar);
        }

        return () => {
            window.removeEventListener('resize', updateHeight);
            if (currentNavBar) {
                resizeObserver.unobserve(currentNavBar);
            }
        };
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleSelectFeature = (feature: Feature) => {
        setIsToolActive(false);
        setActiveFeature(feature);
    };

    const handleSelectTool = (feature: Feature) => {
        setIsToolActive(true);
        setActiveFeature(feature);
    };

    const handleBack = () => {
        setActiveFeature('home');
        setIsToolActive(false);
    };
    
    const getTitle = () => {
        switch (activeFeature) {
            case 'home':
                return 'Johana Tatuajes';
            case 'outline':
                return 'Creador de Trazos';
            case 'preview':
                return 'Visualizador de Tatuajes';
            case 'generate':
                return 'Generador de Diseños';
            case 'consultant':
                return 'Asistente de IA';
            case 'gallery':
                return 'Galería de Tatuajes';
            case 'calendar':
                return 'Agenda de Citas';
            case 'clients':
                return 'Gestión de Clientes';
            default:
                return 'Herramientas de IA';
        }
    };
    
    const renderFeature = () => {
        switch (activeFeature) {
            case 'home':
                return <HomeScreen onSelectTool={handleSelectTool} />;
            case 'gallery':
                return <Gallery />;
            case 'calendar':
                return <Calendar />;
            case 'clients':
                return <Clients />;
            case 'consultant':
                return <AiConsultant />;
            case 'outline':
                return <OutlineCreator />;
            case 'preview':
                return <TattooPreviewer />;
            case 'generate':
                return <DesignGenerator />;
            default:
                return <HomeScreen onSelectTool={handleSelectTool} />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        {isToolActive ? (
                            <button onClick={handleBack} className="p-2 -ml-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Volver">
                                <BackIcon />
                            </button>
                        ) : (
                            <LogoIcon />
                        )}
                         <h1 className="text-2xl font-bold font-playfair text-gray-900 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis">{getTitle()}</h1>
                    </div>
                    <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                    </button>
                </div>
            </header>

            <main className="flex-grow p-4 sm:p-6" style={{ paddingBottom: `${navBarHeight + 24}px` }}>
                <div className="w-full max-w-4xl mx-auto animate-fade-in">
                    {renderFeature()}
                </div>
            </main>
            
            <BottomNavBar ref={navBarRef} activeFeature={activeFeature} onSelect={handleSelectFeature} isToolActive={isToolActive} />
        </div>
    );
};

export default App;