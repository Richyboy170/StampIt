/**
 * Stamp Style Presets for StampIt
 * Defines various stamp style configurations
 */

export interface StampStyle {
    id: string;
    name: string;
    description: string;

    // Extraction settings
    extractionMode: 'edge' | 'silhouette' | 'outline' | 'detailed';
    threshold: number;
    contrast: number;
    edgeStrength: number;

    // Visual settings
    inkColor: string;
    borderStyle: 'none' | 'single' | 'double' | 'dotted' | 'decorative';
    borderWidth: number;
    shape: 'circle' | 'square' | 'rounded' | 'oval' | 'badge';

    // 3D Effect settings
    depth3D: number;         // 0-100 intensity
    shadowAngle: number;     // 0-360 degrees
    shadowDistance: number;  // pixels
    shadowBlur: number;      // pixels
    shadowColor: string;

    // Emboss/Engrave
    embossStrength: number;  // 0-100
    innerShadow: boolean;

    // Textures
    rubberTexture: boolean;
    paperTexture: boolean;
    grunge: number;          // 0-100 amount

    // Ink effects
    inkBleed: number;        // 0-100 amount
    inkOpacity: number;      // 0-100
}



export const STAMP_STYLES: StampStyle[] = [
    {
        id: '3d-realistic',
        name: '3D Realistic',
        description: 'Ultra-realistic stamp with deep shadows and paper impression',
        extractionMode: 'silhouette',
        threshold: 140,
        contrast: 1.3,
        edgeStrength: 1.2,
        inkColor: '#b91c1c',
        borderStyle: 'double',
        borderWidth: 4,
        shape: 'circle',
        depth3D: 80,
        shadowAngle: 135,
        shadowDistance: 8,
        shadowBlur: 15,
        shadowColor: 'rgba(0,0,0,0.4)',
        embossStrength: 70,
        innerShadow: true,
        rubberTexture: true,
        paperTexture: true,
        grunge: 30,
        inkBleed: 15,
        inkOpacity: 95,
    },
    {
        id: 'classic-rubber',
        name: 'Classic Rubber',
        description: 'Traditional red rubber stamp with natural ink spread',
        extractionMode: 'silhouette',
        threshold: 128,
        contrast: 1.2,
        edgeStrength: 1.0,
        inkColor: '#dc2626',
        borderStyle: 'single',
        borderWidth: 3,
        shape: 'rounded',
        depth3D: 40,
        shadowAngle: 145,
        shadowDistance: 4,
        shadowBlur: 8,
        shadowColor: 'rgba(0,0,0,0.25)',
        embossStrength: 30,
        innerShadow: false,
        rubberTexture: true,
        paperTexture: false,
        grunge: 45,
        inkBleed: 35,
        inkOpacity: 85,
    },
    {
        id: 'vintage-seal',
        name: 'Vintage Seal',
        description: 'Elegant wax seal appearance with decorative border',
        extractionMode: 'detailed',
        threshold: 150,
        contrast: 1.4,
        edgeStrength: 0.8,
        inkColor: '#78350f',
        borderStyle: 'decorative',
        borderWidth: 6,
        shape: 'circle',
        depth3D: 90,
        shadowAngle: 120,
        shadowDistance: 10,
        shadowBlur: 20,
        shadowColor: 'rgba(0,0,0,0.5)',
        embossStrength: 85,
        innerShadow: true,
        rubberTexture: false,
        paperTexture: true,
        grunge: 20,
        inkBleed: 5,
        inkOpacity: 100,
    },
    {
        id: 'modern-minimal',
        name: 'Modern Minimal',
        description: 'Clean, flat design with subtle shadow',
        extractionMode: 'edge',
        threshold: 120,
        contrast: 1.5,
        edgeStrength: 1.5,
        inkColor: '#1e293b',
        borderStyle: 'single',
        borderWidth: 2,
        shape: 'square',
        depth3D: 20,
        shadowAngle: 135,
        shadowDistance: 3,
        shadowBlur: 5,
        shadowColor: 'rgba(0,0,0,0.15)',
        embossStrength: 10,
        innerShadow: false,
        rubberTexture: false,
        paperTexture: false,
        grunge: 0,
        inkBleed: 0,
        inkOpacity: 100,
    },
    {
        id: 'ink-bleed',
        name: 'Ink Bleed',
        description: 'Organic ink spread effect with worn edges',
        extractionMode: 'silhouette',
        threshold: 135,
        contrast: 1.1,
        edgeStrength: 0.7,
        inkColor: '#1e3a8a',
        borderStyle: 'none',
        borderWidth: 0,
        shape: 'rounded',
        depth3D: 30,
        shadowAngle: 140,
        shadowDistance: 3,
        shadowBlur: 6,
        shadowColor: 'rgba(0,0,0,0.2)',
        embossStrength: 15,
        innerShadow: false,
        rubberTexture: true,
        paperTexture: true,
        grunge: 60,
        inkBleed: 70,
        inkOpacity: 75,
    },
    {
        id: 'embossed',
        name: 'Embossed',
        description: 'Raised, pressed effect with dramatic lighting',
        extractionMode: 'outline',
        threshold: 130,
        contrast: 1.3,
        edgeStrength: 1.0,
        inkColor: '#ffffff',
        borderStyle: 'double',
        borderWidth: 4,
        shape: 'circle',
        depth3D: 100,
        shadowAngle: 315,
        shadowDistance: 2,
        shadowBlur: 3,
        shadowColor: 'rgba(0,0,0,0.6)',
        embossStrength: 100,
        innerShadow: true,
        rubberTexture: false,
        paperTexture: true,
        grunge: 10,
        inkBleed: 0,
        inkOpacity: 60,
    },
    {
        id: 'neon-glow',
        name: 'Neon Glow',
        description: 'Vibrant glowing effect with color bleed',
        extractionMode: 'edge',
        threshold: 100,
        contrast: 1.6,
        edgeStrength: 2.0,
        inkColor: '#f472b6',
        borderStyle: 'single',
        borderWidth: 2,
        shape: 'rounded',
        depth3D: 50,
        shadowAngle: 0,
        shadowDistance: 0,
        shadowBlur: 25,
        shadowColor: 'rgba(244,114,182,0.8)',
        embossStrength: 0,
        innerShadow: false,
        rubberTexture: false,
        paperTexture: false,
        grunge: 0,
        inkBleed: 40,
        inkOpacity: 100,
    },
    {
        id: 'official-stamp',
        name: 'Official Stamp',
        description: 'Government/corporate style with clean lines',
        extractionMode: 'silhouette',
        threshold: 140,
        contrast: 1.4,
        edgeStrength: 1.0,
        inkColor: '#14532d',
        borderStyle: 'double',
        borderWidth: 5,
        shape: 'oval',
        depth3D: 45,
        shadowAngle: 135,
        shadowDistance: 5,
        shadowBlur: 10,
        shadowColor: 'rgba(0,0,0,0.3)',
        embossStrength: 40,
        innerShadow: true,
        rubberTexture: false,
        paperTexture: true,
        grunge: 15,
        inkBleed: 10,
        inkOpacity: 90,
    },
];

