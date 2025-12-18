'use client'

import { useState, useRef } from "react"
import { Upload, Download, Move, RotateCw, Maximize, Image as ImageIcon } from "lucide-react"

interface Stamp {
    id: string
    imageData: string
    createdAt: Date
    config: any
}

interface PlacedStamp {
    id: string
    stampImage: string
    xPercent: number  // Position as percentage (0-100)
    yPercent: number  // Position as percentage (0-100)
    rotation: number
    scale: number
}

interface DocumentStamperProps {
    userStamps: Stamp[]
}

export function DocumentStamper({ userStamps }: DocumentStamperProps) {
    const [docImage, setDocImage] = useState<string | null>(null)
    const [selectedStamp, setSelectedStamp] = useState<string | null>(null)
    const [placedStamps, setPlacedStamps] = useState<PlacedStamp[]>([])

    // Preview transform state (for the floating preview)
    const [scale, setScale] = useState(1)
    const [rotation, setRotation] = useState(0)

    // Animation state
    const [isStamping, setIsStamping] = useState(false)
    const [stampPosition, setStampPosition] = useState<{ x: number, y: number } | null>(null)

    // UI state
    const [hasDismissedInstructions, setHasDismissedInstructions] = useState(false)

    // Mouse tracking for preview
    const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null)

    // Canvas refs
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const docInputRef = useRef<HTMLInputElement>(null)

    // Handle document upload
    const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (ev) => {
                setDocImage(ev.target?.result as string)
                setPlacedStamps([]) // Clear all stamps when new document is uploaded
            }
            reader.readAsDataURL(file)
        }
    }

    // Track mouse position over document
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!selectedStamp || isStamping) return

        const rect = e.currentTarget.getBoundingClientRect()
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        })
    }

    const handleMouseLeave = () => {
        setMousePosition(null)
    }

    // Handle click on document to place stamp
    const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!selectedStamp || !docImage || isStamping || !hasDismissedInstructions) return

        const rect = e.currentTarget.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const clickY = e.clientY - rect.top

        // Convert to percentage relative to container
        const xPercent = (clickX / rect.width) * 100
        const yPercent = (clickY / rect.height) * 100

        // Trigger animation at click position
        setStampPosition({ x: clickX, y: clickY })
        setIsStamping(true)

        // After animation, add stamp to placed stamps with percentage positions
        setTimeout(() => {
            const newStamp: PlacedStamp = {
                id: Date.now().toString(),
                stampImage: selectedStamp,
                xPercent,
                yPercent,
                rotation,
                scale
            }
            setPlacedStamps(prev => [...prev, newStamp])
            setIsStamping(false)
            setStampPosition(null)
        }, 1400) // Match animation duration
    }

    // Download with all placed stamps
    const handleDownload = async () => {
        if (!docImage || placedStamps.length === 0 || !canvasRef.current || !containerRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')!

        // Load document image
        const docImg = await new Promise<HTMLImageElement>((resolve) => {
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.onload = () => resolve(img)
            img.src = docImage
        })

        canvas.width = docImg.naturalWidth
        canvas.height = docImg.naturalHeight
        ctx.drawImage(docImg, 0, 0)

        const displayRect = containerRef.current!.getBoundingClientRect()
        const ratio = Math.min(displayRect.width / docImg.naturalWidth, displayRect.height / docImg.naturalHeight)

        const displayedWidth = docImg.naturalWidth * ratio
        const displayedHeight = docImg.naturalHeight * ratio

        const offsetX = (displayRect.width - displayedWidth) / 2
        const offsetY = (displayRect.height - displayedHeight) / 2

        // Load all stamp images first
        const stampImages = await Promise.all(
            placedStamps.map(stamp =>
                new Promise<{ img: HTMLImageElement, stamp: typeof stamp }>((resolve) => {
                    const img = new Image()
                    img.crossOrigin = "anonymous"
                    img.onload = () => resolve({ img, stamp })
                    img.src = stamp.stampImage
                })
            )
        )

        // Draw all stamps with embossed effect
        stampImages.forEach(({ img: stampImg, stamp }) => {
            const displayX = (stamp.xPercent / 100) * displayRect.width
            const displayY = (stamp.yPercent / 100) * displayRect.height

            const relX = displayX - offsetX
            const relY = displayY - offsetY

            const domToImg = 1 / ratio

            ctx.save()
            ctx.translate(relX * domToImg, relY * domToImg)
            ctx.rotate((stamp.rotation * Math.PI) / 180)
            ctx.scale(stamp.scale * domToImg, stamp.scale * domToImg)

            // Higher resolution for better quality
            const visualBaseSize = 512
            let drawWidth = visualBaseSize
            let drawHeight = visualBaseSize

            if (stampImg.naturalWidth && stampImg.naturalHeight) {
                const imgRatio = stampImg.naturalWidth / stampImg.naturalHeight
                if (imgRatio > 1) {
                    drawHeight = visualBaseSize / imgRatio
                } else {
                    drawWidth = visualBaseSize * imgRatio
                }
            }

            // === EMBOSSED SEAL EFFECT ===

            // Layer 1: Outer dark shadow (gives depth, pressed into paper)
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
            ctx.shadowBlur = 12
            ctx.shadowOffsetX = 6
            ctx.shadowOffsetY = 6
            ctx.globalAlpha = 0.7
            ctx.globalCompositeOperation = 'source-over'
            ctx.drawImage(stampImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)

            // Layer 2: Inner dark shadow (creates beveled edge effect)
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
            ctx.shadowBlur = 3
            ctx.shadowOffsetX = 2
            ctx.shadowOffsetY = 2
            ctx.globalAlpha = 0.5
            ctx.globalCompositeOperation = 'multiply'
            ctx.drawImage(stampImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)

            // Layer 3: Highlight on opposite side (raised surface catching light)
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)'
            ctx.shadowBlur = 6
            ctx.shadowOffsetX = -4
            ctx.shadowOffsetY = -4
            ctx.globalAlpha = 0.25
            ctx.globalCompositeOperation = 'screen'
            ctx.drawImage(stampImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)

            // Layer 4: Inner highlight (creates the raised center)
            ctx.shadowColor = 'rgba(255, 255, 255, 0.5)'
            ctx.shadowBlur = 2
            ctx.shadowOffsetX = -1
            ctx.shadowOffsetY = -1
            ctx.globalAlpha = 0.2
            ctx.globalCompositeOperation = 'overlay'
            ctx.drawImage(stampImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)

            // Layer 5: Final stamp with slight transparency (ink on paper)
            ctx.shadowColor = 'transparent'
            ctx.shadowBlur = 0
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 0
            ctx.globalCompositeOperation = 'multiply'
            ctx.globalAlpha = 0.75
            ctx.drawImage(stampImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)

            ctx.restore()
        })

        // Download
        const link = document.createElement('a')
        link.download = `stamped-doc-${Date.now()}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[800px]">
            {/* Sidebar Controls */}
            <div className="lg:col-span-4 space-y-4">
                {/* Upload Doc */}
                <div className="glass-card p-6 rounded-2xl">
                    <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-indigo-400" />
                        1. Upload Document
                    </h2>

                    <button
                        onClick={() => docInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-white/10 hover:border-indigo-500/50 bg-black/20 hover:bg-black/40 rounded-xl p-8 transition-all flex flex-col items-center gap-3 group"
                    >
                        <div className="bg-white/5 p-3 rounded-full group-hover:scale-110 transition-transform">
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                        </div>
                        <span className="text-slate-300 font-medium">Select Image File</span>
                        <span className="text-xs text-slate-500">JPG, PNG, PDF (as Image)</span>
                    </button>
                    <input ref={docInputRef} type="file" accept="image/*" onChange={handleDocUpload} className="hidden" />
                </div>

                {/* Stamp Picker */}
                <div className="glass-card p-6 rounded-2xl flex-1 flex flex-col min-h-[400px]">
                    <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                        <RotateCw className="w-5 h-5 text-indigo-400" />
                        2. Select Stamp
                    </h2>

                    {userStamps.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <p>No saved stamps found.</p>
                            <p className="text-sm mt-2">Go to the Editor to create one!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                            {userStamps.map(stamp => (
                                <button
                                    key={stamp.id}
                                    onClick={() => setSelectedStamp(stamp.imageData)}
                                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedStamp === stamp.imageData
                                        ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                                        : 'border-transparent hover:border-white/20'
                                        }`}
                                >
                                    <img src={stamp.imageData} alt="stamp" className="w-full h-full object-contain bg-white/5 p-2" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Step 3: Instructions */}
                {docImage && selectedStamp && (
                    <div className="glass-card p-6 rounded-2xl border-2 border-indigo-500/30 bg-indigo-500/5">
                        <h2 className="font-bold text-white mb-3 flex items-center gap-2">
                            <Move className="w-5 h-5 text-indigo-400" />
                            3. Position & Stamp
                        </h2>
                        <ul className="text-sm text-slate-300 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-400 mt-0.5">•</span>
                                <span><strong>Click</strong> anywhere on the document to place a stamp</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-400 mt-0.5">•</span>
                                <span><strong>Rotate</strong> using the slider below before clicking</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-400 mt-0.5">•</span>
                                <span><strong>Scale</strong> to adjust size before clicking</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-400 mt-0.5">•</span>
                                <span><strong>Click multiple</strong> times to add more stamps!</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-400 mt-0.5">•</span>
                                <span><strong>Download</strong> when done to save your stamped document</span>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Main Stage */}
            <div className="lg:col-span-8 space-y-4">
                <div
                    ref={containerRef}
                    onClick={handleDocumentClick}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="glass-card rounded-2xl h-[600px] relative overflow-hidden flex items-center justify-center bg-[#1a1a1a] shadow-2xl border border-white/10 cursor-crosshair"
                >
                    {!docImage ? (
                        <div className="text-slate-500 flex flex-col items-center">
                            <Upload className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-xl font-medium">Document Preview</p>
                            <p className="text-sm">Upload a document to start stamping</p>
                        </div>
                    ) : (
                        <>
                            <img
                                src={docImage}
                                alt="Document"
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full object-contain pointer-events-none select-none"
                            />

                            {/* Render all placed stamps with embossed effect */}
                            {placedStamps.map(stamp => {
                                const rect = containerRef.current?.getBoundingClientRect()
                                if (!rect) return null

                                // Convert percentage to pixels based on current container size
                                const pixelX = (stamp.xPercent / 100) * rect.width
                                const pixelY = (stamp.yPercent / 100) * rect.height

                                return (
                                    <div
                                        key={stamp.id}
                                        className="absolute pointer-events-none embossed-seal"
                                        style={{
                                            left: pixelX,
                                            top: pixelY,
                                            transform: `translate(-50%, -50%) rotate(${stamp.rotation}deg) scale(${stamp.scale})`,
                                            width: '256px',
                                            height: '256px',
                                            zIndex: 5
                                        }}
                                    >
                                        <img
                                            src={stamp.stampImage}
                                            alt="Placed Stamp"
                                            className="w-full h-full object-contain"
                                            style={{
                                                mixBlendMode: 'multiply',
                                                opacity: 0.85
                                            }}
                                        />
                                    </div>
                                )
                            })}

                            {/* Cursor-following stamp handle - animates in place when stamping */}
                            {selectedStamp && (mousePosition || (isStamping && stampPosition)) && (
                                <div
                                    className={`stamp-handle-3d ${isStamping ? 'pumping' : ''}`}
                                    style={{
                                        left: isStamping && stampPosition ? stampPosition.x + 50 : (mousePosition?.x ?? 0) + 50,
                                        top: isStamping && stampPosition ? stampPosition.y + 50 : (mousePosition?.y ?? 0) + 50,
                                        transform: 'translate(-50%, -50%) rotateZ(155deg)',
                                    }}
                                >
                                    {/* Wooden Handle - Bulbous top */}
                                    <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
                                        {/* Main handle grip - teardrop/mushroom shape */}
                                        <div className="w-16 h-20 mx-auto rounded-t-full opacity-90"
                                            style={{
                                                background: 'linear-gradient(145deg, #C19A6B 0%, #A0826D 50%, #8B7355 100%)',
                                                boxShadow: 'inset -3px 0 12px rgba(0,0,0,0.3), inset 3px 0 8px rgba(255,255,255,0.2)',
                                                borderRadius: '50% 50% 45% 45% / 60% 60% 40% 40%',
                                            }}
                                        />

                                        {/* Dark wooden connector */}
                                        <div className="w-10 h-5 mx-auto -mt-1 opacity-90"
                                            style={{
                                                background: 'linear-gradient(180deg, #654321 0%, #4A2F1A 100%)',
                                                boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                                                borderRadius: '2px'
                                            }}
                                        />

                                        {/* Wooden stamp base (rectangular holder) */}
                                        <div className="w-28 h-7 mx-auto mt-1 rounded-md opacity-90"
                                            style={{
                                                background: 'linear-gradient(135deg, #D2B48C 0%, #C19A6B 50%, #A0826D 100%)',
                                                boxShadow: 'inset 0 -2px 8px rgba(0,0,0,0.2), 0 3px 8px rgba(0,0,0,0.4)',
                                            }}
                                        />

                                        {/* Red rubber stamp face */}
                                        <div className="w-28 h-3 mx-auto rounded-sm overflow-hidden opacity-90"
                                            style={{
                                                background: 'linear-gradient(180deg, #DC143C 0%, #8B0000 100%)',
                                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                                            }}
                                        >
                                            <img
                                                src={selectedStamp}
                                                alt="Stamp Preview"
                                                className="w-full h-full object-contain opacity-30"
                                                style={{ filter: 'brightness(0.2) invert(1)' }}
                                            />
                                        </div>

                                        {/* Actual stamp preview (larger, below handle) */}
                                        <div className="w-48 h-48 mx-auto mt-2 opacity-80"
                                            style={{
                                                transform: 'rotateZ(-155deg)', // Counter-rotate to show stamp upright
                                            }}
                                        >
                                            <img
                                                src={selectedStamp}
                                                alt="Stamp Preview"
                                                className="w-full h-full object-contain"
                                                style={{
                                                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                                                    mixBlendMode: 'multiply'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Paper impression effect at animation position */}
                            {isStamping && stampPosition && selectedStamp && (
                                <div
                                    className="paper-impression-wrapper impressing absolute pointer-events-none"
                                    style={{
                                        left: stampPosition.x,
                                        top: stampPosition.y,
                                        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
                                        width: '256px',
                                        height: '256px',
                                        zIndex: 10
                                    }}
                                >
                                    <img
                                        src={selectedStamp}
                                        alt="Stamp Overlay"
                                        className="w-full h-full object-contain drop-shadow-xl"
                                        style={{ mixBlendMode: 'multiply' }}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {/* Helper Overlay when no stamp selected */}
                    {docImage && !selectedStamp && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl pointer-events-none">
                            <div className="text-center">
                                <RotateCw className="w-16 h-16 text-indigo-400 mx-auto mb-4 animate-pulse" />
                                <p className="text-2xl font-bold text-white mb-2">Select a Stamp</p>
                                <p className="text-slate-400">Choose from your saved stamps on the left</p>
                            </div>
                        </div>
                    )}

                    {/* Click to Stamp instruction when ready */}
                    {docImage && selectedStamp && placedStamps.length === 0 && !isStamping && !hasDismissedInstructions && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl z-50">
                            <div className="text-center bg-[#1a1a1a]/90 p-8 rounded-2xl border border-white/10 shadow-2xl max-w-md mx-4">
                                <div className="text-6xl mb-4">👆</div>
                                <h3 className="text-2xl font-bold text-white mb-2">Click to Stamp!</h3>
                                <p className="text-slate-300 mb-6">Position your mouse and click anywhere on the document to place your stamp.</p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setHasDismissedInstructions(true)
                                    }}
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold transition-all w-full"
                                >
                                    Got it, let me stamp!
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Transform Controls & Action */}
                <div className="glass-card p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <RotateCw className="w-4 h-4 text-slate-400" />
                            <input
                                type="range" min="0" max="360" value={rotation}
                                onChange={(e) => setRotation(parseInt(e.target.value))}
                                className="w-32 accent-indigo-500 h-1.5 bg-white/10 rounded-full"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Maximize className="w-4 h-4 text-slate-400" />
                            <input
                                type="range" min="0.2" max="2" step="0.1" value={scale}
                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                className="w-32 accent-indigo-500 h-1.5 bg-white/10 rounded-full"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleDownload}
                        disabled={!docImage || placedStamps.length === 0 || isStamping}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-10 py-4 rounded-xl font-bold transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] disabled:shadow-none text-lg"
                    >
                        {isStamping ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Stamping...
                            </>
                        ) : (
                            <>
                                <Download className="w-6 h-6" />
                                Download ({placedStamps.length} stamp{placedStamps.length !== 1 ? 's' : ''})
                            </>
                        )}
                    </button>

                    <canvas ref={canvasRef} className="hidden" />
                </div>
            </div>
        </div>
    )
}
