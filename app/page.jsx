"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp,
  increment,
  arrayUnion,
  deleteDoc
} from 'firebase/firestore';

// ==========================================
// 1. LOCAL ICON COMPONENTS (Replacing Lucide)
// ==========================================

const HeartIcon = ({ size = 24, className = "", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);

const Trash2 = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);

const BookOpen = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);

const UserPlus = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
);

const Settings = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);

const XIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
);

const Fingerprint = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12a10 10 0 0 1 20 0"/><path d="M7 12a5 5 0 0 1 10 0"/><path d="M12 12v.01"/><path d="M12 7v.01"/><path d="M12 17v.01"/><path d="M17 12c0-2.8-2.2-5-5-5s-5 2.2-5 5-2.2 5-5 5"/><path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12"/><path d="M7 12c0 2.8 2.2 5 5 5s5-2.2 5-5 2.2-5 5-5"/></svg>
);

const Sparkles = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);

// ==========================================
// 2. CONFIGURATION LAYER
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyCwSGh5OQGgLUEaoY02Z1RsGbeeLUQytrk",
  authDomain: "daily-ish.firebaseapp.com",
  projectId: "daily-ish",
  storageBucket: "daily-ish.firebasestorage.app",
  messagingSenderId: "1093410199718",
  appId: "1:1093410199718:web:60e68a67f4cfd666b0bc67",
  measurementId: "G-Y0B716N3BL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "reading_lab_v1"; 

const palette = {
  Wonder: '#9370DB', Angst: '#4169E1', Smut: '#FF1493',
  Joy: '#FFD700', Grief: '#4B0082', Boredom: '#D3D3D3', Fear: '#2F4F4F',
  Outbound: '#D3D3D3', Lead: '#AEC6CF', Active: '#FFD1DC', DNF: '#FFB347'
};

const genres = ["Fantasy", "Sci-Fi", "Literary", "Non-Fiction", "Romance", "Thriller", "Horror", "Memoir", "Poetry"];

const mlmStripes = ['#98E8C1', '#FFFFFF', '#7BADE2'];

// ==========================================
// 3. UI COMPONENTS
// ==========================================

const MLMHeart = ({ size = 125, id = "heart", opacity = 1, style = {}, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 125 125" style={{ opacity, ...style }} className={className}>
    <defs>
      <clipPath id={`${id}-clip`}>
        <path d="M60 105 C60 105 15 80 15 45 15 20 50 20 60 35 70 20 105 20 105 45 105 80 60 105 60 105 Z" />
      </clipPath>
    </defs>
    <g transform="translate(2, 2)">
      {/* Sharp industrial shadow */}
      <path d="M60 105 C60 105 15 80 15 45 15 20 50 20 60 35 70 20 105 20 105 45 105 80 60 105 60 105 Z" fill="black" transform="translate(6, 6)" />
      
      {/* Symmetrical Waves Core */}
      <g clipPath={`url(#${id}-clip)`}>
        <rect x="0" y="0" width="120" height="120" fill={mlmStripes[0]} />
        <path d="M-20 40 Q20 25 60 40 T140 40 L140 80 Q100 65 60 80 T-20 80 Z" fill={mlmStripes[1]} transform="rotate(-15, 60, 60)" />
        <path d="M-20 80 Q20 65 60 80 T140 80 L140 160 L-20 160 Z" fill={mlmStripes[2]} transform="rotate(-15, 60, 60)" />
      </g>
      
      {/* Industrial Border */}
      <path d="M60 105 C60 105 15 80 15 45 15 20 50 20 60 35 70 20 105 20 105 45 105 80 60 105 60 105 Z" fill="none" stroke="black" strokeWidth="6" strokeLinejoin="round" />
      
      {/* Shine */}
      <path d="M35 45 Q40 30 55 35" stroke="white" strokeWidth="4" opacity="0.4" fill="none" strokeLinecap="round" />
    </g>
  </svg>
);

const ConfettiBurst = () => (
  <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
    {[...Array(60)].map((_, i) => (
      <div 
        key={i}
        className="confetti-particle-burst"
        style={{
          '--spread-x': `${(Math.random() - 0.5) * 1200}px`,
          '--spread-y': `${(Math.random() - 0.5) * 1200}px`,
          backgroundColor: ['#FFD1DC', '#AEC6CF', '#C1E1C1', '#FFD700', '#FF1493'][Math.floor(Math.random() * 5)],
        }}
      />
    ))}
  </div>
);

const ConfettiRain = () => (
  <div className="fixed inset-0 pointer-events-none z-[100]">
    {[...Array(60)].map((_, i) => (
      <div 
        key={i}
        className="confetti-particle-rain"
        style={{
          left: `${Math.random() * 100}%`,
          backgroundColor: ['#FFD1DC', '#AEC6CF', '#C1E1C1', '#FFD700', '#FF1493'][Math.floor(Math.random() * 5)],
          animationDuration: `${Math.random() * 2 + 3}s`,
          animationDelay: `${Math.random() * 2}s`,
        }}
      />
    ))}
  </div>
);

const Legend = () => (
  <div className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2">
    {Object.entries(palette).map(([name, color]) => (
      <div key={name} className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: color }} />
        <span className="text-[10px] uppercase font-black opacity-60 text-black">{String(name)}</span>
      </div>
    ))}
  </div>
);

