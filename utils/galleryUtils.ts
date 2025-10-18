import type { Tattoo, TattooStyle } from '../data/gallery';

const GALLERY_STORAGE_KEY = 'johanaTattooGallery';

/**
 * Saves a new tattoo item to the gallery in localStorage.
 * @param itemDetails - The details of the tattoo to save.
 */
export const saveToGallery = (itemDetails: {
    src: string;
    alt: string;
    description: string;
    style: TattooStyle;
    type: 'image' | 'video';
}) => {
    // Basic validation
    if (!itemDetails.src || !itemDetails.alt.trim()) {
        console.error("Save to gallery failed: src and alt are required.");
        throw new Error("El título y la imagen son obligatorios para guardar.");
    }

    const newTattoo: Tattoo = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        ...itemDetails,
    };

    try {
        const savedGalleryRaw = localStorage.getItem(GALLERY_STORAGE_KEY);
        // Initialize with empty array if no data is found
        const savedGallery: Tattoo[] = savedGalleryRaw ? JSON.parse(savedGalleryRaw) : [];
        
        const updatedGallery = [newTattoo, ...savedGallery];
        
        localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updatedGallery));
    } catch (err) {
        console.error("Error saving to gallery in localStorage:", err);
        throw new Error("No se pudo guardar la imagen en la galería.");
    }
};
