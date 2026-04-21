"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Paperclip, Home, Database, Mail, LayoutGrid,
  Settings, Share2, ChevronDown, Sparkles, ArrowUpRight,
  Activity, BarChart3, ShieldAlert, Cpu, FileText
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ProductionDashboard() {
  const [query, setQuery] = useState("");
  const [chat, setChat] = useState<{ role: string; content: string }[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
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
      const res = await fetch("http://localhost:8000/upload", { 
        method: "POST", 
        body: fd 
      });
      const data = await res.json();
      
      if (res.ok) {
        setStats(data.stats);
        setChat(prev => [...prev, { 
          role: 'assistant', 
          content: `System: ${selectedFile.name} indexed successfully. Document intelligence engine ready.` 
        }]);
      } else {
        throw new Error(data.detail || "Upload failed");
      }
    } catch (err: any) {
      setChat(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${err.message || "Connection to backend lost."}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const onChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = { role: 'user', content: query };
    setChat(prev => [...prev, userMsg]);
    const currentQuery = query;
    setQuery("");

    const fd = new FormData();
    fd.append("question", currentQuery);

    try {
      const res = await fetch("http://localhost:8000/chat", { 
        method: "POST", 
        body: fd 
      });
      const data = await res.json();
      setChat(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch {
      setChat(prev => [...prev, { role: 'assistant', content: "Error: Connection to backend lost." }]);
    }
  };

  const suggestions = [
    { title: "Summary", desc: "Summarize this document's key points", color: "bg-sky-500/10 text-sky-300 border-sky-500/20" },
    { title: "Analytics", desc: "What are the average values in this data?", color: "bg-rose-500/10 text-rose-300 border-rose-500/20" },
    { title: "Extract", desc: "Extract all dates and names mentioned", color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  ];

  return (
    <div className="flex h-screen bg-[#0A0E0E] text-slate-300 overflow-hidden relative selection:bg-teal-500/30">
      
      <aside className="w-16 border-r border-white/5 flex flex-col items-center justify-between py-5 z-20 bg-[#0A0E0E]">
        <div className="flex flex-col items-center gap-8">
          <div className="p-2.5 rounded-xl bg-teal-400 text-black shadow-lg shadow-teal-500/20">
            <ArrowUpRight size={18} strokeWidth={2.5} />
          </div>
          <nav className="flex flex-col gap-5">
            <SidebarIcon icon={<Home size={18} />} active />
            <SidebarIcon icon={<Database size={18} />} />
            <SidebarIcon icon={<Mail size={18} />} />
            <SidebarIcon icon={<LayoutGrid size={18} />} />
          </nav>
        </div>
        <div className="flex flex-col gap-5">
          <SidebarIcon icon={<Settings size={18} />} />
          <SidebarIcon icon={<Share2 size={18} />} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] pointer-events-none z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.15),transparent_70%)] blur-3xl" />
        </div>
        
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse at top, black 20%, transparent 80%)",
          }}
        />

        <header className="h-16 flex items-center justify-end px-8 z-20">
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-full pl-1 pr-3 py-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-[10px] text-black font-black">AI</div>
            <span className="text-sm text-slate-200 font-medium">RAG</span>
            <ChevronDown size={14} className="text-slate-500" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 z-10 custom-scrollbar">
          <div className="max-w-4xl mx-auto pt-10 pb-32">
            
            {chat.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                <h1 className="text-6xl font-semibold text-white tracking-tight leading-tight">Hey!</h1>
                <h2 className="text-6xl font-semibold text-white/40 tracking-tight leading-tight">What can I help with?</h2>
              </motion.div>
            )}

            {stats && stats.has_analytics && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-12 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <MetricCard label="Entities" value={stats.total_points} icon={<Activity size={14}/>} />
                  <MetricCard label="Mean" value={stats.mean.toFixed(1)} icon={<BarChart3 size={14}/>} />
                  <MetricCard label="Max" value={stats.max.toLocaleString()} icon={<Sparkles size={14}/>} />
                </div>
                <div className="bg-[#111716] border border-white/5 rounded-3xl p-6 h-64 shadow-2xl">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.raw_values.slice(0,20).map((v:any, i:any)=>({n:i, v}))}>
                      <Tooltip contentStyle={{backgroundColor: '#0A0E0E', border: '1px solid #14b8a6', borderRadius: '12px'}} />
                      <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                        {stats.raw_values.map((_:any, i:number) => (
                          <Cell key={i} fill={i % 2 === 0 ? '#2dd4bf' : '#0f766e'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            <div className="space-y-6 mb-10">
              {chat.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 rounded-2xl text-[15px] leading-relaxed max-w-[85%] shadow-xl ${
                    m.role === 'user' ? 'bg-teal-400 text-black font-medium' : 'bg-[#111716] border border-white/5 text-slate-200'
                  }`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {chat.length === 0 && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                {suggestions.map((s, i) => (
                  <motion.button key={i} whileHover={{ y: -2 }} onClick={() => setQuery(s.desc)}
                    className="text-left p-5 rounded-2xl bg-[#111716] border border-white/5 hover:border-teal-400/30 transition-all group">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${s.color} mb-3`}>
                      {s.title}
                    </span>
                    <p className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors leading-snug">{s.desc}</p>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0A0E0E] via-[#0A0E0E]/90 to-transparent z-20">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={onChat} className="bg-[#111716] border border-white/5 rounded-[2rem] p-5 shadow-2xl relative group focus-within:border-teal-400/30 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <Sparkles size={20} className="text-teal-400 mt-1 shrink-0 animate-pulse" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={loading ? "Analyzing document..." : "Ask your document anything..."}
                  className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-600 text-lg outline-none"
                  disabled={loading}
                />
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <label className="flex items-center gap-2 text-xs text-slate-400 bg-white/[0.04] border border-white/5 rounded-xl px-4 py-2 cursor-pointer hover:bg-teal-400/10 hover:text-teal-400 transition">
                  <Paperclip size={14} />
                  <span className="font-semibold uppercase tracking-widest">{file ? file.name : "Attach DOCUMENT"}</span>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.docx,.csv,.xlsx,.xls,.txt"
                    onChange={(e) => {
                      const selected = e.target.files?.[0];
                      if (selected) {
                        setFile(selected);
                        onUpload(selected);
                      }
                    }}
                  />
                </label>
                <button type="submit" disabled={!query || loading}
                  className="p-3 rounded-2xl bg-teal-400 text-black hover:bg-teal-300 disabled:opacity-20 disabled:scale-100 transition-all active:scale-95 shadow-lg shadow-teal-500/20">
                  <Send size={18} strokeWidth={2.5} className="-rotate-90" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarIcon({ icon, active }: { icon: React.ReactNode; active?: boolean }) {
  return (
    <button className={`p-2.5 rounded-xl transition-all ${
      active ? 'bg-teal-400/10 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.1)]' : 'text-slate-600 hover:text-slate-300 hover:bg-white/5'
    }`}>
      {icon}
    </button>
  );
}

function MetricCard({ label, value, icon }: any) {
  return (
    <div className="bg-[#111716] border border-white/5 p-5 rounded-2xl flex flex-col gap-2">
      <div className="flex items-center justify-between text-teal-500/50">
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
        {icon}
      </div>
      <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
    </div>
  );
}