import React, { useState, useMemo, useEffect, useRef } from 'react';

/**
 * LoveLab.jsx 
 * Combined Version: Hub + Garden + Orbital Intimacy Dynamics
 * Fixed: Replaced lucide-react with inline SVGs to resolve build errors.
 */

// --- Inline SVG Icons (Replacing lucide-react) ---
const Icon = ({ children, size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

const HeartIcon = (props) => (
  <Icon {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></Icon>
);
const SparklesIconInternal = (props) => (
  <Icon {...props}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
  </Icon>
);
const TargetIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </Icon>
);
const MessageSquareIcon = (props) => (
  <Icon {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Icon>
);
const ShieldCheckIcon = (props) => (
  <Icon {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></Icon>
);
const UnlockIcon = (props) => (
  <Icon {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></Icon>
);
const TrendingDownIcon = (props) => (
  <Icon {...props}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></Icon>
);
const TrendingUpIcon = (props) => (
  <Icon {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></Icon>
);
const BrainIcon = (props) => (
  <Icon {...props}>
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54Z" />
  </Icon>
);
const PlusIcon = (props) => (
  <Icon {...props}><line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" /></Icon>
);
const MinusIcon = (props) => (
  <Icon {...props}><line x1="5" x2="19" y1="12" y2="12" /></Icon>
);
const GhostIcon = (props) => (
  <Icon {...props}><path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" /></Icon>
);
const ZapIcon = (props) => (
  <Icon {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></Icon>
);
const SettingsIconInternal = (props) => (
  <Icon {...props}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

// --- Orbital Constants ---
const RINGS = [
  { id: 'void', label: "The Void", radius: 0.95, color: '#94a3b8' },
  { id: 'talking', label: "Talking", radius: 0.65, color: '#3b82f6' },
  { id: 'dating', label: "Dating", radius: 0.4, color: '#ec4899' },
  { id: 'committed', label: "Committed", radius: 0.15, color: '#22c55e' }
];

export default function LoveLab({
  appState, setAppState, emptySlots, activeSpecimens, sedimentPile,
  setIsAddingPerson, isAddingPerson, handleAddPerson, 
  triggerSpecimenExpiration, fallingSpecimen
}) {
  const [selectedDate, setSelectedDate] = useState("TODAY");
  const [isDateActive, setIsDateActive] = useState(false);
  const [newlyAddedId, setNewlyAddedId] = useState(null);
  const [entropy, setEntropy] = useState(0.2);

  // --- ORBITAL SIMULATION LOGIC ---
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const particles = useRef([]); 
  const requestRef = useRef();

  useEffect(() => {
    if (appState === 'dating_garden') {
      const currentIds = activeSpecimens.filter(s => s.codename).map(s => s.id);
      
      activeSpecimens.filter(s => s.codename).forEach(s => {
        const existing = particles.current.find(p => p.id === s.id);
        if (!existing) {
          particles.current.push({
            id: s.id,
            name: s.codename,
            color: '#fb7185',
            dist: 300,
            angle: Math.random() * Math.PI * 2,
            heat: 0
          });
        }
      });

      particles.current = particles.current.filter(p => currentIds.includes(p.id));
    }
  }, [activeSpecimens, appState]);

  const updateSim = () => {
    const canvas = canvasRef.current;
    if (!canvas || appState !== 'dating_garden') return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const center = { x: w / 2, y: h / 2 };
    const maxRadius = Math.min(w, h) * 0.42;

    ctx.fillStyle = '#fdfcf0';
    ctx.fillRect(0, 0, w, h);

    RINGS.forEach((ring) => {
      const r = ring.radius * maxRadius;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.05;
      ctx.setLineDash([5, 8]);
      ctx.beginPath(); ctx.arc(center.x, center.y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#000000';
      ctx.font = '900 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ring.label.toUpperCase(), center.x, center.y - r - 5);
      ctx.globalAlpha = 1.0;
    });

    ctx.fillStyle = '#000000';
    ctx.beginPath(); ctx.arc(center.x, center.y, 8, 0, Math.PI * 2); ctx.fill();

    particles.current.forEach(p => {
      p.dist += entropy * 1.5;
      if (p.heat > 0) {
        p.dist -= p.heat * 4;
        p.heat *= 0.94;
      }
      p.angle += 0.005;

      if (p.dist > maxRadius) p.dist = maxRadius;
      if (p.dist < 15) p.dist = 15;

      const x = center.x + Math.cos(p.angle) * p.dist;
      const y = center.y + Math.sin(p.angle) * p.dist;

      ctx.save();
      ctx.translate(x, y);
      if (p.heat > 0.1) {
        ctx.shadowBlur = 15 * p.heat;
        ctx.shadowColor = '#fb7185';
      }
      ctx.fillStyle = '#fb7185';
      ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(-4, -4, 3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, x, y - 18);
    });

    requestRef.current = requestAnimationFrame(updateSim);
  };

  useEffect(() => {
    if (appState === 'dating_garden') {
      const handleResize = () => {
        if (containerRef.current && canvasRef.current) {
          canvasRef.current.width = containerRef.current.clientWidth;
          canvasRef.current.height = containerRef.current.clientHeight;
        }
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      requestRef.current = requestAnimationFrame(updateSim);
      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(requestRef.current);
      };
    }
  }, [appState, entropy]);

  const pulseSpecimen = (id) => {
    const p = particles.current.find(item => item.id === id);
    if (p) p.heat = 2.5;
  };

  const dateTabs = useMemo(() => {
    return [...Array(6)].map((_, i) => {
      if (i === 0) return "TODAY";
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
  }, []);

  const wrapHandleAddPerson = (data) => {
    const target = activeSpecimens.find(s => !s.codename);
    if (target) setNewlyAddedId(target.id);
    handleAddPerson(data);
  };

  const renderCurrentView = () => {
    if (appState === 'dating_lab') {
      return (
        <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in slide-in-from-right duration-500 overflow-y-auto text-black text-left">
          <header className="bg-[#1a1c2c] border-b-[6px] border-black px-10 py-8 flex justify-between items-center text-white relative shadow-xl">
            <button onClick={() => setAppState('dating_hub')} className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity font-bold text-white">BACK</button>
            <h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight font-black">Testing Lab</h2>
            <div className="w-10" />
          </header>
          <div className="p-8 space-y-8 max-w-2xl mx-auto w-full pb-32">
            <div className="bg-[#FFD1DC] border-[5px] border-black rounded-[45px] p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500 rounded-full border-4 border-black flex items-center justify-center text-white font-black">A</div>
                <h3 className="font-['Londrina_Solid'] text-3xl uppercase font-black">Baseline Bio</h3>
              </div>
              <textarea placeholder="Paste Bio A here..." className="w-full bg-white/50 border-4 border-black/10 rounded-2xl p-4 min-h-[100px] mb-4 font-sans text-sm focus:border-blue-500 outline-none transition-all" />
              <div className="grid grid-cols-2 gap-4">
                <LabMetric label="Matches" value={14} color="bg-white/40" />
                <LabMetric label="Success" value="5.1%" color="bg-white/40" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (appState === 'dating_garden') {
      const poolSize = 50;
      const currentCount = 8 - emptySlots + sedimentPile.length;
      const threshold = Math.floor(poolSize * 0.37);
      const phase = currentCount <= threshold ? 'Exploration' : 'Selection';

      return (
        <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in slide-in-from-right duration-500 overflow-y-auto text-black text-left">
          <header className="bg-[#1a1c2c] border-b-[6px] border-black px-10 py-8 flex justify-between items-center text-white relative shadow-xl shrink-0">
            <button onClick={() => setAppState('dating_hub')} className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity font-bold text-white">BACK</button>
            <h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight font-black text-white">Active Garden</h2>
            <div className="w-10" />
          </header>

          <div className="flex-1 flex flex-col md:flex-row">
            <div className="flex-1 min-h-[500px] relative flex flex-col">
              <div className="p-6 bg-white/40 border-b-2 border-black/5 flex justify-between items-center">
                 <div>
                    <h3 className="font-['Londrina_Solid'] text-2xl uppercase font-black leading-none">Intimacy Orbit</h3>
                    <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Live Dynamic Mapping</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">System Entropy</span>
                      <input type="range" min="0" max="0.8" step="0.1" value={entropy} onChange={(e) => setEntropy(parseFloat(e.target.value))} className="w-24 h-2 bg-black/10 rounded-full appearance-none accent-black border border-black/20" />
                    </div>
                 </div>
              </div>
              <div ref={containerRef} className="flex-1 relative bg-white overflow-hidden cursor-crosshair">
                <canvas ref={canvasRef} className="block w-full h-full" onClick={(e) => {
                  const rect = canvasRef.current.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  particles.current.forEach(p => {
                    const dx = p.x - x;
                    const dy = p.y - y;
                    if (Math.sqrt(dx*dx + dy*dy) < 30) pulseSpecimen(p.id);
                  });
                }} />
              </div>
            </div>

            <div className="w-full md:w-96 p-8 space-y-8 bg-[#FDFCF0] border-l-[6px] border-black overflow-y-auto">
              <div className="bg-[#FFD1DC] border-[5px] border-black rounded-[45px] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
                <h3 className="font-['Londrina_Solid'] text-xl uppercase opacity-40 font-bold mb-2">Phase: {phase}</h3>
                <div className={`font-['Londrina_Solid'] text-5xl uppercase font-black leading-none mb-4 ${phase === 'Exploration' ? 'text-blue-600' : 'text-green-600'}`}>
                  {currentCount}/{poolSize}
                </div>
                <div className="w-full h-6 bg-white/30 border-2 border-black rounded-full overflow-hidden flex p-0.5 mb-2">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min((currentCount / poolSize) * 100, 37)}%` }} />
                  {currentCount > threshold && <div className="h-full bg-green-500 rounded-full ml-0.5" style={{ width: `${((currentCount - threshold) / poolSize) * 100}%` }} />}
                </div>
                <p className="text-[9px] opacity-60 font-black uppercase tracking-tight">Stop Rule: Commit after 37%</p>
              </div>

              <div className="bg-white border-[5px] border-black rounded-[40px] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h4 className="font-['Londrina_Solid'] text-xl uppercase font-black mb-4 flex items-center gap-2">
                   <TargetIcon size={16} /> Active Pulses
                </h4>
                <div className="space-y-2">
                  {particles.current.map(p => (
                    <button 
                      key={p.id} 
                      onClick={() => pulseSpecimen(p.id)}
                      className="w-full bg-slate-50 border-2 border-black/5 p-3 rounded-2xl flex justify-between items-center group active:scale-95 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="font-bold text-xs uppercase">{p.name}</span>
                      </div>
                      <SparklesIconInternal size={12} className="opacity-0 group-hover:opacity-100 text-rose-500 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border-[5px] border-black rounded-[40px] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h4 className="font-['Londrina_Solid'] text-xl uppercase font-black mb-4">Reciprocity</h4>
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-2xl border-2 border-black/5">
                    <span className="font-black uppercase text-[8px] opacity-40">Reply Latency</span>
                    <div className="font-['Londrina_Solid'] text-xl leading-none mt-1">4.2 HOURS</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border-2 border-black/5">
                    <span className="font-black uppercase text-[8px] opacity-40">Effort Ratio</span>
                    <div className="font-['Londrina_Solid'] text-xl leading-none mt-1">1.2 : 1.0</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (appState === 'dating_bloom') {
      return (
        <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden text-black text-left">
          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes heart-pop-glow {
              0% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(255,255,255,0)); }
              50% { transform: scale(1.4); filter: drop-shadow(0 0 35px #fff700); }
              100% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(255,255,255,0)); }
            }
            .animate-pop-glow { animation: heart-pop-glow 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
          `}} />

          <header className="bg-[#1a1c2c] border-b-[6px] border-black px-10 py-8 flex justify-between items-center text-white relative shadow-xl shrink-0">
            <button onClick={() => isDateActive ? setIsDateActive(false) : setAppState('dating_hub')} className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity font-bold text-white">
              {isDateActive ? 'BACK TO LOG' : 'EXIT LOG'}
            </button>
            <h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight font-black text-white">
              {isDateActive ? selectedDate : 'Daily Bloom'}
            </h2>
            <div className="w-10" />
          </header>

          {!isDateActive ? (
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="mb-8">
                <p className="font-['Londrina_Solid'] text-xl opacity-30 uppercase tracking-tight font-bold">Experimental Cycles</p>
                <h3 className="font-['Londrina_Solid'] text-5xl uppercase leading-none">Select Record</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {dateTabs.map((date) => (
                  <button
                    key={date}
                    onClick={() => { setSelectedDate(date); setIsDateActive(true); }}
                    className={`py-6 px-4 border-[4px] border-black rounded-[35px] font-['Londrina_Solid'] text-2xl uppercase transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex flex-col items-center justify-center gap-2 ${selectedDate === date ? 'bg-[#ff748c] text-black translate-y-0.5' : 'bg-[#FFD1DC] text-black hover:bg-[#ffb6c1]'
                      }`}
                  >
                    <span className="opacity-40 text-[10px] font-black tracking-widest uppercase">LOG DATE</span>
                    {date}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 relative overflow-y-auto glass-body flex flex-col bg-white/5 p-8 animate-in slide-in-from-bottom duration-300 pb-32">
                <div className="grid grid-cols-2 gap-y-16 gap-x-10 justify-items-center">
                  {activeSpecimens.map((s, i) => (
                    <div key={s.id} className="flex flex-col items-center">
                      <div className={newlyAddedId === s.id ? 'animate-pop-glow' : 'animate-float'} style={{ animationDelay: `${i * 0.1}s` }}>
                        <MLMHeart id={`detail-${s.id}`} isPlaceholder={!s.codename} />
                      </div>
                      {s.codename ? (
                        <button onClick={() => triggerSpecimenExpiration(s)} className="font-['Londrina_Solid'] text-xs uppercase mt-5 opacity-60 font-bold hover:text-red-500 transition-colors">
                          Terminate {String(s.codename)}
                        </button>
                      ) : selectedDate === "TODAY" ? (
                        <button
                          onClick={() => setIsAddingPerson(true)}
                          className="bg-black text-white px-4 py-2 rounded-2xl border-2 border-black font-['Londrina_Solid'] text-[10px] uppercase mt-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all font-black"
                        >
                          Register Subject
                        </button>
                      ) : (
                        <span className="font-['Londrina_Solid'] text-xs uppercase mt-5 opacity-10 font-bold">Dormant Slot</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-black p-6 border-t-[6px] border-black text-center text-white font-black uppercase text-xs sticky bottom-0 z-50">
                Active Cycle: {selectedDate} — Sediment Log: {sedimentPile.length} Hearts
              </div>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden text-black text-left">
        <header className="bg-[#1a1c2c] border-b-[6px] border-black px-10 py-8 flex justify-between items-center text-white relative shadow-xl shrink-0">
          <button onClick={() => setAppState('garden')} className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity font-bold text-white">EXIT LAB</button>
          <h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight font-black text-white">The Love Jar</h2>
          <button className="w-10 h-10 flex items-center justify-center border-4 border-white/20 rounded-xl bg-white/5 text-white">
            <SettingsIconInternal size={20} />
          </button>
        </header>

        <div className="flex-1 relative overflow-y-auto glass-body flex flex-col bg-white/5 p-8 pb-40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto w-full mb-10">
            <BentoButton title="Daily Bloom" bg="bg-[#FFD1DC]" onClick={() => setAppState('dating_bloom')}>
              <p className="font-['Londrina_Solid'] text-2xl text-black font-black">Today's Cycle</p>
              <p className="font-['Londrina_Solid'] text-xl text-black opacity-40 font-bold">View Hearts: {8 - emptySlots}</p>
            </BentoButton>
            <BentoButton title="Active Garden" bg="bg-[#C1E1C1]" onClick={() => setAppState('dating_garden')}>
              <p className="font-['Londrina_Solid'] text-2xl text-black font-black">Dynamic Tracking</p>
              <p className="font-['Londrina_Solid'] text-xl text-black opacity-40 font-bold">Live Simulation</p>
            </BentoButton>
            <BentoButton title="The Lab" bg="bg-[#AEC6CF]" onClick={() => setAppState('dating_lab')}>
              <p className="font-['Londrina_Solid'] text-2xl text-black font-black">Split Profiles</p>
              <p className="font-['Londrina_Solid'] text-xl text-black opacity-40 font-bold">Conversion Lab</p>
            </BentoButton>
            <BentoButton title="Playbook" bg="bg-[#FFFACD]" onClick={() => setAppState('dating_playbook')} className="rotate-[-1deg]">
              <p className="font-['Londrina_Solid'] text-2xl text-black font-black">Tactics</p>
              <p className="font-['Londrina_Solid'] text-xl text-black opacity-40 font-bold">Active Hooks</p>
            </BentoButton>
          </div>
          <button onClick={() => setIsAddingPerson(true)} className="w-full max-w-2xl mx-auto bg-black text-white border-[5px] border-black rounded-[45px] p-8 shadow-[10px_10px_0px_0px_rgba(100,100,100,0.5)] active:translate-y-2 transition-all flex items-center justify-center text-4xl font-['Londrina_Solid'] uppercase font-black">
            Recruit New Subject
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderCurrentView()}
      {isAddingPerson && (
        <AddPersonModal
          handleAddPerson={wrapHandleAddPerson}
          onCancel={() => setIsAddingPerson(false)}
        />
      )}
    </>
  );
}

const LabMetric = ({ label, value, color }) => (
  <div className={`${color} border-[3px] border-black rounded-2xl p-4 flex flex-col items-center justify-center text-black`}>
    <span className="font-['Londrina_Solid'] text-[10px] uppercase font-black opacity-40">{label}</span>
    <span className="font-['Londrina_Solid'] text-3xl font-black">{value}</span>
  </div>
);

const BentoButton = ({ title, bg, onClick, children, className = "" }) => (
  <button onClick={onClick} className={`${bg} border-[5px] border-black rounded-[45px] p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between h-[220px] active:scale-95 transition-all group ${className}`}>
    <span className="font-['Londrina_Solid'] text-3xl uppercase text-black font-bold">{title}</span>
    <div className="flex flex-col text-black">{children}</div>
  </button>
);

const MLMHeart = ({ size = 125, id = "heart", opacity = 1, isPlaceholder = false, style = {}, className = "" }) => {
  const mlmStripes = ['#98E8C1', '#FFFFFF', '#7BADE2'];
  return (
    <svg width={size} height={size} viewBox="0 0 125 125" style={{ opacity: isPlaceholder ? 1.0 : opacity, ...style }} className={className}>
      <defs><clipPath id={`${id}-clip`}><path d="M60 105 C60 105 15 80 15 45 15 20 50 20 60 35 70 20 105 20 105 45 105 80 60 105 60 105 Z" /></clipPath></defs>
      <g transform="translate(2, 2)">
        <path d="M60 105 C60 105 15 80 15 45 15 20 50 20 60 35 70 20 105 20 105 45 105 80 60 105 60 105 Z" fill="black" transform="translate(6, 6)" />
        {isPlaceholder ? (
          <path d="M60 105 C60 105 15 80 15 45 15 20 50 20 60 35 70 20 105 20 105 45 105 80 60 105 60 105 Z" fill="#1a1c2c" />
        ) : (
          <g clipPath={`url(#${id}-clip)`}>
            <rect x="0" y="0" width="120" height="120" fill={mlmStripes[0]} />
            <path d="M-20 40 Q20 25 60 40 T140 40 L140 80 Q100 65 60 80 T-20 80 Z" fill={mlmStripes[1]} transform="rotate(-15, 60, 60)" />
            <path d="M-20 80 Q20 65 60 80 T140 80 L140 160 L-20 160 Z" fill={mlmStripes[2]} transform="rotate(-15, 60, 60)" />
          </g>
        )}
        <path d="M60 105 C60 105 15 80 15 45 15 20 50 20 60 35 70 20 105 20 105 45 105 80 60 105 60 105 Z" fill="none" stroke="black" strokeWidth="6" strokeLinejoin="round" />
        {!isPlaceholder && <path d="M35 45 Q40 30 55 35" stroke="white" strokeWidth="4" opacity="0.4" fill="none" strokeLinecap="round" />}
      </g>
    </svg>
  );
}

const AddPersonModal = ({ handleAddPerson, onCancel }) => {
  const [vectors, setVectors] = useState({
    'Visual Pull': 5,
    'Conv. Potential': 5,
    'Lifestyle Fit': 5
  });
  const [mood, setMood] = useState('Curious');
  const [archetype, setArchetype] = useState(null);
  const [showArchetypeInfo, setShowArchetypeInfo] = useState(false);

  const moods = [
    { id: 'Curious', icon: '🔍' },
    { id: 'Bored', icon: '🥱' },
    { id: 'Depth-Seeking', icon: '🌊' },
    { id: 'Standards-High', icon: '💎' }
  ];

  const archetypes = [
    'Wordsmith', 'Visualist', 'Academic', 'Traveler', 'Enigma', 'Corporate'
  ];

  const archetypeDefinitions = {
    'Wordsmith': 'Deep prompts, witty banter, high verbal engagement.',
    'Visualist': 'Curated aesthetic, professional photos, minimal text.',
    'Academic': 'Researchers, students, or high-intellectual "Resonance Markers".',
    'Traveler': 'Photos from various geographical coordinates, "Active" lifestyle.',
    'Enigma': 'Low-effort or mysterious prompts; high risk of "Ghosting" transitions.',
    'Corporate': 'Career-focused profiles; clear "Lifestyle Fit" markers.'
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[250] px-6 pt-20 pb-6 flex items-end justify-center text-left text-black" onClick={onCancel}>
      <div
        className="bg-[#FDFCF0] border-[5px] border-black rounded-[45px] p-8 w-full max-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom overflow-y-auto text-black max-h-[85vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 bg-[#FDFCF0] z-20 pb-6 flex justify-between items-start">
          <div>
            <h2 className="font-['Londrina_Solid'] text-5xl uppercase leading-none font-black text-black">Subject Registry</h2>
            <p className="opacity-40 uppercase font-['Londrina_Solid'] text-xl font-bold mt-1 tracking-tight text-black/40">Mirror Hypothesis Calibration</p>
          </div>
          <button onClick={onCancel} className="text-3xl opacity-20 font-bold p-2">✕</button>
        </header>

        <form onSubmit={(e) => {
          e.preventDefault();
          handleAddPerson({
            codename: e.target.codename.value,
            vectors: vectors,
            selfMood: mood,
            archetype: archetype,
            hypothesis: e.target.hypothesis.value
          });
        }} className="space-y-8 mt-4">

          <div className="bg-white border-4 border-black p-5 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
            <label className="text-[10px] uppercase font-black opacity-40 block mb-4 tracking-widest text-center">Researcher Self-Mood (Prior Bias)</label>
            <div className="flex justify-between items-center px-2">
              {moods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMood(m.id)}
                  className={`flex flex-col items-center gap-2 transition-all ${mood === m.id ? 'scale-110' : 'opacity-30 grayscale'}`}
                >
                  <span className="text-3xl">{m.icon}</span>
                  <span className="font-black text-[8px] uppercase">{m.id}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#FFD1DC] border-4 border-black p-5 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
            <label className="text-[10px] uppercase font-black opacity-40 block mb-1 tracking-widest">Subject Codename</label>
            <input required name="codename" type="text" placeholder="Alias..." className="w-full bg-transparent font-['Londrina_Solid'] text-4xl focus:outline-none text-black placeholder:opacity-20" />
          </div>

          <div className="bg-white border-4 border-black p-6 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-['Londrina_Solid'] text-xl uppercase font-black mb-6 flex items-center gap-2 text-blue-600">Resonance Markers <span className="text-[10px] opacity-30">(The Mirror)</span></h4>
            <div className="space-y-8">
              {Object.keys(vectors).map(v => (
                <div key={v} className="space-y-3">
                  <div className="flex justify-between font-black uppercase text-[12px] tracking-widest text-black">
                    <span>{v}</span>
                    <span className="bg-black text-white px-2 py-0.5 rounded-lg">{vectors[v]}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={vectors[v]}
                    onChange={(e) => setVectors({ ...vectors, [v]: parseInt(e.target.value) })}
                    className="w-full h-4 bg-black/5 rounded-full appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border-4 border-black p-5 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] relative">
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] uppercase font-black opacity-40 tracking-widest">
                Hook Archetype (Independent Var.)
              </label>
              <button
                type="button"
                onClick={() => setShowArchetypeInfo(true)}
                className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center font-serif italic text-xs bg-slate-100 active:scale-90"
              >
                i
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {archetypes.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setArchetype(a)}
                  className={`px-3 py-2 border-2 border-black rounded-xl text-[10px] font-black uppercase transition-all ${archetype === a ? 'bg-black text-white scale-105' : 'bg-white opacity-40'}`}
                >
                  {a}
                </button>
              ))}
            </div>

            {showArchetypeInfo && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] px-6 pt-20 pb-10 flex items-center justify-center animate-in fade-in duration-300">
                <div 
                  className="bg-[#FDFCF0] border-[5px] border-black rounded-[45px] p-8 w-full max-w-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative max-h-[70vh] flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button onClick={() => setShowArchetypeInfo(false)} className="absolute top-6 right-8 text-2xl font-black opacity-20 hover:opacity-100 transition-opacity">✕</button>
                  <header className="mb-6">
                    <div className="inline-block bg-blue-100 border-2 border-black px-3 py-1 rounded-full mb-3">
                      <p className="font-['Londrina_Solid'] text-[10px] uppercase tracking-widest font-black text-blue-600">Research Manual</p>
                    </div>
                    <h4 className="font-['Londrina_Solid'] text-4xl uppercase font-black leading-none text-black">Taxonomy</h4>
                  </header>
                  <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                    {Object.entries(archetypeDefinitions).map(([name, def]) => (
                      <div key={name} className="border-b-2 border-black/5 pb-4 last:border-0">
                        <p className="font-['Londrina_Solid'] text-xl uppercase font-black text-black leading-none mb-1">{name}</p>
                        <p className="text-sm font-medium opacity-60 leading-tight text-black">{def}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setShowArchetypeInfo(false)} className="mt-6 w-full bg-black text-white py-4 rounded-2xl font-['Londrina_Solid'] text-xl uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-1 transition-all">Understood</button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border-4 border-black p-6 rounded-3xl text-left shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
            <label className="text-[10px] uppercase font-black opacity-40 block mb-2 tracking-widest">Internal Hypothesis</label>
            <textarea required name="hypothesis" placeholder="Predict outcome..." className="w-full bg-transparent font-sans text-sm h-32 resize-none focus:outline-none text-black leading-relaxed" />
          </div>

          <button type="submit" className="w-full bg-black text-white p-6 rounded-[40px] font-['Londrina_Solid'] text-3xl uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none transition-all text-center">Inject Data</button>
        </form>
      </div>
    </div>
  );
};