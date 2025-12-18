/**
 * Feature Extraction Engine for StampIt
 * Provides advanced image processing for stamp creation
 */

export type ExtractionMode = 'edge' | 'silhouette' | 'outline' | 'detailed' | 'anime' | 'human' | 'animal';

export interface ExtractionOptions {
    mode: ExtractionMode;
    threshold: number;
    contrast: number;
    brightness: number;
    blur: number;
    invert: boolean;
    edgeStrength: number;
}

export const DEFAULT_EXTRACTION_OPTIONS: ExtractionOptions = {
    mode: 'edge',
    threshold: 128,
    contrast: 1.2,
    brightness: 0,
    blur: 1,
    invert: false,
    edgeStrength: 1.0,
};

/**
 * Apply Gaussian blur to image data
 */
function gaussianBlur(imageData: ImageData, radius: number): ImageData {
    const pixels = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(pixels);

    if (radius <= 0) return imageData;

    const kernel = createGaussianKernel(radius);
    const kernelSize = kernel.length;
    const halfKernel = Math.floor(kernelSize / 2);

    // Horizontal pass
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0, weightSum = 0;

            for (let k = 0; k < kernelSize; k++) {
                const px = Math.min(width - 1, Math.max(0, x + k - halfKernel));
                const idx = (y * width + px) * 4;
                const weight = kernel[k];
                r += pixels[idx] * weight;
                g += pixels[idx + 1] * weight;
                b += pixels[idx + 2] * weight;
                a += pixels[idx + 3] * weight;
                weightSum += weight;
            }

            const outIdx = (y * width + x) * 4;
            output[outIdx] = r / weightSum;
            output[outIdx + 1] = g / weightSum;
            output[outIdx + 2] = b / weightSum;
            output[outIdx + 3] = a / weightSum;
        }
    }

    // Vertical pass
    const temp = new Uint8ClampedArray(output);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0, weightSum = 0;

            for (let k = 0; k < kernelSize; k++) {
                const py = Math.min(height - 1, Math.max(0, y + k - halfKernel));
                const idx = (py * width + x) * 4;
                const weight = kernel[k];
                r += temp[idx] * weight;
                g += temp[idx + 1] * weight;
                b += temp[idx + 2] * weight;
                a += temp[idx + 3] * weight;
                weightSum += weight;
            }

            const outIdx = (y * width + x) * 4;
            output[outIdx] = r / weightSum;
            output[outIdx + 1] = g / weightSum;
            output[outIdx + 2] = b / weightSum;
            output[outIdx + 3] = a / weightSum;
        }
    }

    return new ImageData(output, width, height);
}

function createGaussianKernel(radius: number): number[] {
    const size = Math.ceil(radius) * 2 + 1;
    const sigma = radius / 3;
    const kernel: number[] = [];

    for (let i = 0; i < size; i++) {
        const x = i - Math.floor(size / 2);
        kernel.push(Math.exp(-(x * x) / (2 * sigma * sigma)));
    }

    return kernel;
}

/**
 * Apply Sobel edge detection
 */
function sobelEdgeDetection(imageData: ImageData, strength: number = 1.0): ImageData {
    const pixels = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(pixels.length);

    // Sobel kernels
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let gx = 0, gy = 0;

            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const idx = ((y + ky) * width + (x + kx)) * 4;
                    const gray = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
                    const kernelIdx = (ky + 1) * 3 + (kx + 1);
                    gx += gray * sobelX[kernelIdx];
                    gy += gray * sobelY[kernelIdx];
                }
            }

            const magnitude = Math.min(255, Math.sqrt(gx * gx + gy * gy) * strength);
            const outIdx = (y * width + x) * 4;
            output[outIdx] = magnitude;
            output[outIdx + 1] = magnitude;
            output[outIdx + 2] = magnitude;
            output[outIdx + 3] = 255;
        }
    }

    return new ImageData(output, width, height);
}

/**
 * Difference of Gaussians (DoG) for Anime/Clean Line art style
 * Subtracts a blurred version from a less blurred version to isolate edges
 */