// Smart Auto-Recommendations for new images
export const RECOMMENDED_PRESETS: StampStyle[] = [
    {
        ...STAMP_STYLES.find(s => s.id === '3d-realistic')!,
        id: 'rec-bold',
        name: 'Bold Ink',
        description: 'Strong, high-contrast look',
        threshold: 160,
        extractionMode: 'silhouette'
    },
    {
        ...STAMP_STYLES.find(s => s.id === 'classic-rubber')!,
        id: 'rec-sketch',
        name: 'Fine Sketch',
        description: 'Detailed line work',
        extractionMode: 'anime', // Anime mode is great for sketches
        threshold: 128,
        blur: 1, // Ensure blur is set for anime
        edgeStrength: 1.5
    } as StampStyle,
    {
        ...STAMP_STYLES.find(s => s.id === 'vintage-seal')!,
        id: 'rec-vintage',
        name: 'Vintage',
        description: 'Aged, textured appearance',
        grunge: 60,
        paperTexture: true
    },
    {
        ...STAMP_STYLES.find(s => s.id === 'modern-minimal')!,
        id: 'rec-clean',
        name: 'Clean Edge',
        description: 'Minimalist outline',
        extractionMode: 'outline',
        threshold: 110
    }
];

/**
 * Get a style by ID
 */
export function getStyleById(id: string): StampStyle | undefined {
    return STAMP_STYLES.find(s => s.id === id);
}

/**
 * Get the default 3D realistic style
 */
export function getDefault3DStyle(): StampStyle {
    return STAMP_STYLES[0];
}

/**
 * Create custom style from base
 */
export function createCustomStyle(
    baseStyle: StampStyle,
    overrides: Partial<StampStyle>
): StampStyle {
    return {
        ...baseStyle,
        ...overrides,
        id: 'custom',
        name: 'Custom',
    };
}
