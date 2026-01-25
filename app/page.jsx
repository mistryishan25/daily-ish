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
  arrayUnion
} from 'firebase/firestore';

// ==========================================
// 1. INFRASTRUCTURE LAYER
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
  Joy: '#FFD700', Grief: '#4B0082', Boredom: '#D3D3D3', Fear: '#2F4F4F'
};

const genres = ["Fantasy", "Sci-Fi", "Literary", "Non-Fiction", "Romance", "Thriller", "Horror", "Memoir", "Poetry"];

// ==========================================
// 2. VISUAL COMPONENTS
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
        <p className="font-['Londrina_Solid'] text-[10px] opacity-40 uppercase tracking-[0.2em] font-bold mt-1 text-black">Emotional Stratigraphy</p>
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
      <div className="bg-white border-[5px] border-black rounded-[45px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col text-black">
        <div className="mb-6 text-black text-left">
          <h3 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight text-black">{String(bookTitle)}</h3>
          <p className="font-['Londrina_Solid'] text-[10px] opacity-40 uppercase tracking-[0.2em] font-bold mt-1 text-black">Visual Page Progress</p>
        </div>
        <div className="bg-[#f9f8f4] border-2 border-dashed border-black/10 rounded-[35px] p-8 flex items-center justify-center relative min-h-[350px]">
          <div className="relative w-full max-w-[340px] flex shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-xl border-[4px] border-black bg-white overflow-hidden text-black">
            <div className="w-1/2 p-4 border-r-2 border-black/20 relative shadow-inner">
               {[...Array(Math.max(0, leftPageRows))].map((_, i) => renderRowPill(i))}
               <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-r from-transparent to-black/[0.03]" />
            </div>
            <div className="w-1/2 p-4 relative shadow-inner">
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
// 3. UI COMPONENTS
// ==========================================

const BookGridItem = ({ book, onSelect, currentUserId }) => (
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
    <div className="flex justify-between items-center z-10">
      <div className="w-3.5 h-3.5 rounded-full border-2 border-black" style={{ backgroundColor: palette[book.vibe] || '#000' }} />
      {Number(book.cries) > 0 && <span className="text-[10px] font-black opacity-40">💧 {Number(book.cries)}</span>}
    </div>
  </button>
);

// ==========================================
// 4. DRAWERS (Registry & Observations)
// ==========================================

