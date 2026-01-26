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

import ReadingLab from './ReadingLab';
import LoveLab from './LoveLab';
// ==========================================
// SECTION 1: GLOBAL CONFIG & CONSTANTS
// (Keep this in your page.jsx or a config/firebase.js)
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

// Shared Icons
const SettingsIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
const SproutIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 20h10"/><path d="M10 20c5.5-2.5 8-6.4 8-10"/><path d="M9.5 9.4c1.1.8 2.4 2.2 2.5 4.6"/><path d="M2 11c.1 0 .2.1.2.1C4.6 13 6 17 6 17c1.3-4.3 6-4.5 6-4.5.8 0 1.5.3 2 1 2.5-3.3 5.8-3.3 5.8-3.3A5.9 5.9 0 0 0 22 4s-4.4 0-6.1 1.7c-2 2-2.3 4.2-2 5.6C11 11.3 8 13.5 6.5 17c-1.3-4.3-4.5-6-4.5-6z"/></svg>
);
const SparklesIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);



// ==========================================
// SECTION 4: MAIN DRIVER (The Orchestrator)
// (Save as page.jsx)
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
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [focusedSubjectId, setFocusedSubjectId] = useState(null);

  // Love State
  const [activeSpecimens, setActiveSpecimens] = useState([
    { id: 1, codename: "Alpha", active: true }, { id: 2, codename: "Beta", active: true },
    { id: 3, codename: "Gamma", active: true }, { id: 4, codename: "Delta", active: true },
    { id: 5, codename: null }, { id: 6, codename: null },
    { id: 7, codename: null }, { id: 8, codename: null }
  ]);
  const [fallingSpecimen, setFallingSpecimen] = useState(null);
  const [sedimentPile, setSedimentPile] = useState([]);

  // Battle Logic States
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
  const emptySlots = useMemo(() => activeSpecimens.filter(s => !s.codename).length, [activeSpecimens]);

  useEffect(() => {
    if (appState === 'library' && libraryMode === 'battle' && !finalWinner && tbrPool.length > 1) {
      if (!currentChamp) { setCurrentChamp(tbrPool[0]); setBattleIdx(1); }
    }
  }, [appState, libraryMode, finalWinner, tbrPool.length, currentChamp]);

  // Actions
  const triggerSpecimenExpiration = (specimen) => {
    if (fallingSpecimen || !specimen.codename) return;
    setActiveSpecimens(prev => prev.map(s => s.id === specimen.id ? { ...s, codename: null } : s));
    setFallingSpecimen({ ...specimen, rot: (Math.random() - 0.5) * 40, x: (Math.random() - 0.5) * 60 });
    setTimeout(() => {
      setSedimentPile(prev => [...prev, { ...specimen, rot: (Math.random() - 0.5) * 25, x: (Math.random() - 0.5) * 40 }]);
      setFallingSpecimen(null);
    }, 1200);
  };

  const handleAddPerson = (personData) => {
    const emptySlot = activeSpecimens.find(s => !s.codename);
    if (emptySlot) setActiveSpecimens(prev => prev.map(s => s.id === emptySlot.id ? { ...s, codename: personData.codename, active: true } : s));
    setIsAddingPerson(false);
  };

  const handleAddBook = async (bookData) => {
    if (!user) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'books'), { ...bookData, status: 'TBR', currentPage: 1, sessions: [], ownerId: user.uid, createdAt: serverTimestamp() });
    setIsAddingBook(false);
  };

  const handleStartReading = async (book) => {
    if (!user || !book) return;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'books', book.id), { status: 'READING' });
    setFocusedSubjectId(book.id);
    setAppState('manage'); setFinalWinner(null); setCurrentChamp(null);
  };

  const handleSaveSession = async (sessionData) => {
    if (!user || !focusedSubjectId) return;
    const pagesRead = Number(sessionData.endPage) - Number(sessionData.startPage);
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'books', focusedSubjectId), {
      status: sessionData.isFinished ? 'FINISHED' : 'READING',
      currentPage: Number(sessionData.endPage),
      sessions: arrayUnion({ emotion: String(sessionData.emotion), intensity: Number(sessionData.intensity), minutes: Number(sessionData.minutes), pagesRead: Number(pagesRead), date: new Date().toISOString() }),
      review: sessionData.isFinished ? String(sessionData.conclusion) : ''
    });
    setIsLogging(false);
  };

  const handleBattleChoice = (winner) => {
    if (!winner) return;
    setRoundWinnerId(winner.id); setCelebrating(true);
    setTimeout(() => {
      setCelebrating(false); setRoundWinnerId(null);
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
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
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
        .confetti-particle-burst { position: absolute; width: 12px; height: 12px; opacity: 0; border-radius: 2px; animation: burst-out 0.8s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; }
        @keyframes burst-out { 0% { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 1; } 100% { transform: translate(var(--spread-x), var(--spread-y)) scale(0.6) rotate(720deg); opacity: 0; } }
        .confetti-particle-rain { position: absolute; width: 10px; height: 10px; top: -20px; opacity: 0.8; border-radius: 2px; animation: confetti-fall 5s linear infinite; }
        @keyframes confetti-fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
      ` }} />

      {celebrating && !finalWinner && <ConfettiBurst />}
      {finalWinner && <ConfettiRain />}

      <div className="p-6 pb-28 text-black text-left">
        {appState === 'garden' && (
          <div className="max-w-md mx-auto pt-10 animate-in fade-in duration-500">
            <header className="mb-10 text-left">
              <div className="inline-block bg-white border-[3px] border-black px-3 py-1 rounded-full mb-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <p className="font-['Londrina_Solid'] text-xs uppercase tracking-widest text-black">Verified Researcher: {String(user?.uid?.substring(0, 8))}</p>
              </div>
              <h1 className="font-['Londrina_Solid'] text-7xl uppercase leading-none font-black text-black">Pattern HQ</h1>
            </header>
            <div className="grid grid-cols-2 gap-5">
                <button onClick={() => setAppState('manage')} className="bg-[#AEC6CF] h-[155px] border-[5px] border-black rounded-[45px] p-5 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between active:translate-y-1 transition-all">
                  <span className="font-['Londrina_Solid'] text-2xl uppercase font-bold">Reading</span>
                  <div className="text-4xl font-['Londrina_Solid']">{Number(books.length)}</div>
                </button>
                <button onClick={() => setAppState('dating_hub')} className="bg-[#FFD1DC] h-[155px] border-[5px] border-black rounded-[45px] p-5 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between active:translate-y-1 transition-all">
                  <span className="font-['Londrina_Solid'] text-2xl uppercase font-bold">Dating</span>
                  <div className="text-4xl font-['Londrina_Solid'] text-right">{Number(peopleMetCount)}</div>
                </button>
            </div>
          </div>
        )}

        {appState === 'manage' && (
          <ReadingLab 
            books={books} user={user} setAppState={setAppState} setFocusedSubjectId={setFocusedSubjectId} 
            focusedSubjectId={focusedSubjectId} setIsLogging={setIsLogging} handleStartReading={handleStartReading} 
            readingList={readingList}
          />
        )}

        {appState === 'dating_hub' && (
          <LoveLab 
            activeSpecimens={activeSpecimens} setAppState={setAppState} emptySlots={emptySlots} 
            triggerSpecimenExpiration={triggerSpecimenExpiration} sedimentPile={sedimentPile} 
            setIsAddingPerson={setIsAddingPerson} fallingSpecimen={fallingSpecimen}
          />
        )}

        {/* Global Modals & Sub-Views */}
        {appState === 'library' && (
           <LibraryView 
             setAppState={setAppState} libraryMode={libraryMode} setLibraryMode={setLibraryMode} 
             setFinalWinner={setFinalWinner} setCurrentChamp={setCurrentChamp} setIsAddingBook={setIsAddingBook} 
             books={books} setSelectedBook={setSelectedBook} setActiveTab={setActiveTab} user={user} 
             tbrPool={tbrPool} finalWinner={finalWinner} handleBattleChoice={handleBattleChoice} 
             roundWinnerId={roundWinnerId} currentChamp={currentChamp} battleIdx={battleIdx} handleStartReading={handleStartReading}
           />
        )}

        {appState === 'dating_bloom' && (
           <DatingBloomView 
             setAppState={setAppState} activeSpecimens={activeSpecimens} triggerSpecimenExpiration={triggerSpecimenExpiration} 
             fallingSpecimen={fallingSpecimen} sedimentPile={sedimentPile}
           />
        )}

        {isAddingBook && <AddBookDrawer onSave={handleAddBook} onCancel={() => setIsAddingBook(false)} />}
        {isAddingPerson && <AddPersonModal handleAddPerson={handleAddPerson} setIsAddingPerson={setIsAddingPerson} />}
        {isLogging && focusedSubjectId && <ReadingDrawer activeBook={books.find(b => b.id === focusedSubjectId)} onCancel={() => setIsLogging(false)} onSave={handleSaveSession} />}
        {selectedBook && <AnalysisModal selectedBook={selectedBook} setSelectedBook={setSelectedBook} activeTab={activeTab} setActiveTab={setActiveTab} />}
        {['dating_garden', 'dating_lab', 'dating_playbook'].includes(appState) && <StationPlaceholder appState={appState} setAppState={setAppState} />}
      </div>
    </div>
  );
}

// SHARED VIEW HELPERS
const LibraryView = ({ setAppState, libraryMode, setLibraryMode, setFinalWinner, setCurrentChamp, setIsAddingBook, books, setSelectedBook, setActiveTab, user, tbrPool, finalWinner, handleBattleChoice, roundWinnerId, currentChamp, battleIdx, handleStartReading }) => (
  <div className="max-w-md mx-auto animate-in fade-in">
    <header className="flex justify-between items-center mb-10 pt-4"><button onClick={() => setAppState('manage')} className="text-3xl opacity-30 font-bold">✕</button><div className="inline-flex bg-white border-[4px] border-black p-1 rounded-[25px] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">{['grid', 'battle'].map(m => (<button key={m} onClick={() => { setLibraryMode(m); setFinalWinner(null); setCurrentChamp(null); }} className={`px-6 py-2 rounded-[20px] font-['Londrina_Solid'] uppercase text-lg transition-all ${libraryMode === m ? 'bg-black text-white' : 'opacity-40 text-black'}`}>{String(m)}</button>))}</div><div className="w-8" /></header>
    <div className="grid grid-cols-2 gap-x-5 gap-y-10">{libraryMode === 'grid' ? (<><button onClick={() => setIsAddingBook(true)} className="relative w-full aspect-[1/1.25] border-[4px] border-dashed border-black/20 rounded-[24px] p-3 flex flex-col items-center justify-center bg-white/50 hover:border-black/40"><div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center text-2xl font-black">+</div></button>{books.map(b => <BookGridItem key={b.id} book={b} onSelect={(book) => { setSelectedBook(book); setActiveTab('review'); }} currentUserId={user?.uid} />)}</>) : (<div className="col-span-2">{tbrPool.length < 2 && !finalWinner ? (<div className="text-center py-20 font-['Londrina_Solid'] text-3xl opacity-30 uppercase">Min. 2 Subjects Required</div>) : !finalWinner ? (<div className="space-y-2 text-center"><h2 className="font-['Londrina_Solid'] text-5xl uppercase mb-6">The Gauntlet</h2><div className="flex flex-col space-y-0">{currentChamp && <div className="pb-7"><BattleCard book={currentChamp} label="The Champ" onClick={() => handleBattleChoice(currentChamp)} isSelectionWinner={roundWinnerId === currentChamp.id} /></div>}<div className="flex justify-center py-2 z-20 relative pointer-events-none"><div className="w-16 h-16 rounded-full bg-black border-[6px] border-[#FDFCF0] text-white flex items-center justify-center font-['Londrina_Solid'] text-3xl italic shadow-xl">VS</div></div>{tbrPool[battleIdx] && <div className="pt-7"><BattleCard book={tbrPool[battleIdx]} label="The Challenger" isNew={true} onClick={() => handleBattleChoice(tbrPool[battleIdx])} isSelectionWinner={roundWinnerId === tbrPool[battleIdx].id} /></div>}</div></div>) : (<div className="text-center animate-in zoom-in py-10"><div className="inline-block bg-green-200 border-2 border-black px-4 py-1 rounded-xl mb-4 font-black uppercase text-[10px]">Subject Selected</div><h2 className="font-['Londrina_Solid'] text-6xl uppercase leading-none mb-8">{String(finalWinner.title)}</h2><button onClick={() => handleStartReading(finalWinner)} className="w-full bg-black text-white p-6 rounded-3xl font-['Londrina_Solid'] text-3xl uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-1 font-bold">Start Experiment</button></div>)}</div>)}</div>
  </div>
);

const DatingBloomView = ({ setAppState, activeSpecimens, triggerSpecimenExpiration, fallingSpecimen, sedimentPile }) => (
  <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
    <header className="bg-[#1a1c2c] border-b-[6px] border-black px-10 py-8 flex justify-between items-center text-white relative shadow-xl"><button onClick={() => setAppState('dating_hub')} className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity font-bold">BACK</button><h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight">Daily Bloom</h2><div className="w-10" /></header>
    <div className="flex-1 relative overflow-y-auto glass-body flex flex-col bg-white/5 p-8"><div className="grid grid-cols-2 gap-y-16 gap-x-10 mb-24 justify-items-center">{activeSpecimens.map((s, i) => (<button key={s.id} onClick={() => triggerSpecimenExpiration(s)} className="flex flex-col items-center animate-float group" style={{ animationDelay: `${i * 0.4}s` }}><MLMHeart id={`detail-${s.id}`} isPlaceholder={!s.codename} /><span className="font-['Londrina_Solid'] text-xs uppercase mt-5 opacity-60 font-bold group-active:scale-110 transition-transform">{s.codename ? `Terminate ${String(s.codename)}` : 'Dormant Slot'}</span></button>)) }</div>{fallingSpecimen && (<div className="animate-physics-drop absolute bottom-32 left-1/2 -translate-x-1/2" style={{ '--final-rot': `${fallingSpecimen.rot}deg`, zIndex: 100 }}><MLMHeart id={`fall-${fallingSpecimen.id}`} /></div>)}</div>
    <div className="bg-black p-6 border-t-[6px] border-black text-center text-white font-black uppercase text-xs text-white">Sediment Log: {sedimentPile.length}</div>
  </div>
);

const AnalysisModal = ({ selectedBook, setSelectedBook, activeTab, setActiveTab }) => (
  <div className="fixed inset-0 bg-[#FDFCF0] z-50 p-6 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto">
    <button onClick={() => setSelectedBook(null)} className="absolute top-6 right-6 text-4xl opacity-30 text-black font-bold">✕</button>
    <div className="flex justify-center gap-4 mb-10 mt-12 relative z-10">{['review', 'capsule', 'pages'].map(t => (<button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-4 border-[4px] border-black rounded-[28px] font-['Londrina_Solid'] uppercase text-xl transition-all ${activeTab === t ? 'bg-black text-white shadow-none translate-y-1' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black font-bold'}`}>{String(t)}</button>))}</div>
    <div className="flex flex-col items-center flex-1 pb-10">{activeTab === 'review' && (<div className="w-full space-y-8 animate-in fade-in text-left"><header><h2 className="font-['Londrina_Solid'] text-5xl uppercase leading-none mb-2 font-black">{String(selectedBook.title)}</h2><p className="font-['Londrina_Solid'] text-xl opacity-40 uppercase font-bold">{String(selectedBook.author)}</p></header><div className="bg-white border-[5px] border-black p-8 rounded-[45px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"><h4 className="font-['Londrina_Solid'] text-2xl uppercase mb-3 text-green-600 tracking-tight font-black">Conclusion</h4><p className="text-xl italic font-medium leading-relaxed">"{String(selectedBook.review || "Ongoing investigation.")}"</p></div></div>)}{activeTab === 'capsule' && <SedimentaryRecord sessions={selectedBook.sessions || []} bookTitle={selectedBook.title} />}{activeTab === 'pages' && <StratifiedBookFlow sessions={selectedBook.sessions || []} bookTitle={selectedBook.title} totalPages={selectedBook.totalPages} />}</div>
  </div>
);

