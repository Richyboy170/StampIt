'use client'

import { useState, useRef, useEffect, useCallback } from "react"
import { Upload, Download, Settings, RefreshCw, Save, Palette, Layers, Sparkles, ChevronDown, Eye, Maximize, Crop, Zap } from "lucide-react"
import { useSession } from "next-auth/react"
import {
    extractFeatures,
    applyInkColor,
    ExtractionOptions,
    ExtractionMode,
    DEFAULT_EXTRACTION_OPTIONS
} from "@/lib/featureExtractor"
import { STAMP_STYLES, StampStyle, getDefault3DStyle } from "@/lib/stampStyles"

interface StampEditorProps {
    userCoins: number
    userId: string
}

type ShapeType = 'circle' | 'square' | 'rounded' | 'oval' | 'badge' | 'fit';
type BorderStyleType = 'none' | 'single' | 'double' | 'dotted' | 'decorative';

export function StampEditor({ userCoins, userId }: StampEditorProps) {
    const { update } = useSession()

    // Image state
    const [image, setImage] = useState<string | null>(null)
    const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null)
    const [imgDimensions, setImgDimensions] = useState({ w: 0, h: 0 })

    // Style preset
    const [activeStyle, setActiveStyle] = useState<StampStyle>(getDefault3DStyle())
    const [showStylePicker, setShowStylePicker] = useState(false)

    // Extraction settings
    const [extractionMode, setExtractionMode] = useState<ExtractionMode>('silhouette')
    const [threshold, setThreshold] = useState(140)
    const [contrast, setContrast] = useState(1.3)
    const [edgeStrength, setEdgeStrength] = useState(1.2)
    const [blur, setBlur] = useState(1)
    const [inverted, setInverted] = useState(false)

    // Visual settings
    const [inkColor, setInkColor] = useState("#b91c1c")
    const [shape, setShape] = useState<ShapeType>('circle')
    const [borderStyle, setBorderStyle] = useState<BorderStyleType>('double')
    const [borderWidth, setBorderWidth] = useState(4)

    // 3D Effect settings
    const [depth3D, setDepth3D] = useState(80)
    const [shadowAngle, setShadowAngle] = useState(135)
    const [shadowDistance, setShadowDistance] = useState(8)
    const [shadowBlur, setShadowBlur] = useState(15)
    const [embossStrength, setEmbossStrength] = useState(70)
    const [innerShadow, setInnerShadow] = useState(true)

    // Texture settings
    const [rubberTexture, setRubberTexture] = useState(true)
    const [paperTexture, setPaperTexture] = useState(true)
    const [grunge, setGrunge] = useState(30)
    const [inkBleed, setInkBleed] = useState(15)
    const [inkOpacity, setInkOpacity] = useState(95)

    // Export settings
    const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpeg' | 'webp' | 'svg'>('png')
    const [exportSize, setExportSize] = useState<'1x' | '2x' | '4x'>('1x')
    const [transparentBg, setTransparentBg] = useState(true)

    // UI state
    const [activeTab, setActiveTab] = useState<'extract' | 'style' | '3d'>('extract')
    const [saving, setSaving] = useState(false)

    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Color palette
    const colorPalette = [
        '#b91c1c', '#dc2626', '#ea580c', '#d97706', '#ca8a04',
        '#65a30d', '#16a34a', '#059669', '#0d9488', '#0891b2',
        '#0284c7', '#2563eb', '#4f46e5', '#7c3aed', '#9333ea',
        '#c026d3', '#db2777', '#e11d48', '#1e293b', '#000000',
    ]

    // Apply style preset
    const applyStylePreset = useCallback((style: StampStyle) => {
        setActiveStyle(style)
        setExtractionMode(style.extractionMode)
        setThreshold(style.threshold)
        setContrast(style.contrast)
        setEdgeStrength(style.edgeStrength)
        setInkColor(style.inkColor)
        setBorderStyle(style.borderStyle)
        setBorderWidth(style.borderWidth)
        setShape(style.shape)
        setDepth3D(style.depth3D)
        setShadowAngle(style.shadowAngle)
        setShadowDistance(style.shadowDistance)
        setShadowBlur(style.shadowBlur)
        setEmbossStrength(style.embossStrength)
        setInnerShadow(style.innerShadow)
        setRubberTexture(style.rubberTexture)
        setPaperTexture(style.paperTexture)
        setGrunge(style.grunge)
        setInkBleed(style.inkBleed)
        setInkOpacity(style.inkOpacity)
        setShowStylePicker(false)
    }, [])

    // Auto-Recommend Settings
    const autoRecommend = () => {
        // Simple logic for now: pick a random robust preset
        const robustPresets = STAMP_STYLES.filter(s => s.extractionMode === 'silhouette' || s.extractionMode === 'detailed');
        const random = robustPresets[Math.floor(Math.random() * robustPresets.length)];
        applyStylePreset(random);
    }

    // Process image with feature extraction
    const processImage = useCallback(() => {
        if (!canvasRef.current || !image) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const img = new Image()
        img.src = image
        img.onload = () => {
            // Resize logic
            const MAX_SIZE = 800
            let w = img.width
            let h = img.height
            if (w > h) {
                if (w > MAX_SIZE) { h *= MAX_SIZE / w; w = MAX_SIZE }
            } else {
                if (h > MAX_SIZE) { w *= MAX_SIZE / h; h = MAX_SIZE }
            }

            setImgDimensions({ w, h })

            canvas.width = w
            canvas.height = h

            // Draw original
            ctx.drawImage(img, 0, 0, w, h)

            // Store original for reference
            setOriginalImageData(ctx.getImageData(0, 0, w, h))

            // Apply feature extraction
            const options: ExtractionOptions = {
                mode: extractionMode,
                threshold,
                contrast,
                brightness: 0,
                blur,
                invert: inverted,
                edgeStrength,
            }

            let extractedData = extractFeatures(ctx, w, h, options)

            // Apply ink color
            extractedData = applyInkColor(extractedData, inkColor)

            // Apply ink opacity
            const pixels = extractedData.data
            for (let i = 3; i < pixels.length; i += 4) {
                pixels[i] = Math.floor(pixels[i] * (inkOpacity / 100))
            }

            ctx.putImageData(extractedData, 0, 0)
        }
    }, [image, extractionMode, threshold, contrast, blur, inverted, edgeStrength, inkColor, inkOpacity])

    useEffect(() => {
        processImage()
    }, [processImage])

    // File handler
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (ev) => setImage(ev.target?.result as string)
            reader.readAsDataURL(file)
        }
    }

    // Calculate 3D shadow CSS
    const get3DShadowStyle = () => {
        const angleRad = (shadowAngle * Math.PI) / 180
        const x = Math.cos(angleRad) * shadowDistance * (depth3D / 100)
        const y = Math.sin(angleRad) * shadowDistance * (depth3D / 100)
        const blur = shadowBlur * (depth3D / 100)

        const shadows = []

        // Main drop shadow
        shadows.push(`${x}px ${y}px ${blur}px rgba(0,0,0,${0.3 * (depth3D / 100)})`)

        // Secondary softer shadow
        shadows.push(`${x * 1.5}px ${y * 1.5}px ${blur * 2}px rgba(0,0,0,${0.15 * (depth3D / 100)})`)

        // Inner shadow for emboss effect
        if (innerShadow && embossStrength > 0) {
            const embossIntensity = embossStrength / 100
            shadows.push(`inset ${-x * 0.3}px ${-y * 0.3}px ${blur * 0.5}px rgba(255,255,255,${0.2 * embossIntensity})`)
            shadows.push(`inset ${x * 0.3}px ${y * 0.3}px ${blur * 0.5}px rgba(0,0,0,${0.4 * embossIntensity})`)
        }

        return shadows.join(', ')
    }

    // Get shape classes
    const getShapeStyle = () => {
        const base: React.CSSProperties = {
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        }

        // Fixed dimensions for standard shapes
        const standardSize = { width: '380px', height: '380px' }

        switch (shape) {
            case 'fit':
                return {
                    ...base,
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '100%',
                    padding: '24px', // Padding becomes the "border" space
                }
            case 'circle':
                return { ...base, ...standardSize, borderRadius: '50%' }
            case 'square':
                return { ...base, ...standardSize, borderRadius: '4px' } // Slight rounding
            case 'rounded':
                return { ...base, ...standardSize, borderRadius: '40px' }
            case 'oval':
                return { ...base, width: '420px', height: '320px', borderRadius: '50%' }
            case 'badge':
                return { ...base, ...standardSize, borderRadius: '12px 12px 50% 50%' }
            default:
                return { ...base, ...standardSize }
        }
    }

    // Get border style
    const getBorderStyle = (): React.CSSProperties => {
        if (borderStyle === 'none') return {}

        const borderColor = inkColor

        switch (borderStyle) {
            case 'single':
                return { border: `${borderWidth}px solid ${borderColor}` }
            case 'double':
                return {
                    border: `${borderWidth}px double ${borderColor}`,
                    outline: `${borderWidth}px solid ${borderColor}`,
                    outlineOffset: `${borderWidth}px`
                }
            case 'dotted':
                return { border: `${borderWidth}px dotted ${borderColor}` }
            case 'decorative':
                return {
                    border: `${borderWidth}px dashed ${borderColor}`,
                    outline: `${borderWidth * 0.5}px solid ${borderColor}`,
                    outlineOffset: `${borderWidth * 1.5}px`
                }
            default:
                return {}
        }
    }

    // Download handler with coin check
    const handleDownload = async () => {
        if (!canvasRef.current) return
        if (userCoins < 5) {
            alert("You need at least 5 coins to download. Watch an ad or redeem a code!")
            return
        }

        // Deduct coins
        const { deductCoins } = await import('@/app/actions/economy')
        const result = await deductCoins(5)
        if (!result.success) {
            alert(result.error || "Failed to process. Try again.")
            return
        }
        update()

        // Create download
        const sizeMultiplier = exportSize === '1x' ? 1 : exportSize === '2x' ? 2 : 4
        const canvas = canvasRef.current

        // For higher resolution, create a scaled canvas
        const exportCanvas = document.createElement('canvas')
        exportCanvas.width = canvas.width * sizeMultiplier
        exportCanvas.height = canvas.height * sizeMultiplier
        const exportCtx = exportCanvas.getContext('2d')

        if (exportCtx) {
            if (!transparentBg && downloadFormat !== 'png') {
                exportCtx.fillStyle = '#ffffff'
                exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
            }
            exportCtx.scale(sizeMultiplier, sizeMultiplier)
            exportCtx.drawImage(canvas, 0, 0)
        }

        const link = document.createElement('a')
        const mimeType = downloadFormat === 'svg' ? 'image/svg+xml' :
            `image/${downloadFormat === 'jpeg' ? 'jpeg' : downloadFormat}`

        link.download = `stampit-${Date.now()}.${downloadFormat}`
        link.href = exportCanvas.toDataURL(mimeType, 0.95)
        link.click()
    }

    // Save handler
    const handleSave = async () => {
        if (!canvasRef.current) return
        setSaving(true)

        const { saveStamp } = await import('@/app/actions/stamps')
        const dataUrl = canvasRef.current.toDataURL()
        const config = {
            extractionMode, threshold, contrast, edgeStrength, blur, inverted,
            inkColor, shape, borderStyle, borderWidth,
            depth3D, shadowAngle, shadowDistance, shadowBlur, embossStrength, innerShadow,
            rubberTexture, paperTexture, grunge, inkBleed, inkOpacity,
            styleId: activeStyle.id
        }

        const res = await saveStamp(dataUrl, config)
        if (res.success) {
            alert("Stamp saved to gallery!")
        } else {
            alert("Failed to save.")
        }
        setSaving(false)
    }

    // Reset all settings
    const handleReset = () => {
        setImage(null)
        applyStylePreset(getDefault3DStyle())
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[800px]">
            {/* Controls Panel - Glassmorphic Dark */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-4">

                {/* Smart Recommendations */}
                <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                            <h3 className="font-bold text-white">Smart Recommendations</h3>
                        </div>
                    </div>

                    {!image ? (
                        <div className="text-center py-6 text-slate-500 text-sm">
                            Upload an image to see AI-powered suggestions.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {/* We import RECOMMENDED_PRESETS dynamically or use a local version if not available yet on client load */}
                            {/* Ideally we use the ones we just defined in lib/stampStyles */}
                            {['Bold Ink', 'Fine Sketch', 'Vintage', 'Clean Edge'].map((name, i) => {
                                // Mapping UI to presets roughly by index or name
                                // real app would map directly from the imported constant
                                const icons = [Zap, Palette, Layers, Crop];
                                const Icon = icons[i];

                                return (
                                    <button
                                        key={name}
                                        onClick={() => {
                                            // In a real implementation we would import { RECOMMENDED_PRESETS } 
                                            // For now, let's trigger the 'autoRecommend' or specific style logic
                                            // Since we can't easily import the *new* constant inside this component without a full file refresh sometimes,
                                            // we will implement a helper here or rely on the updated file.
                                            // Assuming RECOMMENDED_PRESETS is available:
                                            const { RECOMMENDED_PRESETS } = require('@/lib/stampStyles');
                                            if (RECOMMENDED_PRESETS && RECOMMENDED_PRESETS[i]) {
                                                applyStylePreset(RECOMMENDED_PRESETS[i]);
                                            }
                                        }}
                                        className="bg-black/40 hover:bg-indigo-600/20 border border-white/5 hover:border-indigo-500/50 p-3 rounded-xl transition-all group text-left"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
                                            <span className="font-bold text-slate-200 text-sm">{name}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 group-hover:text-slate-400">
                                            {i === 0 ? 'High Contrast' : i === 1 ? 'Detailed Lines' : i === 2 ? 'Textured Look' : 'Minimalist'}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* Advanced Presets Toggle */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <button
                            onClick={() => setShowStylePicker(!showStylePicker)}
                            className="w-full flex items-center justify-between text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider"
                        >
                            <span>All Presets</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${showStylePicker ? 'rotate-180' : ''}`} />
                        </button>

                        {showStylePicker && (
                            <div className="mt-3 grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                {STAMP_STYLES.map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={() => applyStylePreset(style)}
                                        className={`p-2 rounded-lg text-left transition-all ${activeStyle.id === style.id
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white/5 hover:bg-white/10 text-slate-300'
                                            } text-xs font-medium`}
                                    >
                                        {style.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Controls - Glassmorphic */}
                <div className="glass-card p-5 rounded-2xl">
                    <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                        <h2 className="font-bold text-white flex items-center gap-2">
                            <Settings className="w-5 h-5 text-indigo-400" />
                            Studio Config
                        </h2>
                        <button onClick={handleReset} className="text-slate-500 hover:text-white text-xs uppercase font-bold tracking-wider">
                            Reset
                        </button>
                    </div>

                    {!image ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all group bg-black/20"
                        >
                            <div className="bg-white/5 p-4 rounded-full mb-4 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all">
                                <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-400" />
                            </div>
                            <span className="text-slate-200 font-medium text-lg">Upload Source</span>
                            <span className="text-slate-500 text-sm mt-1">JPG, PNG, WebP accepted</span>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </div>
                    ) : (
                        <>
                            {/* Tab Navigation */}
                            <div className="flex gap-1 mb-6 bg-black/40 p-1.5 rounded-xl border border-white/5">
                                {[
                                    { id: 'extract', label: 'Extract', icon: Eye },
                                    { id: 'style', label: 'Style', icon: Palette },
                                    { id: '3d', label: 'Effects', icon: Layers },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === tab.id
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <tab.icon className="w-3.5 h-3.5" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {/* Extraction Tab */}
                                {activeTab === 'extract' && (
                                    <div className="space-y-5">
                                        {/* Extraction Mode */}
                                        <div>
                                            <span className="text-slate-400 text-xs font-bold uppercase mb-3 block">Extraction Algorithm</span>
                                            <div className="grid grid-cols-2 gap-2">
                                                {(['edge', 'silhouette', 'outline', 'detailed'] as ExtractionMode[]).map((mode) => (
                                                    <button
                                                        key={mode}
                                                        onClick={() => setExtractionMode(mode)}
                                                        className={`py-3 px-3 rounded-lg text-xs font-bold uppercase transition-all border ${extractionMode === mode
                                                            ? 'bg-white text-black border-white'
                                                            : 'bg-black/40 text-slate-400 border-white/5 hover:border-white/20'
                                                            }`}
                                                    >
                                                        {mode}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Sliders */}
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span className="text-slate-400">Threshold Intensity</span>
                                                    <span className="text-indigo-400">{threshold}</span>
                                                </div>
                                                <input
                                                    type="range" min="0" max="255" value={threshold}
                                                    onChange={(e) => setThreshold(parseInt(e.target.value))}
                                                    className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span className="text-slate-400">Contrast Boost</span>
                                                    <span className="text-indigo-400">{contrast.toFixed(1)}</span>
                                                </div>
                                                <input
                                                    type="range" min="0.5" max="2.5" step="0.1" value={contrast}
                                                    onChange={(e) => setContrast(parseFloat(e.target.value))}
                                                    className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span className="text-slate-400">Smoothing / Blur</span>
                                                    <span className="text-indigo-400">{blur}</span>
                                                </div>
                                                <input
                                                    type="range" min="0" max="5" value={blur}
                                                    onChange={(e) => setBlur(parseInt(e.target.value))}
                                                    className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        <label className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 cursor-pointer hover:border-white/20 transition-colors">
                                            <span className="text-slate-300 text-sm font-medium">Invert Colors</span>
                                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${inverted ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${inverted ? 'translate-x-4' : ''}`} />
                                            </div>
                                            <input type="checkbox" checked={inverted} onChange={(e) => setInverted(e.target.checked)} className="hidden" />
                                        </label>
                                    </div>
                                )}

                                {/* Style Tab */}
                                {activeTab === 'style' && (
                                    <div className="space-y-5">
                                        {/* Ink Color */}
                                        <div>
                                            <span className="text-slate-400 text-xs font-bold uppercase mb-3 block">Ink Pigment</span>
                                            <div className="grid grid-cols-5 gap-2 mb-3">
                                                {colorPalette.slice(0, 10).map(c => (
                                                    <button
                                                        key={c}
                                                        onClick={() => setInkColor(c)}
                                                        className={`w-full aspect-square rounded-lg border-2 transition-transform ${inkColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                                                            }`}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                            </div>
                                            <input
                                                type="color"
                                                value={inkColor}
                                                onChange={(e) => setInkColor(e.target.value)}
                                                className="w-full h-10 rounded-lg cursor-pointer bg-white/5 border border-white/10"
                                            />
                                        </div>

                                        {/* Shape */}
                                        <div>
                                            <span className="text-slate-400 text-xs font-bold uppercase mb-3 block">Stamp Shape</span>
                                            <div className="grid grid-cols-3 gap-2">
                                                {(['fit', 'circle', 'square', 'rounded', 'oval', 'badge'] as ShapeType[]).map((s) => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setShape(s)}
                                                        className={`py-2 px-1 rounded-lg text-xs font-medium capitalize transition-colors flex flex-col items-center gap-1 ${shape === s
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-black/40 text-slate-400 hover:bg-black/60'
                                                            }`}
                                                    >
                                                        {s === 'fit' ? <Maximize className="w-4 h-4" /> : <Crop className="w-4 h-4" />}
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Border Style */}
                                        <div>
                                            <span className="text-slate-400 text-xs font-bold uppercase mb-3 block">Border Style</span>
                                            <div className="grid grid-cols-3 gap-2">
                                                {(['none', 'single', 'double', 'dotted', 'decorative'] as BorderStyleType[]).map((b) => (
                                                    <button
                                                        key={b}
                                                        onClick={() => setBorderStyle(b)}
                                                        className={`py-2 px-2 rounded-lg text-xs font-medium capitalize transition-colors ${borderStyle === b
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-black/40 text-slate-400 hover:bg-black/60'
                                                            }`}
                                                    >
                                                        {b}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-slate-400">Opacity</span>
                                                <span className="text-indigo-400">{inkOpacity}%</span>
                                            </div>
                                            <input
                                                type="range" min="10" max="100" value={inkOpacity}
                                                onChange={(e) => setInkOpacity(parseInt(e.target.value))}
                                                className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                                            />
                                        </div>

                                    </div>
                                )}

                                {/* 3D Effects Tab */}
                                {activeTab === '3d' && (
                                    <div className="space-y-5">
                                        {/* 3D Depth */}
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span className="text-slate-400">Depth Intensity</span>
                                                    <span className="text-indigo-400">{depth3D}%</span>
                                                </div>
                                                <input
                                                    type="range" min="0" max="100" value={depth3D}
                                                    onChange={(e) => setDepth3D(parseInt(e.target.value))}
                                                    className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span className="text-slate-400">Lighting Angle</span>
                                                    <span className="text-indigo-400">{shadowAngle}°</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="range" min="0" max="360" value={shadowAngle}
                                                        onChange={(e) => setShadowAngle(parseInt(e.target.value))}
                                                        className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                                                    />
                                                    <div
                                                        className="w-6 h-6 rounded-full border border-white/20 relative"
                                                        style={{ transform: `rotate(${shadowAngle}deg)` }}
                                                    >
                                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span className="text-slate-400">Emboss Level</span>
                                                    <span className="text-indigo-400">{embossStrength}%</span>
                                                </div>
                                                <input
                                                    type="range" min="0" max="100" value={embossStrength}
                                                    onChange={(e) => setEmbossStrength(parseInt(e.target.value))}
                                                    className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        {/* Toggles */}
                                        <div className="space-y-2 bg-black/20 p-3 rounded-xl border border-white/5">
                                            {[
                                                { label: 'Inner Shadow', state: innerShadow, setter: setInnerShadow },
                                                { label: 'Rubber Texture', state: rubberTexture, setter: setRubberTexture },
                                                { label: 'Paper Texture', state: paperTexture, setter: setPaperTexture }
                                            ].map((item, i) => (
                                                <label key={i} className="flex items-center justify-between cursor-pointer py-1">
                                                    <span className="text-slate-300 text-sm">{item.label}</span>
                                                    <div className={`w-8 h-5 rounded-full p-0.5 transition-colors ${item.state ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${item.state ? 'translate-x-3' : ''}`} />
                                                    </div>
                                                    <input type="checkbox" checked={item.state} onChange={(e) => item.setter(e.target.checked)} className="hidden" />
                                                </label>
                                            ))}
                                        </div>

                                        {/* Grunge */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-slate-400">Grunge / Distort</span>
                                                <span className="text-indigo-400">{grunge}%</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="100" value={grunge}
                                                onChange={(e) => setGrunge(parseInt(e.target.value))}
                                                className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Change Image Button */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full mt-4 py-3 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-xl transition-colors bg-white/5 hover:bg-white/10"
                                >
                                    Change Source Image
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Preview Stage */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
                {/* Canvas Stage */}
                <div className="bg-[#121212] rounded-3xl relative overflow-hidden flex items-center justify-center flex-1 min-h-[600px] border border-white/5 shadow-2xl">
                    {/* Paper Texture Background */}
                    {paperTexture && (
                        <div className="absolute inset-0 stamp-paper opacity-20 pointer-events-none mix-blend-overlay" />
                    )}
                    <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />

                    {image ? (
                        <div
                            className="relative transition-all duration-300 flex items-center justify-center overflow-hidden isolate"
                            style={{
                                ...getShapeStyle(),
                                ...getBorderStyle(),
                                borderColor: inkColor,
                                color: inkColor,
                                boxShadow: get3DShadowStyle(),
                                backgroundColor: transparentBg ? 'transparent' : 'rgba(255,255,255,0.9)',
                            }}
                        >
                            {/* The Ink Layer */}
                            <canvas
                                ref={canvasRef}
                                className="max-w-full max-h-full object-contain"
                                style={{
                                    filter: `
                                        drop-shadow(0px 1px 0px rgba(255,255,255,0.5)) 
                                        drop-shadow(0px 1px 2px rgba(0,0,0,0.3))
                                        ${inkBleed > 0 ? `blur(${inkBleed * 0.02}px)` : ''}
                                    `,
                                    mixBlendMode: 'normal', // Changed from multiply to normal for better visibility on dark
                                }}
                            />

                            {/* Grunge Overlay (Clipped to container) */}
                            {grunge > 0 && (
                                <div
                                    className="absolute inset-0 pointer-events-none mix-blend-overlay z-10"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                                        opacity: grunge / 100,
                                    }}
                                />
                            )}

                            {/* Rubber Texture Overlay (Clipped to container) */}
                            {rubberTexture && (
                                <div
                                    className="absolute inset-0 pointer-events-none opacity-20 z-10"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h1v1H0V0zm2 2h1v1H2V2z' fill='%23000' fill-opacity='0.1'/%3E%3C/svg%3E")`,
                                    }}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="text-slate-600 flex flex-col items-center">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                                <Upload className="w-10 h-10 opacity-30" />
                            </div>
                            <p className="text-2xl font-bold text-slate-500">Stamp Canvas</p>
                            <p className="text-sm mt-2 text-slate-700">Upload an image to render preview</p>
                        </div>
                    )}
                </div>

                {/* Actions Bar - Bottom */}
                {image && (
                    <div className="glass-card p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
                                {['png', 'jpeg', 'webp', 'svg'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setDownloadFormat(f as any)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-colors ${downloadFormat === f ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>

                            <label className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer ml-2">
                                <input type="checkbox" checked={transparentBg} onChange={(e) => setTransparentBg(e.target.checked)} className="rounded border-slate-700 bg-slate-800 text-indigo-500" />
                                <span className="text-sm text-slate-300">Transparent Bg</span>
                            </label>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Size Selector */}
                            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                                {['1x', '2x', '4x'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setExportSize(s as any)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${exportSize === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save to Gallery'}
                            </button>

                            <button
                                onClick={handleDownload}
                                className="bg-white text-black px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                            >
                                <Download className="w-4 h-4" />
                                Download Stamp
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
