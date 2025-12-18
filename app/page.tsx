import { Navbar } from "@/components/Navbar"
import Link from "next/link"
import { ArrowRight, Stamp, Zap, Image as ImageIcon, Download, Share2 } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-background z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-white/[0.02] z-0 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none opacity-50" />

      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center text-center">

        {/* Badge */}
        <div className="mb-8 animate-fade-in-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/50 border border-secondary text-secondary-foreground text-sm font-medium backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Be Your Own Impression
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-foreground leading-[0.9]">
          Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-indigo-400 text-glow">Stamps</span> <br />
          Reimagined.
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          Transform any photo into a hyper-realistic 3D stamp in seconds.
          Custom depth, ink texture, and paper embossing—all in your browser.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-24">
          <Link
            href="/dashboard"
            className="group relative inline-flex h-14 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
          >
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl transition-all group-hover:bg-slate-900 gap-2">
              Start Creating Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/gallery"
            className="h-14 px-8 rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center gap-2 transition-colors font-medium"
          >
            View Gallery
          </Link>
        </div>

        {/* Live Demo / Visual */}
        <div className="relative w-full max-w-4xl aspect-[16/9] md:aspect-[21/9] rounded-3xl glass-card p-1 overflow-hidden border-t border-white/10 group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 z-10 pointer-events-none" />

          {/* Mock UI */}
          <div className="w-full h-full bg-slate-950/80 rounded-[20px] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,100,255,0.1),transparent_70%)]" />

            {/* Stamp Visual */}
            <div className="relative z-20 flex items-center gap-12 animate-pulse-slow">
              {/* Left: Original */}
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-xl bg-white/5 border border-white/10 p-4 flex items-center justify-center rotate-[-6deg] shadow-2xl backdrop-blur-sm">
                <ImageIcon className="w-16 h-16 text-white/20" />
              </div>

              <ArrowRight className="text-white/20 w-8 h-8 md:w-12 md:h-12" />

              {/* Right: Stamp */}
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-primary/50 flex items-center justify-center rotate-[6deg] shadow-[0_0_50px_rgba(99,102,241,0.3)] bg-slate-900">
                <Stamp className="w-16 h-16 text-primary drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Feature Grid */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card p-8 rounded-3xl col-span-1 md:col-span-2 relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-40 h-40" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6 text-primary">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Instant Processing</h3>
              <p className="text-muted-foreground max-w-md text-lg">
                Our advanced edge-detection engine processes your image in milliseconds. No waiting, just pure creativity.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-8 rounded-3xl relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Multi-Format Export</h3>
            <p className="text-muted-foreground">
              Download as high-res PNG with transparency, or scalable SVG for professional print work.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-8 rounded-3xl relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-6 text-pink-400">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Share Gallery</h3>
            <p className="text-muted-foreground">
              Showcase your creations in the community gallery and get inspired by others.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-card p-8 rounded-3xl col-span-1 md:col-span-2 relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">Precise Control</h3>
                <p className="text-muted-foreground max-w-sm text-lg">
                  Adjust threshold, noise reduction, and line thickness with our professional-grade sliders.
                </p>
              </div>

              {/* Visual Interface Mockup */}
              <div className="w-full md:w-1/2 bg-slate-900/50 rounded-xl border border-white/5 p-4 flex flex-col gap-3">
                <div className="h-2 w-2/3 bg-slate-800 rounded-full" />
                <div className="h-2 w-full bg-slate-800 rounded-full" />
                <div className="flex gap-2 mt-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20" />
                  <div className="h-8 w-full bg-slate-800 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer Simple */}
      <footer className="w-full py-8 text-center text-muted-foreground text-sm">
        <p>&copy; 2025 StampIt. All rights reserved.</p>
      </footer>
    </main>
  )
}
