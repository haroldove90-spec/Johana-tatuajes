import React, { useState, useMemo, useEffect, useRef } from 'react';
import { tattooGallery as defaultGallery, Tattoo, TattooStyle, TATTOO_STYLES } from '../data/gallery';
import { FacebookIcon, InstagramIcon, TikTokIcon, CloseIcon, UploadIcon, VideoPlayIcon } from './Icons';

const GALLERY_STORAGE_KEY = 'johanaTattooGallery';
type SortOption = 'newest' | 'oldest';

export const Gallery: React.FC = () => {
    // --- State ---
    const [galleryItems, setGalleryItems] = useState<Tattoo[]>([]);
    const [filterStyle, setFilterStyle] = useState<TattooStyle | 'all'>('all');
    const [sortOrder, setSortOrder] = useState<SortOption>('newest');
    const [selectedItem, setSelectedItem] = useState<Tattoo | null>(null);

    // State for adding new media
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newMediaSrc, setNewMediaSrc] = useState<string | null>(null);
    const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
    const [newMediaData, setNewMediaData] = useState({
        alt: '',
        description: '',
        style: 'Realismo' as TattooStyle,
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Persistence ---
    useEffect(() => {
        try {
            const savedGallery = localStorage.getItem(GALLERY_STORAGE_KEY);
            if (savedGallery) {
                setGalleryItems(JSON.parse(savedGallery));
            } else {
                setGalleryItems(defaultGallery);
            }
        } catch (err)
 {
            console.error("Error loading gallery from localStorage:", err);
            setGalleryItems(defaultGallery);
        }
    }, []);

    useEffect(() => {
        if (galleryItems.length > 0) {
            localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(galleryItems));
        }
    }, [galleryItems]);

    const filteredAndSortedGallery = useMemo(() => {
        let items = [...galleryItems];
        if (filterStyle !== 'all') {
            items = items.filter(item => item.style === filterStyle);
        }
        items.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
        return items;
    }, [filterStyle, sortOrder, galleryItems]);
    
    // --- Handlers for adding media ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewMediaType(file.type.startsWith('video') ? 'video' : 'image');
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewMediaSrc(reader.result as string);
                setIsAddModalOpen(true);
            };
            reader.readAsDataURL(file);
        }
        if (e.target) e.target.value = '';
    };

    const handleSaveNewMedia = (e: React.FormEvent) => {
        e.preventDefault();
        const { alt, description, style } = newMediaData;
        
        if (!newMediaSrc || !alt.trim()) {
            alert("El título es obligatorio.");
            return;
        }

        const newTattoo: Tattoo = {
            id: Date.now(),
            src: newMediaSrc,
            alt,
            description,
            style,
            date: new Date().toISOString().split('T')[0],
            type: newMediaType,
        };

        setGalleryItems(prevItems => [newTattoo, ...prevItems]);
        closeAddModal();
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setNewMediaSrc(null);
        setNewMediaData({ alt: '', description: '', style: TATTOO_STYLES[0] || 'Realismo' });
    };
    
    // --- Share Logic ---
    const handleShare = (platform: 'facebook' | 'instagram' | 'tiktok') => {
        const text = encodeURIComponent(`¡Mira este increíble trabajo de Johana Tatuajes! - ${selectedItem?.alt}`);
        if (selectedItem?.type === 'video') {
             alert("Para compartir videos, guárdalo en tu dispositivo y súbelo desde la app. ¡Gracias!");
             return;
        }
        let shareUrl: string;
        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(selectedItem?.src || '')}&quote=${text}`;
                window.open(shareUrl, '_blank', 'noopener,noreferrer');
                break;
            default:
                alert("Para compartir, guarda la imagen y súbela desde la app. ¡Gracias!");
        }
    };
    
    // --- Render ---
    return (
        <div className="space-y-6">
            {/* Add Media Controls */}
            <div className="flex justify-center">
                 <button onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow">
                    <UploadIcon /><span className="ml-2 font-semibold">Subir Archivo</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="sr-only" />
            </div>

            {/* Filters */}
            <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    {/* Style Filter */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Filtrar por Estilo:</label>
                        <div className="flex flex-wrap gap-2">
                             <button
                                onClick={() => setFilterStyle('all')}
                                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                                    filterStyle === 'all'
                                        ? 'bg-purple-600 text-white shadow'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                Todos
                            </button>
                            {TATTOO_STYLES.map(style => (
                                <button
                                    key={style}
                                    onClick={() => setFilterStyle(style)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                                        filterStyle === style
                                            ? 'bg-purple-600 text-white shadow'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Sort */}
                    <div className="flex-shrink-0">
                         <label htmlFor="sort-order" className="block text-sm font-medium mb-2">Ordenar por:</label>
                         <select
                            id="sort-order"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as SortOption)}
                            className="w-full md:w-auto bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="newest">Más recientes</option>
                            <option value="oldest">Más antiguos</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredAndSortedGallery.map((item) => (
                    <div key={item.id} className="group relative aspect-square cursor-pointer bg-black rounded-lg" onClick={() => setSelectedItem(item)}>
                        {item.type === 'video' ? (
                            <video src={item.src} className="w-full h-full object-cover rounded-lg" autoPlay loop muted playsInline />
                        ) : (
                            <img src={item.src} alt={item.alt} className="w-full h-full object-cover rounded-lg"/>
                        )}
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            {item.type === 'video' && <VideoPlayIcon />}
                            <p className="text-white text-center p-2 text-sm">{item.alt}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            {filteredAndSortedGallery.length === 0 && (
                <p className="text-center text-gray-500 py-8">No se encontraron trabajos. ¡Añade tu primero!</p>
            )}

            {/* Add Media Modal */}
            {isAddModalOpen && newMediaSrc && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={closeAddModal}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full relative p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Añadir Nuevo Trabajo</h3>
                        {newMediaType === 'image' ? (
                            <img src={newMediaSrc} alt="Previsualización" className="w-full h-auto max-h-64 object-contain rounded-md bg-gray-200 dark:bg-gray-900"/>
                        ):(
                            <video src={newMediaSrc} controls className="w-full h-auto max-h-64 object-contain rounded-md bg-gray-200 dark:bg-gray-900"/>
                        )}
                        <form onSubmit={handleSaveNewMedia} className="space-y-4">
                            <input type="text" value={newMediaData.alt} onChange={e => setNewMediaData({...newMediaData, alt: e.target.value})} placeholder="Título del trabajo" required className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"/>
                            <textarea value={newMediaData.description} onChange={e => setNewMediaData({...newMediaData, description: e.target.value})} placeholder="Descripción (opcional)" rows={2} className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"></textarea>
                            <select value={newMediaData.style} onChange={e => setNewMediaData({...newMediaData, style: e.target.value as TattooStyle})} className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                {TATTOO_STYLES.map(style => <option key={style} value={style}>{style}</option>)}
                            </select>
                            <div className="flex justify-end gap-4 pt-2">
                                <button type="button" onClick={closeAddModal} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md font-semibold">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-md font-semibold hover:bg-purple-700">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Selected Item Modal */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedItem(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full flex flex-col md:flex-row relative" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setSelectedItem(null)} className="absolute -top-10 right-0 text-white hover:text-gray-300">
                           <CloseIcon className="w-8 h-8"/>
                        </button>
                        <div className="w-full md:w-1/2 bg-black flex items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-t-none">
                            {selectedItem.type === 'video' ? (
                                <video src={selectedItem.src} controls autoPlay className="w-full h-auto object-cover md:h-full"/>
                            ) : (
                                <img src={selectedItem.src} alt={selectedItem.alt} className="w-full h-auto object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"/>
                            )}
                        </div>
                        <div className="p-6 flex flex-col">
                            <h3 className="text-2xl font-bold mb-2">{selectedItem.alt}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1"><span className="font-semibold">Estilo:</span> {selectedItem.style}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4"><span className="font-semibold">Fecha:</span> {new Date(selectedItem.date).toLocaleDateString()}</p>
                            <p className="flex-grow text-gray-700 dark:text-gray-300">{selectedItem.description}</p>
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm font-semibold mb-3 text-center">Compartir en:</p>
                                <div className="flex justify-center gap-4">
                                    <button onClick={() => handleShare('facebook')} className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors"><FacebookIcon/></button>
                                    <button onClick={() => handleShare('instagram')} className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center hover:opacity-90 transition-opacity"><InstagramIcon/></button>
                                    <button onClick={() => handleShare('tiktok')} className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors"><TikTokIcon/></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};