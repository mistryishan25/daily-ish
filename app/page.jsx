"use client";
import React, { useState, useEffect, useMemo } from 'react';

// ==========================================
// 1. CONFIG & THEME
// ==========================================
const palette = {
  Wonder: '#9370DB', Angst: '#4169E1', Smut: '#FF1493',
  Joy: '#FFD700', Grief: '#4B0082', Boredom: '#D3D3D3', Fear: '#2F4F4F'
};

const genres = ["Fantasy", "Sci-Fi", "Literary", "Non-Fiction", "Romance", "Thriller", "Horror", "Memoir", "Poetry"];

// ==========================================
// 2. VISUAL COMPONENTS (Stratigraphy)
// ==========================================

const Legend = () => (
  <div className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2 text-black">
    {Object.entries(palette).map(([name, color]) => (
      <div key={name} className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 rounded-full border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]" style={{ backgroundColor: color }} />
        <span className="text-[10px] uppercase font-black font-mono tracking-tighter opacity-70">{String(name)}</span>
      </div>
    ))}
  </div>
);

const SedimentaryRecord = ({ sessions = [], bookTitle = "Book Title" }) => (
  <div className="w-full animate-in fade-in zoom-in duration-300">
    <div className="bg-white border-[5px] border-black rounded-[45px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col">
      <div className="mb-6 text-black text-left">
        <h3 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight text-black">{String(bookTitle)}</h3>
        <p className="font-['Londrina_Solid'] text-[10px] opacity-40 uppercase tracking-[0.2em] font-bold mt-1 text-black text-left">Emotional Stratigraphy</p>
      </div>
      <div className="bg-[#f9f8f4] border-2 border-dashed border-black/10 rounded-[35px] p-10 flex items-center justify-center relative min-h-[350px]">
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
      <div className="bg-white border-[5px] border-black rounded-[45px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col">
        <div className="mb-6 text-black text-left">
          <h3 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight text-black">{String(bookTitle)}</h3>
          <p className="font-['Londrina_Solid'] text-[10px] opacity-40 uppercase tracking-[0.2em] font-bold mt-1 text-black text-left">Visual Page Progress</p>
        </div>
        <div className="bg-[#f9f8f4] border-2 border-dashed border-black/10 rounded-[35px] p-8 flex items-center justify-center relative min-h-[350px]">
          <div className="relative w-full max-w-[340px] flex shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-xl border-[4px] border-black bg-white overflow-hidden">
            <div className="w-1/2 p-4 border-r-2 border-black/20 relative shadow-inner text-black">
               {[...Array(Math.max(0, leftPageRows))].map((_, i) => renderRowPill(i))}
               <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-r from-transparent to-black/[0.03]" />
            </div>
            <div className="w-1/2 p-4 relative shadow-inner text-black">
               {[...Array(Math.max(0, totalRows - leftPageRows))].map((_, i) => renderRowPill(i + leftPageRows))}
               <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-l from-transparent to-black/[0.03]" />
            </div>
          </div>
        </div>
        <Legend />
      </div>
    </div>
  );
};

// ==========================================
// 3. UI COMPONENTS (Grid & Battle)
// ==========================================

