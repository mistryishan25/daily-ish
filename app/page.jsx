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
        <div className="w-3.5 h-3.5 rounded-full border-2 border-black" style={{ backgroundColor: color }} />
        <span className="text-[10px] uppercase font-black font-mono opacity-70">{String(name)}</span>
      </div>
    ))}
  </div>
);

const SedimentaryRecord = ({ sessions = [], bookTitle = "Book Title" }) => (
  <div className="w-full animate-in fade-in zoom-in duration-300">
    <div className="bg-white border-[5px] border-black rounded-[45px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col">
      <div className="mb-6">
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
      <div className="bg-white border-[5px] border-black rounded-[45px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col">
        <div className="mb-6">
          <h3 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight text-black">{String(bookTitle)}</h3>
          <p className="font-['Londrina_Solid'] text-[10px] opacity-40 uppercase tracking-[0.2em] font-bold mt-1 text-black">Visual Page Progress</p>
        </div>
        <div className="bg-[#f9f8f4] border-2 border-dashed border-black/10 rounded-[35px] p-8 flex items-center justify-center min-h-[350px]">
          <div className="relative w-full max-w-[340px] flex shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-xl border-[4px] border-black bg-white overflow-hidden">
            <div className="w-1/2 p-4 border-r-2 border-black/20 relative shadow-inner text-black">
               {[...Array(Math.max(0, leftPageRows))].map((_, i) => renderRowPill(i))}
            </div>
            <div className="w-1/2 p-4 relative shadow-inner text-black">
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
    className={`relative w-full aspect-[1/1.25] border-black rounded-[24px] p-3 text-left flex flex-col justify-between transition-all active:scale-95 bg-white overflow-hidden
      ${book.status === 'FINISHED' ? 'border-[4px] shadow-[8px_8px_0px_0px_#22c55e]' : ''}
      ${book.status === 'READING' ? 'border-[4px] border-blue-500 shadow-[8px_8px_0px_0px_#3b82f6]' : ''}
      ${book.status === 'DNF' ? 'border-[4px] shadow-[8px_8px_0px_0px_#ef4444] opacity-70 grayscale' : ''}
      ${book.status === 'TBR' ? 'border-2 border-black/10 opacity-40 grayscale shadow-none' : ''}
    `}
  >
    {book.status === 'DNF' && <div className="absolute inset-0 dnf-stripes z-0 pointer-events-none" />}
    <div className="flex flex-col gap-1 z-10 text-black">
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
    <div className="z-10 text-black">
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
  if (!book) return <div className="w-full aspect-[1/1.25] max-h-[400px] bg-gray-100 border-[4px] border-dashed border-black/20 rounded-[35px] flex items-center justify-center text-black text-center p-10"><span className="font-['Londrina_Solid'] text-xl opacity-20 uppercase tracking-widest text-black">Awaiting Subject</span></div>;
  return (
    <button onClick={onClick} className={`w-full bg-white border-[4px] border-black rounded-[35px] text-left flex flex-col p-6 transition-all active:scale-95 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${isNew ? 'animate-in slide-in-from-right' : ''}`}>
      <div className="flex flex-col gap-1 text-black mb-4">
        <span className="text-[10px] uppercase font-bold opacity-30 tracking-widest">{String(label)}</span>
        <h3 className="font-['Londrina_Solid'] text-4xl uppercase leading-none mt-1 text-black">{String(book.title)}</h3>
        <p className="font-['Londrina_Solid'] text-xl opacity-40 uppercase truncate text-black">{String(book.author)}</p>
      </div>
      <div className="mt-auto flex items-center justify-between w-full text-black">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-black" style={{ backgroundColor: palette[book.vibe] || '#000' }} />
          <span className="font-['Londrina_Solid'] text-lg uppercase opacity-50 text-black">{String(book.vibe)}</span>
        </div>
      </div>
    </button>
  );
};

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
        <header className="flex justify-between items-start mb-6">
          <div className="text-left text-black"><h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none">New Subject</h2><p className="opacity-40 uppercase font-['Londrina_Solid'] text-lg tracking-tight">Registration</p></div>
          <button onClick={onCancel} className="text-3xl opacity-20 text-black">✕</button>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between text-black">
            <label className="text-[10px] uppercase font-black opacity-40 block mb-1">Cries Hypothesis</label>
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setNewBook(p => ({...p, cries: Math.max(0, Number(p.cries) - 1)}))} className="w-8 h-8 border-2 border-black rounded-full text-black">-</button>
              <span className="font-['Londrina_Solid'] text-3xl">{Number(newBook.cries)}</span>
              <button type="button" onClick={() => setNewBook(p => ({...p, cries: Number(p.cries) + 1}))} className="w-8 h-8 border-2 border-black rounded-full text-black">+</button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><label className="text-[10px] uppercase font-black opacity-40 block">Title</label><input required type="text" className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none text-black" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} /></div>
            <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><label className="text-[10px] uppercase font-black opacity-40 block">Author</label><input required type="text" className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none text-black" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} /></div>
            <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><label className="text-[10px] uppercase font-black opacity-40 block">Total Pages</label><input required type="number" className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none text-black" value={newBook.totalPages} onChange={e => setNewBook({...newBook, totalPages: e.target.value})} /></div>
          </div>
          <button type="submit" className="w-full bg-black text-white p-5 rounded-3xl font-['Londrina_Solid'] text-2xl uppercase mt-4">Registry Success</button>
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
      <div className="bg-[#FDFCF0] border-[5px] border-black rounded-[40px] p-8 w-full max-w-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom overflow-y-auto max-h-[95vh] text-black">
        <header className="flex justify-between items-start mb-6 text-black">
          <div className="text-left text-black"><h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none">Log Session</h2><p className="opacity-40 uppercase font-['Londrina_Solid'] text-lg truncate max-w-[240px]">{String(activeBook?.title)}</p></div>
          <button onClick={onCancel} className="text-3xl opacity-20 text-black">✕</button>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4 pb-4">
          <div className="grid grid-cols-2 gap-4 text-black text-left">
            <div className="bg-slate-100 border-4 border-black/10 p-2 rounded-2xl opacity-60"><label className="text-[8px] font-black block">Start Page</label><div className="font-['Londrina_Solid'] text-2xl">{Number(startPage)}</div></div>
            <div className="bg-white border-4 border-black p-2 rounded-2xl"><label className="text-[8px] font-black block">End Page</label><input required type="number" className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none text-black" value={session.endPage} onChange={e => setSession({...session, endPage: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-black text-left">
            <div className="bg-white border-4 border-black p-2 rounded-2xl"><label className="text-[8px] font-black block">Start Time</label><input type="time" required className="w-full bg-transparent font-['Londrina_Solid'] text-xl focus:outline-none text-black" value={session.startTime} onChange={e => setSession({...session, startTime: e.target.value})} /></div>
            <div className="bg-white border-4 border-black p-2 rounded-2xl"><label className="text-[8px] font-black block">End Time</label><input type="time" required className="w-full bg-transparent font-['Londrina_Solid'] text-xl focus:outline-none text-black" value={session.endTime} onChange={e => setSession({...session, endTime: e.target.value})} /></div>
          </div>
          <div className="flex items-center justify-between bg-white border-4 border-black p-3 rounded-2xl text-black">
             <label className="text-[10px] font-black opacity-40 uppercase">Cries?</label>
             <div className="flex items-center gap-3">
                <button type="button" onClick={() => setSession(p => ({...p, sessionCries: Math.max(0, Number(p.sessionCries) - 1)}))} className="w-6 h-6 border-2 border-black rounded-full">-</button>
                <span className="font-['Londrina_Solid'] text-xl">{Number(session.sessionCries)}</span>
                <button type="button" onClick={() => setSession(p => ({...p, sessionCries: Number(p.sessionCries) + 1}))} className="w-6 h-6 border-2 border-black rounded-full">+</button>
             </div>
          </div>
          <div className="text-left text-black"><label className="text-[10px] font-black mb-2 block uppercase opacity-40">Primary Vibe</label><div className="flex flex-wrap gap-1">{Object.keys(palette).map(emo => (<button key={emo} type="button" onClick={() => setSession({...session, emotion: emo})} className={`px-2 py-1 border-2 border-black rounded-lg text-[8px] font-black uppercase transition-all ${session.emotion === emo ? 'bg-black text-white' : 'bg-white opacity-40'}`}>{String(emo)}</button>))}</div></div>
          <button type="submit" className="w-full bg-black text-white p-5 rounded-3xl font-['Londrina_Solid'] text-2xl uppercase">{isFinished ? 'Finish Experiment!' : `Save (${Number(minutes)}m)`}</button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 3. MAIN APP CONTROLLER