const SedimentaryRecord = ({ sessions = [], bookTitle = "Book Title" }) => (
  <div className="w-full animate-in fade-in zoom-in duration-300">
    <div className="bg-white border-[5px] border-black rounded-[45px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col">
      <div className="mb-6 text-left">
        <h3 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight text-black">{String(bookTitle)}</h3>
        <p className="font-['Londrina_Solid'] text-[10px] opacity-40 uppercase tracking-[0.2em] font-bold mt-1 text-black">Emotional Stratigraphy</p>
      </div>
      <div className="bg-[#f9f8f4] border-2 border-dashed border-black/10 rounded-[35px] p-10 flex items-center justify-center min-h-[350px]">
        <div className="flex flex-col-reverse w-16 border-[5px] border-black rounded-full overflow-hidden bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-[280px]">
          {(sessions || []).map((session, i) => (
            <div 
              key={i} 
              style={{ 
                height: `${Math.min(Number(session.minutes) || 10, 100)}%`, 
                backgroundColor: palette[session.emotion] || '#000',
                opacity: 0.4 + (Number(session.intensity || 3) * 0.12),
                borderTop: '2px solid rgba(0,0,0,0.1)' 
              }} 
              className="w-full transition-all" 
            />
          ))}
        </div>
      </div>
      <Legend />
    </div>
  </div>
);

const StratifiedBookFlow = ({ sessions = [], bookTitle = "Book Title", totalPages = 400, pagesPerRow = 50 }) => {
  const safeTotalPages = Number(totalPages) || 400;
  const totalRows = Math.ceil(safeTotalPages / pagesPerRow);
  const leftPageRows = Math.ceil(totalRows / 2);
  let currentTotal = 0;
  const sessionsWithRanges = (sessions || []).map(s => {
    const start = currentTotal;
    currentTotal += Number(s.pagesRead) || (Number(s.minutes) * 0.8);
    return { ...s, start, end: currentTotal };
  });

  const renderRowPill = (rowIdx) => {
    const rowStart = rowIdx * pagesPerRow;
    const rowEnd = rowStart + pagesPerRow;
    const rowSegments = sessionsWithRanges.filter(s => s.start < rowEnd && s.end > rowStart);
    return (
      <div key={rowIdx} className="w-full h-4 mb-3 last:mb-0 bg-white/50 border-2 border-black/5 rounded-full overflow-hidden flex relative">
        {rowSegments.map((seg, i) => {
          const widthPct = ((Math.min(seg.end, rowEnd) - Math.max(seg.start, rowStart)) / pagesPerRow) * 100;
          return <div key={i} style={{ width: `${widthPct}%`, backgroundColor: palette[seg.emotion] }} className="h-full border-r border-black/5 last:border-0" />;
        })}
      </div>
    );
  };

  return (
    <div className="w-full animate-in slide-in-from-right duration-300">
      <div className="bg-white border-[5px] border-black rounded-[45px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col text-black">
        <div className="mb-6 text-black text-left">
          <h3 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight text-black">{String(bookTitle)}</h3>
          <p className="font-['Londrina_Solid'] text-[10px] opacity-40 uppercase tracking-[0.2em] font-bold mt-1 text-black">Visual Page Progress</p>
        </div>
        <div className="bg-[#f9f8f4] border-2 border-dashed border-black/10 rounded-[35px] p-8 flex items-center justify-center min-h-[350px]">
          <div className="relative w-full max-w-[340px] flex shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-xl border-[4px] border-black bg-white overflow-hidden text-black text-left">
            <div className="w-1/2 p-4 border-r-2 border-black/20 relative shadow-inner">
               {[...Array(Math.max(0, leftPageRows))].map((_, i) => renderRowPill(i))}
            </div>
            <div className="w-1/2 p-4 relative shadow-inner">
               {[...Array(Math.max(0, totalRows - leftPageRows))].map((_, i) => renderRowPill(i + leftPageRows))}
            </div>
          </div>
        </div>
        <Legend />
      </div>
    </div>
  );
};