const BookGridItem = ({ book, onSelect }) => (
  <button 
    onClick={() => (book.status === 'FINISHED' || book.status === 'READING' || book.status === 'DNF') && onSelect(book)}
    className={`relative w-full aspect-[1/1.25] border-black rounded-[24px] p-3 text-left flex flex-col justify-between transition-all active:scale-95 bg-white overflow-hidden
      ${book.status === 'FINISHED' ? 'border-[4px] shadow-[8px_8px_0px_0px_#22c55e]' : ''}
      ${book.status === 'READING' ? 'border-[4px] border-blue-500 shadow-[8px_8px_0px_0px_#3b82f6]' : ''}
      ${book.status === 'DNF' ? 'border-[4px] shadow-[8px_8px_0px_0px_#ef4444] opacity-70 grayscale' : ''}
      ${book.status === 'TBR' ? 'border-2 border-black/10 opacity-40 grayscale shadow-none' : ''}
    `}
  >
    {book.status === 'DNF' && <div className="absolute inset-0 dnf-stripes z-0 pointer-events-none" />}
    <div className="flex flex-col gap-1 z-10 text-black">
      <div className="font-['Londrina_Solid'] uppercase text-[8px] tracking-widest text-black/30 text-left">{String(book.status)}</div>
      <div className="inline-block self-start px-2 py-0.5 border-2 border-black rounded-md text-[7px] font-black uppercase bg-slate-50 truncate max-w-full">
        {Array.isArray(book.genre) ? String(book.genre[0] || 'GENRE') : String(book.genre || 'GENRE')}
      </div>
    </div>
    <div className="z-10 text-black text-left">
      <h3 className="font-['Londrina_Solid'] text-lg uppercase leading-none mb-1 line-clamp-2">{String(book.title)}</h3>
      <p className="font-['Londrina_Solid'] text-[10px] opacity-40 uppercase truncate">{String(book.author)}</p>
    </div>
    <div className="flex justify-between items-center z-10">
      <div className="w-3.5 h-3.5 rounded-full border-2 border-black" style={{ backgroundColor: palette[book.vibe] || '#000' }} />
      {Number(book.cries) > 0 && <span className="text-[10px] font-black opacity-40">💧 {Number(book.cries)}</span>}
    </div>
  </button>
);

const BattleCard = ({ book, onClick, label, isNew }) => {
  if (!book) return <div className="w-full aspect-[1/1.25] max-h-[400px] bg-gray-100 border-[4px] border-dashed border-black/20 rounded-[35px] flex items-center justify-center text-black text-center p-10"><span className="font-['Londrina_Solid'] text-xl opacity-20 uppercase tracking-widest">Awaiting Subject</span></div>;
  return (
    <button onClick={onClick} className={`w-full bg-white border-[4px] border-black rounded-[35px] text-left flex flex-col p-6 transition-all active:scale-95 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${isNew ? 'animate-in slide-in-from-right' : ''}`}>
      <div className="flex flex-col gap-1 text-black text-left mb-4">
        <span className="text-[10px] uppercase font-bold opacity-30 tracking-widest">{String(label)}</span>
        <h3 className="font-['Londrina_Solid'] text-4xl uppercase leading-none mt-1 text-black">{String(book.title)}</h3>
        <p className="font-['Londrina_Solid'] text-xl opacity-40 uppercase truncate text-black">{String(book.author)}</p>
      </div>
      {book.introduction && (
        <div className="mb-6 p-4 bg-slate-50 border-2 border-black/5 rounded-2xl italic text-sm leading-relaxed opacity-70 text-black text-left">
          "{String(book.introduction)}"
        </div>
      )}
      <div className="mt-auto flex items-center justify-between w-full text-black">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-black" style={{ backgroundColor: palette[book.vibe] || '#000' }} />
          <span className="font-['Londrina_Solid'] text-lg uppercase opacity-50 text-black">{String(book.vibe)}</span>
        </div>
        {book.suggestedBy && <span className="text-[8px] uppercase font-black opacity-30 text-black">Via {String(book.suggestedBy)}</span>}
      </div>
    </button>
  );
};

// ==========================================
// 4. DRAWERS (Registry & Observations)
// ==========================================

