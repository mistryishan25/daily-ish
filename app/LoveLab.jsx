"use client";
import React, { useState, useMemo, useEffect } from 'react';

/**
 * LoveLab.jsx 
 * Includes: LoveLab Main, BentoButton, MLMHeart, DatingBloomView, 
 * AddPersonModal, CalibrationGarden (37% Rule), and TestingLab (A/B testing).
 */

export default function LoveLab({ 
  appState, setAppState, emptySlots, activeSpecimens, sedimentPile, 
  setIsAddingPerson, isAddingPerson, handleAddPerson, SettingsIcon, 
  triggerSpecimenExpiration, fallingSpecimen, SparklesIcon
}) {
  const [selectedDate, setSelectedDate] = useState("TODAY");
  const [isDateActive, setIsDateActive] = useState(false);
  
  // Tracking which ID just got added to trigger the animation
  const [newlyAddedId, setNewlyAddedId] = useState(null);

  const dateTabs = useMemo(() => {
    return [...Array(6)].map((_, i) => {
      if (i === 0) return "TODAY";
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
  }, []);

  // Internal handler to clear animation state after it plays
  useEffect(() => {
    if (newlyAddedId) {
      const timer = setTimeout(() => setNewlyAddedId(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedId]);

  const wrapHandleAddPerson = (data) => {
    // Find the first empty slot ID to target animation
    const target = activeSpecimens.find(s => !s.codename);
    if (target) setNewlyAddedId(target.id);
    handleAddPerson(data);
  };

  // Helper to render the specific view content
  const renderCurrentView = () => {
    // --- SUB-VIEW: THE LAB (A/B Testing) ---
    if (appState === 'dating_lab') {
      return (
        <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in slide-in-from-right duration-500 overflow-y-auto text-black text-left">
          <header className="bg-[#1a1c2c] border-b-[6px] border-black px-10 py-8 flex justify-between items-center text-white relative shadow-xl text-left">
            <button onClick={() => setAppState('dating_hub')} className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity font-bold">BACK</button>
            <h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight font-black">Testing Lab</h2>
            <div className="w-10" />
          </header>
          <div className="p-8 space-y-8 max-w-2xl mx-auto w-full pb-32 text-left text-black">
            <div className="bg-[#FFD1DC] border-[5px] border-black rounded-[45px] p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-left">
              <div className="flex items-center gap-3 mb-6 text-left text-black text-left">
                <div className="w-10 h-10 bg-blue-500 rounded-full border-4 border-black flex items-center justify-center text-white font-black text-left">A</div>
                <h3 className="font-['Londrina_Solid'] text-3xl uppercase font-black text-left text-black">Baseline Profile</h3>
              </div>
              <textarea placeholder="Paste Bio A here..." className="w-full bg-white/50 border-4 border-black/10 rounded-2xl p-4 min-h-[100px] mb-4 font-sans text-sm focus:border-blue-500 outline-none transition-all text-left text-black" />
              <div className="grid grid-cols-2 gap-4 text-left">
                <LabMetric label="Matches" value={12} color="bg-white/40" />
                <LabMetric label="Conv. Rate" value="4.2%" color="bg-white/40" />
              </div>
            </div>

            <div className="bg-[#FFD1DC] border-[5px] border-black rounded-[45px] p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-left">
              <div className="flex items-center gap-3 mb-6 text-left text-black text-left">
                <div className="w-10 h-10 bg-pink-500 rounded-full border-4 border-black flex items-center justify-center text-white font-black text-left text-black">B</div>
                <h3 className="font-['Londrina_Solid'] text-3xl uppercase font-black text-left text-black">Challenger Profile</h3>
              </div>
              <textarea placeholder="Paste Bio B here..." className="w-full bg-white/50 border-4 border-black/10 rounded-2xl p-4 min-h-[100px] mb-4 font-sans text-sm focus:border-pink-500 outline-none transition-all text-left text-black" />
              <div className="grid grid-cols-2 gap-4 text-left">
                <LabMetric label="Matches" value={8} color="bg-white/40" />
                <LabMetric label="Conv. Rate" value="2.1%" color="bg-white/40" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // --- SUB-VIEW: ACTIVE BED (37% Calibration) ---
    if (appState === 'dating_garden') {
      const poolSize = 50; 
      const currentCount = 8 - emptySlots + sedimentPile.length;
      const threshold = Math.floor(poolSize * 0.37);
      const phase = currentCount <= threshold ? 'Exploration' : 'Selection';

      return (
        <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in slide-in-from-right duration-500 overflow-y-auto text-black text-left">
          <header className="bg-[#1a1c2c] border-b-[6px] border-black px-10 py-8 flex justify-between items-center text-white relative shadow-xl text-left">
            <button onClick={() => setAppState('dating_hub')} className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity font-bold">BACK</button>
            <h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight font-black">Calibration Bed</h2>
            <div className="w-10" />
          </header>
          <div className="p-8 space-y-8 max-w-2xl mx-auto w-full pb-32 text-left">
            <div className="bg-[#FFD1DC] border-[5px] border-black rounded-[45px] p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-center text-black">
              <h3 className="font-['Londrina_Solid'] text-2xl uppercase opacity-40 font-bold text-center text-black">Current Phase</h3>
              <div className={`font-['Londrina_Solid'] text-7xl uppercase font-black leading-none my-4 text-center ${phase === 'Exploration' ? 'text-blue-500' : 'text-green-500'}`}>
                {phase}
              </div>
              <p className="text-sm font-medium px-8 opacity-60 italic text-center text-black">
                {phase === 'Exploration' 
                  ? "Establishing the 'Look-Then-Leap' baseline. Do not commit yet." 
                  : "Baseline established. Select the first subject that exceeds all previous data points."}
              </p>
            </div>

            <div className="bg-[#FFD1DC] border-[5px] border-black rounded-[45px] p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-left">
               <div className="flex justify-between items-end mb-4 font-['Londrina_Solid'] uppercase text-left">
                  <span className="text-xl font-bold text-black text-left">Sample: {currentCount}/{poolSize}</span>
                  <span className="text-sm opacity-40 font-bold text-black text-left">Threshold: {threshold} (37%)</span>
               </div>
               <div className="w-full h-12 bg-white/30 border-[4px] border-black rounded-full overflow-hidden flex p-1 text-left">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000 border-r-4 border-black/20 text-left" 
                    style={{ width: `${Math.min((currentCount / poolSize) * 100, 37)}%` }} 
                  />
                  {currentCount > threshold && (
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-1000 ml-1 text-left" 
                      style={{ width: `${((currentCount - threshold) / poolSize) * 100}%` }} 
                    />
                  )}
               </div>
            </div>
          </div>
        </div>
      );
    }

    // --- SUB-VIEW: DAILY BLOOM ---
    if (appState === 'dating_bloom') {
      return (
        <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden text-black text-left">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes heart-pop-glow {
              0% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(255,255,255,0)); }
              50% { transform: scale(1.3); filter: drop-shadow(0 0 30px #fff700); }
              100% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(255,255,255,0)); }
            }
            .animate-pop-glow { animation: heart-pop-glow 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
          `}} />

          <header className="bg-[#1a1c2c] border-b-[6px] border-black px-10 py-8 flex justify-between items-center text-white relative shadow-xl text-left">
            <button 
              onClick={() => isDateActive ? setIsDateActive(false) : setAppState('dating_hub')} 
              className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity font-bold"
            >
              {isDateActive ? 'BACK TO LOG' : 'EXIT LOG'}
            </button>
            <h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight text-white font-black text-left text-white">
              {isDateActive ? selectedDate : 'Daily Bloom'}
            </h2>
            <div className="w-10" />
          </header>

          {!isDateActive ? (
            <div className="flex-1 p-8 overflow-y-auto text-left">
              <div className="mb-8 text-left text-black">
                <p className="font-['Londrina_Solid'] text-xl opacity-30 uppercase tracking-tight font-bold text-left">Experimental Cycles</p>
                <h3 className="font-['Londrina_Solid'] text-5xl uppercase leading-none text-left">Select Record</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left">
                {dateTabs.map((date) => (
                  <button 
                    key={date}
                    onClick={() => {
                      setSelectedDate(date);
                      setIsDateActive(true);
                    }}
                    className={`py-6 px-4 border-[4px] border-black rounded-[35px] font-['Londrina_Solid'] text-2xl uppercase transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex flex-col items-center justify-center gap-2 ${
                      selectedDate === date 
                        ? 'bg-[#ff748c] text-black translate-y-0.5' 
                        : 'bg-[#FFD1DC] text-black hover:bg-[#ffb6c1]'
                    }`}
                  >
                    <span className="opacity-40 text-[10px] font-black tracking-widest text-left text-black">LOG DATE</span>
                    {date}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 relative overflow-y-auto glass-body flex flex-col bg-white/5 p-8 text-left animate-in slide-in-from-bottom duration-300">
                <div className="grid grid-cols-2 gap-y-16 gap-x-10 mb-24 justify-items-center text-left">
                  {activeSpecimens.map((s, i) => (
                    <div key={s.id} className="flex flex-col items-center text-left">
                      <div className={newlyAddedId === s.id ? 'animate-pop-glow' : 'animate-float'} style={{ animationDelay: `${i * 0.1}s` }}>
                         <MLMHeart id={`detail-${s.id}`} isPlaceholder={!s.codename} />
                      </div>
                      {s.codename ? (
                        <button onClick={() => triggerSpecimenExpiration(s)} className="font-['Londrina_Solid'] text-xs uppercase mt-5 opacity-60 font-bold text-black text-center group active:scale-95 transition-transform">
                          Terminate {String(s.codename)}
                        </button>
                      ) : selectedDate === "TODAY" ? (
                        <button 
                          onClick={() => setIsAddingPerson(true)}
                          className="bg-black text-white px-3 py-1.5 rounded-xl border-2 border-black font-['Londrina_Solid'] text-[10px] uppercase mt-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all font-black text-center"
                        >
                          Register Subject
                        </button>
                      ) : (
                        <span className="font-['Londrina_Solid'] text-xs uppercase mt-5 opacity-20 font-bold text-black text-center">Dormant Slot</span>
                      )}
                    </div>
                  ))}
                </div>
                {fallingSpecimen && (
                  <div className="animate-physics-drop absolute bottom-32 left-1/2 -translate-x-1/2 text-left" style={{ '--final-rot': `${fallingSpecimen.rot}deg`, zIndex: 100 }}>
                    <MLMHeart id={`fall-${fallingSpecimen.id}`} />
                  </div>
                )}
              </div>
              <div className="bg-black p-6 border-t-[6px] border-black text-center text-white font-black uppercase text-xs text-center text-white">
                Active Cycle: {selectedDate} — Sediment Log: {sedimentPile.length} Hearts
              </div>
            </>
          )}
        </div>
      );
    }

    // --- Placeholder: Playbook ---
    if (appState === 'dating_playbook') {
      return (
        <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in zoom-in duration-300 text-black text-left">
          <header className="bg-[#1a1c2c] border-b-[6px] border-black px-10 py-8 flex justify-between items-center text-white relative shadow-xl text-left text-white">
            <button onClick={() => setAppState('dating_hub')} className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity font-bold text-white text-left text-white">BACK</button>
            <h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight text-white text-left text-white text-left text-white">PLAYBOOK STATION</h2>
            <div className="w-10" />
          </header>
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center opacity-30 text-black text-center">
            <SparklesIcon size={100} className="mb-6 text-black text-center text-black" />
            <h3 className="font-['Londrina_Solid'] text-4xl uppercase font-black text-center text-black">Calibration Required</h3>
            <p className="font-['Londrina_Solid'] text-xl uppercase mt-2 font-bold text-center text-black">Refining local variables...</p>
          </div>
        </div>
      );
    }

    // --- MAIN HUB LAYOUT (Default fallback) ---
    return (
      <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden text-black text-left">
        <header className="bg-[#1a1c2c] border-b-[6px] border-black px-10 py-8 flex justify-between items-center text-white relative shadow-xl text-left text-white">
           <button onClick={() => setAppState('garden')} className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity font-bold text-white text-left">EXIT LAB</button>
           <h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight text-white font-black text-left text-white">The Love Jar</h2>
           <button className="w-10 h-10 flex items-center justify-center border-4 border-white/20 rounded-xl bg-white/5 text-white text-left"><SettingsIcon size={20} className="text-white" /></button>
        </header>
        
        <div className="flex-1 relative overflow-y-auto glass-body flex flex-col bg-white/5 p-8 pb-40 text-left text-black">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto w-full mb-10 text-left">
              <BentoButton title="Daily Bloom" bg="bg-[#FFD1DC]" onClick={() => setAppState('dating_bloom')}>
                 <p className="font-['Londrina_Solid'] text-2xl text-black font-black text-left">Flowers: {String(8 - emptySlots)}</p>
                 <p className="font-['Londrina_Solid'] text-xl text-black opacity-40 font-bold text-left">Available: {String(emptySlots)}</p>
              </BentoButton>
              <BentoButton title="Active Bed" bg="bg-[#C1E1C1]" onClick={() => setAppState('dating_garden')}>
                 <p className="font-['Londrina_Solid'] text-2xl text-black font-black text-left">Phase: {activeSpecimens.filter(s => s.codename).length > 18 ? 'Selection' : 'Exploration'}</p>
                 <p className="font-['Londrina_Solid'] text-xl text-black opacity-40 font-bold text-left">37% Rule Tracking</p>
              </BentoButton>
              <BentoButton title="The Lab" bg="bg-[#AEC6CF]" onClick={() => setAppState('dating_lab')}>
                 <p className="font-['Londrina_Solid'] text-2xl text-black font-black text-left text-left">A/B Match Rate</p>
                 <p className="font-['Londrina_Solid'] text-xl text-black opacity-40 font-bold text-left text-left">Profile Split Testing</p>
              </BentoButton>
              <BentoButton title="Playbook" bg="bg-[#FFFACD]" onClick={() => setAppState('dating_playbook')} className="rotate-[-1deg] text-left">
                 <p className="font-['Londrina_Solid'] text-2xl text-black font-black text-left">Openers: 12</p>
                 <p className="font-['Londrina_Solid'] text-xl text-black opacity-40 font-bold text-left text-left">Trial tactics</p>
              </BentoButton>
           </div>
           <button onClick={() => setIsAddingPerson(true)} className="w-full max-w-2xl mx-auto bg-black text-white border-[5px] border-black rounded-[45px] p-8 shadow-[10px_10px_0px_0px_rgba(100,100,100,0.5)] active:translate-y-2 transition-all flex items-center justify-center group text-white font-black text-4xl font-['Londrina_Solid'] uppercase text-center text-center">
              Recruit New Subject
           </button>
        </div>

        <div className="bg-black p-6 border-t-[6px] border-black text-center text-white font-black uppercase text-xs flex justify-between items-center text-center text-white">
           <span>Love Jar Content: {sedimentPile.length} Hearts</span>
           <div className="flex gap-1 text-center">{[...Array(Math.min(sedimentPile.length, 10))].map((_, i) => (<div key={i} className="w-2 h-2 rounded-full bg-white/20 text-center" />))}</div>
        </div>
      </div>
    );
  };

  // MAIN RETURN WRAPPER: Ensures Modals are globally accessible
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
  <div className={`${color} border-[3px] border-black rounded-2xl p-4 flex flex-col items-center justify-center text-center text-black`}>
    <span className="font-['Londrina_Solid'] text-[10px] uppercase font-black opacity-40 text-center">{label}</span>
    <span className="font-['Londrina_Solid'] text-3xl font-black text-center">{value}</span>
  </div>
);

const BentoButton = ({ title, bg, onClick, children, className = "" }) => (
  <button onClick={onClick} className={`${bg} border-[5px] border-black rounded-[45px] p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between h-[220px] active:scale-95 transition-all group ${className} text-left`}>
    <span className="font-['Londrina_Solid'] text-3xl uppercase text-black font-bold text-left">{title}</span>
    <div className="flex flex-col text-left text-black">{children}</div>
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

const AddPersonModal = ({ handleAddPerson, onCancel }) => (
  <div className="fixed inset-0 bg-black/60 z-[250] p-6 flex items-end justify-center text-left text-black" onClick={onCancel}>
    <div 
      className="bg-[#FDFCF0] border-[5px] border-black rounded-[40px] p-10 w-full max-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom overflow-y-auto text-black text-left text-left max-h-[90vh]" 
      onClick={(e) => e.stopPropagation()}
    >
      <header className="flex justify-between items-start mb-8 text-left text-black">
        <div className="text-left text-black">
          <h2 className="font-['Londrina_Solid'] text-5xl uppercase leading-none font-black text-black text-left">Subject Entry</h2>
          <p className="opacity-40 uppercase font-['Londrina_Solid'] text-xl font-bold text-black text-left mt-1">High-Fidelity Registration</p>
        </div>
        <button onClick={onCancel} className="text-3xl opacity-20 font-bold text-black text-left">✕</button>
      </header>
      
      <form onSubmit={(e) => { 
        e.preventDefault(); 
        handleAddPerson({ 
          codename: e.target.codename.value,
          origin: e.target.origin.value,
          hingeIntel: e.target.hingeIntel.value,
          hypothesis: e.target.hypothesis.value,
          vibeScore: e.target.vibeScore.value
        }); 
      }} className="space-y-6 text-left text-black">
        
        <div className="bg-[#FFD1DC] border-4 border-black p-4 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-left">
          <label className="text-[10px] uppercase font-black opacity-40 block mb-1 text-black">Subject Codename</label>
          <input required name="codename" type="text" placeholder="Subject Name / Alias..." className="w-full bg-transparent font-['Londrina_Solid'] text-3xl focus:outline-none text-black text-left" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border-4 border-black p-4 rounded-3xl text-left">
            <label className="text-[10px] uppercase font-black opacity-40 block mb-1 text-black">Origin</label>
            <input required name="origin" type="text" placeholder="Hinge, IRL..." className="w-full bg-transparent font-['Londrina_Solid'] text-xl focus:outline-none text-black text-left" />
          </div>
          <div className="bg-white border-4 border-black p-4 rounded-3xl text-left">
            <label className="text-[10px] uppercase font-black opacity-40 block mb-1 text-black text-left">Initial Vibe (1-10)</label>
            <input required name="vibeScore" type="number" min="1" max="10" placeholder="5" className="w-full bg-transparent font-['Londrina_Solid'] text-xl focus:outline-none text-black text-left" />
          </div>
        </div>

        <div className="bg-white border-4 border-black p-4 rounded-3xl text-left text-black">
          <label className="text-[10px] uppercase font-black opacity-40 block mb-1 text-black text-left">Hinge Intel / First Impression</label>
          <textarea required name="hingeIntel" placeholder="Key prompts, vibe notes, early observations..." className="w-full bg-transparent font-sans text-sm h-24 resize-none focus:outline-none text-black text-left" />
        </div>

        <div className="bg-white border-4 border-black p-4 rounded-3xl text-left text-black">
          <label className="text-[10px] uppercase font-black opacity-40 block mb-1 text-black text-left text-left">Initial Hypothesis (Why the interest?)</label>
          <textarea required name="hypothesis" placeholder="Log the core reasoning for subject selection..." className="w-full bg-transparent font-sans text-sm h-24 resize-none focus:outline-none text-black text-left" />
        </div>

        <button type="submit" className="w-full bg-black text-white p-6 rounded-[40px] font-['Londrina_Solid'] text-3xl uppercase shadow-[8px_8px_0px_0px_rgba(100,100,100,1)] active:translate-y-1 transition-all text-center">Inject Subject</button>
      </form>
    </div>
  </div>
);