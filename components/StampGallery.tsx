'use client'

import { useState } from "react"
import { Trash2, Download, ExternalLink, MoreVertical, Pencil, X, Check } from "lucide-react"
import { deleteStamp, updateStampName } from "@/app/actions/stamps"

interface Stamp {
    id: string
    name: string
    imageData: string
    config: any
    createdAt: Date
}

interface StampGalleryProps {
    stamps: Stamp[]
    onRefresh?: () => void
}

export function StampGallery({ stamps, onRefresh }: StampGalleryProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this stamp?")) return

        setDeletingId(id)
        const result = await deleteStamp(id)
        setDeletingId(null)

        if (result.success) {
            onRefresh?.()
        } else {
            alert(result.error || "Failed to delete")
        }
    }

    const handleDownload = (stamp: Stamp) => {
        const link = document.createElement('a')
        link.download = `${stamp.name.replace(/\s+/g, '-')}.png`
        link.href = stamp.imageData
        link.click()
    }

    const startEditing = (stamp: Stamp) => {
        setEditingId(stamp.id)
        setEditName(stamp.name)
        setMenuOpenId(null)
    }

    const saveEdit = async (id: string) => {
        if (!editName.trim()) return

        await updateStampName(id, editName.trim())
        setEditingId(null)
        onRefresh?.()
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditName("")
    }

    if (stamps.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-400 mb-2">No stamps yet</h3>
                <p className="text-slate-500 text-sm">Create your first stamp and it will appear here!</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stamps.map((stamp) => (
                <div
                    key={stamp.id}
                    className="group relative bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all"
                >
                    {/* Image Preview */}
                    <div className="aspect-square bg-slate-100 flex items-center justify-center p-4">
                        <img
                            src={stamp.imageData}
                            alt={stamp.name}
                            className="max-w-full max-h-full object-contain"
                            style={{ imageRendering: 'auto' }}
                        />
                    </div>

                    {/* Info Bar */}
                    <div className="p-3 bg-slate-900">
                        {editingId === stamp.id ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveEdit(stamp.id)
                                        if (e.key === 'Escape') cancelEdit()
                                    }}
                                />
                                <button onClick={() => saveEdit(stamp.id)} className="text-green-400 hover:text-green-300">
                                    <Check className="w-4 h-4" />
                                </button>
                                <button onClick={cancelEdit} className="text-red-400 hover:text-red-300">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="truncate">
                                    <h4 className="text-sm font-medium text-white truncate">{stamp.name}</h4>
                                    <p className="text-xs text-slate-500" suppressHydrationWarning>
                                        {new Date(stamp.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Menu Trigger */}
                                <div className="relative">
                                    <button
                                        onClick={() => setMenuOpenId(menuOpenId === stamp.id ? null : stamp.id)}
                                        className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {menuOpenId === stamp.id && (
                                        <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 py-1 min-w-[140px]">
                                            <button
                                                onClick={() => handleDownload(stamp)}
                                                className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download
                                            </button>
                                            <button
                                                onClick={() => startEditing(stamp)}
                                                className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                                            >
                                                <Pencil className="w-4 h-4" />
                                                Rename
                                            </button>
                                            <button
                                                onClick={() => handleDelete(stamp.id)}
                                                disabled={deletingId === stamp.id}
                                                className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                {deletingId === stamp.id ? "Deleting..." : "Delete"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 pointer-events-none group-hover:pointer-events-auto">
                        <button
                            onClick={() => handleDownload(stamp)}
                            className="bg-white text-slate-900 p-3 rounded-full hover:bg-indigo-100 transition-colors"
                            title="Download"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleDelete(stamp.id)}
                            disabled={deletingId === stamp.id}
                            className="bg-red-500 text-white p-3 rounded-full hover:bg-red-400 transition-colors disabled:opacity-50"
                            title="Delete"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