const AddBookDrawer = ({ onSave, onCancel }) => {
  const [newBook, setNewBook] = useState({ title: '', author: '', totalPages: '', genre: [], vibe: 'Wonder', suggestedBy: '', cries: 0, introduction: '' });
  const toggleGenre = (g) => { setNewBook(prev => ({ ...prev, genre: prev.genre.includes(g) ? prev.genre.filter(item => item !== g) : [...prev.genre, g] })); };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newBook.title || !newBook.totalPages) return;
    onSave({ ...newBook, id: Date.now().toString(), status: 'TBR', currentPage: 1, sessions: [] });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] p-6 flex items-end justify-center">
      <div className="bg-[#FDFCF0] border-[5px] border-black rounded-[40px] p-8 w-full max-w-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom duration-300 overflow-y-auto max-h-[95vh] text-black">
        <header className="flex justify-between items-start mb-6 text-left">
          <div className="text-left text-black"><h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none">New Subject</h2><p className="opacity-40 uppercase font-['Londrina_Solid'] text-lg tracking-tight">Experiment Registration</p></div>
          <button onClick={onCancel} className="text-3xl opacity-20 hover:opacity-100 transition-opacity text-black">✕</button>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between text-black">
            <label className="text-[10px] uppercase font-black opacity-40 block mb-1 text-left">Cries Hypothesis</label>
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setNewBook(p => ({...p, cries: Math.max(0, Number(p.cries) - 1)}))} className="w-8 h-8 border-2 border-black rounded-full font-black text-xl hover:bg-slate-100">-</button>
              <span className="font-['Londrina_Solid'] text-3xl">{Number(newBook.cries)}</span>
              <button type="button" onClick={() => setNewBook(p => ({...p, cries: Number(p.cries) + 1}))} className="w-8 h-8 border-2 border-black rounded-full font-black text-xl hover:bg-slate-100">+</button>
            </div>
          </div>
          <div className="space-y-3 text-left">
            <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left text-black"><label className="text-[10px] uppercase font-black opacity-40 block text-left">Subject Title</label><input required type="text" placeholder="..." className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none text-black" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} /></div>
            <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left text-black"><label className="text-[10px] uppercase font-black opacity-40 block text-left">Lead Author</label><input required type="text" placeholder="..." className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none text-black" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} /></div>
          </div>
          <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left text-black"><label className="text-[10px] uppercase font-black opacity-40 block text-left">Subject Hypothesis (Intro)</label><textarea placeholder="..." className="w-full bg-transparent font-sans text-sm focus:outline-none mt-1 min-h-[60px] resize-none leading-tight text-black" value={newBook.introduction} onChange={e => setNewBook({...newBook, introduction: e.target.value})} /></div>
          <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left text-black"><label className="text-[10px] uppercase font-black opacity-40 block text-left">Suggested By</label><input type="text" placeholder="..." className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none text-black" value={newBook.suggestedBy} onChange={e => setNewBook({...newBook, suggestedBy: e.target.value})} /></div>
          <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left text-black"><label className="text-[10px] uppercase font-black opacity-40 block text-left">Total Pages</label><input required type="number" placeholder="..." className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none text-black" value={newBook.totalPages} onChange={e => setNewBook({...newBook, totalPages: e.target.value})} /></div>
          <div className="text-left text-black"><label className="text-[10px] uppercase font-black mb-2 block text-left">Genres</label><div className="flex flex-wrap gap-1.5">{genres.map(g => (<button key={g} type="button" onClick={() => toggleGenre(g)} className={`px-2 py-1 border-2 border-black rounded-lg text-[10px] font-black uppercase transition-all ${newBook.genre.includes(g) ? 'bg-blue-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-105' : 'bg-white opacity-40 text-black'}`}>{String(g)}</button>))}</div></div>
          <button type="submit" className="w-full bg-black text-white p-5 rounded-3xl font-['Londrina_Solid'] text-2xl uppercase shadow-[6px_6px_0px_0px_rgba(100,100,100,1)] active:translate-y-1 mt-4 transition-all">Registry Success</button>
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
      <div className="bg-[#FDFCF0] border-[5px] border-black rounded-[40px] p-8 w-full max-w-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom duration-300 overflow-y-auto max-h-[95vh] text-black text-left">
        <header className="flex justify-between items-start mb-6 text-left text-black">
          <div className="text-left text-black"><h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none">Log Session</h2><p className="opacity-40 uppercase font-['Londrina_Solid'] text-lg truncate max-w-[240px]">{String(activeBook?.title)}</p></div>
          <button onClick={onCancel} className="text-3xl opacity-20 transition-opacity text-black">✕</button>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4 pb-4 text-left text-black">
          <div className="grid grid-cols-2 gap-4 text-black">
            <div className="bg-slate-100 border-4 border-black/10 p-2 rounded-2xl opacity-60 text-left"><label className="text-[8px] font-black block text-left">Start Page</label><div className="font-['Londrina_Solid'] text-2xl text-left">{Number(startPage)}</div></div>
            <div className={`bg-white border-4 p-2 rounded-2xl text-left transition-all ${isFinished ? 'border-green-500 shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]' : 'border-black'}`}><label className="text-[8px] font-black block text-left text-black">End Page</label><input required type="number" placeholder={`Max ${totalPages}`} className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none text-black" value={session.endPage} onChange={e => setSession({...session, endPage: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-left text-black">
            <div className="bg-white border-4 border-black p-2 rounded-2xl text-left text-black text-left text-black"><label className="text-[8px] font-black block text-left">Start Time</label><input type="time" required className="w-full bg-transparent font-['Londrina_Solid'] text-xl focus:outline-none text-black" value={session.startTime} onChange={e => setSession({...session, startTime: e.target.value})} /></div>
            <div className="bg-white border-4 border-black p-2 rounded-2xl text-left text-black text-left text-black"><label className="text-[8px] font-black block text-left text-black">End Time</label><input type="time" required className="w-full bg-transparent font-['Londrina_Solid'] text-xl focus:outline-none text-black" value={session.endTime} onChange={e => setSession({...session, endTime: e.target.value})} /></div>
          </div>
          <div className="flex items-center justify-between bg-white border-4 border-black p-3 rounded-2xl text-left text-black">
             <label className="text-[10px] font-black opacity-40 uppercase text-left">Cries this session?</label>
             <div className="flex items-center gap-3">
                <button type="button" onClick={() => setSession(p => ({...p, sessionCries: Math.max(0, Number(p.sessionCries) - 1)}))} className="w-6 h-6 border-2 border-black rounded-full font-black">-</button>
                <span className="font-['Londrina_Solid'] text-xl">{Number(session.sessionCries)}</span>
                <button type="button" onClick={() => setSession(p => ({...p, sessionCries: Number(p.sessionCries) + 1}))} className="w-6 h-6 border-2 border-black rounded-full font-black">+</button>
             </div>
          </div>
          {isFinished && <div className="bg-white border-4 border-green-500 p-3 rounded-2xl animate-in slide-in-from-top text-left text-black"><label className="text-[10px] font-black text-green-700 uppercase block mb-1 text-left text-left">Peer Review Conclusion</label><textarea required placeholder="Final thoughts..." className="w-full bg-transparent font-sans text-sm focus:outline-none min-h-[60px] resize-none leading-tight text-black" value={session.conclusion} onChange={e => setSession({...session, conclusion: e.target.value})} /></div>}
          <div className="text-left text-black text-left"><label className="text-[10px] font-black mb-2 block uppercase opacity-40 text-left">Primary Vibe</label><div className="flex flex-wrap gap-1">{Object.keys(palette).map(emo => (<button key={emo} type="button" onClick={() => setSession({...session, emotion: emo})} className={`px-2 py-1 border-2 border-black rounded-lg text-[8px] font-black uppercase transition-all ${session.emotion === emo ? 'bg-black text-white scale-105' : 'bg-white opacity-40 text-black'}`}>{String(emo)}</button>))}</div></div>
          <button type="submit" disabled={!activeBook || !session.endPage || Number(session.endPage) <= startPage || minutes <= 0} className={`w-full text-white p-5 rounded-3xl font-['Londrina_Solid'] text-2xl uppercase transition-all ${isFinished ? 'bg-green-600 shadow-[8px_8px_0px_0px_rgba(34,197,94,0.3)]' : 'bg-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]'}`}>{isFinished ? 'Finish Experiment! 🏁' : `Save (${Number(minutes)}m)`}</button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 5. MAIN APP CONTROLLER (Local State Mode)
