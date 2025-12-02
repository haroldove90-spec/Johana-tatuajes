import { supabase } from './supabase';
import type { Tattoo, TattooStyle } from '../data/gallery';
import { dataURLtoFile } from './fileUtils';

/**
 * Saves a new tattoo item to the gallery in Supabase.
 * @param itemDetails - The details of the tattoo to save.
 */
export const saveToGallery = async (itemDetails: {
    src: string; // This is a data URL
    alt: string;
    description: string;
    style: TattooStyle;
    type: 'image' | 'video';
}) => {
    if (!itemDetails.src || !itemDetails.alt.trim()) {
        console.error("Save to gallery failed: src and alt are required.");
        throw new Error("El título y la imagen son obligatorios para guardar.");
    }

    // 1. Upload file to Supabase Storage
    const file = dataURLtoFile(itemDetails.src, `${Date.now()}-${itemDetails.alt.replace(/\s+/g, '-')}`);
    const filePath = `public/${file.name}`;
    const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error('No se pudo subir el archivo a la galería.');
    }

    // 2. Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

    if (!publicUrl) {
        throw new Error('No se pudo obtener la URL pública del archivo.');
    }

    // 3. Save metadata to 'gallery' table
    const newTattoo: Omit<Tattoo, 'id'> = {
        src: publicUrl,
        alt: itemDetails.alt,
        description: itemDetails.description,
        style: itemDetails.style,
        date: new Date().toISOString().split('T')[0],
        type: itemDetails.type,
    };

    const { error: insertError } = await supabase.from('gallery').insert([newTattoo]);
    
    if (insertError) {
        console.error('Error saving gallery item to database:', insertError);
        // Attempt to delete the orphaned file from storage
        await supabase.storage.from('gallery').remove([filePath]);
        throw new Error('No se pudo guardar la información del tatuaje en la base de datos.');
    }
};
