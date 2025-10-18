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

export const tattooGallery: Tattoo[] = [
    {
        id: 1,
        src: 'https://picsum.photos/id/101/500/500',
        alt: 'Lobo Geométrico',
        description: 'Un diseño intrincado de un lobo compuesto por formas geométricas y líneas limpias, simbolizando la inteligencia y la libertad.',
        style: 'Geométrico',
        date: '2024-05-15',
        type: 'image',
    },
    {
        id: 2,
        src: 'https://picsum.photos/id/102/500/500',
        alt: 'Retrato de Tigre',
        description: 'Un retrato fotorrealista de un tigre, capturando la intensidad de su mirada y la textura de su pelaje. Un símbolo de poder y coraje.',
        style: 'Realismo',
        date: '2024-04-20',
        type: 'image',
    },
    {
        id: 3,
        src: 'https://picsum.photos/id/103/500/500',
        alt: 'Rosa Tradicional',
        description: 'Una rosa clásica en estilo tradicional americano, con colores sólidos, líneas gruesas y un diseño atemporal que representa el amor y la belleza.',
        style: 'Tradicional',
        date: '2023-11-30',
        type: 'image',
    },
    {
        id: 4,
        src: 'https://picsum.photos/id/104/500/500',
        alt: 'Manga de Mandalas',
        description: 'Una composición de mandalas y patrones sagrados que fluyen a lo largo del brazo, representando el equilibrio y la espiritualidad.',
        style: 'Blackwork',
        date: '2024-06-01',
        type: 'image',
    },
    {
        id: 5,
        src: 'https://picsum.photos/id/106/500/500',
        alt: 'Brújula y Mapa',
        description: 'Una brújula detallada sobre un fondo de mapa antiguo, perfecta para los amantes de los viajes y la aventura.',
        style: 'Realismo',
        date: '2024-02-10',
        type: 'image',
    },
    {
        id: 6,
        src: 'https://picsum.photos/id/108/500/500',
        alt: 'Daga y Corazón',
        description: 'Un diseño icónico del estilo tradicional: una daga atravesando un corazón, simbolizando la traición pero también la valentía.',
        style: 'Tradicional',
        date: '2024-03-25',
        type: 'image',
    },
    {
        id: 7,
        src: 'https://picsum.photos/id/111/500/500',
        alt: 'Patrones Tribales',
        description: 'Diseños tribales audaces que se adaptan a la forma del músculo, utilizando tinta negra sólida para crear un impacto visual fuerte.',
        style: 'Blackwork',
        date: '2023-09-05',
        type: 'image',
    },
    {
        id: 8,
        src: 'https://picsum.photos/id/117/500/500',
        alt: 'Constelación de Orión',
        description: 'Una representación minimalista de la constelación de Orión, conectada con líneas finas y puntos precisos. Ideal para un primer tatuaje.',
        style: 'Geométrico',
        date: '2024-05-28',
        type: 'image',
    },
];