const AddBookDrawer = ({ onSave, onCancel }) => {
  const [newBook, setNewBook] = useState({ title: '', author: '', totalPages: '', genre: [], vibe: 'Wonder', suggestedBy: '', cries: 0, introduction: '' });
  const toggleGenre = (g) => { setNewBook(prev => ({ ...prev, genre: prev.genre.includes(g) ? prev.genre.filter(item => item !== g) : [...prev.genre, g] })); };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newBook.title || !newBook.totalPages) return;
    onSave({ ...newBook, status: 'TBR', currentPage: 1, sessions: [] });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] p-6 flex items-end justify-center">
      <div className="bg-[#FDFCF0] border-[5px] border-black rounded-[40px] p-8 w-full max-w-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom overflow-y-auto max-h-[95vh] text-black">
        <header className="flex justify-between items-start mb-6 text-left">
          <div className="text-left text-black">
            <h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none">New Subject</h2>
            <p className="opacity-40 uppercase font-['Londrina_Solid'] text-lg tracking-tight">Experiment Registration</p>
          </div>
          <button onClick={onCancel} className="text-3xl opacity-20 hover:opacity-100 transition-opacity">✕</button>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <label className="text-[10px] uppercase font-black opacity-40 block mb-1">Cries Hypothesis</label>
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setNewBook(p => ({...p, cries: Math.max(0, Number(p.cries) - 1)}))} className="w-8 h-8 border-2 border-black rounded-full font-black text-xl hover:bg-slate-100">-</button>
              <span className="font-['Londrina_Solid'] text-3xl">{Number(newBook.cries)}</span>
              <button type="button" onClick={() => setNewBook(p => ({...p, cries: Number(p.cries) + 1}))} className="w-8 h-8 border-2 border-black rounded-full font-black text-xl hover:bg-slate-100">+</button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left text-black">
              <label className="text-[10px] uppercase font-black opacity-40 block">Subject Title</label>
              <input required type="text" placeholder="..." className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} />
            </div>
            <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left text-black">
              <label className="text-[10px] uppercase font-black opacity-40 block">Lead Author</label>
              <input required type="text" placeholder="..." className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} />
            </div>
          </div>
          <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left text-black">
            <label className="text-[10px] uppercase font-black opacity-40 block">Subject Hypothesis (Intro)</label>
            <textarea placeholder="..." className="w-full bg-transparent font-sans text-sm focus:outline-none mt-1 min-h-[60px] resize-none leading-tight" value={newBook.introduction} onChange={e => setNewBook({...newBook, introduction: e.target.value})} />
          </div>
          <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left text-black">
            <label className="text-[10px] uppercase font-black opacity-40 block">Suggested By</label>
            <input type="text" placeholder="..." className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none" value={newBook.suggestedBy} onChange={e => setNewBook({...newBook, suggestedBy: e.target.value})} />
          </div>
          <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left text-black">
            <label className="text-[10px] uppercase font-black opacity-40 block">Total Pages</label>
            <input required type="number" placeholder="..." className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none" value={newBook.totalPages} onChange={e => setNewBook({...newBook, totalPages: e.target.value})} />
          </div>
          <div className="text-left text-black">
            <label className="text-[10px] uppercase font-black mb-2 block">Genres</label>
            <div className="flex flex-wrap gap-1.5">
              {genres.map(g => (
                <button key={g} type="button" onClick={() => toggleGenre(g)} className={`px-2 py-1 border-2 border-black rounded-lg text-[10px] font-black uppercase transition-all ${newBook.genre.includes(g) ? 'bg-blue-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-105' : 'bg-white opacity-40'}`}>
                  {String(g)}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full bg-black text-white p-5 rounded-3xl font-['Londrina_Solid'] text-2xl uppercase shadow-[6px_6px_0px_0px_rgba(100,100,100,1)] active:translate-y-1 mt-4 transition-all text-center">Registry Success</button>
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
          <div className="text-left text-black"><h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none">Log Session</h2><p className="opacity-40 uppercase font-['Londrina_Solid'] text-lg truncate max-w-[240px]">{String(activeBook?.title)}</p></div>
          <button onClick={onCancel} className="text-3xl opacity-20">✕</button>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4 pb-4 text-left">
          <div className="grid grid-cols-2 gap-4 text-black">
            <div className="bg-slate-100 border-4 border-black/10 p-2 rounded-2xl opacity-60 text-left"><label className="text-[8px] font-black block">Start Page</label><div className="font-['Londrina_Solid'] text-2xl">{Number(startPage)}</div></div>
            <div className={`bg-white border-4 p-2 rounded-2xl text-left transition-all ${isFinished ? 'border-green-500 shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]' : 'border-black'}`}><label className="text-[8px] font-black block text-left">End Page</label><input required type="number" placeholder={`Max ${totalPages}`} className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none" value={session.endPage} onChange={e => setSession({...session, endPage: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-left text-black">
            <div className="bg-white border-4 border-black p-2 rounded-2xl text-left"><label className="text-[8px] font-black block">Start Time</label><input type="time" required className="w-full bg-transparent font-['Londrina_Solid'] text-xl focus:outline-none" value={session.startTime} onChange={e => setSession({...session, startTime: e.target.value})} /></div>
            <div className="bg-white border-4 border-black p-2 rounded-2xl text-left"><label className="text-[8px] font-black block">End Time</label><input type="time" required className="w-full bg-transparent font-['Londrina_Solid'] text-xl focus:outline-none" value={session.endTime} onChange={e => setSession({...session, endTime: e.target.value})} /></div>
          </div>
          <div className="flex items-center justify-between bg-white border-4 border-black p-3 rounded-2xl text-left">
             <label className="text-[10px] font-black opacity-40 uppercase">Cries this session?</label>
             <div className="flex items-center gap-3">
                <button type="button" onClick={() => setSession(p => ({...p, sessionCries: Math.max(0, Number(p.sessionCries) - 1)}))} className="w-6 h-6 border-2 border-black rounded-full font-black">-</button>
                <span className="font-['Londrina_Solid'] text-xl">{Number(session.sessionCries)}</span>
                <button type="button" onClick={() => setSession(p => ({...p, sessionCries: Number(p.sessionCries) + 1}))} className="w-6 h-6 border-2 border-black rounded-full font-black">+</button>
             </div>
          </div>
          <div className="bg-white border-4 border-black p-3 rounded-2xl">
            <label className="text-[10px] font-black opacity-40 uppercase block mb-1">Emotion Intensity (1-5)</label>
            <input type="range" min="1" max="5" step="1" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-black" value={session.intensity} onChange={e => setSession({...session, intensity: Number(e.target.value)})} />
            <div className="flex justify-between text-[8px] font-black mt-1 uppercase opacity-40"><span>Subtle</span><span>Overwhelming</span></div>
          </div>
          {isFinished && <div className="bg-white border-4 border-green-500 p-3 rounded-2xl animate-in slide-in-from-top text-left text-black"><label className="text-[10px] font-black text-green-700 uppercase block mb-1">Peer Review Conclusion</label><textarea required placeholder="Final thoughts..." className="w-full bg-transparent font-sans text-sm focus:outline-none min-h-[60px] resize-none leading-tight" value={session.conclusion} onChange={e => setSession({...session, conclusion: e.target.value})} /></div>}
          <div className="text-left text-black"><label className="text-[10px] font-black mb-2 block uppercase opacity-40">Primary Vibe</label><div className="flex flex-wrap gap-1">{Object.keys(palette).map(emo => (<button key={emo} type="button" onClick={() => setSession({...session, emotion: emo})} className={`px-2 py-1 border-2 border-black rounded-lg text-[8px] font-black uppercase transition-all ${session.emotion === emo ? 'bg-black text-white scale-105' : 'bg-white opacity-40'}`}>{String(emo)}</button>))}</div></div>
          <button type="submit" disabled={!activeBook || !session.endPage || Number(session.endPage) <= startPage || minutes <= 0} className={`w-full text-white p-5 rounded-3xl font-['Londrina_Solid'] text-2xl uppercase transition-all ${isFinished ? 'bg-green-600 shadow-[8px_8px_0px_0px_rgba(34,197,94,0.3)]' : 'bg-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]'}`}>{isFinished ? 'Finish Experiment! 🏁' : `Save (${Number(minutes)}m)`}</button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 5. MAIN APP CONTROLLER
// ==========================================

export default function App() {
  const [hasMounted, setHasMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [appState, setAppState] = useState('garden'); 
  const [libraryMode, setLibraryMode] = useState('grid');
  const [selectedBook, setSelectedBook] = useState(null);
  const [activeTab, setActiveTab] = useState('review');
  const [isLogging, setIsLogging] = useState(false);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [focusedSubjectId, setFocusedSubjectId] = useState(null);
  const [error, setError] = useState(null);
  const [allBooks, setAllBooks] = useState([]);

  // Data Architect Rule: Memory-based filtering for the requested researcher ID
  const TARGET_USER_ID = "0WW4Ed64jwWJICU0cAYY2VwJq8n2";
  
  const books = useMemo(() => {
    return allBooks.filter(b => b.ownerId === TARGET_USER_ID || b.ownerId === user?.uid);
  }, [allBooks, user]);

  useEffect(() => { setHasMounted(true); }, []);

  // AUTHENTICATION HANDSHAKE
  useEffect(() => {
    if (!hasMounted) return;
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.error("Auth Failure:", e);
          setError("Vault Authorization Failed.");
        }
      }
    });
    return () => unsubscribe();
  }, [hasMounted]);

  // DATA SUBSCRIPTION STREAM (Subscription Pattern)
  useEffect(() => {
    if (!user) return; 
    const booksRef = collection(db, 'artifacts', appId, 'public', 'data', 'books');
    const unsubscribe = onSnapshot(booksRef, (snapshot) => {
      const booksData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setAllBooks(booksData);
    }, (err) => {
      console.error("Stream Interrupted:", err);
      setError("Sync Error: Missing permissions.");
    });
    
    return () => unsubscribe();
  }, [user]);

  const readingList = useMemo(() => books.filter(b => b.status === 'READING'), [books]);

  // DATA INGESTION
  const handleAddBook = async (bookData) => {
    if (!user) return;
    try {
      const booksRef = collection(db, 'artifacts', appId, 'public', 'data', 'books');
      await addDoc(booksRef, { 
        ...bookData, 
        ownerId: user.uid, 
        createdAt: serverTimestamp() 
      });
      setIsAddingBook(false);
    } catch (e) { console.error(e); }
  };

  const handleStartReading = async (book) => {
    if (!user) return;
    const bookRef = doc(db, 'artifacts', appId, 'public', 'data', 'books', book.id);
    await updateDoc(bookRef, { status: 'READING' });
    setFocusedSubjectId(book.id);
    setAppState('manage');
  };

  const handleSaveSession = async (sessionData) => {
    if (!user || !focusedSubjectId) return;
    const bookRef = doc(db, 'artifacts', appId, 'public', 'data', 'books', focusedSubjectId);
    const pagesRead = Number(sessionData.endPage) - Number(sessionData.startPage);
    
    await updateDoc(bookRef, {
      status: sessionData.isFinished ? 'FINISHED' : 'READING',
      currentPage: Number(sessionData.endPage),
      cries: increment(Number(sessionData.sessionCries) || 0),
      sessions: arrayUnion({
        researcherAlias: "Anonymous_Scientist",
        emotion: String(sessionData.emotion),
        minutes: Number(sessionData.minutes),
        pagesRead: Number(pagesRead),
        intensity: Number(sessionData.intensity),
        date: new Date().toISOString()
      }),
      review: sessionData.isFinished ? String(sessionData.conclusion) : ''
    });
    setIsLogging(false);
  };

  if (!hasMounted) return null;

  return (
    <div className="min-h-screen bg-[#FDFCF0] font-sans text-black overflow-x-hidden" suppressHydrationWarning>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Londrina+Solid:wght@300;400;900&display=swap');
        .dnf-stripes { background-image: repeating-linear-gradient(45deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.15) 10px, rgba(0,0,0,0.15) 20px); }
      ` }} />

      {error && <div className="fixed top-0 inset-x-0 bg-red-500 text-white p-2 text-center text-xs z-[1000]">{String(error)}</div>}

      {!user && (
        <div className="fixed inset-0 bg-[#FDFCF0] z-[200] flex flex-col items-center justify-center p-10 text-center">
           <h2 className="font-['Londrina_Solid'] text-3xl uppercase text-black">Opening Vault</h2>
        </div>
      )}

      <div className="p-6 pb-28 text-black">
        {appState === 'garden' && (
          <div className="max-w-md mx-auto pt-10 animate-in fade-in text-left text-black">
            <header className="mb-10 text-left text-black">
              <div className="inline-block bg-white border-[3px] border-black px-3 py-1 rounded-full mb-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black">
                <p className="font-['Londrina_Solid'] text-xs uppercase tracking-widest text-black text-center px-4">Researcher: {String(user?.uid?.substring(0, 8))}</p>
              </div>
              <h1 className="font-['Londrina_Solid'] text-7xl uppercase leading-none text-black">My Garden</h1>
            </header>
            <div className="grid grid-cols-2 gap-5 text-black">
                <button onClick={() => setAppState('manage')} className="bg-[#AEC6CF] h-[155px] border-[5px] border-black rounded-[35px] p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between text-black">
                  <span className="font-['Londrina_Solid'] text-2xl uppercase">Books</span>
                  <div className="text-4xl font-['Londrina_Solid'] leading-none">{Number(books.length)}</div>
                </button>
            </div>
          </div>
        )}

        {appState === 'manage' && (
          <div className="fixed inset-0 bg-[#FDFCF0] z-40 p-8 flex flex-col animate-in slide-in-from-bottom overflow-y-auto text-black text-left">
            <header className="flex justify-between items-start mb-10 text-black">
              <div className="text-left text-black"><h2 className="font-['Londrina_Solid'] text-5xl uppercase leading-none">Reading Lab</h2><p className="font-['Londrina_Solid'] text-xl opacity-30 uppercase tracking-tight">Active Subjects</p></div>
              <button onClick={() => setAppState('library')} className="w-14 h-14 bg-white border-[4px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">📚</button>
            </header>
            <div className="flex-1 space-y-4 text-left">
              {readingList.map(book => (
                <button key={book.id} onClick={() => setFocusedSubjectId(book.id)} className={`w-full bg-white border-4 border-black p-5 rounded-[30px] flex items-center justify-between text-left ${focusedSubjectId === book.id ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-blue-500 scale-[1.02]' : 'opacity-50'}`}>
                  <div className="text-left text-black">
                    <p className="font-['Londrina_Solid'] text-2xl uppercase leading-none">{String(book.title)}</p>
                    <p className="text-[10px] font-black opacity-30 uppercase mt-1">Page {Number(book.currentPage)} / {Number(book.totalPages)}</p>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 border-black" style={{ backgroundColor: palette[book.vibe] || '#000' }} />
                </button>
              ))}
            </div>
            <button onClick={() => setIsLogging(true)} disabled={!focusedSubjectId} className="w-full bg-black text-white p-6 rounded-[30px] font-['Londrina_Solid'] text-3xl uppercase mt-6 disabled:opacity-20 transition-all text-center">Log Observation</button>
            <button onClick={() => setAppState('garden')} className="w-full font-['Londrina_Solid'] text-xl opacity-30 uppercase text-center mt-6">Exit Lab</button>
          </div>
        )}

        {appState === 'library' && (
          <div className="max-w-md mx-auto animate-in fade-in text-black">
            <header className="flex justify-between items-center mb-10 pt-4 text-black text-left">
              <button onClick={() => setAppState('manage')} className="text-3xl opacity-30">✕</button>
              <div className="inline-flex bg-white border-[4px] border-black p-1 rounded-[25px] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                {['grid', 'battle'].map(m => (<button key={m} onClick={() => setLibraryMode(m)} className={`px-6 py-2 rounded-[20px] font-['Londrina_Solid'] uppercase text-lg ${libraryMode === m ? 'bg-black text-white' : 'opacity-40'}`}>{String(m)}</button>))}
              </div>
              <div className="w-8" />
            </header>
            <div className="grid grid-cols-2 gap-x-5 gap-y-10">
              {libraryMode === 'grid' ? (
                <>
                  <button onClick={() => setIsAddingBook(true)} className="relative w-full aspect-[1/1.25] border-[4px] border-dashed border-black/20 rounded-[24px] p-3 flex flex-col items-center justify-center bg-white/50 transition-all"><div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center text-2xl font-black">+</div></button>
                  {books.map(b => <BookGridItem key={b.id} book={b} onSelect={(book) => { setSelectedBook(book); setActiveTab('review'); }} currentUserId={user.uid} />)}
                </>
              ) : (
                <div className="col-span-2 text-center py-20 opacity-30 uppercase font-['Londrina_Solid'] text-2xl">Battle mode drafting...</div>
              )}
            </div>
          </div>
        )}

        {selectedBook && (
          <div className="fixed inset-0 bg-[#FDFCF0] z-50 p-6 flex flex-col animate-in slide-in-from-bottom overflow-y-auto text-black text-left">
            <button onClick={() => setSelectedBook(null)} className="absolute top-6 right-6 text-4xl">✕</button>
            <div className="flex justify-center gap-4 mb-10 mt-12 relative z-10 text-black text-center">{['review', 'capsule', 'pages'].map(t => (<button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-4 border-[4px] border-black rounded-[28px] font-['Londrina_Solid'] uppercase text-xl ${activeTab === t ? 'bg-black text-white shadow-none translate-y-1' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}>{String(t)}</button>))}</div>
            <div className="flex flex-col items-center flex-1 pb-10 text-black">
              {activeTab === 'review' && (<div className="w-full space-y-8 text-black"><header className="text-left text-black"><h2 className="font-['Londrina_Solid'] text-5xl uppercase leading-none mb-2">{String(selectedBook.title)}</h2><p className="font-['Londrina_Solid'] text-xl opacity-40 uppercase">{String(selectedBook.author)}</p></header><div className="bg-white border-[5px] border-black p-8 rounded-[45px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-left"><h4 className="font-['Londrina_Solid'] text-2xl uppercase mb-3 text-green-600 tracking-tight">Summary</h4><p className="text-xl italic font-medium leading-relaxed text-black">"{String(selectedBook.review || "No peer review submitted yet.")}"</p></div><div className="grid grid-cols-2 gap-5"><div className="bg-white border-[5px] border-black p-5 rounded-[30px] text-left"><span className="text-[10px] font-bold uppercase opacity-30">Vibe</span><p className="font-['Londrina_Solid'] text-3xl uppercase leading-none mt-1">{String(selectedBook.vibe)}</p></div><div className="bg-white border-[5px] border-black p-5 rounded-[30px] shadow-[8px_8px_0px_0px_#22c55e] text-left"><span className="text-[10px] font-bold uppercase opacity-30">Status</span><p className="font-['Londrina_Solid'] text-3xl uppercase leading-none mt-1 text-green-600">{String(selectedBook.status)}</p></div></div></div>)}
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