// ==========================================

export default function App() {
  const [hasMounted, setHasMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [appState, setAppState] = useState('garden'); 
  const [libraryMode, setLibraryMode] = useState('grid');
  const [selectedBook, setSelectedBook] = useState(null);
  const [activeTab, setActiveTab] = useState('review');
  const [finalWinner, setFinalWinner] = useState(null);
  const [isLogging, setIsLogging] = useState(false);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [focusedSubjectId, setFocusedSubjectId] = useState(null);
  const [error, setError] = useState(null);
  const [books, setBooks] = useState([]);

  useEffect(() => { setHasMounted(true); }, []);

  // AUTH HANDSHAKE
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

  // DATA SUBSCRIPTION
  useEffect(() => {
    if (!user) return; 
    const booksRef = collection(db, 'artifacts', appId, 'public', 'data', 'books');
    const unsubscribe = onSnapshot(booksRef, (snapshot) => {
      const booksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBooks(booksData);
    }, (err) => {
      setError("Sync Error: Missing Permissions.");
    });
    return () => unsubscribe();
  }, [user]);

  const readingList = useMemo(() => books.filter(b => b.status === 'READING'), [books]);
  const tbrPool = useMemo(() => books.filter(b => b.status === 'TBR'), [books]);

  // DATA INGESTION
  const handleAddBook = async (bookData) => {
    if (!user) return;
    try {
      const booksRef = collection(db, 'artifacts', appId, 'public', 'data', 'books');
      await addDoc(booksRef, { 
        ...bookData, 
        ownerId: user.uid, // FIELD-BASED OWNERSHIP
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
              <div className="inline-block bg-white border-[3px] border-black px-3 py-1 rounded-full mb-3 text-black">
                <p className="font-['Londrina_Solid'] text-xs uppercase tracking-widest text-black">Researcher: {String(user?.uid?.substring(0, 8))}</p>
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
          <div className="fixed inset-0 bg-[#FDFCF0] z-40 p-8 flex flex-col animate-in slide-in-from-bottom overflow-y-auto text-black">
            <header className="flex justify-between items-start mb-10 text-black">
              <div className="text-left text-black"><h2 className="font-['Londrina_Solid'] text-5xl uppercase leading-none">Reading Lab</h2></div>
              <button onClick={() => setAppState('library')} className="w-14 h-14 bg-white border-[4px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">📚</button>
            </header>
            <div className="flex-1 space-y-4 text-left">
              {readingList.map(book => (
                <button key={book.id} onClick={() => setFocusedSubjectId(book.id)} className={`w-full bg-white border-4 border-black p-5 rounded-[30px] flex items-center justify-between ${focusedSubjectId === book.id ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-blue-500' : 'opacity-50'}`}>
                  <div className="text-left text-black"><p className="font-['Londrina_Solid'] text-2xl uppercase leading-none">{String(book.title)}</p></div>
                  <div className="w-4 h-4 rounded-full border-2 border-black" style={{ backgroundColor: palette[book.vibe] || '#000' }} />
                </button>
              ))}
            </div>
            <button onClick={() => setIsLogging(true)} disabled={!focusedSubjectId} className="w-full bg-black text-white p-6 rounded-[30px] font-['Londrina_Solid'] text-3xl uppercase mt-6 disabled:opacity-20">Log Observation</button>
            <button onClick={() => setAppState('garden')} className="w-full font-['Londrina_Solid'] text-xl opacity-30 uppercase text-center mt-6">Exit Lab</button>
          </div>
        )}

        {appState === 'library' && (
          <div className="max-w-md mx-auto animate-in fade-in text-black">
            <header className="flex justify-between items-center mb-10 pt-4 text-black">
              <button onClick={() => setAppState('manage')} className="text-3xl opacity-30 text-black">✕</button>
              <div className="bg-white border-[4px] border-black p-1 rounded-[25px] text-black">
                {['grid', 'battle'].map(m => (<button key={m} onClick={() => setLibraryMode(m)} className={`px-6 py-2 rounded-[20px] font-['Londrina_Solid'] uppercase text-lg ${libraryMode === m ? 'bg-black text-white' : 'opacity-40'}`}>{String(m)}</button>))}
              </div>
              <div className="w-8" />
            </header>
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 text-black">
              {libraryMode === 'grid' ? (
                <>
                  <button onClick={() => setIsAddingBook(true)} className="w-full aspect-[1/1.25] border-[4px] border-dashed border-black/20 rounded-[24px] flex flex-col items-center justify-center bg-white/50 text-black font-black">+</button>
                  {books.map(b => <BookGridItem key={b.id} book={b} onSelect={(book) => { setSelectedBook(book); setActiveTab('review'); }} currentUserId={user.uid} />)}
                </>
              ) : (
                <div className="col-span-2 text-black">
                  {!finalWinner ? (
                     <div className="space-y-12">
                       <BattleCard book={tbrPool[0]} label="The Champ" onClick={() => setFinalWinner(tbrPool[0])} />
                     </div>
                  ) : <button onClick={() => handleStartReading(finalWinner)}>Start!</button>}
                </div>
              )}
            </div>
          </div>
        )}

        {selectedBook && (
          <div className="fixed inset-0 bg-[#FDFCF0] z-50 p-6 flex flex-col animate-in slide-in-from-bottom overflow-y-auto text-black">
            <button onClick={() => setSelectedBook(null)} className="absolute top-6 right-6 text-4xl text-black">✕</button>
            <div className="flex justify-center gap-4 mb-10 mt-12 text-black">{['review', 'capsule', 'pages'].map(t => (<button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-4 border-[4px] border-black rounded-[28px] font-['Londrina_Solid'] uppercase text-xl ${activeTab === t ? 'bg-black text-white' : 'bg-white'}`}>{String(t)}</button>))}</div>
            <div className="flex flex-col items-center flex-1 pb-10 text-black">
              {activeTab === 'review' && (<div className="w-full space-y-8 text-black"><header className="text-left text-black"><h2 className="font-['Londrina_Solid'] text-5xl uppercase leading-none text-black">{String(selectedBook.title)}</h2></header><div className="bg-white border-[5px] border-black p-8 rounded-[45px] text-left text-black"><p className="text-xl italic text-black">"{String(selectedBook.review || "No review.")}"</p></div></div>)}
              {activeTab === 'capsule' && <SedimentaryRecord sessions={selectedBook.sessions || []} bookTitle={selectedBook.title} />}
            </div>
          </div>
        )}

        {isLogging && activeSubject && <ReadingDrawer activeBook={activeSubject} onCancel={() => setIsLogging(false)} onSave={handleSaveSession} />}
        {isAddingBook && <AddBookDrawer onSave={handleAddBook} onCancel={() => setIsAddingBook(false)} />}
      </div>
    </div>
  );
}