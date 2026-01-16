
import React, { useState } from 'react';
import { UserRole } from '../types';
import { Spinner, EyeIcon, EyeOffIcon, CloseIcon } from './Icons';
import { supabase } from '../utils/supabase';

interface AuthProps {
    onLogin: (username: string, role: UserRole) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [authMode, setAuthMode] = useState<'login' | 'register' | 'recover'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Form States
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const resetMessages = () => {
        setError('');
        setSuccessMessage('');
    };

    const handleRecoverPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        resetMessages();

        try {
            // Verificar si el correo existe
            const { data: user, error: fetchError } = await supabase
                .from('clients')
                .select('id, username')
                .eq('contact', email.toLowerCase().trim())
                .single();

            if (fetchError || !user) {
                throw new Error('CORREO NO REGISTRADO EN EL SISTEMA');
            }

            const { error: updateError } = await supabase
                .from('clients')
                .update({ password: newPassword })
                .eq('id', user.id);

            if (updateError) throw new Error('ERROR AL ACTUALIZAR CONTRASEÑA');

            setSuccessMessage('¡CONTRASEÑA ACTUALIZADA CON ÉXITO!');
            setTimeout(() => {
                setAuthMode('login');
                resetMessages();
            }, 2000);

        } catch (err: any) {
            setError(err.message.toUpperCase());
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (authMode === 'recover') return handleRecoverPassword(e);
        
        setLoading(true);
        resetMessages();

        const cleanUsername = username.toLowerCase().trim();
        const cleanEmail = email.toLowerCase().trim();

        try {
            if (authMode === 'login') {
                // Credenciales de Administrador Especiales
                const adminCreds = [
                    { u: 'johana_admin', p: '123_admin' },
                    { u: 'harold', p: '123_admin' }
                ];

                const specialAdmin = adminCreds.find(c => c.u === cleanUsername && c.p === password);
                
                if (specialAdmin) {
                    onLogin(specialAdmin.u, 'admin');
                    return;
                }

                // Validación normal vía Base de Datos
                const { data: user, error: fetchError } = await supabase
                    .from('clients')
                    .select('username, password, role')
                    .eq('username', cleanUsername)
                    .single();

                if (fetchError || !user) {
                    throw new Error('USUARIO NO ENCONTRADO');
                }

                if (user.password !== password) {
                    throw new Error('CONTRASEÑA INCORRECTA');
                }

                onLogin(user.username, user.role as UserRole);
            } else {
                if (!fullName || !username || !email || !whatsapp || !password) {
                    throw new Error('TODOS LOS CAMPOS SON OBLIGATORIOS');
                }

                const { error: dbError } = await supabase
                    .from('clients')
                    .insert([{
                        name: fullName.trim(),
                        username: cleanUsername,
                        contact: cleanEmail,
                        whatsapp: whatsapp.trim(),
                        password: password,
                        role: 'client',
                        notes: `Registro vía App`
                    }]);

                if (dbError) {
                    if (dbError.code === '23505') throw new Error('EL USUARIO O CORREO YA EXISTEN');
                    throw new Error(dbError.message);
                }
                
                onLogin(cleanUsername, 'client');
            }
        } catch (err: any) {
            setError(err.message.toUpperCase());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/10 blur-[120px] rounded-full pointer-events-none"></div>
            
            <div className="w-full max-w-md space-y-8 animate-fade-in py-10 px-6 relative z-10">
                <div className="text-center mb-10">
                    <img src="https://tritex.com.mx/Bribiesca%20logo%2002.jpg" alt="Logo" className="relative h-28 w-auto mx-auto mb-6 rounded-3xl shadow-2xl border border-white/10" />
                    <h2 className="text-3xl font-black text-white uppercase italic leading-none">
                        {authMode === 'login' ? 'Acceso' : authMode === 'register' ? 'Registro' : 'Recuperar'}
                    </h2>
                    {authMode === 'recover' && (
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-4">Introduce tu correo para restablecer</p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {authMode === 'recover' ? (
                        <>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="CORREO REGISTRADO" 
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold" 
                                required 
                            />
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                    placeholder="NUEVA CONTRASEÑA" 
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold pr-14" 
                                    required 
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-brand transition-colors">
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {authMode === 'register' && (
                                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="NOMBRE COMPLETO" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold" required />
                            )}
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="USUARIO" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold" required />
                            {authMode === 'register' && (
                                <>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="CORREO" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold" required />
                                    <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WHATSAPP" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold" required />
                                </>
                            )}
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="CONTRASEÑA" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold pr-14" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-brand transition-colors">
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </>
                    )}

                    {error && <p className="text-brand text-[10px] font-black uppercase text-center tracking-widest bg-brand/10 p-3 rounded-xl animate-shake">{error}</p>}
                    {successMessage && <p className="text-green-500 text-[10px] font-black uppercase text-center tracking-widest bg-green-500/10 p-3 rounded-xl">{successMessage}</p>}

                    <button type="submit" disabled={loading} className="w-full py-5 bg-brand text-white text-[11px] font-black rounded-2xl shadow-xl active:scale-95 transition-all disabled:opacity-50">
                        {loading ? <Spinner /> : (authMode === 'login' ? 'ENTRAR' : authMode === 'register' ? 'REGISTRARME' : 'ACTUALIZAR ACCESO')}
                    </button>
                </form>

                <div className="flex flex-col gap-4 text-center">
                    {authMode === 'login' && (
                        <button 
                            onClick={() => { setAuthMode('recover'); resetMessages(); }} 
                            className="text-[9px] font-black text-brand/60 hover:text-brand uppercase tracking-widest transition-colors"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    )}
                    
                    <button onClick={() => { 
                        setAuthMode(authMode === 'login' ? 'register' : 'login'); 
                        resetMessages(); 
                    }} className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors">
                        {authMode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>

                    {authMode === 'recover' && (
                        <button onClick={() => { setAuthMode('login'); resetMessages(); }} className="text-[9px] font-black text-gray-500 hover:text-white uppercase tracking-widest">
                            Volver al inicio
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
