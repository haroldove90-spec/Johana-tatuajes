
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
import { ConsentForms } from './components/ConsentForms';
import { ClientProfile } from './components/ClientProfile';
import { MedicalHistoryManager } from './components/MedicalHistory';
import { Reviews } from './components/Reviews';
import { Auth } from './components/Auth';
import { supabase } from './utils/supabase';
import { 
    HomeIcon, 
    CalendarIcon, 
    ConsultantIcon, 
    ClientsIcon, 
    InventoryIcon, 
    FlashIcon, 
    BudgetIcon, 
    CareIcon, 
    DashboardIcon, 
    UserRoleIcon, 
    CheckIcon,
    UserIcon,
    MedicalIcon
} from './components/Icons';

interface NavItem {
    id: string;
    icon: React.ReactNode;
    label: string;
    badge?: boolean;
}

const App: React.FC = () => {
    const [user, setUser] = useState<{username: string, role: UserRole} | null>(() => {
        const saved = localStorage.getItem('bribiesca_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [activeFeature, setActiveFeature] = useState<Feature>('home');
    const [pendingConsentsCount, setPendingConsentsCount] = useState(0);
    const navBarRef = useRef<HTMLElement>(null);
    const [navBarHeight, setNavBarHeight] = useState(0);

    // Verificación de permisos solicitados en metadata.json
    useEffect(() => {
        const checkPermissions = async () => {
            try {
                // Verificar soporte de geolocalización
                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(() => {}, () => {
                        console.warn("Geolocalización desactivada.");
                    });
                }
                
                // Los permisos de cámara y micrófono se solicitan bajo demanda en AiConsultant y OutlineCreator,
                // pero aquí validamos soporte inicial.
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    console.warn("Hardware multimedia no detectado.");
                }
            } catch (e) {
                console.error("Error validando capacidades del hardware:", e);
            }
        };
        checkPermissions();
    }, []);

    useEffect(() => {
        if (user) {
            localStorage.setItem('bribiesca_user', JSON.stringify(user));
            
            // Solicitar permisos de notificación si es admin
            if (user.role === 'admin') {
                if ("Notification" in window && Notification.permission === "default") {
                    Notification.requestPermission();
                }
                if (activeFeature === 'home') setActiveFeature('dashboard');
            }

            if (user.role === 'client') {
                fetchPendingCount();
                const channel = supabase
                    .channel('global_notifications')
                    .on('postgres_changes', { 
                        event: '*', 
                        schema: 'public', 
                        table: 'consents',
                        filter: `client_username=eq.${user.username.toLowerCase()}`
                    }, () => fetchPendingCount())
                    .subscribe();
                return () => { supabase.removeChannel(channel); };
            }
        } else {
            localStorage.removeItem('bribiesca_user');
        }
    }, [user]);

    const fetchPendingCount = async () => {
        if (!user || user.role !== 'client') return;
        const { count } = await supabase
            .from('consents')
            .select('*', { count: 'exact', head: true })
            .eq('client_username', user.username.toLowerCase())
            .eq('status', 'pending');
        setPendingConsentsCount(count || 0);
    };

    useLayoutEffect(() => {
        const updateHeight = () => setNavBarHeight(navBarRef.current?.offsetHeight || 0);
        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    if (!user) {
        return <Auth onLogin={(username, role) => setUser({username, role})} />;
    }

    const adminMenu: NavItem[] = [
        { id: 'dashboard', icon: <DashboardIcon />, label: 'Panel' },
        { id: 'calendar', icon: <CalendarIcon />, label: 'Agenda' },
        { id: 'clients', icon: <ClientsIcon />, label: 'Fichas' },
        { id: 'medical_history', icon: <MedicalIcon />, label: 'Historial' },
        { id: 'consent', icon: <CheckIcon />, label: 'Firmas' },
        { id: 'inventory', icon: <InventoryIcon />, label: 'Stock' },
    ];

    const clientMenu: NavItem[] = [
        { id: 'home', icon: <HomeIcon />, label: 'Inicio' },
        { id: 'flash', icon: <FlashIcon />, label: 'Diseños' },
        { id: 'calendar', icon: <CalendarIcon />, label: 'Citas' },
        { id: 'consent', icon: <CheckIcon />, label: 'Firmas', badge: pendingConsentsCount > 0 },
        { id: 'aftercare', icon: <CareIcon />, label: 'Cuidado' },
        { id: 'profile', icon: <UserIcon />, label: 'Perfil' },
    ];

    const currentMenu = user.role === 'admin' ? adminMenu : clientMenu;

    const renderFeature = () => {
        switch (activeFeature) {
            case 'home': return (
                <div className="space-y-8 animate-fade-in">
                    <DailyTips />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FeatureCard 
                            title="Firmas" 
                            desc={pendingConsentsCount > 0 ? `Tienes ${pendingConsentsCount} pendientes` : "Ver Contratos"} 
                            icon={<CheckIcon />} 
                            onClick={() => setActiveFeature('consent')} 
                            highlight={pendingConsentsCount > 0} 
                        />
                        <FeatureCard title="Mi Presupuesto" desc="Calculadora PRO" icon={<BudgetIcon />} onClick={() => setActiveFeature('budget')} />
                        <FeatureCard title="Generador IA" desc="Diseños únicos" icon={<DashboardIcon />} onClick={() => setActiveFeature('generate')} />
                        <FeatureCard title="Probador AR" desc="Vista en piel" icon={<DashboardIcon />} onClick={() => setActiveFeature('preview')} />
                        <FeatureCard title="Asistente PRO" desc="Consultas técnicas" icon={<ConsultantIcon />} onClick={() => setActiveFeature('consultant')} />
                        <FeatureCard title="Testimonios" desc="Reseñas Studio" icon={<UserIcon />} onClick={() => setActiveFeature('reviews')} />
                    </div>
                </div>
            );
            case 'dashboard': return <AdminDashboard />;
            case 'inventory': return <InventoryManager />;
            case 'calendar': return <Calendar adminMode={user.role === 'admin'} />;
            case 'clients': return <Clients />;
            case 'medical_history': return <MedicalHistoryManager />;
            case 'flash': return <FlashCatalog isAdmin={user.role === 'admin'} />;
            case 'budget': return <BudgetCalculator />;
            case 'aftercare': return <AftercareGuide />;
            case 'consent': return <ConsentForms userRole={user.role} username={user.username} />;
            case 'generate': return <DesignGenerator />;
            case 'preview': return <TattooPreviewer />;
            case 'outline': return <OutlineCreator />;
            case 'consultant': return <AiConsultant />;
            case 'profile': return <ClientProfile username={user.username} />;
            case 'reviews': return <Reviews username={user.username} isAdmin={user.role === 'admin'} />;
            default: return <div className="text-center py-20 opacity-50 uppercase tracking-widest text-[10px]">Cargando...</div>;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-black text-white selection:bg-brand">
            <header className="sticky top-0 bg-black/95 backdrop-blur-2xl z-40 p-3 border-b border-white/5 safe-top">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="flex-1"></div>
                    <img src="https://tritex.com.mx/Bribiesca%20logo%2002.jpg" alt="Logo" className="h-12 w-auto object-contain mx-auto transition-transform active:scale-95" />
                    <div className="flex-1 flex justify-end">
                        <button onClick={() => setUser(null)} className="p-2 rounded-full text-brand hover:scale-110 active:opacity-50">
                            <UserRoleIcon />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-grow p-4 md:p-10 overflow-x-hidden" style={{ paddingBottom: `${navBarHeight + 40}px` }}>
                <div className="max-w-4xl mx-auto">{renderFeature()}</div>
            </main>

            <nav ref={navBarRef} className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-3xl border-t border-white/5 z-50 safe-bottom">
                <div className={`max-w-4xl mx-auto grid grid-cols-6 h-20`}>
                    {currentMenu.map(item => (
                        <button key={item.id} onClick={() => setActiveFeature(item.id as Feature)} 
                                className={`flex flex-col items-center justify-center space-y-1.5 transition-all relative ${activeFeature === item.id ? 'text-brand scale-110' : 'text-gray-600 hover:text-gray-400'}`}>
                            <div className="w-5 h-5">{item.icon}</div>
                            <span className="text-[8px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                            {item.badge && (
                                <div className="absolute top-3 right-1/4 w-2 h-2 bg-brand rounded-full animate-ping shadow-[0_0_10px_#E815DC]"></div>
                            )}
                            {item.badge && (
                                <div className="absolute top-3 right-1/4 w-2 h-2 bg-brand rounded-full border border-white/20"></div>
                            )}
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
};

const FeatureCard = ({ title, desc, icon, onClick, highlight = false }: any) => (
    <button onClick={onClick} className={`flex items-center p-8 border rounded-[2.5rem] text-left hover:border-brand/40 transition-all group shadow-2xl active:scale-[0.98] ${highlight ? 'bg-brand/5 border-brand/40 shadow-[0_0_30px_rgba(232,21,220,0.1)]' : 'bg-[#050505] border-white/5'}`}>
        <div className={`p-5 rounded-3xl mr-5 border group-hover:bg-brand/[0.07] ${highlight ? 'bg-brand/10 text-brand border-brand/20' : 'bg-brand/[0.03] text-brand border-white/5'}`}>{icon}</div>
        <div>
            <h4 className="font-black text-xs uppercase tracking-widest text-white mb-1 italic">{title}</h4>
            <p className={`text-[9px] uppercase tracking-widest font-bold opacity-60 ${highlight ? 'text-brand animate-pulse' : 'text-gray-600'}`}>{desc}</p>
        </div>
    </button>
);

export default App;
