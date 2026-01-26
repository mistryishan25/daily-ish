"use client";
import React, { useState, useMemo, useEffect } from 'react';

/**
 * LoveLab.jsx 
 * Handles: Main Hub, Daily Bloom directory, 37% Rule Calibration, 
 * A/B Testing Lab, and high-fidelity Subject Entry.
 */

export default function LoveLab({ 
  appState, setAppState, emptySlots, activeSpecimens, sedimentPile, 
  setIsAddingPerson, isAddingPerson, handleAddPerson, SettingsIcon, 
  triggerSpecimenExpiration, fallingSpecimen, SparklesIcon
}) {
  const [selectedDate, setSelectedDate] = useState("TODAY");
  const [isDateActive, setIsDateActive] = useState(false);
  
  // Trigger for the lightbulb-glow animation
  const [newlyAddedId, setNewlyAddedId] = useState(null);

  const dateTabs = useMemo(() => {
    return [...Array(6)].map((_, i) => {
      if (i === 0) return "TODAY";
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
  }, []);

  useEffect(() => {
    if (newlyAddedId) {
      const timer = setTimeout(() => setNewlyAddedId(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedId]);

  const wrapHandleAddPerson = (data) => {
    // Find next available slot to animate
    const target = activeSpecimens.find(s => !s.codename);
    if (target) setNewlyAddedId(target.id);
    handleAddPerson(data);
  };

  const renderCurrentView = () => {
    // --- STATION: THE LAB (A/B Testing) ---
    if (appState === 'dating_lab') {
      return (
        <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in slide-in-from-right duration-500 overflow-y-auto text-black text-left">
          <header className="bg-[#1a1c2c] border-b-[6px] border-black px-10 py-8 flex justify-between items-center text-white relative shadow-xl">
            <button onClick={() => setAppState('dating_hub')} className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity font-bold">BACK</button>
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

    // --- STATION: ACTIVE GARDEN (Engagement Monitoring) ---
    if (appState === 'dating_garden') {
      const poolSize = 50; 
      const currentCount = 8 - emptySlots + sedimentPile.length;
      const threshold = Math.floor(poolSize * 0.37);
      const phase = currentCount <= threshold ? 'Exploration' : 'Selection';

      return (
        <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in slide-in-from-right duration-500 overflow-y-auto text-black text-left">
          <header className="bg-[#1a1c2c] border-b-[6px] border-black px-10 py-8 flex justify-between items-center text-white relative shadow-xl">
            <button onClick={() => setAppState('dating_hub')} className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity font-bold">BACK</button>
            <h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight font-black">Active Garden</h2>
            <div className="w-10" />
          </header>
          <div className="p-8 space-y-8 max-w-2xl mx-auto w-full pb-32">
            {/* OPTIMAL STOPPING CALIBRATION */}
            <div className="bg-[#FFD1DC] border-[5px] border-black rounded-[45px] p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-center">
              <h3 className="font-['Londrina_Solid'] text-2xl uppercase opacity-40 font-bold">Phase: {phase}</h3>
              <div className={`font-['Londrina_Solid'] text-7xl uppercase font-black leading-none my-4 ${phase === 'Exploration' ? 'text-blue-600' : 'text-green-600'}`}>
                {currentCount}/{poolSize}
              </div>
              <div className="w-full h-8 bg-white/30 border-[3px] border-black rounded-full overflow-hidden flex p-1 mb-4">
                 <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min((currentCount / poolSize) * 100, 37)}%` }} />
                 {currentCount > threshold && <div className="h-full bg-green-500 rounded-full ml-1" style={{ width: `${((currentCount - threshold) / poolSize) * 100}%` }} />}
              </div>
              <p className="text-xs opacity-60 italic font-medium px-4">Establishing baseline quality. Commit only after 37% of sample size is processed.</p>
            </div>

            {/* RECIPROCAL POTENTIAL MODULE */}
            <div className="bg-white border-[5px] border-black rounded-[45px] p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
              <h4 className="font-['Londrina_Solid'] text-2xl uppercase font-black mb-6">Live Behavioral Tracking</h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-center bg-slate-50 p-5 rounded-3xl border-2 border-black/5">
                    <div className="flex flex-col"><span className="font-bold uppercase text-[9px] opacity-40">Avg Reply Latency</span><span className="font-['Londrina_Solid'] text-2xl">4.2 HOURS</span></div>
                    <span className="text-2xl opacity-20">🕒</span>
                 </div>
                 <div className="flex justify-between items-center bg-slate-50 p-5 rounded-3xl border-2 border-black/5">
                    <div className="flex flex-col"><span className="font-bold uppercase text-[9px] opacity-40">Effort Ratio (You:Him)</span><span className="font-['Londrina_Solid'] text-2xl">1.2 : 1.0</span></div>
                    <span className="text-2xl opacity-20">⚖️</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // --- STATION: DAILY BLOOM ---
    if (appState === 'dating_bloom') {
      return (
        <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden text-black text-left">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes heart-pop-glow {
              0% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(255,255,255,0)); }
              50% { transform: scale(1.4); filter: drop-shadow(0 0 35px #fff700); }
              100% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(255,255,255,0)); }
            }
            .animate-pop-glow { animation: heart-pop-glow 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
          `}} />

          <header className="bg-[#1a1c2c] border-b-[6px] border-black px-10 py-8 flex justify-between items-center text-white relative shadow-xl">
            <button onClick={() => isDateActive ? setIsDateActive(false) : setAppState('dating_hub')} className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity font-bold">
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
                    className={`py-6 px-4 border-[4px] border-black rounded-[35px] font-['Londrina_Solid'] text-2xl uppercase transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex flex-col items-center justify-center gap-2 ${
                      selectedDate === date ? 'bg-[#ff748c] text-black translate-y-0.5' : 'bg-[#FFD1DC] text-black hover:bg-[#ffb6c1]'
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
              <div className="flex-1 relative overflow-y-auto glass-body flex flex-col bg-white/5 p-8 animate-in slide-in-from-bottom duration-300">
                <div className="grid grid-cols-2 gap-y-16 gap-x-10 mb-24 justify-items-center">
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
              <div className="bg-black p-6 border-t-[6px] border-black text-center text-white font-black uppercase text-xs">
                Active Cycle: {selectedDate} — Sediment Log: {sedimentPile.length} Hearts
              </div>
            </>
          )}
        </div>
      );
    }

    // --- MAIN HUB LAYOUT ---
    return (
      <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden text-black text-left">
        <header className="bg-[#1a1c2c] border-b-[6px] border-black px-10 py-8 flex justify-between items-center text-white relative shadow-xl">
           <button onClick={() => setAppState('garden')} className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity font-bold">EXIT LAB</button>
           <h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight font-black text-white">The Love Jar</h2>
           <button className="w-10 h-10 flex items-center justify-center border-4 border-white/20 rounded-xl bg-white/5 text-white"><SettingsIcon size={20} /></button>
        </header>
        
        <div className="flex-1 relative overflow-y-auto glass-body flex flex-col bg-white/5 p-8 pb-40">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto w-full mb-10">
              <BentoButton title="Daily Bloom" bg="bg-[#FFD1DC]" onClick={() => setAppState('dating_bloom')}>
                 <p className="font-['Londrina_Solid'] text-2xl text-black font-black">Today's Cycle</p>
                 <p className="font-['Londrina_Solid'] text-xl text-black opacity-40 font-bold">View Hearts: {8 - emptySlots}</p>
              </BentoButton>
              <BentoButton title="Active Garden" bg="bg-[#C1E1C1]" onClick={() => setAppState('dating_garden')}>
                 <p className="font-['Londrina_Solid'] text-2xl text-black font-black">Reciprocal Study</p>
                 <p className="font-['Londrina_Solid'] text-xl text-black opacity-40 font-bold">Latency: 4.2h</p>
              </BentoButton>
              <BentoButton title="The Lab" bg="bg-[#AEC6CF]" onClick={() => setAppState('dating_lab')}>
                 <p className="font-['Londrina_Solid'] text-2xl text-black font-black">Split Profiles</p>
                 <p className="font-['Londrina_Solid'] text-xl text-black opacity-40 font-bold">Match Conversion</p>
              </BentoButton>
              <BentoButton title="Playbook" bg="bg-[#FFFACD]" onClick={() => setAppState('dating_playbook')} className="rotate-[-1deg]">
                 <p className="font-['Londrina_Solid'] text-2xl text-black font-black">Experimental Tactics</p>
                 <p className="font-['Londrina_Solid'] text-xl text-black opacity-40 font-bold">12 Active Hooks</p>
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

// --- Sub-Components ---

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
  const [vectors, setVectors] = useState({ Aesthetic: 5, Intel: 5, Vibe: 5 });

  return (
    <div className="fixed inset-0 bg-black/70 z-[250] p-6 flex items-end justify-center text-left text-black" onClick={onCancel}>
      <div 
        className="bg-[#FDFCF0] border-[5px] border-black rounded-[45px] p-10 w-full max-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom overflow-y-auto text-black max-h-[90vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-start mb-8">
          <div>
            <h2 className="font-['Londrina_Solid'] text-5xl uppercase leading-none font-black text-black">Subject Registry</h2>
            <p className="opacity-40 uppercase font-['Londrina_Solid'] text-xl font-bold mt-1">Quantifying the Attraction Profile</p>
          </div>
          <button onClick={onCancel} className="text-3xl opacity-20 font-bold">✕</button>
        </header>
        
        <form onSubmit={(e) => { 
          e.preventDefault(); 
          handleAddPerson({ 
            codename: e.target.codename.value,
            origin: e.target.origin.value,
            vectors: vectors,
            hypothesis: e.target.hypothesis.value 
          }); 
        }} className="space-y-6">
          
          <div className="bg-[#FFD1DC] border-4 border-black p-4 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-left">
            <label className="text-[10px] uppercase font-black opacity-40 block mb-1">Subject Codename</label>
            <input required name="codename" type="text" placeholder="Alias..." className="w-full bg-transparent font-['Londrina_Solid'] text-3xl focus:outline-none text-black" />
          </div>

          <div className="bg-white border-4 border-black p-6 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-['Londrina_Solid'] text-xl uppercase font-black mb-4 flex items-center gap-2">Attraction Vector <span className="text-[10px] opacity-20">(Radar Base)</span></h4>
            <div className="space-y-5">
              {['Aesthetic', 'Intel', 'Vibe'].map(v => (
                <div key={v} className="space-y-1">
                  <div className="flex justify-between font-black uppercase text-[10px]"><span>{v}</span><span>{vectors[v]}/10</span></div>
                  <input type="range" min="1" max="10" value={vectors[v]} onChange={(e) => setVectors({...vectors, [v]: parseInt(e.target.value)})} className="w-full accent-[#ff748c]" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border-4 border-black p-4 rounded-3xl text-left">
            <label className="text-[10px] uppercase font-black opacity-40 block mb-1">Hinge Intel / Why him?</label>
            <textarea required name="hypothesis" placeholder="Log initial hooks and attraction hypothesis..." className="w-full bg-transparent font-sans text-sm h-24 resize-none focus:outline-none text-black" />
          </div>

          <button type="submit" className="w-full bg-black text-white p-6 rounded-[40px] font-['Londrina_Solid'] text-3xl uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,0.4)] active:translate-y-1 transition-all text-center">Inject Data</button>
        </form>
      </div>
    </div>
  );
};