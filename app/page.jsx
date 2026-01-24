"use client";
import React, { useState, useEffect } from 'react';

// ==========================================
// 1. SHARED CONFIG & THEME
// ==========================================
const palette = {
  Wonder: '#9370DB', Angst: '#4169E1', Smut: '#FF1493',
  Joy: '#FFD700', Grief: '#4B0082', Boredom: '#D3D3D3', Fear: '#2F4F4F'
};

// ==========================================
// 2. INTERNAL COMPONENTS (Consolidated for Preview)
// ==========================================

const Legend = () => (
  <div className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2">
    {Object.entries(palette).map(([name, color]) => (
      <div key={name} className="flex items-center gap-2 text-black">
        <div className="w-3.5 h-3.5 rounded-full border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]" style={{ backgroundColor: color }} />
        <span className="text-[10px] uppercase font-black font-mono tracking-tighter opacity-70">{name}</span>
      </div>
    ))}
  </div>
);

const DataInsights = ({ text }) => (
  <div className="bg-white border-[5px] border-black rounded-[35px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 text-center mt-6">
    <h4 className="font-['Londrina_Solid'] text-2xl uppercase mb-3 tracking-tight text-black text-left sm:text-center">Data Insights:</h4>
    <p className="text-xs opacity-70 leading-relaxed font-medium text-black italic max-w-[80%] mx-auto">{text}</p>
  </div>
);

const SedimentaryRecord = ({ sessions = [], bookTitle = "Book Title" }) => (
  <div className="w-full animate-in fade-in zoom-in duration-300">
    <div className="bg-white border-[5px] border-black rounded-[45px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col">
      <div className="mb-6 text-black text-left">
        <h3 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight">{bookTitle}</h3>
        <p className="font-['Londrina_Solid'] text-[10px] opacity-40 uppercase tracking-[0.2em] font-bold mt-1">Emotional Stratigraphy</p>
      </div>
      <div className="bg-[#f9f8f4] border-2 border-dashed border-black/10 rounded-[35px] p-10 flex items-center justify-center relative min-h-[350px]">
        <div className="flex flex-col-reverse w-16 border-[5px] border-black rounded-full overflow-hidden bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-[280px]">
          {sessions.map((session, i) => (
            <div key={i} style={{ height: `${Math.min(session.minutes || 10, 100)}%`, backgroundColor: palette[session.emotion] || '#000', borderTop: '2px solid rgba(0,0,0,0.1)' }} className="w-full transition-all" />
          ))}
        </div>
      </div>
      <Legend />
    </div>
    <DataInsights text="STRATIGRAPHY: Vertical time-logs reveal your focus duration per emotion. These layers build your unique reading artifact." />
  </div>
);

