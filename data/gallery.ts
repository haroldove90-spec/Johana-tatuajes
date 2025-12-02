export type TattooStyle = 'Realismo' | 'Geométrico' | 'Blackwork' | 'Tradicional';

export const TATTOO_STYLES: TattooStyle[] = ['Realismo', 'Geométrico', 'Blackwork', 'Tradicional'];

export interface Tattoo {
    id: number;
    src: string;
    alt: string;
    description: string;
    style: TattooStyle;
    date: string; // YYYY-MM-DD
    type: 'image' | 'video';
}

export const tattooGallery: Tattoo[] = [];
