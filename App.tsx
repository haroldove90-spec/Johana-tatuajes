
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import type { Feature, UserRole } from './types';
import { OutlineCreator } from './components/OutlineCreator';
import { TattooPreviewer } from './components/TattooPreviewer';
import { DesignGenerator } from './components/DesignGenerator';
import { AiConsultant } from './components/AiConsultant';
import { DailyTips } from './components/DailyTips';
import { Gallery } from './components/Gallery';
import { Calendar } from './components/Calendar';
import { Clients } from './components/Clients';
import { AdminDashboard } from './components/AdminDashboard';
import { InventoryManager } from './components/InventoryManager';
import { FlashCatalog } from './components/FlashCatalog';
import { BudgetCalculator } from './components/BudgetCalculator';
import { AftercareGuide } from './components/AftercareGuide';
import { LogoIcon, SunIcon, MoonIcon, HomeIcon, GalleryIcon, CalendarIcon, ConsultantIcon, ClientsIcon, InventoryIcon, FlashIcon, BudgetIcon, CareIcon, DashboardIcon, UserRoleIcon } from './components/Icons';

const App: React.FC = () => {
    const [role, setRole] = useState<UserRole>(() => (localStorage.getItem('userRole') as UserRole) || 'client');
    const [activeFeature, setActiveFeature] = useState<Feature>('home');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const navBarRef = useRef<HTMLElement>(null);
    const [navBarHeight, setNavBarHeight] = useState(0);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('userRole', role);
        setActiveFeature('home');
    }, [role]);

    useLayoutEffect(() => {
        const updateHeight = () => setNavBarHeight(navBarRef.current?.offsetHeight || 0);
        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    const toggleRole = () => setRole(prev => prev === 'admin' ? 'client' : 'admin');

    const adminMenu = [
        { id: 'dashboard', icon: <DashboardIcon />, label: 'Panel' },
        { id: 'calendar', icon: <CalendarIcon />, label: 'Agenda' },
        { id: 'inventory', icon: <InventoryIcon />, label: 'Stock' },
        { id: 'flash', icon: <FlashIcon />, label: 'Flash' },
        { id: 'clients', icon: <ClientsIcon />, label: 'Clientes' },
    ];

    const clientMenu = [
        { id: 'home', icon: <HomeIcon />, label: 'Inicio' },
        { id: 'flash', icon: <FlashIcon />, label: 'Diseños' },
        { id: 'calendar', icon: <CalendarIcon />, label: 'Reservar' },
        { id: 'budget', icon: <BudgetIcon />, label: 'Precio' },
        { id: 'aftercare', icon: <CareIcon />, label: 'Cuidados' },
    ];

    const currentMenu = role === 'admin' ? adminMenu : clientMenu;

    const renderFeature = () => {
        switch (activeFeature) {
            case 'home': return (
                <div className="space-y-8">
                    <DailyTips />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FeatureCard title="Generador IA" desc="Crea diseños desde cero" icon={<DashboardIcon />} onClick={() => setActiveFeature('generate')} />
                        <FeatureCard title="Probador AR" desc="Mira el tattoo en tu piel" icon={<DashboardIcon />} onClick={() => setActiveFeature('preview')} />
                        <FeatureCard title="Trazo Maestro" desc="Prepara tu plantilla" icon={<DashboardIcon />} onClick={() => setActiveFeature('outline')} />
                        <FeatureCard title="Asistente PRO" desc="Consultas técnicas" icon={<ConsultantIcon />} onClick={() => setActiveFeature('consultant')} />
                    </div>
                </div>
            );
            case 'dashboard': return <AdminDashboard />;
            case 'inventory': return <InventoryManager />;
            case 'calendar': return <Calendar adminMode={role === 'admin'} />;
            case 'clients': return <Clients />;
            case 'gallery': return <Gallery />;
            case 'consultant': return <AiConsultant />;
            case 'flash': return <FlashCatalog isAdmin={role === 'admin'} />;
            case 'budget': return <BudgetCalculator />;
            case 'aftercare': return <AftercareGuide />;
            case 'generate': return <DesignGenerator />;
            case 'preview': return <TattooPreviewer />;
            case 'outline': return <OutlineCreator />;
            default: return <div className="text-center py-20">Próximamente...</div>;
        }
    };

    return (
        <div className="min-h-screen flex flex-col transition-colors duration-500">
            <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-40 p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <LogoIcon />
                        <h1 className="text-xl font-bold font-playfair tracking-tight">
                            {role === 'admin' ? 'Admin Portal' : 'Johana Tatuajes'}
                        </h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={toggleRole} className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 transition-all hover:scale-110" title="Cambiar Rol">
                            <UserRoleIcon />
                        </button>
                        <button onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-grow p-4 md:p-8 overflow-x-hidden" style={{ paddingBottom: `${navBarHeight + 30}px` }}>
                <div className="max-w-4xl mx-auto animate-fade-in">
                    {renderFeature()}
                </div>
            </main>

            <nav ref={navBarRef} className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 z-50">
                <div className="max-w-4xl mx-auto grid grid-cols-5 h-20">
                    {currentMenu.map(item => (
                        <button key={item.id} onClick={() => setActiveFeature(item.id as Feature)} 
                                className={`flex flex-col items-center justify-center space-y-1 transition-all ${activeFeature === item.id ? 'text-purple-600 dark:text-purple-400 scale-110 font-bold' : 'text-gray-400'}`}>
                            <div className="w-6 h-6">{item.icon}</div>
                            <span className="text-[10px] uppercase tracking-widest">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
};

const FeatureCard = ({ title, desc, icon, onClick }: any) => (
    <button onClick={onClick} className="flex items-center p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-left hover:border-purple-500 transition-all group shadow-sm">
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl mr-4 group-hover:scale-110 transition-transform">{icon}</div>
        <div>
            <h4 className="font-bold text-lg">{title}</h4>
            <p className="text-sm text-gray-500">{desc}</p>
        </div>
    </button>
);

export default App;
