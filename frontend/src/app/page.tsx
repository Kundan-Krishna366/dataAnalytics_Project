"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Link2,
  FileText,
  Plus,
  ArrowUp,
  Layers,
  Zap,
  Trash2,
  Activity,
  BarChart3,
  ChevronDown,
  Wrench,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [chat, setChat] = useState<{ role: string; content: string }[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const onUpload = async (selectedFile: File) => {
    setLoading(true);
    const fd = new FormData();
    fd.append("file", selectedFile);
    try {
      const res = await fetch("http://localhost:8000/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
        if (data.stats.has_analytics) setShowAnalytics(true);
        setChat((prev) => [...prev, { role: "assistant", content: `System: Neural link with ${selectedFile.name} established. Data indexed.` }]);
      }
    } catch (err) {
      setChat((prev) => [...prev, { role: "assistant", content: "Link Error: Check Backend." }]);
    } finally {
      setLoading(false);
    }
  };

  const onChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || loading) return;
    setChat((prev) => [...prev, { role: "user", content: prompt }]);
    const currentPrompt = prompt;
    setPrompt("");
    setLoading(true);
    const fd = new FormData();
    fd.append("question", currentPrompt);
    try {
      const res = await fetch("http://localhost:8000/chat", { method: "POST", body: fd });
      const data = await res.json();
      setChat((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch {
      setChat((prev) => [...prev, { role: "assistant", content: "Neural bridge interrupted." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#0a0807] text-white relative overflow-hidden flex flex-col selection:bg-orange-500/30">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-40 w-[800px] h-[800px] rounded-full opacity-60 animate-blob-slow"
          style={{ background: "radial-gradient(circle at 35% 35%, rgba(255,120,40,0.5), rgba(220,60,20,0.2) 35%, transparent 65%)", filter: "blur(70px)" }} />
        <div className="absolute bottom-[-10%] left-1/4 w-[700px] h-[600px] rounded-full opacity-50 animate-blob-fast"
          style={{ background: "radial-gradient(circle, rgba(130,60,220,0.35), transparent 65%)", filter: "blur(90px)" }} />
        <div className="absolute inset-0 opacity-[0.07] mix-blend-screen"
          style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.8) 0px, rgba(255,255,255,0.8) 1px, transparent 1px, transparent 18px)" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_70%,#0a0807_100%)]" />
      </div>

      <style>{`
        @keyframes blobSlow { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,30px) scale(1.05); } }
        @keyframes blobFast { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-30px,-20px) scale(1.08); } }
        .animate-blob-slow { animation: blobSlow 20s ease-in-out infinite; }
        .animate-blob-fast { animation: blobFast 12s ease-in-out infinite; }
      `}</style>

      <header className="relative z-30 w-full shrink-0 flex items-center justify-between px-10 py-8 text-[11px] tracking-[0.25em] uppercase font-black text-white/30">
        <div className="flex items-center gap-3">
          <Link2 size={14} className="text-orange-500" />
          <span className="text-white/60 tracking-widest">DOCS RAG</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => { setChat([]); setStats(null); setFile(null); setShowAnalytics(false); }}
            className="flex items-center gap-2 hover:text-rose-400 transition group text-rose-500/50">
            <Trash2 size={13} className="group-hover:scale-110 transition" /> RESET
          </button>
          <div className="h-4 w-px bg-white/10" />
          <Settings size={14} className="hover:text-white transition cursor-pointer" />
        </div>
      </header>

      <main className="relative z-20 w-full max-w-4xl px-8 mx-auto flex flex-col flex-1 min-h-0">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-8 pb-12">
            <AnimatePresence>
              {showAnalytics && stats?.has_analytics && (
                <motion.div initial={{ opacity: 0, y: -20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full mb-8 rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-2xl p-7 shadow-2xl relative">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><BarChart3 size={18} /></div>
                      <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/70">Neural Data Extraction</span>
                    </div>
                    <button onClick={() => setShowAnalytics(false)} className="text-[10px] bg-white/5 px-3 py-1 rounded-full border border-white/10 hover:bg-white/10 transition">Hide Panel</button>
                  </div>

                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.raw_values.slice(0, 25).map((v: any, i: number) => ({ n: i, v }))}>
                        <Bar dataKey="v" radius={[5, 5, 0, 0]}>
                          {stats.raw_values.map((_: any, i: number) => (
                            <Cell key={i} fill={i % 2 === 0 ? '#ff8c3c' : '#8b5cf6'} fillOpacity={0.7} />
                          ))}
                        </Bar>
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0a0807', border: '1px solid #333', borderRadius: '8px', fontSize: '11px' }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
                    <Metric label="Mean" value={stats.mean.toFixed(1)} />
                    <Metric label="Peak" value={stats.max.toLocaleString()} />
                    <Metric label="Entropy" value={stats.total_points} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {chat.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="pt-24 text-center">
                <h1 className="text-7xl font-serif tracking-tight text-white italic opacity-90">Hello, Friend.</h1>
                <h2 className="text-4xl font-serif text-white/30 italic mt-4">What shall we process today?</h2>
                <div className="mt-12 flex justify-center gap-10 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                  <span className="hover:text-orange-500/50 transition cursor-default">Data</span>
                  <span className="hover:text-purple-500/50 transition cursor-default">Analytics</span>
                  <span className="hover:text-orange-500/50 transition cursor-default">Project</span>
                </div>
              </motion.div>
            ) : (
              chat.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-5 rounded-[1.5rem] text-[15px] leading-relaxed backdrop-blur-md shadow-2xl ${m.role === 'user' ? 'bg-white/10 border border-white/20 text-white' : 'bg-white/[0.03] border border-white/5 text-white/80'
                    }`}>
                    {m.content}
                  </div>
                </motion.div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="shrink-0 space-y-4 pb-12">
          <div className="rounded-[1.5rem] bg-black/40 backdrop-blur-xl border border-white/10 p-4 flex items-center gap-4 transition-all hover:border-white/20 shadow-xl">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${file ? 'bg-orange-500/20 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.2)]' : 'bg-white/5 text-white/20'}`}>
              <FileText size={18} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[13px] text-white font-semibold truncate tracking-tight">{file ? file.name : "Upload Context File"}</p>
              <p className="text-[9px] text-white/30 uppercase font-black tracking-[0.1em]">{file ? `${(file.size / 1024).toFixed(1)} KB indexed` : "Awaiting Context File"}</p>
            </div>
            <label className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-lg group">
              <Plus size={16} className="group-hover:rotate-90 transition-transform" />
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.csv,.xlsx,.xls,.txt" onChange={(e) => { const s = e.target.files?.[0]; if (s) { setFile(s); onUpload(s); } }} />
            </label>
          </div>
          <div className="rounded-[1.8rem] bg-black/40 backdrop-blur-xl border border-white/10 p-5 shadow-2xl focus-within:border-orange-500/30 transition-all duration-500">
            <form onSubmit={onChat}>
              <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Enter query for neural synthesis..."
                className="w-full bg-transparent outline-none text-[16px] text-white placeholder:text-white/20 px-1" disabled={loading} />
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-[10px] font-black text-orange-500 uppercase tracking-widest border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                    llama-3.3-70b
                  </div>
                  {stats?.has_analytics && (
                    <button type="button" onClick={() => setShowAnalytics(!showAnalytics)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white/40 hover:text-white hover:bg-white/5 transition uppercase tracking-[0.2em] border border-white/5">
                      <Activity size={12} className="text-purple-400" /> Statistics
                    </button>
                  )}
                </div>
                <button type="submit" disabled={!prompt.trim() || loading} className="h-10 w-10 rounded-xl bg-white text-black flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-xl disabled:opacity-5 active:scale-90">
                  <ArrowUp size={18} strokeWidth={3} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="shrink-0 relative z-30 w-full flex justify-between px-10 py-8 text-[9px] tracking-[0.4em] uppercase text-white/20 font-black">
        <div className="flex items-center gap-3">
          <Zap size={12} fill="currentColor" className="text-orange-500 animate-pulse" />
          <span>GROQ CLOUD</span>
        </div>
        <div className="flex gap-8">
          <span className="hidden md:inline"></span>
          <span></span>
        </div>
      </footer>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center group">
      <p className="text-[10px] text-white/25 uppercase font-black tracking-widest mb-1 group-hover:text-white/40 transition">{label}</p>
      <p className="text-lg font-mono font-bold text-white/90">{value}</p>
    </div>
  );
}