function differenceOfGaussians(imageData: ImageData, sigma1: number, sigma2: number, sensitivity: number): ImageData {
    // We simulate sigma scaling with blur radius. 
    // radius ~= 3 * sigma
    // For anime, we want sharp lines, so small difference.

    const blur1 = gaussianBlur(imageData, sigma1); // Base structure
    const blur2 = gaussianBlur(imageData, sigma2); // Background structure

    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(imageData.data.length);

    const p1 = blur1.data;
    const p2 = blur2.data;

    for (let i = 0; i < p1.length; i += 4) {
        // Convert to grayscale for comparison
        const g1 = (p1[i] + p1[i + 1] + p1[i + 2]) / 3;
        const g2 = (p2[i] + p2[i + 1] + p2[i + 2]) / 3;

        // The difference logic: D = G1 - G2
        // Edges appear where the difference is significant.
        // We normalize it to 0-255 using sensitivity (tau). 
        // For "pencil sketch" look: if (G1 - G2) > 0 -> darker

        let diff = (g1 - g2) * sensitivity;

        // Invert log: We want edges (high diff) to be BLACK (0) and background to be WHITE (255)
        // Usually DoG returns edges as non-zero.
        // Let's implement a "tanh" style activation for clean lines

        let value = 255 - diff; // Edges (pos diff) become darker

        // Clean up noise
        if (value > 240) value = 255;
        if (value < 0) value = 0;

        output[i] = value;
        output[i + 1] = value;
        output[i + 2] = value;
        output[i + 3] = 255;
    }

    return new ImageData(output, width, height);
}

/**
 * Color-Difference Edge Detection
 * Computes gradient on all 3 channels to catch color boundaries (Human/Animal)
 */
function colorEdgeDetection(imageData: ImageData, strength: number): ImageData {
    const pixels = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(pixels.length);

    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let rx = 0, ry = 0;
            let gx = 0, gy = 0;
            let bx = 0, by = 0;

            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const idx = ((y + ky) * width + (x + kx)) * 4;
                    const kernelIdx = (ky + 1) * 3 + (kx + 1);

                    const r = pixels[idx];
                    const g = pixels[idx + 1];
                    const b = pixels[idx + 2];

                    const sx = sobelX[kernelIdx];
                    const sy = sobelY[kernelIdx];

                    rx += r * sx; ry += r * sy;
                    gx += g * sx; gy += g * sy;
                    bx += b * sx; by += b * sy;
                }
            }

            // Vector gradient magnitude
            const magR = rx * rx + ry * ry;
            const magG = gx * gx + gy * gy;
            const magB = bx * bx + by * by;

            // Euclidean distance in RGB space
            const rawMag = Math.sqrt(magR + magG + magB);

            // Non-linear boost: Power < 1 boosts shadows/weak edges
            // We use power 0.6 to significantly lift subtle details (texture)
            // Then scale back up.
            const boostedMag = Math.pow(rawMag, 0.6) * (strength * 4);

            const magnitude = Math.min(255, boostedMag);

            output[((y * width) + x) * 4] = magnitude;
            output[((y * width) + x) * 4 + 1] = magnitude;
            output[((y * width) + x) * 4 + 2] = magnitude;
            output[((y * width) + x) * 4 + 3] = 255;
        }
    }

    return new ImageData(output, width, height);
}

/**
 * Convert to grayscale
 */
function toGrayscale(imageData: ImageData): ImageData {
    const pixels = imageData.data;
    const output = new Uint8ClampedArray(pixels);

    for (let i = 0; i < pixels.length; i += 4) {
        const gray = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
        output[i] = gray;
        output[i + 1] = gray;
        output[i + 2] = gray;
    }

    return new ImageData(output, imageData.width, imageData.height);
}

/**
 * Apply contrast and brightness
 */
function adjustContrastBrightness(
    imageData: ImageData,
    contrast: number,
    brightness: number
): ImageData {
    const pixels = imageData.data;
    const output = new Uint8ClampedArray(pixels);
    const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));

    for (let i = 0; i < pixels.length; i += 4) {
        for (let c = 0; c < 3; c++) {
            let value = pixels[i + c];
            value = factor * (value - 128) + 128 + brightness;
            output[i + c] = Math.max(0, Math.min(255, value));
        }
    }

    return new ImageData(output, imageData.width, imageData.height);
}

/**
 * Apply threshold to create binary image
 */
function applyThreshold(
    imageData: ImageData,
    threshold: number,
    invert: boolean
): ImageData {
    const pixels = imageData.data;
    const output = new Uint8ClampedArray(pixels);

    for (let i = 0; i < pixels.length; i += 4) {
        const gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        const isInk = invert ? gray > threshold : gray < threshold;

        if (isInk) {
            output[i] = 0;
            output[i + 1] = 0;
            output[i + 2] = 0;
            output[i + 3] = 255;
        } else {
            output[i + 3] = 0; // Transparent
        }
    }

    return new ImageData(output, imageData.width, imageData.height);
}

/**
 * Extract silhouette (filled shape)
 */
function extractSilhouette(
    imageData: ImageData,
    threshold: number,
    invert: boolean
): ImageData {
    // Simple threshold for silhouette
    return applyThreshold(imageData, threshold, invert);
}

/**
 * Extract outline only
 */