const BookGridItem = ({ book, onSelect, currentUserId }) => (
  <button 
    onClick={() => (book.status === 'FINISHED' || book.status === 'READING' || book.status === 'DNF') && onSelect(book)}
    className={`relative w-full aspect-[1/1.25] border-black border-[4px] rounded-[24px] p-3 text-left flex flex-col justify-between transition-all active:scale-95 bg-white overflow-hidden
      ${book.status === 'FINISHED' ? 'shadow-[8px_8px_0px_0px_#22c55e]' : ''}
      ${book.status === 'READING' ? 'border-blue-500 shadow-[8px_8px_0px_0px_#3b82f6]' : ''}
      ${book.status === 'DNF' ? 'shadow-[8px_8px_0px_0px_#ef4444] opacity-70 grayscale' : 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'}
    `}
  >
    {book.status === 'DNF' && <div className="absolute inset-0 dnf-stripes z-0 pointer-events-none" />}
    <div className="flex flex-col gap-1 z-10 text-black text-left">
      <div className="flex justify-between items-center">
        <div className="font-['Londrina_Solid'] uppercase text-[8px] tracking-widest text-black/30">{String(book.status)}</div>
        <div className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${book.ownerId === currentUserId ? 'bg-black text-white' : 'bg-slate-100 text-black'}`}>
          {book.ownerId === currentUserId ? 'My Lab' : 'Peer'}
        </div>
      </div>
      <div className="inline-block self-start px-2 py-0.5 border-2 border-black rounded-md text-[7px] font-black uppercase bg-slate-50 truncate max-w-full">
        {Array.isArray(book.genre) ? String(book.genre[0] || 'GENRE') : String(book.genre || 'GENRE')}
      </div>
    </div>
    <div className="z-10 text-black text-left">
      <h3 className="font-['Londrina_Solid'] text-lg uppercase leading-none mb-1 line-clamp-2">{String(book.title)}</h3>
      <p className="font-['Londrina_Solid'] text-[10px] opacity-40 uppercase truncate">{String(book.author)}</p>
    </div>
    <div className="flex justify-between items-center z-10 text-black">
      {book.status === 'DNF' ? (
        <div className="bg-yellow-400 text-black px-2 py-0.5 rounded-md border-2 border-black font-black text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
          DNF
        </div>
      ) : (
        <div className="w-3.5 h-3.5 rounded-full border-2 border-black" style={{ backgroundColor: palette[book.vibe] || '#000' }} />
      )}
      {Number(book.cries) > 0 && <span className="text-[10px] font-black opacity-40 text-black">💧 {Number(book.cries)}</span>}
    </div>
  </button>
);

const BattleCard = ({ book, onClick, label, isNew, isSelectionWinner }) => {
  if (!book) return (
    <div className="w-full aspect-[1.5/1] bg-gray-100 border-[4px] border-dashed border-black/20 rounded-[35px] flex items-center justify-center text-black text-center p-6">
      <span className="font-['Londrina_Solid'] text-lg opacity-20 uppercase tracking-widest text-black text-center">Awaiting Subject</span>
    </div>
  );
  return (
    <div className="relative w-full">
      {isSelectionWinner && (
        <div className="absolute -inset-3 bg-gradient-to-r from-blue-500 via-pink-500 to-yellow-500 rounded-[45px] animate-laser-glow blur-[2px] z-0" />
      )}
      <button 
        onClick={onClick} 
        className={`relative w-full bg-white border-[4px] border-black rounded-[35px] text-left flex flex-col p-5 transition-all active:scale-95 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-10 ${isNew ? 'animate-in slide-in-from-right duration-500' : ''} ${isSelectionWinner ? 'scale-105 border-transparent' : ''}`}
      >
        <div className="flex flex-col gap-0.5 text-black mb-3 text-left">
          <span className="text-[10px] uppercase font-bold opacity-30 tracking-widest text-left">{String(label)}</span>
          <h3 className="font-['Londrina_Solid'] text-2xl uppercase leading-tight line-clamp-1 text-left">{String(book.title)}</h3>
          <p className="font-['Londrina_Solid'] text-lg opacity-40 uppercase truncate leading-none text-left">{String(book.author)}</p>
        </div>
        
        {book.introduction && (
          <div className="mb-4 p-3 bg-slate-50 border-2 border-black/5 rounded-2xl italic text-xs leading-snug opacity-70 text-left text-black line-clamp-2">
            "{String(book.introduction)}"
          </div>
        )}

        <div className="mt-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]" style={{ backgroundColor: palette[book.vibe] || '#000' }} />
            <span className="font-['Londrina_Solid'] text-base uppercase opacity-50 text-black">{String(book.vibe)}</span>
          </div>
          {book.suggestedBy && (
            <span className="text-[7px] uppercase font-black opacity-30 tracking-tighter text-black">Via {String(book.suggestedBy)}</span>
          )}
        </div>
      </button>
    </div>
  );
};

const AddBookDrawer = ({ onSave, onCancel }) => {
  const [nb, setNb] = useState({ title: '', author: '', totalPages: '', genre: [], vibe: 'Wonder', suggestedBy: '', cries: 0, introduction: '' });
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] p-6 flex items-end justify-center text-black text-left">
      <div className="bg-[#FDFCF0] border-[5px] border-black rounded-[40px] p-8 w-full max-w-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-black overflow-y-auto max-h-[95vh] text-left">
        <h2 className="font-['Londrina_Solid'] text-4xl uppercase mb-6 text-black text-left font-bold">Subject Registration</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(nb); }} className="space-y-4 text-left text-black text-left">
          <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between text-black text-left">
            <label className="text-[10px] uppercase font-black opacity-40 text-black text-left text-black font-bold">Cries Hypothesis</label>
            <div className="flex items-center justify-between text-black text-center font-bold">
              <button type="button" onClick={() => setNb(p => ({...p, cries: Math.max(0, p.cries - 1)}))} className="w-8 h-8 border-2 border-black rounded-full text-black font-bold">-</button>
              <span className="font-['Londrina_Solid'] text-3xl text-black font-bold">{nb.cries}</span>
              <button type="button" onClick={() => setNb(p => ({...p, cries: p.cries + 1}))} className="w-8 h-8 border-2 border-black rounded-full text-black font-bold">+</button>
            </div>
          </div>
          <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black text-left"><label className="text-[10px] uppercase font-black opacity-40 text-black text-left text-black">Title</label><input required className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none text-black font-bold" value={nb.title} onChange={e => setNb({...nb, title: e.target.value})} /></div>
          <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black text-left"><label className="text-[10px] uppercase font-black opacity-40 text-black text-left text-black">Hypothesis (Intro)</label><textarea required className="w-full bg-transparent text-sm h-20 resize-none text-black font-bold" value={nb.introduction} onChange={e => setNb({...nb, introduction: e.target.value})} /></div>
          <button type="submit" className="w-full bg-black text-white p-5 rounded-3xl font-['Londrina_Solid'] text-2xl uppercase font-bold text-center text-white text-center">Inject Archive</button>
          <button type="button" onClick={onCancel} className="w-full opacity-30 uppercase font-black text-xs mt-2 text-black text-center">Abort</button>
        </form>
      </div>
    </div>
  );
};

const ReadingDrawer = ({ activeBook, onSave, onCancel }) => {
  const startPage = Number(activeBook?.currentPage) || 1;
  const totalPages = Number(activeBook?.totalPages) || 400;
  const [session, setSession] = useState({ 
    endPage: '', startTime: '09:00', endTime: '10:00', emotion: 'Wonder', intensity: 3, 
    sessionCries: 0, conclusion: '' 
  });
  const isFinished = Number(session.endPage) >= totalPages;
  const calculateMinutes = () => {
    const [startH, startM] = session.startTime.split(':').map(Number);
    const [endH, endM] = session.endTime.split(':').map(Number);
    let diff = (endH * 60 + endM) - (startH * 60 + startM);
    return diff < 0 ? diff + 1440 : diff;
  };
  const minutes = calculateMinutes();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!session.endPage || minutes <= 0 || !activeBook) return;
    onSave({ ...session, startPage, endPage: Number(session.endPage), minutes, isFinished });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] p-6 flex items-end justify-center">
      <div className="bg-[#FDFCF0] border-[5px] border-black rounded-[40px] p-8 w-full max-w-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom duration-300 overflow-y-auto max-h-[95vh] text-black">
        <header className="flex justify-between items-start mb-6 text-left">
          <div className="text-black text-left"><h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none text-left text-black font-bold">Log Session</h2><p className="font-['Londrina_Solid'] text-lg opacity-40 uppercase truncate text-black text-left">{String(activeBook?.title)}</p></div>
          <button onClick={onCancel} className="text-3xl opacity-20 text-center font-bold">✕</button>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4 pb-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-100 border-4 border-black/10 p-2 rounded-2xl opacity-60 text-left"><label className="text-[8px] font-black block text-left">Start Page</label><div className="font-['Londrina_Solid'] text-2xl">{Number(startPage)}</div></div>
            <div className={`bg-white border-4 p-2 rounded-2xl text-left transition-all ${isFinished ? 'border-green-500 shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]' : 'border-black text-black'}`}><label className="text-[8px] font-black block text-left text-black">End Page</label><input required type="number" placeholder={`Max ${totalPages}`} className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none text-black font-bold" value={session.endPage} onChange={e => setSession({...session, endPage: e.target.value})} /></div>
          </div>
          <div className="bg-white border-4 border-black p-3 rounded-2xl text-black">
            <label className="text-[10px] font-black opacity-40 uppercase block mb-1 text-left">Intensity (1-5)</label>
            <input type="range" min="1" max="5" step="1" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-black" value={session.intensity} onChange={e => setSession({...session, intensity: Number(e.target.value)})} />
            <div className="flex justify-between text-[8px] font-black mt-1 uppercase opacity-40 text-black text-center text-center"><span>Subtle</span><span>Extreme</span></div>
          </div>
          <button type="submit" disabled={!activeBook || !session.endPage || minutes <= 0} className={`w-full text-white p-5 rounded-3xl font-['Londrina_Solid'] text-2xl uppercase transition-all ${isFinished ? 'bg-green-600 shadow-[8px_8px_0px_0px_rgba(34,197,94,0.3)]' : 'bg-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]'}`}>Save Experiment Data</button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4. MAIN APP CONTROLLER
// ==========================================

export default function App() {
  const [hasMounted, setHasMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [appState, setAppState] = useState('garden'); 
  const [libraryMode, setLibraryMode] = useState('grid');
  const [books, setBooks] = useState([]);
  const [datingSubjects, setDatingSubjects] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [activeTab, setActiveTab] = useState('review');
  const [isLogging, setIsLogging] = useState(false);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [focusedSubjectId, setFocusedSubjectId] = useState(null);
  const [error, setError] = useState(null);

  // LOVE PILLAR PHYSICS STATE
  const [activeSpecimens, setActiveSpecimens] = useState([
    { id: 1, codename: "Alpha" }, { id: 2, codename: "Beta" },
    { id: 3, codename: "Gamma" }, { id: 4, codename: "Delta" },
    { id: 5, codename: "Epsilon" }, { id: 6, codename: "Zeta" },
    { id: 7, codename: "Eta" }, { id: 8, codename: "Theta" }
  ]);
  const [fallingSpecimen, setFallingSpecimen] = useState(null);
  const [sedimentPile, setSedimentPile] = useState([]);

  // BATTLE/WINNER STATE
  const [celebrating, setCelebrating] = useState(false);
  const [roundWinnerId, setRoundWinnerId] = useState(null); 
  const [battleIdx, setBattleIdx] = useState(0);
  const [currentChamp, setCurrentChamp] = useState(null);
  const [finalWinner, setFinalWinner] = useState(null);

  useEffect(() => { setHasMounted(true); }, []);

  useEffect(() => {
    if (!hasMounted) return;
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) setUser(u);
      else await signInAnonymously(auth);
    });
    return () => unsubscribe();
  }, [hasMounted]);

  useEffect(() => {
    if (!user) return;
    const bSub = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'books'), (snap) => setBooks(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const dSub = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'subjects'), (snap) => setDatingSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { bSub(); dSub(); };
  }, [user]);

  const readingList = useMemo(() => books.filter(b => b.status === 'READING'), [books]);
  const tbrPool = useMemo(() => books.filter(b => b.status === 'TBR'), [books]);
  const peopleMetCount = useMemo(() => datingSubjects.length + sedimentPile.length, [datingSubjects, sedimentPile]);

  // LOVE PILLAR ACTION
  const triggerSpecimenExpiration = (specimen) => {
    if (fallingSpecimen) return;
    setActiveSpecimens(prev => prev.filter(s => s.id !== specimen.id));
    setFallingSpecimen({
      ...specimen,
      rot: (Math.random() - 0.5) * 40,
      x: (Math.random() - 0.5) * 60
    });
    setTimeout(() => {
      setSedimentPile(prev => [...prev, { ...specimen, rot: (Math.random() - 0.5) * 25, x: (Math.random() - 0.5) * 40 }]);
      setFallingSpecimen(null);
    }, 1200);
  };

  const handleAddBook = async (bookData) => {
    if (!user) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'books'), { ...bookData, ownerId: user.uid, createdAt: serverTimestamp() });
    setIsAddingBook(false);
  };

  const handleStartReading = async (book) => {
    if (!user || !book) return;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'books', book.id), { status: 'READING' });
    setFocusedSubjectId(book.id);
    setAppState('manage');
  };

  const handleSaveSession = async (sessionData) => {
    if (!user || !focusedSubjectId) return;
    const bookRef = doc(db, 'artifacts', appId, 'public', 'data', 'books', focusedSubjectId);
    await updateDoc(bookRef, {
      status: sessionData.isFinished ? 'FINISHED' : 'READING',
      currentPage: Number(sessionData.endPage),
      sessions: arrayUnion({ emotion: String(sessionData.emotion), intensity: Number(sessionData.intensity), pagesRead: Number(sessionData.endPage - sessionData.startPage), date: new Date().toISOString() })
    });
    setIsLogging(false);
  };

  const handleBattleChoice = (winner) => {
    if (!winner) return;
    setRoundWinnerId(winner.id);
    setCelebrating(true);
    setTimeout(() => {
      setCelebrating(false);
      setRoundWinnerId(null);
      if (battleIdx >= tbrPool.length - 1) setFinalWinner(winner);
      else { setCurrentChamp(winner); setBattleIdx(prev => prev + 1); }
    }, 1000);
  };

  if (!hasMounted) return null;

  return (
    <div className="min-h-screen bg-[#FDFCF0] font-sans text-black overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Londrina+Solid:wght@300;400;900&display=swap');
        .dnf-stripes { background-image: repeating-linear-gradient(45deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.15) 10px, rgba(0,0,0,0.15) 20px); }
        .glass-body { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(50px); border: 6px solid rgba(0,0,0,0.15); }
        .jar-shine { background: linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.4) 50%, transparent 55%); pointer-events: none; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .pebble-jitter { animation: jitter 0.8s ease-in-out infinite alternate; }
        @keyframes jitter { from { transform: translate(0,0); } to { transform: translate(2px, 2px); } }
        @keyframes physics-drop-bounce {
          0% { transform: translateY(-500px) scale(1.1); opacity: 0; }
          30% { transform: translateY(0px) scale(0.85, 1.15); opacity: 1; }
          45% { transform: translateY(-75px) scale(1.05, 0.95); }
          60% { transform: translateY(0px) scale(0.95, 1.05); }
          75% { transform: translateY(-30px); }
          85% { transform: translateY(0px); }
          92% { transform: translateY(-10px); }
          100% { transform: translateY(0px) rotate(var(--final-rot)); }
        }
        .animate-physics-drop { animation: physics-drop-bounce 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        @keyframes laser-sync { 0% { border-color: #3b82f6; box-shadow: 0 0 20px #3b82f6; } 33% { border-color: #ec4899; box-shadow: 0 0 20px #ec4899; } 66% { border-color: #eab308; box-shadow: 0 0 20px #eab308; } 100% { border-color: #3b82f6; box-shadow: 0 0 20px #3b82f6; } }
        .animate-laser-glow { animation: laser-sync 0.6s linear infinite; border-width: 6px !important; }
      ` }} />

      {celebrating && !finalWinner && <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in"><div className="w-12 h-12 bg-yellow-400 rounded-full animate-ping" /></div>}

      <div className="p-6 pb-28 text-black">
        {/* DASHBOARD */}
        {appState === 'garden' && (
          <div className="max-w-md mx-auto pt-10 animate-in fade-in duration-500 text-left">
            <header className="mb-10 text-left">
              <div className="inline-block bg-white border-[3px] border-black px-3 py-1 rounded-full mb-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black">
                <p className="font-['Londrina_Solid'] text-xs uppercase tracking-widest text-black">Researcher Verified: {String(user?.uid?.substring(0, 8))}</p>
              </div>
              <h1 className="font-['Londrina_Solid'] text-7xl uppercase leading-none text-black text-left">Pattern HQ</h1>
            </header>
            <div className="grid grid-cols-2 gap-5 text-black">
                <button onClick={() => setAppState('manage')} className="bg-[#AEC6CF] h-[155px] border-[5px] border-black rounded-[35px] p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between active:translate-y-1 transition-all">
                  <span className="font-['Londrina_Solid'] text-2xl uppercase text-black text-left font-bold">Reading</span>
                  <div className="text-4xl font-['Londrina_Solid'] text-black">{Number(books.length)}</div>
                </button>
                <button onClick={() => setAppState('dating')} className="bg-[#FFD1DC] h-[155px] border-[5px] border-black rounded-[35px] p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between active:translate-y-1 transition-all">
                  <span className="font-['Londrina_Solid'] text-2xl uppercase text-black text-left font-bold">Dating</span>
                  <div className="text-4xl font-['Londrina_Solid'] text-black text-right">{Number(peopleMetCount)}</div>
                </button>
            </div>
          </div>
        )}

        {/* READING LAB */}
        {appState === 'manage' && (
          <div className="fixed inset-0 bg-[#FDFCF0] z-40 p-8 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto text-black">
            <header className="flex justify-between items-start mb-10 text-black">
              <div className="text-left text-black"><h2 className="font-['Londrina_Solid'] text-5xl uppercase leading-none">Reading Lab</h2><p className="font-['Londrina_Solid'] text-xl opacity-30 uppercase tracking-tight text-black">Active Observations</p></div>
              <button onClick={() => setAppState('library')} className="w-14 h-14 bg-white border-[4px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all text-black font-bold">📚</button>
            </header>
            <div className="flex-1 space-y-4 text-black text-left">
              {readingList.map(book => (
                <div key={book.id} className="relative group text-left text-black">
                  <button onClick={() => setFocusedSubjectId(book.id)} className={`w-full bg-white border-4 border-black p-5 rounded-[30px] flex items-center justify-between text-left transition-all ${focusedSubjectId === book.id ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-blue-500 scale-[1.02]' : 'opacity-50 grayscale shadow-none'}`}>
                    <div className="text-left text-black"><p className="font-['Londrina_Solid'] text-2xl uppercase leading-none">{String(book.title)}</p><p className="text-[10px] font-black opacity-30 mt-1 uppercase text-left">Page {book.currentPage}/{book.totalPages}</p></div>
                    {focusedSubjectId === book.id ? (
                      <div onClick={(e) => { e.stopPropagation(); updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'books', book.id), { status: 'DNF' }); }} className="bg-yellow-400 text-black px-5 py-2.5 rounded-2xl border-[3px] border-black font-black text-xl uppercase text-center active:scale-95 transition-all">DNF</div>
                    ) : <div className="w-4 h-4 rounded-full border-2 border-black" style={{ backgroundColor: palette[book.vibe] || '#000' }} />}
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setIsLogging(true)} disabled={!focusedSubjectId} className="w-full bg-black text-white p-6 rounded-[30px] font-['Londrina_Solid'] text-3xl uppercase mt-6 disabled:opacity-20 font-bold">Log Observation</button>
            <button onClick={() => setAppState('garden')} className="w-full font-['Londrina_Solid'] text-xl opacity-30 uppercase text-center mt-6 text-black">Exit Lab</button>
          </div>
        )}

        {/* TBR / LIBRARY */}
        {appState === 'library' && (
          <div className="max-w-md mx-auto animate-in fade-in text-black">
            <header className="flex justify-between items-center mb-10 pt-4 text-black text-left">
              <button onClick={() => setAppState('manage')} className="text-3xl opacity-30 font-bold">✕</button>
              <div className="inline-flex bg-white border-[4px] border-black p-1 rounded-[25px] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-black">
                {['grid', 'battle'].map(m => (<button key={m} onClick={() => { setLibraryMode(m); setFinalWinner(null); setCurrentChamp(null); }} className={`px-6 py-2 rounded-[20px] font-['Londrina_Solid'] uppercase text-lg transition-all ${libraryMode === m ? 'bg-black text-white' : 'opacity-40 text-black'}`}>{String(m)}</button>))}
              </div>
              <div className="w-8" />
            </header>
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 text-black">
              {libraryMode === 'grid' ? (
                <>
                  <button onClick={() => setIsAddingBook(true)} className="relative w-full aspect-[1/1.25] border-[4px] border-dashed border-black/20 rounded-[24px] p-3 flex flex-col items-center justify-center bg-white/50 hover:border-black/40 text-black font-bold"><div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center text-2xl font-black">+</div></button>
                  {books.map(b => <BookGridItem key={b.id} book={b} onSelect={(book) => { setSelectedBook(book); setActiveTab('review'); }} currentUserId={user?.uid} />)}
                </>
              ) : (
                <div className="col-span-2 text-black">
                  {!finalWinner ? (
                    <div className="space-y-2 text-black">
                       <div className="text-center mb-4"><h2 className="font-['Londrina_Solid'] text-5xl uppercase">The Gauntlet</h2></div>
                       <div className="flex flex-col space-y-0">
                          {currentChamp && <div className="pb-7"><BattleCard book={currentChamp} label="The Champ" onClick={() => handleBattleChoice(currentChamp)} isSelectionWinner={roundWinnerId === currentChamp.id} /></div>}
                          <div className="flex justify-center py-2 z-20 relative pointer-events-none"><div className="w-16 h-16 rounded-full bg-black border-[6px] border-[#FDFCF0] text-white flex items-center justify-center font-['Londrina_Solid'] text-3xl italic shadow-xl">VS</div></div>
                          {tbrPool[battleIdx] && <div className="pt-7"><BattleCard book={tbrPool[battleIdx]} label="The Challenger" isNew={true} onClick={() => handleBattleChoice(tbrPool[battleIdx])} isSelectionWinner={roundWinnerId === tbrPool[battleIdx].id} /></div>}
                       </div>
                    </div>
                  ) : (
                    <div className="text-center animate-in zoom-in py-10 text-black">
                      <div className="inline-block bg-green-200 border-2 border-black px-4 py-1 rounded-xl mb-4 font-black uppercase text-[10px]">Subject Selected</div>
                      <h2 className="font-['Londrina_Solid'] text-6xl uppercase leading-none mb-8">{finalWinner.title}</h2>
                      <button onClick={() => handleStartReading(finalWinner)} className="w-full bg-black text-white p-6 rounded-3xl font-['Londrina_Solid'] text-3xl uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-1 font-bold text-center">Begin Experiment</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DATING LAB UNIFIED CONTAINER */}
        {appState === 'dating' && (
          <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden text-black text-left">
            <div className="flex-1 flex flex-col max-w-md mx-auto w-[88%] my-12 relative overflow-hidden text-black shadow-2xl rounded-[40px]">
               <div className="relative z-30">
                 <header className="bg-[#1a1c2c] border-[6px] border-black rounded-t-[40px] px-10 py-8 flex justify-between items-center text-white relative shadow-xl">
                   <button onClick={() => setAppState('garden')} className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity">HQ</button>
                   <h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight">The Love Jar</h2>
                   <button className="w-10 h-10 flex items-center justify-center border-4 border-white/20 rounded-xl bg-white/5"><Settings size={20} className="text-white" /></button>
                 </header>
                 <div className="bg-black/20 h-4 border-x-[6px] border-black shadow-inner" /> 
               </div>
               <div className="flex-1 relative overflow-hidden glass-body rounded-b-[75px] border-[6px] border-t-0 border-black/20 flex flex-col bg-white/5">
                  <div className="absolute inset-0 jar-shine z-10 opacity-30" />
                  <div className="absolute inset-0 backdrop-blur-[60px] bg-pink-50/5 z-0" />
                  <div className="absolute top-[37%] left-0 right-0 border-t-[4px] border-dashed border-black/5 z-10 flex items-center justify-between px-10 pointer-events-none text-black">
                     <span className="text-[10px] font-black uppercase opacity-20 -mt-8 text-black">Selection Zone</span>
                     <span className="text-[10px] font-black uppercase opacity-20 -mt-8 text-black font-bold tracking-widest text-left">37% Stop</span>
                  </div>
                  <div className="flex-1 overflow-y-auto px-8 pt-10 pb-56 relative z-20">
                     <div className="grid grid-cols-2 gap-y-16 gap-x-10 mb-24 justify-items-center">
                        {activeSpecimens.map((s, i) => (
                          <button key={s.id} onClick={() => triggerSpecimenExpiration(s)} className="flex flex-col items-center animate-float group" style={{ animationDelay: `${i * 0.4}s` }}>
                             <MLMHeart id={`active-${s.id}`} size={125} />
                             <span className="font-['Londrina_Solid'] text-sm uppercase mt-5 opacity-60 text-black font-bold group-active:scale-110 transition-transform text-center text-black">Expire</span>
                          </button>
                        ))}
                     </div>
                     <div className="mt-40 relative px-4 text-black text-center">
                        <h3 className="w-full text-center font-['Londrina_Solid'] text-2xl uppercase opacity-20 mb-8">Laboratory Sediment</h3>
                        <div className="relative flex flex-wrap justify-center min-h-[350px] items-end pb-12">
                          {fallingSpecimen && (
                             <div className="animate-physics-drop absolute bottom-12" style={{ '--final-rot': `${fallingSpecimen.rot}deg`, left: `calc(50% + ${fallingSpecimen.x}px)`, zIndex: 100 }}>
                                <MLMHeart id={`falling-${fallingSpecimen.id}`} size={125} />
                             </div>
                          )}
                          <div className="flex flex-wrap justify-center items-end text-center">
                             {sedimentPile.map((drop, i) => (
                                <div key={i} className="pebble-jitter relative" style={{ transform: `rotate(${drop.rot}deg)`, left: `${drop.x}px`, margin: '-15px', zIndex: i }}>
                                   <MLMHeart id={`sediment-${drop.id}`} size={125} opacity={1} />
                                </div>
                             ))}
                          </div>
                        </div>
                     </div>
                  </div>
                  <div className="absolute bottom-8 left-0 right-0 px-10 z-30 opacity-20 pointer-events-none text-black font-bold uppercase"><button className="w-full bg-black text-white p-6 rounded-[35px] font-['Londrina_Solid'] text-3xl font-bold uppercase">Specimens Logged: {peopleMetCount}</button></div>
               </div>
            </div>
          </div>
        )}

        {/* ANALYSIS MODAL */}
        {selectedBook && (
          <div className="fixed inset-0 bg-[#FDFCF0] z-50 p-6 flex flex-col animate-in slide-in-from-bottom overflow-y-auto text-black text-left">
            <button onClick={() => setSelectedBook(null)} className="absolute top-6 right-6 text-4xl opacity-30 text-black font-bold">✕</button>
            <div className="flex justify-center gap-4 mb-10 mt-12 relative z-10 text-center text-black">{['review', 'capsule', 'pages'].map(t => (<button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-4 border-[4px] border-black rounded-[28px] font-['Londrina_Solid'] uppercase text-xl transition-all ${activeTab === t ? 'bg-black text-white shadow-none translate-y-1' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black font-bold'}`}>{String(t)}</button>))}</div>
            <div className="flex flex-col items-center flex-1 pb-10 text-black">
              {activeTab === 'review' && (
                <div className="w-full space-y-8 animate-in fade-in text-black">
                  <header className="text-left text-black"><h2 className="font-['Londrina_Solid'] text-5xl uppercase leading-none mb-2 text-black">{String(selectedBook.title)}</h2><p className="font-['Londrina_Solid'] text-xl opacity-40 uppercase text-black">{String(selectedBook.author)}</p></header>
                  <div className="bg-white border-[5px] border-black p-8 rounded-[45px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-left text-black font-black"><h4 className="font-['Londrina_Solid'] text-2xl uppercase mb-3 text-green-600 tracking-tight text-left">Peer Conclusion</h4><p className="text-xl italic font-medium leading-relaxed text-black text-left font-bold">"{String(selectedBook.review || "Subject still under active investigation.")}"</p></div>
                </div>
              )}
              {activeTab === 'capsule' && <SedimentaryRecord sessions={selectedBook.sessions || []} bookTitle={selectedBook.title} />}
              {activeTab === 'pages' && <StratifiedBookFlow sessions={selectedBook.sessions || []} bookTitle={selectedBook.title} totalPages={selectedBook.totalPages} />}
            </div>
          </div>
        )}

        {isLogging && focusedSubjectId && <ReadingDrawer activeBook={books.find(b => b.id === focusedSubjectId)} onCancel={() => setIsLogging(false)} onSave={handleSaveSession} />}
        {isAddingBook && <AddBookDrawer onSave={handleAddBook} onCancel={() => setIsAddingBook(false)} />}
      </div>
    </div>
  );
}