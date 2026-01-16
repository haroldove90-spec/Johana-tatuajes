
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Review } from '../types';
import { Spinner, CheckIcon } from './Icons';

export const Reviews: React.FC<{ username: string, isAdmin?: boolean }> = ({ username, isAdmin }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isWriting, setIsWriting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ rating: 5, comment: '' });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        const { data } = await supabase.from('reviews').select('*').order('date', { ascending: false });
        if (data) setReviews(data);
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('reviews').insert([{
            client_name: username,
            rating: formData.rating,
            comment: formData.comment,
            date: new Date().toISOString()
        }]);

        if (!error) {
            setIsWriting(false);
            setFormData({ rating: 5, comment: '' });
            fetchReviews();
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Spinner /></div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Testimonios</h2>
                    <p className="text-[10px] text-brand font-black uppercase tracking-widest mt-1">Experiencia Bribiesca</p>
                </div>
                {!isAdmin && !isWriting && (
                    <button onClick={() => setIsWriting(true)} className="bg-brand text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">Dejar Reseña</button>
                )}
            </header>

            {isWriting && (
                <form onSubmit={handleSave} className="bg-[#050505] p-8 rounded-[2.5rem] border border-brand/30 shadow-2xl space-y-6 animate-fade-in">
                    <div className="text-center">
                        <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4">Califica tu experiencia</label>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button 
                                    key={star} 
                                    type="button" 
                                    onClick={() => setFormData({ ...formData, rating: star })}
                                    className={`text-2xl transition-all ${formData.rating >= star ? 'scale-125 grayscale-0' : 'grayscale opacity-30'}`}
                                >
                                    ⭐
                                </button>
                            ))}
                        </div>
                    </div>
                    <textarea 
                        value={formData.comment} 
                        onChange={e => setFormData({ ...formData, comment: e.target.value })} 
                        placeholder="CUÉNTANOS TU EXPERIENCIA..."
                        className="w-full bg-black p-6 rounded-2xl border border-white/5 text-sm font-medium h-32"
                        required
                    ></textarea>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setIsWriting(false)} className="flex-1 py-4 bg-white/5 rounded-2xl text-[9px] font-black uppercase">Cancelar</button>
                        <button type="submit" className="flex-1 py-4 bg-brand text-white rounded-2xl text-[9px] font-black uppercase shadow-xl">Publicar</button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {reviews.map(review => (
                    <div key={review.id} className="p-6 bg-[#050505] border border-white/5 rounded-3xl shadow-2xl group transition-all hover:border-brand/20">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-black text-white text-sm uppercase tracking-tight">{review.client_name}</h4>
                                <p className="text-[8px] text-gray-600 font-bold uppercase">{new Date(review.date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-1">
                                {Array.from({ length: review.rating }).map((_, i) => <span key={i} className="text-[10px]">⭐</span>)}
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed italic">"{review.comment}"</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