// ==========================================

export default function App() {
  const [appState, setAppState] = useState('garden'); 
  const [libraryMode, setLibraryMode] = useState('grid');
  const [selectedBook, setSelectedBook] = useState(null);
  const [activeTab, setActiveTab] = useState('review');
  const [finalWinner, setFinalWinner] = useState(null);
  const [isLogging, setIsLogging] = useState(false);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [focusedSubjectId, setFocusedSubjectId] = useState(null);

  // LOCAL STATE - Cleaned up to reflect Schema Architecting phase
  const [books, setBooks] = useState([
    { 
      id: '1', title: "A Court of Mist and Fury", author: "S.J. Maas", vibe: "Smut", genre: ["Fantasy", "Romance"], 
      status: 'FINISHED', sessions: [{ emotion: 'Wonder', minutes: 45, pagesRead: 40, intensity: 4 }, { emotion: 'Smut', minutes: 90, pagesRead: 85, intensity: 5 }], 
      review: "The gold standard romantasy. High tension verified.", totalPages: 400, currentPage: 400, cries: 2, suggestedBy: "TikTok",
      introduction: "Testing the hypothesis that extreme tension can sustain a massive narrative arc."
    },
    { 
      id: '2', title: "Iron Flame", author: "Rebecca Yarros", genre: ["Fantasy"], vibe: "Wonder", 
      status: 'READING', sessions: [], totalPages: 600, currentPage: 1, cries: 0, suggestedBy: "Bestie",
      introduction: "Analyzing mechanical consistency in dragon-based combat scenarios."
    },
    { 
      id: '3', title: "The Seven Husbands of Evelyn Hugo", author: "T. Jenkins Reid", genre: ["Historical"], vibe: "Grief", 
      status: 'TBR', sessions: [], totalPages: 450, currentPage: 1, cries: 10, suggestedBy: "NYT",
      introduction: "A deep dive into Hollywood glamour, secrecy, and emotional collapse."
    }
  ]);

  const readingList = useMemo(() => books.filter(b => b.status === 'READING'), [books]);
  const tbrPool = useMemo(() => books.filter(b => b.status === 'TBR'), [books]);

  const [battleIdx, setBattleIdx] = useState(1);
  const [currentChamp, setCurrentChamp] = useState(null);

  useEffect(() => {
    if (appState === 'library' && libraryMode === 'battle' && !finalWinner && tbrPool.length > 0) {
      if (!currentChamp) setCurrentChamp(tbrPool[0]);
    }
  }, [appState, libraryMode, finalWinner, tbrPool.length, currentChamp]);

  const handleAddBook = (bookData) => {
    setBooks(prev => [...prev, bookData]);
    setIsAddingBook(false);
  };

  const handleStartReading = (book) => {
    setBooks(prev => prev.map(b => b.id === book.id ? { ...b, status: 'READING' } : b));
    setFocusedSubjectId(book.id);
    setFinalWinner(null);
    setAppState('manage');
  };

  const handleSaveSession = (sessionData) => {
    setBooks(prev => prev.map(book => {
      if (book.id === focusedSubjectId) {
        const pagesRead = Number(sessionData.endPage) - Number(sessionData.startPage);
        const newSession = {
          emotion: String(sessionData.emotion),
          minutes: Number(sessionData.minutes),
          pagesRead: Number(pagesRead),
          intensity: Number(sessionData.intensity),
          date: new Date().toISOString()
        };
        return { 
          ...book, 
          status: sessionData.isFinished ? 'FINISHED' : 'READING',
          currentPage: Number(sessionData.endPage), 
          cries: (Number(book.cries) || 0) + (Number(sessionData.sessionCries) || 0),
          sessions: [...(book.sessions || []), newSession],
          review: sessionData.isFinished ? String(sessionData.conclusion) : String(book.review || '')
        };
      }
      return book;
    }));
    setIsLogging(false);
  };

  const terminateExperiment = (id) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, status: 'DNF', review: "Experiment terminated early." } : b));
    setFocusedSubjectId(null);
  };

  const handleBattleChoice = (winner) => {
    if (battleIdx >= tbrPool.length - 1) setFinalWinner(winner);
    else { setCurrentChamp(winner); setBattleIdx(prev => prev + 1); }
  };

  const activeSubject = books.find(b => b.id === focusedSubjectId);

  return (
    <div className="min-h-screen bg-[#FDFCF0] font-sans text-black overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Londrina+Solid:wght@300;400;900&display=swap');
        .dnf-stripes { background-image: repeating-linear-gradient(45deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.15) 10px, rgba(0,0,0,0.15) 20px); }
      ` }} />

      <div className="p-6 pb-28">
        {/* DASHBOARD */}
        {appState === 'garden' && (
          <div className="max-w-md mx-auto pt-10 animate-in fade-in duration-500 text-black text-left">
            <header className="mb-10 text-left text-black">
              <div className="inline-block bg-white border-[3px] border-black px-3 py-1 rounded-full mb-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black">
                <p className="font-['Londrina_Solid'] text-xs uppercase tracking-widest text-black text-center px-4">Local Mode: Designing Blueprints</p>
              </div>
              <h1 className="font-['Londrina_Solid'] text-7xl uppercase leading-none text-black">My Garden</h1>
            </header>
            <div className="grid grid-cols-2 gap-5 text-black">
                <button onClick={() => setAppState('manage')} className="bg-[#AEC6CF] col-span-1 h-[155px] border-[5px] border-black rounded-[35px] p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:scale-95 text-left flex flex-col justify-between text-black text-left">
                  <span className="font-['Londrina_Solid'] text-2xl uppercase">Books</span>
                  <div className="text-4xl font-['Londrina_Solid'] leading-none text-left">{Number(books.length)}</div>
                </button>
                <button className="bg-[#C1E1C1] h-[155px] border-[5px] border-black rounded-[35px] p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] opacity-50 grayscale flex flex-col justify-between text-left text-black text-left text-black"><span className="font-['Londrina_Solid'] text-2xl uppercase text-left">Workout</span><div className="text-4xl font-['Londrina_Solid'] text-left">0</div></button>
                <button className="bg-[#FFD1DC] col-span-2 h-[130px] border-[5px] border-black rounded-[35px] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] opacity-40 grayscale flex flex-col justify-between text-left text-black text-left text-black"><span className="font-['Londrina_Solid'] text-2xl uppercase text-left">Experiment</span><div className="h-2 w-full bg-black/10 rounded-full" /></button>
            </div>
          </div>
        )}

        {/* READING LAB */}
        {appState === 'manage' && (
          <div className="fixed inset-0 bg-[#FDFCF0] z-40 p-8 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto text-black text-left">
            <header className="flex justify-between items-start mb-10 text-black text-left">
              <div className="text-left text-black"><h2 className="font-['Londrina_Solid'] text-5xl uppercase leading-none text-black">Reading Lab</h2><p className="font-['Londrina_Solid'] text-xl opacity-30 uppercase tracking-tight text-black text-left">Active Subjects</p></div>
              <button onClick={() => setAppState('library')} className="w-14 h-14 bg-white border-[4px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center active:translate-y-1 transition-all text-black"><span className="font-['Londrina_Solid'] text-xs">TBR</span><span className="text-xl text-black">📚</span></button>
            </header>
            <div className="flex-1 space-y-4 text-left">
              {readingList.map(book => (
                <div key={book.id} className="relative group text-left">
                  <button onClick={() => setFocusedSubjectId(book.id)} className={`w-full bg-white border-4 border-black p-5 rounded-[30px] transition-all flex items-center justify-between text-left ${focusedSubjectId === book.id ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] scale-[1.02] border-blue-500' : 'opacity-50 grayscale shadow-none'}`}>
                    <div className="text-left text-black text-left"><p className="font-['Londrina_Solid'] text-2xl uppercase leading-none text-black text-left">{String(book.title)}</p><p className="text-[10px] uppercase font-black opacity-40 mt-1 text-black text-left text-left">Page {Number(book.currentPage)} / {Number(book.totalPages)}</p></div>
                    <div className="w-4 h-4 rounded-full border-2 border-black flex-shrink-0" style={{ backgroundColor: palette[book.vibe] || '#000' }} />
                  </button>
                  {focusedSubjectId === book.id && (
                    <button onClick={() => terminateExperiment(book.id)} className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full border-2 border-black font-black flex items-center justify-center shadow-md animate-in zoom-in transition-all">✕</button>
                  )}
                </div>
              ))}
              {readingList.length === 0 && <div className="text-center py-20 opacity-30 text-black text-center"><p className="font-['Londrina_Solid'] text-2xl uppercase text-black text-center">No Active experiments</p><button onClick={() => setAppState('library')} className="border-b-2 border-black mt-2 text-black text-center font-black">Go to Gauntlet</button></div>}
            </div>
            <button onClick={() => setIsLogging(true)} disabled={!focusedSubjectId} className="w-full bg-black text-white p-6 rounded-[30px] font-['Londrina_Solid'] text-3xl uppercase shadow-[8px_8px_0px_0px_rgba(100,100,100,1)] active:translate-y-1 mt-6 disabled:opacity-20 transition-all text-center">Log Observation</button>
            <button onClick={() => setAppState('garden')} className="w-full font-['Londrina_Solid'] text-xl opacity-30 uppercase text-center mt-6 text-black text-center">Exit Lab</button>
          </div>
        )}

        {/* LIBRARY GRID */}
        {appState === 'library' && (
          <div className="max-w-md mx-auto animate-in fade-in">
            <header className="flex justify-between items-center mb-10 pt-4 text-black text-left">
              <button onClick={() => setAppState('manage')} className="text-3xl opacity-30 text-black text-center transition-all text-black">✕</button>
              <div className="inline-flex bg-white border-[4px] border-black p-1 rounded-[25px] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-black">
                {['grid', 'battle'].map(m => (<button key={m} onClick={() => { setLibraryMode(m); }} className={`px-6 py-2 rounded-[20px] font-['Londrina_Solid'] uppercase text-lg transition-all ${libraryMode === m ? 'bg-black text-white' : 'opacity-40 text-black'}`}>{String(m)}</button>))}
              </div>
              <div className="w-8" />
            </header>
            <div className="grid grid-cols-2 gap-x-5 gap-y-10">
              {libraryMode === 'grid' ? (
                <>
                  <button onClick={() => setIsAddingBook(true)} className="relative w-full aspect-[1/1.25] border-[4px] border-dashed border-black/20 rounded-[24px] p-3 flex flex-col items-center justify-center bg-white/50 hover:border-black/40 transition-all text-black"><div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white font-black">+</div><span className="font-['Londrina_Solid'] text-sm uppercase mt-4 opacity-40 text-black text-center text-black">Add Book</span></button>
                  {books.map(b => <BookGridItem key={b.id} book={b} onSelect={(book) => { setSelectedBook(book); setActiveTab('review'); }} />)}
                </>
              ) : (
                <div className="col-span-2 space-y-12">
                  {!finalWinner ? (
                    <div className="relative text-black space-y-12 w-full text-black text-left"><div className="text-center text-black"><h2 className="font-['Londrina_Solid'] text-5xl uppercase text-black text-center text-black text-center text-black text-center">The Gauntlet</h2></div><BattleCard book={currentChamp} onClick={() => handleBattleChoice(currentChamp)} label="The Champ" /><div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"><div className="bg-black text-white w-14 h-14 rounded-full border-[5px] border-[#FDFCF0] flex items-center justify-center font-['Londrina_Solid'] text-2xl shadow-lg italic text-white text-center text-white text-white">OR</div></div>{tbrPool[battleIdx] && <BattleCard book={tbrPool[battleIdx]} onClick={() => handleBattleChoice(tbrPool[battleIdx])} label="The Challenger" isNew={true} />}</div>
                  ) : (
                    <div className="text-center py-10 animate-in zoom-in text-black w-full text-black text-center text-black text-center"><div className="inline-block bg-[#C1E1C1] border-4 border-black px-6 py-2 rounded-2xl mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-['Londrina_Solid'] text-2xl uppercase text-black text-center text-black text-center">Winner</div><h2 className="font-['Londrina_Solid'] text-6xl uppercase mb-4 leading-none text-black text-center text-black text-center text-black">{String(finalWinner.title)}</h2><button onClick={() => handleStartReading(finalWinner)} className="w-full bg-black text-white p-6 rounded-[35px] font-['Londrina_Solid'] text-3xl uppercase shadow-[8px_8px_0px_0px_rgba(100,100,100,1)] active:translate-y-1 mt-8 transition-all text-center text-white">Start Reading!</button></div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ANALYSIS MODAL */}
        {selectedBook && (
          <div className="fixed inset-0 bg-[#FDFCF0] z-50 p-6 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto text-black text-left">
            <button onClick={() => setSelectedBook(null)} className="absolute top-6 right-6 text-4xl text-black text-center transition-all text-black text-black">✕</button>
            <div className="flex justify-center gap-4 mb-10 mt-12 relative z-10 text-black">{['review', 'capsule', 'pages'].map(t => (<button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-4 border-[4px] border-black rounded-[28px] font-['Londrina_Solid'] uppercase text-xl ${activeTab === t ? 'bg-black text-white shadow-none translate-y-1' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black text-center text-black text-center'}`}>{String(t)}</button>))}</div>
            <div className="flex flex-col items-center flex-1 pb-10 text-black">
              {activeTab === 'review' && (<div className="w-full space-y-8 animate-in fade-in text-black text-left"><header className="mb-4 text-left"><h2 className="font-['Londrina_Solid'] text-5xl uppercase leading-none mb-2 text-black text-left text-black text-left text-black">{String(selectedBook.title)}</h2><p className="font-['Londrina_Solid'] text-xl opacity-40 uppercase text-black text-left text-black text-left text-black">{String(selectedBook.author)}</p></header><div className="bg-white border-[5px] border-black p-8 rounded-[45px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-left text-black text-left text-black text-left text-black"><h4 className="font-['Londrina_Solid'] text-2xl uppercase mb-3 text-green-600 tracking-tight text-black text-left text-black">Summary</h4><p className="text-xl italic font-medium leading-relaxed text-black text-left text-black text-left text-black">"{String(selectedBook.review || "No review written yet.")}"</p></div><div className="grid grid-cols-2 gap-5 text-left text-black"><div className="bg-white border-[5px] border-black p-5 rounded-[30px] text-left text-black text-left text-black text-left text-black"><span className="text-[10px] font-bold uppercase opacity-30 text-black text-left text-black">Vibe</span><p className="font-['Londrina_Solid'] text-3xl uppercase leading-none mt-1 text-black text-left text-black text-left text-black">{String(selectedBook.vibe)}</p></div><div className="bg-white border-[5px] border-black p-5 rounded-[30px] shadow-[8px_8px_0px_0px_#22c55e] text-left text-black text-left text-left text-black text-left text-black"><span className="text-[10px] font-bold uppercase opacity-30 text-black text-left text-black text-left">Status</span><p className={`font-['Londrina_Solid'] text-3xl uppercase leading-none mt-1 ${selectedBook.status === 'FINISHED' ? 'text-green-600' : 'text-red-500'}`}>{String(selectedBook.status)}</p></div></div></div>)}
              {activeTab === 'capsule' && <SedimentaryRecord sessions={selectedBook.sessions || []} bookTitle={selectedBook.title} />}
              {activeTab === 'pages' && <StratifiedBookFlow sessions={selectedBook.sessions || []} bookTitle={selectedBook.title} totalPages={selectedBook.totalPages} />}
            </div>
          </div>
        )}

        {isLogging && activeSubject && <ReadingDrawer activeBook={activeSubject} onCancel={() => setIsLogging(false)} onSave={handleSaveSession} />}
        {isAddingBook && <AddBookDrawer onSave={handleAddBook} onCancel={() => setIsAddingBook(false)} />}
      </div>
    </div>
  );
}