const StratifiedBookFlow = ({ sessions = [], bookTitle = "Book Title", totalPages = 400, pagesPerRow = 50 }) => {
  const totalRows = Math.ceil(totalPages / pagesPerRow);
  const leftPageRows = Math.ceil(totalRows / 2);
  let currentTotal = 0;
  const sessionsWithRanges = sessions.map(s => {
    const start = currentTotal;
    currentTotal += s.pagesRead || (s.minutes * 0.8);
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
      <div className="bg-white border-[5px] border-black rounded-[45px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col">
        <div className="mb-6 text-black text-left">
          <h3 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight">{bookTitle}</h3>
          <p className="font-['Londrina_Solid'] text-[10px] opacity-40 uppercase tracking-[0.2em] font-bold mt-1">Visual Page Progress</p>
        </div>
        <div className="bg-[#f9f8f4] border-2 border-dashed border-black/10 rounded-[35px] p-8 flex items-center justify-center relative min-h-[350px]">
          <div className="relative w-full max-w-[340px] flex shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-xl border-[4px] border-black bg-white overflow-hidden">
            <div className="w-1/2 p-4 border-r-2 border-black/20 relative shadow-inner">
               {[...Array(leftPageRows)].map((_, i) => renderRowPill(i))}
               <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-r from-transparent to-black/[0.03]" />
            </div>
            <div className="w-1/2 p-4 relative shadow-inner">
               {[...Array(totalRows - leftPageRows)].map((_, i) => renderRowPill(i + leftPageRows))}
               <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-l from-transparent to-black/[0.03]" />
            </div>
          </div>
        </div>
        <Legend />
      </div>
      <DataInsights text="PAGE FLOW: Horizontal milestones visualize chronological momentum across the physical volume." />
    </div>
  );
};

const BookGridItem = ({ book, onSelect }) => (
  <button 
    onClick={() => book.status === 'FINISHED' && onSelect(book)}
    className={`relative w-full aspect-[1/1.25] border-black rounded-[24px] p-3 text-left flex flex-col justify-between transition-all active:scale-95 bg-white overflow-hidden
      ${book.status === 'FINISHED' ? 'border-[4px] shadow-[8px_8px_0px_0px_#22c55e]' : ''}
      ${book.status === 'DNF' ? 'border-[4px] shadow-[8px_8px_0px_0px_#ef4444] opacity-70 grayscale' : ''}
      ${book.status === 'TBR' ? 'border-2 border-black/10 opacity-30 shadow-none grayscale' : ''}
    `}
  >
    {book.status === 'DNF' && <div className="absolute inset-0 dnf-stripes z-0 pointer-events-none" />}
    <div className="flex flex-col gap-1 z-10 text-black">
      <div className="font-['Londrina_Solid'] uppercase text-[8px] tracking-widest text-black/30">{book.status}</div>
      <div className="inline-block self-start px-2 py-0.5 border-2 border-black rounded-md text-[7px] font-black uppercase bg-slate-50">{book.genre || 'GENRE'}</div>
    </div>
    <div className="z-10 text-black">
      <h3 className="font-['Londrina_Solid'] text-lg uppercase leading-none mb-1 line-clamp-2">{book.title}</h3>
      <p className="font-['Londrina_Solid'] text-[10px] opacity-40 uppercase truncate">{book.author}</p>
    </div>
    <div className="w-3.5 h-3.5 rounded-full border-2 border-black z-10" style={{ backgroundColor: palette[book.vibe] }} />
  </button>
);

const BattleCard = ({ book, onClick, label, isNew }) => {
  if (!book) return null;
  return (
    <button onClick={onClick} className={`w-full aspect-[1/1.25] max-h-[300px] bg-white border-[4px] border-black rounded-[35px] text-left flex flex-col justify-between p-6 transition-all active:scale-95 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${isNew ? 'animate-in slide-in-from-right' : ''}`}>
      <div className="flex flex-col gap-1 text-black">
        <span className="text-[10px] uppercase font-bold opacity-30 tracking-widest">{label}</span>
        <h3 className="font-['Londrina_Solid'] text-4xl uppercase leading-none mt-1">{book.title}</h3>
        <p className="font-['Londrina_Solid'] text-xl opacity-40 uppercase truncate">{book.author}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full border-2 border-black" style={{ backgroundColor: palette[book.vibe] }} />
        <span className="font-['Londrina_Solid'] text-lg uppercase opacity-50 text-black">{book.vibe}</span>
      </div>
    </button>
  );
};

const ReadingDrawer = ({ activeBook, onSave, onCancel }) => {
  const [session, setSession] = useState({ pages: '', minutes: '', emotion: 'Wonder', note: '' });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!session.pages || !session.minutes) return;
    onSave({ ...session, id: Date.now() });
  };
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] p-6 flex items-end justify-center">
      <div className="bg-[#FDFCF0] border-[5px] border-black rounded-[40px] p-8 w-full max-w-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom duration-300">
        <header className="flex justify-between items-start mb-6 text-black">
          <div><h2 className="font-['Londrina_Solid'] text-4xl uppercase">Log Session</h2><p className="opacity-40 uppercase">{activeBook?.title}</p></div>
          <button onClick={onCancel} className="text-3xl opacity-20">✕</button>
        </header>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border-4 border-black p-3 rounded-2xl">
              <label className="font-['Londrina_Solid'] text-xs uppercase opacity-40 block text-black">Pages</label>
              <input type="number" required className="w-full bg-transparent font-['Londrina_Solid'] text-3xl focus:outline-none text-black" value={session.pages} onChange={e => setSession({...session, pages: e.target.value})} />
            </div>
            <div className="bg-white border-4 border-black p-3 rounded-2xl">
              <label className="font-['Londrina_Solid'] text-xs uppercase opacity-40 block text-black">Minutes</label>
              <input type="number" required className="w-full bg-transparent font-['Londrina_Solid'] text-3xl focus:outline-none text-black" value={session.minutes} onChange={e => setSession({...session, minutes: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="font-['Londrina_Solid'] text-xl uppercase mb-3 block text-black">Dominant Vibe</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(palette).map(emo => (
                <button key={emo} type="button" onClick={() => setSession({...session, emotion: emo})} className={`px-3 py-1.5 border-2 border-black rounded-xl font-['Londrina_Solid'] text-sm uppercase transition-all ${session.emotion === emo ? 'bg-black text-white' : 'bg-white text-black opacity-60'}`}>{emo}</button>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full bg-black text-white p-5 rounded-3xl font-['Londrina_Solid'] text-2xl uppercase shadow-[6px_6px_0px_0px_rgba(100,100,100,1)] active:translate-y-1">Save Observation</button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 6. MAIN CONTROLLER
// ==========================================

export default function DailyIshApp() {
  const [appState, setAppState] = useState('garden'); 
  const [libraryMode, setLibraryMode] = useState('grid');
  const [selectedBook, setSelectedBook] = useState(null);
  const [activeTab, setActiveTab] = useState('review');
  const [finalWinner, setFinalWinner] = useState(null);
  const [isLogging, setIsLogging] = useState(false);

  // MOCK DATA
  const [books] = useState([
    { id: 1, title: "A Court of Mist and Fury", author: "S.J. Maas", genre: "Fantasy", vibe: "Smut", status: 'FINISHED', sessions: [{ emotion: 'Wonder', minutes: 45, pagesRead: 40 }, { emotion: 'Smut', minutes: 90, pagesRead: 85 }], review: "Absolute peak reading experience.", minutes: 135, pages: 125 },
    { id: 2, title: "Normal People", author: "Sally Rooney", genre: "Literary", vibe: "Angst", status: 'DNF' },
    { id: 3, title: "The Poppy War", author: "R.F. Kuang", genre: "Grimdark", vibe: "Grief", status: 'TBR' },
    { id: 4, title: "Iron Flame", author: "Rebecca Yarros", genre: "Fantasy", vibe: "Wonder", status: 'READING' },
    { id: 5, title: "Fourth Wing", author: "Rebecca Yarros", genre: "Fantasy", vibe: "Joy", status: 'TBR' },
  ]);

  const tbrPool = books.filter(b => b.status === 'TBR');
  const [battleIdx, setBattleIdx] = useState(1);
  const [currentChamp, setCurrentChamp] = useState(null);

  useEffect(() => {
    if (appState === 'library' && libraryMode === 'battle' && !finalWinner && tbrPool.length > 0) {
      setCurrentChamp(tbrPool[0]);
      setBattleIdx(1);
    }
  }, [appState, libraryMode, finalWinner]);

  const handleBattleChoice = (winner) => {
    if (battleIdx >= tbrPool.length - 1) setFinalWinner(winner);
    else { setCurrentChamp(winner); setBattleIdx(battleIdx + 1); }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] p-6 pb-28 font-sans text-black overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Londrina+Solid:wght@300;400;900&display=swap');
        .dnf-stripes { background-image: repeating-linear-gradient(45deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.15) 10px, rgba(0,0,0,0.15) 20px); }
      ` }} />

      {/* --- GARDEN DASHBOARD --- */}
      {appState === 'garden' && (
        <div className="max-w-md mx-auto pt-10 animate-in fade-in duration-500">
           <header className="mb-10 text-left">
              <div className="inline-block bg-white border-[3px] border-black px-3 py-1 rounded-full mb-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <p className="font-['Londrina_Solid'] text-xs uppercase tracking-widest">Day 01 - Hypothesis</p>
              </div>
              <h1 className="font-['Londrina_Solid'] text-7xl uppercase leading-none">My Garden</h1>
           </header>
           
           <div className="grid grid-cols-2 gap-5">
              <button onClick={() => setAppState('manage')} className="bg-[#AEC6CF] col-span-1 h-[155px] border-[5px] border-black rounded-[35px] p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-all text-left flex flex-col justify-between">
                <span className="font-['Londrina_Solid'] text-2xl uppercase">Books</span>
                <div className="text-4xl font-['Londrina_Solid'] leading-none">{books.length} <small className="text-sm opacity-50">VOLS</small></div>
              </button>
              <button className="bg-[#C1E1C1] h-[155px] border-[5px] border-black rounded-[35px] p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] opacity-50 grayscale flex flex-col justify-between text-left"><span className="font-['Londrina_Solid'] text-2xl uppercase">Workout</span><div className="text-4xl font-['Londrina_Solid']">0</div></button>
              <button className="bg-[#FFD1DC] col-span-2 h-[130px] border-[5px] border-black rounded-[35px] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] opacity-40 grayscale flex flex-col justify-between text-left"><span className="font-['Londrina_Solid'] text-2xl uppercase">Daily Experiment</span><div className="h-2 w-full bg-black/10 rounded-full" /></button>
           </div>
        </div>
      )}

      {/* --- READING LAB --- */}
      {appState === 'manage' && (
        <div className="fixed inset-0 bg-[#FDFCF0] z-40 p-8 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto">
          <header className="flex justify-between items-start mb-12">
            <div><h2 className="font-['Londrina_Solid'] text-5xl uppercase leading-none text-black">Reading Lab</h2><p className="font-['Londrina_Solid'] text-xl opacity-30 uppercase text-black">Experimental Station</p></div>
            <button onClick={() => setAppState('library')} className="w-14 h-14 bg-white border-[4px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center active:translate-y-1"><span className="font-['Londrina_Solid'] text-xs uppercase">TBR</span><span className="text-xl">📚</span></button>
          </header>
          <div className="flex-1 space-y-6">
             <div className="bg-white border-4 border-black p-8 rounded-[40px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"><p className="font-['Londrina_Solid'] text-3xl uppercase text-black">Active Subject</p><p className="text-black/40 uppercase font-black text-sm tracking-widest mt-1">Iron Flame / Yarros</p></div>
             <button onClick={() => setIsLogging(true)} className="w-full bg-black text-white p-6 rounded-[30px] font-['Londrina_Solid'] text-3xl uppercase shadow-[8px_8px_0px_0px_rgba(100,100,100,1)] active:translate-y-1">Log Observation</button>
          </div>
          <button onClick={() => setAppState('garden')} className="font-['Londrina_Solid'] text-xl opacity-30 uppercase mt-6 text-black">Back to Garden</button>
        </div>
      )}

      {/* --- LIBRARY SYSTEM --- */}
      {appState === 'library' && (
        <div className="max-w-md mx-auto animate-in fade-in">
          <header className="flex justify-between items-center mb-10 pt-4">
            <button onClick={() => setAppState('manage')} className="text-3xl opacity-30">✕</button>
            <div className="inline-flex bg-white border-[4px] border-black p-1 rounded-[25px] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
              {['grid', 'battle'].map(m => (
                <button key={m} onClick={() => { setLibraryMode(m); setFinalWinner(null); }} className={`px-6 py-2 rounded-[20px] font-['Londrina_Solid'] uppercase text-lg transition-all ${libraryMode === m ? 'bg-black text-white' : 'opacity-40'}`}>{m}</button>
              ))}
            </div>
            <div className="w-8" />
          </header>
          {libraryMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10">
              {books.map(b => <BookGridItem key={b.id} book={b} onSelect={(book) => { setSelectedBook(book); setActiveTab('review'); }} />)}
            </div>
          ) : (
            <div className="space-y-12">
              {!finalWinner ? (
                <div className="relative text-black space-y-12">
                  <div className="text-center"><h2 className="font-['Londrina_Solid'] text-5xl uppercase">The Gauntlet</h2></div>
                  <BattleCard book={currentChamp} onClick={() => handleBattleChoice(currentChamp)} label="The Champ" />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"><div className="bg-black text-white w-14 h-14 rounded-full border-[5px] border-[#FDFCF0] flex items-center justify-center font-['Londrina_Solid'] text-2xl shadow-lg italic">OR</div></div>
                  <BattleCard book={tbrPool[battleIdx]} onClick={() => handleBattleChoice(tbrPool[battleIdx])} label="The Challenger" isNew={true} />
                </div>
              ) : (
                <div className="text-center py-10 animate-in zoom-in text-black">
                  <div className="inline-block bg-[#C1E1C1] border-4 border-black px-6 py-2 rounded-2xl mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-['Londrina_Solid'] text-2xl uppercase">Chosen</div>
                  <h2 className="font-['Londrina_Solid'] text-6xl uppercase mb-4 leading-none">{finalWinner.title}</h2>
                  <button onClick={() => { setAppState('manage'); setFinalWinner(null); }} className="w-full bg-black text-white p-6 rounded-[35px] font-['Londrina_Solid'] text-3xl uppercase shadow-[8px_8px_0px_0px_rgba(100,100,100,1)] active:translate-y-1 mt-8">Start Experiment</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- ANALYSIS MODAL --- */}
      {selectedBook && (
        <div className="fixed inset-0 bg-[#FDFCF0] z-50 p-6 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto">
          <button onClick={() => setSelectedBook(null)} className="absolute top-6 right-6 text-4xl text-black">✕</button>
          <div className="flex justify-center gap-4 mb-10 mt-12 relative z-10">
            {['review', 'capsule', 'pages'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-4 border-[4px] border-black rounded-[28px] transition-all font-['Londrina_Solid'] uppercase text-xl ${activeTab === t ? 'bg-black text-white shadow-none translate-y-1' : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}>{t}</button>
            ))}
          </div>
          <div className="flex flex-col items-center flex-1 pb-10">
            {activeTab === 'review' && (
              <div className="w-full space-y-8 animate-in fade-in">
                <header className="mb-4 text-black text-left"><h2 className="font-['Londrina_Solid'] text-5xl uppercase leading-none mb-2">{selectedBook.title}</h2><p className="font-['Londrina_Solid'] text-xl opacity-40 uppercase">{selectedBook.author}</p></header>
                <div className="bg-white border-[5px] border-black p-8 rounded-[45px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-black text-left"><h4 className="font-['Londrina_Solid'] text-2xl uppercase mb-3 text-green-600 tracking-tight">Experiment Summary</h4><p className="text-xl italic font-medium leading-relaxed">"{selectedBook.review}"</p></div>
                <div className="grid grid-cols-2 gap-5 text-left text-black">
                   <div className="bg-white border-[5px] border-black p-5 rounded-[30px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"><span className="text-[10px] font-bold uppercase opacity-30">Vibe</span><p className="font-['Londrina_Solid'] text-3xl uppercase leading-none mt-1">{selectedBook.vibe}</p></div>
                   <div className="bg-white border-[5px] border-black p-5 rounded-[30px] shadow-[8px_8px_0px_0px_#22c55e]"><span className="text-[10px] font-bold uppercase opacity-30">Status</span><p className="font-['Londrina_Solid'] text-3xl uppercase text-green-600 leading-none mt-1">DONE</p></div>
                </div>
              </div>
            )}
            {activeTab === 'capsule' && <SedimentaryRecord sessions={selectedBook.sessions} bookTitle={selectedBook.title} />}
            {activeTab === 'pages' && <StratifiedBookFlow sessions={selectedBook.sessions} bookTitle={selectedBook.title} />}
          </div>
        </div>
      )}

      {isLogging && (
        <ReadingDrawer 
          activeBook={books.find(b => b.status === 'READING')} 
          onCancel={() => setIsLogging(false)} 
          onSave={() => setIsLogging(false)} 
        />
      )}
    </div>
  );
}