function extractOutline(imageData: ImageData, threshold: number): ImageData {
    const pixels = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(pixels.length);

    // First, create binary image
    const binary: boolean[][] = [];
    for (let y = 0; y < height; y++) {
        binary[y] = [];
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const gray = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
            binary[y][x] = gray < threshold;
        }
    }

    // Find outline pixels (pixels that are on but have at least one off neighbor)
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;

            if (binary[y][x]) {
                const hasOffNeighbor =
                    !binary[y - 1][x] || !binary[y + 1][x] ||
                    !binary[y][x - 1] || !binary[y][x + 1];

                if (hasOffNeighbor) {
                    output[idx] = 0;
                    output[idx + 1] = 0;
                    output[idx + 2] = 0;
                    output[idx + 3] = 255;
                } else {
                    output[idx + 3] = 0;
                }
            } else {
                output[idx + 3] = 0;
            }
        }
    }

    return new ImageData(output, width, height);
}

/**
 * Extract detailed features (preserved gradients)
 */
function extractDetailed(
    imageData: ImageData,
    threshold: number,
    contrast: number
): ImageData {
    const pixels = imageData.data;
    const output = new Uint8ClampedArray(pixels);

    for (let i = 0; i < pixels.length; i += 4) {
        const gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;

        // Apply non-linear mapping to preserve details
        let value = gray;
        value = Math.pow(value / 255, 1 / contrast) * 255;

        if (value < threshold) {
            // Preserve gradient for darker areas
            const alpha = Math.max(0, (threshold - value) / threshold);
            output[i] = 0;
            output[i + 1] = 0;
            output[i + 2] = 0;
            output[i + 3] = Math.floor(alpha * 255);
        } else {
            output[i + 3] = 0;
        }
    }

    return new ImageData(output, imageData.width, imageData.height);
}

/**
 * Main feature extraction function
 */
export function extractFeatures(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    options: ExtractionOptions
): ImageData {
    let imageData = ctx.getImageData(0, 0, width, height);

    // Common Step: Apply blur if needed (DoG does its own blurring)
    if (options.mode !== 'anime' && options.blur > 0) {
        imageData = gaussianBlur(imageData, options.blur);
    }

    // Common Step: Adjust contrast and brightness (DoG might not need this explicitly first)
    if (options.mode !== 'anime' && (options.contrast !== 1 || options.brightness !== 0)) {
        imageData = adjustContrastBrightness(imageData, options.contrast, options.brightness);
    }

    // Step 3: Apply extraction mode
    switch (options.mode) {
        case 'anime':
            // Difference of Gaussians - Detailed Tuning
            // Reduced base sigma for finer lines
            // Tighter sigma ratio (1.4 vs 1.6) for sharper edge localization
            const sigma1 = Math.max(0.4, options.blur * 0.4 + 0.4);
            const sigma2 = sigma1 * 1.4;
            // Increased sensitivity multiplier (12x vs 8x)
            imageData = differenceOfGaussians(imageData, sigma1, sigma2, 12 * options.edgeStrength);
            imageData = applyThreshold(imageData, 255 - options.threshold, true);
            break;

        case 'human':
            // Color Edge Detection - High Sensitivity
            // Use sqrt compression in the helper, passing unmodified strength here
            imageData = colorEdgeDetection(imageData, options.edgeStrength);
            imageData = applyThreshold(imageData, options.threshold, true);
            break;

        case 'animal':
            // Color Edge + Texture boost
            // Higher strength input
            imageData = colorEdgeDetection(imageData, options.edgeStrength * 2.0);
            imageData = applyThreshold(imageData, options.threshold, true);
            break;

        case 'edge':
            imageData = toGrayscale(imageData);
            imageData = sobelEdgeDetection(imageData, options.edgeStrength);
            imageData = applyThreshold(imageData, 255 - options.threshold, options.invert);
            break;

        case 'silhouette':
            imageData = toGrayscale(imageData);
            imageData = extractSilhouette(imageData, options.threshold, options.invert);
            break;

        case 'outline':
            imageData = toGrayscale(imageData);
            imageData = extractOutline(imageData, options.threshold);
            break;

        case 'detailed':
            imageData = toGrayscale(imageData);
            // Lower threshold effectiveness to let more details in
            imageData = extractDetailed(imageData, options.threshold, options.contrast);
            break;
    }

    return imageData;
}

/**
 * Apply ink color to extracted features
 */
export function applyInkColor(imageData: ImageData, hexColor: string): ImageData {
    const pixels = imageData.data;
    const output = new Uint8ClampedArray(pixels);

    // Parse hex color
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
    const r = result ? parseInt(result[1], 16) : 0;
    const g = result ? parseInt(result[2], 16) : 0;
    const b = result ? parseInt(result[3], 16) : 0;

    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] > 0) {
            // Use alpha as intensity
            const intensity = pixels[i + 3] / 255;
            output[i] = r;
            output[i + 1] = g;
            output[i + 2] = b;
            output[i + 3] = Math.floor(intensity * 255);
        }
    }

    return new ImageData(output, imageData.width, imageData.height);
}
