"use client";
import React, { useState } from 'react';

/**
 * LoveLab.jsx 
 * Includes: LoveLab, BentoButton, MLMHeart, DatingBloomView, AddPersonModal
 */

export default function LoveLab({ 
  appState, setAppState, emptySlots, activeSpecimens, sedimentPile, 
  setIsAddingPerson, isAddingPerson, handleAddPerson, SettingsIcon, 
  triggerSpecimenExpiration, fallingSpecimen, SparklesIcon
}) {

  // --- Sub-View Switcher: Daily Bloom ---
  if (appState === 'dating_bloom') {
    return (
      <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden text-black text-left">
        <header className="bg-[#1a1c2c] border-b-[6px] border-black px-10 py-8 flex justify-between items-center text-white relative shadow-xl">
          <button onClick={() => setAppState('dating_hub')} className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity font-bold">BACK</button>
          <h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight text-white font-black">Daily Bloom</h2>
          <div className="w-10" />
        </header>
        <div className="flex-1 relative overflow-y-auto glass-body flex flex-col bg-white/5 p-8">
          <div className="grid grid-cols-2 gap-y-16 gap-x-10 mb-24 justify-items-center">
            {activeSpecimens.map((s, i) => (
              <button key={s.id} onClick={() => triggerSpecimenExpiration(s)} className="flex flex-col items-center animate-float group" style={{ animationDelay: `${i * 0.4}s` }}>
                <MLMHeart id={`detail-${s.id}`} isPlaceholder={!s.codename} />
                <span className="font-['Londrina_Solid'] text-xs uppercase mt-5 opacity-60 font-bold group-active:scale-110 transition-transform">
                  {s.codename ? `Terminate ${String(s.codename)}` : 'Dormant Slot'}
                </span>
              </button>
            ))}
          </div>
          {fallingSpecimen && (
            <div className="animate-physics-drop absolute bottom-32 left-1/2 -translate-x-1/2" style={{ '--final-rot': `${fallingSpecimen.rot}deg`, zIndex: 100 }}>
              <MLMHeart id={`fall-${fallingSpecimen.id}`} />
            </div>
          )}
        </div>
        <div className="bg-black p-6 border-t-[6px] border-black text-center text-white font-black uppercase text-xs">Sediment Log: {sedimentPile.length}</div>
      </div>
    );
  }

  // --- Sub-View: Calibration required placeholders ---
  if (['dating_garden', 'dating_lab', 'dating_playbook'].includes(appState)) {
    return (
      <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in zoom-in duration-300 text-black">
        <header className="bg-[#1a1c2c] border-b-[6px] border-black px-10 py-8 flex justify-between items-center text-white relative shadow-xl">
          <button onClick={() => setAppState('dating_hub')} className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity font-bold text-white">BACK</button>
          <h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight">{String(appState.split('_')[1].toUpperCase())} STATION</h2>
          <div className="w-10" />
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center opacity-30 text-black">
          <SparklesIcon size={100} className="mb-6 text-black" />
          <h3 className="font-['Londrina_Solid'] text-4xl uppercase font-black">Calibration Required</h3>
          <p className="font-['Londrina_Solid'] text-xl uppercase mt-2 font-bold">Refining local variables...</p>
        </div>
      </div>
    );
  }

  // --- Main Hub Layout ---
  return (
    <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden text-black">
      <header className="bg-[#1a1c2c] border-b-[6px] border-black px-10 py-8 flex justify-between items-center text-white relative shadow-xl">
         <button onClick={() => setAppState('garden')} className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity font-bold text-white">EXIT LAB</button>
         <h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight text-white font-black">The Love Jar</h2>
         <button className="w-10 h-10 flex items-center justify-center border-4 border-white/20 rounded-xl bg-white/5 text-white"><SettingsIcon size={20} className="text-white" /></button>
      </header>
      
      <div className="flex-1 relative overflow-y-auto glass-body flex flex-col bg-white/5 p-8 pb-40">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto w-full mb-10">
            <BentoButton title="Daily Bloom" bg="bg-[#FFD1DC]" onClick={() => setAppState('dating_bloom')}>
               <p className="font-['Londrina_Solid'] text-2xl text-black font-black">Flowers: {String(8 - emptySlots)}</p>
               <p className="font-['Londrina_Solid'] text-xl text-black opacity-40 font-bold">Available: {String(emptySlots)}</p>
            </BentoButton>
            <BentoButton title="Active Bed" bg="bg-[#C1E1C1]" onClick={() => setAppState('dating_garden')}>
               <p className="font-['Londrina_Solid'] text-2xl text-black font-black">Active: {String(activeSpecimens.filter(s => s.codename).length)}</p>
               <p className="font-['Londrina_Solid'] text-xl text-black opacity-40 font-bold">Tracking live</p>
            </BentoButton>
            <BentoButton title="The Lab" bg="bg-[#AEC6CF]" onClick={() => setAppState('dating_lab')}>
               <p className="font-['Londrina_Solid'] text-2xl text-black font-black">Iteration: 2.1</p>
               <p className="font-['Londrina_Solid'] text-xl text-black opacity-40 font-bold">Profile: V2</p>
            </BentoButton>
            <BentoButton title="Playbook" bg="bg-[#FFFACD]" onClick={() => setAppState('dating_playbook')} className="rotate-[-1deg]">
               <p className="font-['Londrina_Solid'] text-2xl text-black font-black">Ideas: 12</p>
               <p className="font-['Londrina_Solid'] text-xl text-black opacity-40 font-bold">Trial tactics</p>
            </BentoButton>
         </div>
         <button onClick={() => setIsAddingPerson(true)} className="w-full max-w-2xl mx-auto bg-black text-white border-[5px] border-black rounded-[45px] p-8 shadow-[10px_10px_0px_0px_rgba(100,100,100,0.5)] active:translate-y-2 transition-all flex items-center justify-center group text-white font-black text-4xl font-['Londrina_Solid'] uppercase">
            Recruit New Subject
         </button>
      </div>

      {isAddingPerson && <AddPersonModal handleAddPerson={handleAddPerson} setIsAddingPerson={setIsAddingPerson} />}

      <div className="bg-black p-6 border-t-[6px] border-black text-center text-white font-black uppercase text-xs flex justify-between items-center">
         <span>Love Jar Content: {sedimentPile.length} Hearts</span>
         <div className="flex gap-1">{[...Array(Math.min(sedimentPile.length, 10))].map((_, i) => (<div key={i} className="w-2 h-2 rounded-full bg-white/20" />))}</div>
      </div>
    </div>
  );
};

