"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, updateDoc, onSnapshot, serverTimestamp, arrayUnion } from 'firebase/firestore';

// LOCAL IMPORTS (Ensure files are in the same folder)
import ReadingLab from './ReadingLab';
import LoveLab from './LoveLab';

// ==========================================
// 1. CONFIG
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
const platformAppId = "reading_lab_v1"; 

const palette = {
  Wonder: '#9370DB', Angst: '#4169E1', Smut: '#FF1493',
  Joy: '#FFD700', Grief: '#4B0082', Boredom: '#D3D3D3', Fear: '#2F4F4F',
  Outbound: '#D3D3D3', Lead: '#AEC6CF', Active: '#FFD1DC', DNF: '#FFB347'
};
const genres = ["Fantasy", "Sci-Fi", "Literary", "Non-Fiction", "Romance", "Thriller", "Horror", "Memoir", "Poetry"];

// Helper Icons
const SettingsIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
const SparklesIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);

// ==========================================
// 2. MAIN APP DRIVER
// ==========================================

export default function App() {
  const [hasMounted, setHasMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [appState, setAppState] = useState('garden'); 
  const [libraryMode, setLibraryMode] = useState('library');
  const [books, setBooks] = useState([]);
  const [datingSubjects, setDatingSubjects] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [activeTab, setActiveTab] = useState('review');
  const [isLogging, setIsLogging] = useState(false);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [focusedSubjectId, setFocusedSubjectId] = useState(null);

  const [activeSpecimens, setActiveSpecimens] = useState([
    { id: 1, codename: "Alpha", active: true }, { id: 2, codename: "Beta", active: true },
    { id: 3, codename: "Gamma", active: true }, { id: 4, codename: "Delta", active: true },
    { id: 5, codename: null }, { id: 6, codename: null },
    { id: 7, codename: null }, { id: 8, codename: null }
  ]);
  const [fallingSpecimen, setFallingSpecimen] = useState(null);
  const [sedimentPile, setSedimentPile] = useState([]);

  // Battle Logic
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
    const bSub = onSnapshot(collection(db, 'artifacts', platformAppId, 'public', 'data', 'books'), (snap) => setBooks(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const dSub = onSnapshot(collection(db, 'artifacts', platformAppId, 'public', 'data', 'subjects'), (snap) => setDatingSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
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

  // Shared Actions
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

  const handleStartReading = async (book) => {
    if (!user || !book) return;
    await updateDoc(doc(db, 'artifacts', platformAppId, 'public', 'data', 'books', book.id), { status: 'READING' });
    setFocusedSubjectId(book.id);
    setAppState('manage'); setFinalWinner(null); setCurrentChamp(null);
  };

  const handleSaveSession = async (sessionData) => {
    if (!user || !focusedSubjectId) return;
    const pagesRead = Number(sessionData.endPage) - Number(sessionData.startPage);
    await updateDoc(doc(db, 'artifacts', platformAppId, 'public', 'data', 'books', focusedSubjectId), {
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
    <div className="min-h-screen bg-[#FDFCF0] font-sans text-black overflow-x-hidden text-left">
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
      ` }} />

      <div className="p-6 pb-28 text-black">
        {/* SHARED DASHBOARD */}
        {appState === 'garden' && (
          <div className="max-w-md mx-auto pt-10 animate-in fade-in duration-500">
            <header className="mb-10 text-left">
              <div className="inline-block bg-white border-[3px] border-black px-3 py-1 rounded-full mb-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black">
                <p className="font-['Londrina_Solid'] text-xs uppercase tracking-widest text-black">Verified Researcher: {String(user?.uid?.substring(0, 8))}</p>
              </div>
              <h1 className="font-['Londrina_Solid'] text-7xl uppercase leading-none font-black text-black">Pattern HQ</h1>
            </header>
            <div className="grid grid-cols-2 gap-5">
                <button onClick={() => setAppState('manage')} className="bg-[#AEC6CF] h-[155px] border-[5px] border-black rounded-[45px] p-5 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between active:translate-y-1 transition-all text-black">
                  <span className="font-['Londrina_Solid'] text-2xl uppercase font-bold">Reading</span>
                  <div className="text-4xl font-['Londrina_Solid']">{Number(books.length)}</div>
                </button>
                <button onClick={() => setAppState('dating_hub')} className="bg-[#FFD1DC] h-[155px] border-[5px] border-black rounded-[45px] p-5 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between active:translate-y-1 transition-all text-black">
                  <span className="font-['Londrina_Solid'] text-2xl uppercase font-bold">Dating</span>
                  <div className="text-4xl font-['Londrina_Solid'] text-right">{Number(peopleMetCount)}</div>
                </button>
            </div>
          </div>
        )}

        {/* MODULAR ROUTING */}
        {(appState === 'manage' || appState === 'library' || selectedBook) && (
          <ReadingLab 
            {...{appState, setAppState, books, user, db, platformAppId, palette, genres, 
                 focusedSubjectId, setFocusedSubjectId, setIsLogging, isLogging,
                 libraryMode, setLibraryMode, isAddingBook, setIsAddingBook,
                 handleStartReading, handleSaveSession, handleBattleChoice,
                 tbrPool, currentChamp, roundWinnerId, battleIdx, finalWinner,
                 selectedBook, setSelectedBook, activeTab, setActiveTab}}
          />
        )}

        {(appState === 'dating_hub' || appState === 'dating_bloom' || ['dating_garden', 'dating_lab', 'dating_playbook'].includes(appState)) && (
          <LoveLab 
            {...{appState, setAppState, emptySlots, activeSpecimens, sedimentPile, 
                 setIsAddingPerson, isAddingPerson, handleAddPerson, SettingsIcon, 
                 triggerSpecimenExpiration, fallingSpecimen, SparklesIcon}}
          />
        )}
      </div>
    </div>
  );
}