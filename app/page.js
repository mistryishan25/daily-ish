"use client";
import React, { useState } from 'react';

/**
 * PixelIcon Component
 * Draws Nounish-style pixel art using basic SVG shapes.
 */
const PixelIcon = ({ type, color = "currentColor" }) => {
  const icons = {
    plant: (
      <svg viewBox="0 0 10 10" className="w-10 h-10">
        <rect x="4" y="7" width="2" height="3" fill="#795548" />
        <rect x="3" y="4" width="4" height="3" fill="#4CAF50" />
        <rect x="4" y="2" width="2" height="2" fill="#8BC34A" />
      </svg>
    ),
    book: (
      <svg viewBox="0 0 10 10" className="w-9 h-9">
        <rect x="2" y="2" width="6" height="6" fill="white" stroke="black" strokeWidth="0.5" />
        <rect x="2" y="2" width="1.5" height="6" fill={color} stroke="black" strokeWidth="0.5" />
        <rect x="4" y="4" width="3" height="0.5" fill="black" />
        <rect x="4" y="5.5" width="3" height="0.5" fill="black" />
      </svg>
    ),
    dumbell: (
      <svg viewBox="0 0 10 10" className="w-9 h-9">
        <rect x="1" y="3" width="2" height="4" fill="black" />
        <rect x="7" y="3" width="2" height="4" fill="black" />
        <rect x="3" y="4.5" width="4" height="1" fill="black" />
      </svg>
    ),
    sparkle: (
      <svg viewBox="0 0 10 10" className="w-10 h-10">
        <rect x="4.5" y="1" width="1" height="8" fill={color} />
        <rect x="1" y="4.5" width="8" height="1" fill={color} />
        <rect x="3" y="3" width="4" height="4" fill={color} />
      </svg>
    )
  };
  return icons[type] || icons.sparkle;
};

/**
 * BentoTile Component
 * The main UI building block with Nounish styling and touch feedback.
 */
const BentoTile = ({ title, value, color, icon, size = "small", onClick }) => {
  const sizeClasses = size === "large" ? "col-span-2 row-span-2" : "col-span-1 row-span-1";
  
  return (
    <button 
      onClick={onClick}
      className={`${color} ${sizeClasses} border-[5px] border-black rounded-[35px] p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] 
      transition-all active:scale-[0.96] active:shadow-none flex flex-col justify-between text-left group overflow-hidden`}
    >
      <div className="flex justify-between items-start gap-2 w-full">
        <h2 className="font-['Londrina_Solid'] uppercase text-2xl tracking-wide leading-[0.9] text-black">
          {title}
        </h2>
        <div className="shrink-0 group-hover:rotate-12 transition-transform">
          <PixelIcon type={icon} color="black" />
        </div>
      </div>
      <div className="font-['Londrina_Solid'] text-5xl leading-none mt-2 text-black">
        {value}
      </div>
    </button>
  );
};

export default function App() {
  const [counts, setCounts] = useState({ reading: 12, workout: 5, focus: 88 });

  const increment = (key) => {
    setCounts(prev => ({ ...prev, [key]: prev[key] + 1 }));
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] p-5 pb-24 text-black select-none font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Londrina+Solid:wght@300;400;900&display=swap');
        body { background-color: #FDFCF0; margin: 0; padding: 0; }
        * { -webkit-tap-highlight-color: transparent; outline: none; }
      ` }} />

      <header className="mb-8 pt-4">
        <div className="inline-block border-[3px] border-black bg-white px-3 py-1 rounded-full mb-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-['Londrina_Solid'] text-xs uppercase tracking-widest text-black">Experimental Log v1.0</p>
        </div>
        <h1 className="font-['Londrina_Solid'] text-6xl uppercase tracking-normal leading-[0.85] mb-2 text-black">
          My Garden
        </h1>
        <p className="font-['Londrina_Solid'] text-lg opacity-80 uppercase leading-tight max-w-[280px] text-black">
          Have fun making habits
        </p>
      </header>

      <div className="grid grid-cols-2 gap-5 auto-rows-[155px]">
        <BentoTile 
          title="Garden State" 
          value="BLOOM" 
          color="bg-[#C1E1C1]" 
          icon="plant" 
          size="large" 
        />
        <BentoTile 
          title="Reading" 
          value={counts.reading} 
          color="bg-[#AEC6CF]" 
          icon="book" 
          onClick={() => increment('reading')}
        />
        <BentoTile 
          title="Workout" 
          value={counts.workout} 
          color="bg-[#FFD1DC]" 
          icon="dumbell" 
          onClick={() => increment('workout')}
        />
        <BentoTile 
          title="Focus" 
          value={`${counts.focus}%`} 
          color="bg-[#E6E6FA]" 
          icon="sparkle" 
          size="large" 
        />
      </div>

      <button className="fixed bottom-8 right-6 w-20 h-20 bg-black text-white rounded-[24px] flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(100,100,100,1)] active:translate-y-1 active:shadow-none transition-all">
        <span className="font-['Londrina_Solid'] text-5xl mb-1">+</span>
      </button>
    </div>
  );
}