// --- Sub-Components ---

const BentoButton = ({ title, bg, onClick, children, className = "" }) => (
  <button onClick={onClick} className={`${bg} border-[5px] border-black rounded-[45px] p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between h-[220px] active:scale-95 transition-all group ${className}`}>
    <span className="font-['Londrina_Solid'] text-3xl uppercase text-black font-bold">{title}</span>
    <div className="flex flex-col text-black">{children}</div>
  </button>
);

const MLMHeart = ({ size = 125, id = "heart", opacity = 1, isPlaceholder = false, style = {}, className = "" }) => {
  const mlmStripes = ['#98E8C1', '#FFFFFF', '#7BADE2'];
  return (
    <svg width={size} height={size} viewBox="0 0 125 125" style={{ opacity: isPlaceholder ? 0.15 : opacity, ...style }} className={className}>
      <defs><clipPath id={`${id}-clip`}><path d="M60 105 C60 105 15 80 15 45 15 20 50 20 60 35 70 20 105 20 105 45 105 80 60 105 60 105 Z" /></clipPath></defs>
      <g transform="translate(2, 2)">
        <path d="M60 105 C60 105 15 80 15 45 15 20 50 20 60 35 70 20 105 20 105 45 105 80 60 105 60 105 Z" fill="black" transform="translate(6, 6)" />
        {isPlaceholder ? <path d="M60 105 C60 105 15 80 15 45 15 20 50 20 60 35 70 20 105 20 105 45 105 80 60 105 60 105 Z" fill="black" /> : (
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

const AddPersonModal = ({ handleAddPerson, setIsAddingPerson }) => (
  <div className="fixed inset-0 bg-black/60 z-[200] p-6 flex items-end justify-center text-left text-black"><div className="bg-[#FDFCF0] border-[5px] border-black rounded-[40px] p-8 w-full max-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom overflow-y-auto text-black"><header className="flex justify-between items-start mb-6"><div><h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none font-black text-black">Subject Recruitment</h2><p className="opacity-40 uppercase font-['Londrina_Solid'] text-lg font-bold text-black">Transforms dormant slots</p></div><button onClick={() => setIsAddingPerson(false)} className="text-3xl opacity-20 font-bold">✕</button></header><form onSubmit={(e) => { e.preventDefault(); handleAddPerson({ codename: e.target.codename.value }); }} className="space-y-5"><div className="bg-white border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><label className="text-[10px] uppercase font-black opacity-40 block mb-1">Subject Codename</label><input required name="codename" type="text" placeholder="..." className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none text-black" /></div><button type="submit" className="w-full bg-black text-white p-5 rounded-3xl font-['Londrina_Solid'] text-2xl uppercase shadow-[6px_6px_0px_0px_rgba(100,100,100,1)] active:translate-y-1 transition-all text-center">Inject Subject</button></form></div></div>
);