const AddPersonModal = ({ handleAddPerson, setIsAddingPerson }) => (
  <div className="fixed inset-0 bg-black/60 z-[200] p-6 flex items-end justify-center"><div className="bg-[#FDFCF0] border-[5px] border-black rounded-[40px] p-8 w-full max-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom overflow-y-auto"><header className="flex justify-between items-start mb-6 text-left"><div><h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none font-black">Subject Recruitment</h2><p className="opacity-40 uppercase font-['Londrina_Solid'] text-lg font-bold">Transforms dormant slots</p></div><button onClick={() => setIsAddingPerson(false)} className="text-3xl opacity-20 font-bold">✕</button></header><form onSubmit={(e) => { e.preventDefault(); handleAddPerson({ codename: e.target.codename.value }); }} className="space-y-5 text-left"><div className="bg-white border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><label className="text-[10px] uppercase font-black opacity-40 block mb-1">Subject Codename</label><input required name="codename" type="text" placeholder="..." className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none" /></div><button type="submit" className="w-full bg-black text-white p-5 rounded-3xl font-['Londrina_Solid'] text-2xl uppercase shadow-[6px_6px_0px_0px_rgba(100,100,100,1)] active:translate-y-1 transition-all text-center">Inject Subject</button></form></div></div>
);

const StationPlaceholder = ({ appState, setAppState }) => (
  <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in zoom-in duration-300"><header className="bg-[#1a1c2c] border-b-[6px] border-black px-10 py-8 flex justify-between items-center text-white relative shadow-xl"><button onClick={() => setAppState('dating_hub')} className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity font-bold">BACK</button><h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight">{String(appState.split('_')[1].toUpperCase())} STATION</h2><div className="w-10" /></header><div className="flex-1 flex flex-col items-center justify-center p-10 text-center opacity-30 text-black"><SparklesIcon size={100} className="mb-6 text-black" /><h3 className="font-['Londrina_Solid'] text-4xl uppercase font-black">Calibration Required</h3><p className="font-['Londrina_Solid'] text-xl uppercase mt-2 font-bold">Refining local variables...</p></div></div>
);

const BookGridItem = ({ book, onSelect, currentUserId }) => (
  <button onClick={() => (book.status === 'FINISHED' || book.status === 'READING' || book.status === 'DNF') && onSelect(book)} className={`relative w-full aspect-[1/1.25] border-black border-[4px] rounded-[24px] p-3 text-left flex flex-col justify-between transition-all active:scale-95 bg-white overflow-hidden ${book.status === 'FINISHED' ? 'shadow-[8px_8px_0px_0px_#22c55e]' : ''} ${book.status === 'READING' ? 'border-blue-500 shadow-[8px_8px_0px_0px_#3b82f6]' : ''} ${book.status === 'DNF' ? 'shadow-[8px_8px_0px_0px_#ef4444] opacity-70 grayscale' : 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'}`}>{book.status === 'DNF' && <div className="absolute inset-0 dnf-stripes z-0 pointer-events-none" />}<div className="flex flex-col gap-1 z-10 text-black text-left"><div className="flex justify-between items-center"><div className="font-['Londrina_Solid'] uppercase text-[8px] tracking-widest text-black/30">{String(book.status)}</div><div className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${book.ownerId === currentUserId ? 'bg-black text-white' : 'bg-slate-100 text-black'}`}>{book.ownerId === currentUserId ? 'My Lab' : 'Peer'}</div></div></div><div className="z-10 text-black text-left"><h3 className="font-['Londrina_Solid'] text-lg uppercase leading-none mb-1 line-clamp-2">{String(book.title)}</h3><p className="font-['Londrina_Solid'] text-[10px] opacity-40 uppercase truncate">{String(book.author)}</p></div><div className="flex justify-between items-center z-10 text-black">{book.status === 'DNF' ? (<div className="bg-yellow-400 text-black px-2 py-0.5 rounded-md border-2 border-black font-black text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase text-center text-black font-black">DNF</div>) : (<div className="w-3.5 h-3.5 rounded-full border-2 border-black shadow-sm" style={{ backgroundColor: palette[book.vibe] || '#000' }} />)}{Number(book.cries) > 0 && <span className="text-[10px] font-black opacity-40 text-black">💧 {Number(book.cries)}</span>}</div></button>
);

const BattleCard = ({ book, onClick, label, isNew, isSelectionWinner }) => {
  if (!book) return null;
  return (
    <div className="relative w-full">{isSelectionWinner && <div className="absolute -inset-3 bg-gradient-to-r from-blue-500 via-pink-500 to-yellow-500 rounded-[45px] animate-laser-glow blur-[2px] z-0" />}<button onClick={onClick} className={`relative w-full bg-white border-[4px] border-black rounded-[35px] text-left flex flex-col p-5 transition-all active:scale-95 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-10 ${isNew ? 'animate-in slide-in-from-right duration-500' : ''} ${isSelectionWinner ? 'scale-105 border-transparent' : ''}`}><span className="text-[10px] uppercase font-bold opacity-30 tracking-widest text-black">{String(label)}</span><h3 className="font-['Londrina_Solid'] text-2xl uppercase leading-tight line-clamp-1 text-black font-black">{String(book.title)}</h3><p className="font-['Londrina_Solid'] text-lg opacity-40 uppercase truncate text-black">{String(book.author)}</p></button></div>
  );
};

const AddBookDrawer = ({ onSave, onCancel }) => {
  const [nb, setNb] = useState({ title: '', author: '', totalPages: '', vibe: 'Wonder', genre: [], suggestedBy: '', cries: 0, introduction: '' });
  const toggleGenre = (g) => { setNb(prev => ({ ...prev, genre: prev.genre.includes(g) ? prev.genre.filter(item => item !== g) : [...prev.genre, g] })); };
  return (
    <div className="fixed inset-0 bg-black/60 z-[200] p-6 flex items-end justify-center text-left"><div className="bg-[#FDFCF0] border-[5px] border-black rounded-[40px] p-8 w-full max-w-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-y-auto max-h-[95vh]"><h2 className="font-['Londrina_Solid'] text-4xl uppercase mb-6 font-black text-left">Subject Registration</h2><form onSubmit={(e) => { e.preventDefault(); onSave(nb); }} className="space-y-4 text-left"><div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between"><label className="text-[10px] uppercase font-black opacity-40">Cries Hypothesis</label><div className="flex items-center justify-between font-bold"><button type="button" onClick={() => setNb(p => ({...p, cries: Math.max(0, p.cries - 1)}))} className="w-8 h-8 border-2 border-black rounded-full font-black">-</button><span className="font-['Londrina_Solid'] text-3xl font-black">{nb.cries}</span><button type="button" onClick={() => setNb(p => ({...p, cries: p.cries + 1}))} className="w-8 h-8 border-2 border-black rounded-full font-black">+</button></div></div><div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><label className="text-[10px] uppercase font-black opacity-40">Title</label><input required className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none font-black" value={nb.title} onChange={e => setNb({...nb, title: e.target.value})} /></div><div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><label className="text-[10px] uppercase font-black opacity-40">Lead Author</label><input required className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none font-black" value={nb.author} onChange={e => setNb({...nb, author: e.target.value})} /></div><div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><label className="text-[10px] uppercase font-black opacity-40">Total Pages</label><input required type="number" className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none font-black" value={nb.totalPages} onChange={e => setNb({...nb, totalPages: e.target.value})} /></div><div className="flex flex-wrap gap-1 mt-2">{genres.map(g => (<button key={g} type="button" onClick={() => toggleGenre(g)} className={`px-2 py-1 border-2 border-black rounded-lg text-[8px] font-black uppercase transition-all ${nb.genre.includes(g) ? 'bg-blue-500 text-white' : 'bg-white opacity-40'}`}>{g}</button>))}</div><button type="submit" className="w-full bg-black text-white p-5 rounded-3xl font-['Londrina_Solid'] text-2xl uppercase font-black shadow-[6px_6px_0px_0px_rgba(100,100,100,1)] active:translate-y-1">Inject Archive</button><button type="button" onClick={onCancel} className="w-full opacity-30 uppercase font-black text-xs mt-2 text-center">Abort</button></form></div></div>
  );
};

const ReadingDrawer = ({ activeBook, onSave, onCancel }) => {
  const startPage = Number(activeBook?.currentPage) || 1;
  const totalPages = Number(activeBook?.totalPages) || 400;
  const [session, setSession] = useState({ endPage: '', startTime: '09:00', endTime: '10:00', emotion: 'Wonder', intensity: 3, sessionCries: 0, conclusion: '' });
  const isFinished = Number(session.endPage) >= totalPages;
  const calculateMinutes = () => { const [startH, startM] = session.startTime.split(':').map(Number); const [endH, endM] = session.endTime.split(':').map(Number); let diff = (endH * 60 + endM) - (startH * 60 + startM); return diff < 0 ? diff + 1440 : diff; };
  const handleSubmit = (e) => { e.preventDefault(); const minutes = calculateMinutes(); if (!session.endPage || !activeBook || minutes <= 0) return; onSave({ ...session, startPage, endPage: Number(session.endPage), minutes, isFinished }); };
  return (
    <div className="fixed inset-0 bg-black/60 z-[200] p-6 flex items-end justify-center text-left"><div className="bg-[#FDFCF0] border-[5px] border-black rounded-[40px] p-8 w-full max-w-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-y-auto max-h-[95vh]"><header className="flex justify-between mb-8"><div><h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none font-black text-left">Log Session</h2><p className="font-['Londrina_Solid'] text-lg opacity-40 uppercase truncate font-bold text-left">{String(activeBook?.title)}</p></div><button onClick={onCancel} className="text-2xl font-black">✕</button></header><form onSubmit={handleSubmit} className="space-y-5 text-left"><div className="grid grid-cols-2 gap-4"><div className="bg-slate-100 border-4 border-black/10 p-3 rounded-2xl opacity-60"><label className="text-[10px] font-black block uppercase">Start Page</label><div className="font-['Londrina_Solid'] text-2xl">{Number(startPage)}</div></div><div className={`bg-white border-4 p-3 rounded-2xl transition-all ${isFinished ? 'border-green-500 shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]' : 'border-black'}`}><label className="text-[10px] font-black block uppercase">End Page</label><input required type="number" className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none font-black" value={session.endPage} onChange={e=>setSession({...session, endPage: e.target.value})} /></div></div><div className="bg-white border-4 border-black p-3 rounded-2xl flex items-center justify-between"><label className="text-[10px] font-black uppercase opacity-40">Cries this session?</label><div className="flex items-center gap-3"><button type="button" onClick={()=>setSession(p=>({...p, sessionCries: Math.max(0, p.sessionCries-1)}))} className="w-6 h-6 border-2 border-black rounded-full font-black">-</button><span className="font-['Londrina_Solid'] text-xl font-black">{session.sessionCries}</span><button type="button" onClick={()=>setSession(p=>({...p, sessionCries: p.sessionCries+1}))} className="w-6 h-6 border-2 border-black rounded-full font-black">+</button></div></div><div className="bg-white border-4 border-black p-4 rounded-2xl"><label className="text-[10px] font-black opacity-30 uppercase block mb-1">Emotion Intensity (1-5)</label><input type="range" min="1" max="5" step="1" className="w-full accent-black" value={session.intensity} onChange={e=>setSession({...session, intensity: e.target.value})} /></div><div className="flex flex-wrap gap-1">{Object.keys(palette).slice(0, 7).map(emo => (<button key={emo} type="button" onClick={() => setSession({...session, emotion: emo})} className={`px-2 py-1 border-2 border-black rounded-lg text-[7px] font-black uppercase transition-all ${session.emotion === emo ? 'bg-black text-white scale-105' : 'bg-white opacity-40'}`}>{emo}</button>))}</div><button type="submit" className="w-full bg-black text-white p-5 rounded-3xl font-['Londrina_Solid'] text-2xl uppercase font-black shadow-[6px_6px_0px_0px_rgba(100,100,100,1)] active:translate-y-1">Save Observation</button></form></div></div>
  );
};