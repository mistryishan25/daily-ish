"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, linkWithPopup, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, updateDoc, onSnapshot, serverTimestamp, arrayUnion, addDoc, setDoc, getDocs } from 'firebase/firestore';// LOCAL IMPORTS (Ensure files are in the same folder)
import ReadingLab from './ReadingLab';
import LoveLab from './LoveLab';
import QuestLog from './QuestLog';
import AuthGate from '../components/AuthGate';
import EnduranceLab from './EnduranceLab';

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

// 📍 Around Line 35 in app/page.jsx
const palette = {
  // --- HIGHLIGHTED EMOTIONS (Updated for high contrast) ---
  Warmth: '#FF7F00',     // Deep Cozy Amber / Warm Orange
  Peace: '#8A2BE2',      // Deep Royal Violet / Calm Purple
  Funny: '#CCFF00',      // Electric Lime / Laughing Yellow-Green
  Fast: '#FF007F',       // Neon Racing Pink / High-Energy Magenta
  Sad: '#1E3A8A',        // Deep Slate Marine Blue (Crisp & Dark)

  // --- 27 EXTENDED EMOTIONAL STRATA ---
  Admiration: '#00D2FF',   // Bright Cyan
  Adoration: '#FF69B4',    // Hot Pink
  Appreciation: '#10B981', // Emerald Green
  Amusement: '#F59E0B',    // Bright Amber
  Anger: '#EF4444',        // Pure Red
  Anxiety: '#6B7280',      // Cool Gray
  Awe: '#7C3AED',          // Violet Indigo
  Awkwardness: '#D97706',  // Ochre / Copper
  Boredom: '#475569',      // Dark Slate
  Calmness: '#06B6D4',     // Cyan Blue
  Confusion: '#A855F7',    // Lavender Purple
  Craving: '#F97316',      // Bright Orange
  Disgust: '#4D7C0F',      // Forest Olive Green
  Empathy: '#14B8A6',      // Teal
  Entrancement: '#312E81', // Midnight Dark Violet
  Excitement: '#EC4899',   // Electric Pink
  Fear: '#1F2937',         // Charcoal Almost-Black
  Horror: '#881337',       // Deep Crimson Burgundy
  Interest: '#0284C7',     // Sky Blue
  Joy: '#FACC15',          // Canary Yellow
  Nostalgia: '#B45309',    // Cinnamon Brown
  Relief: '#34D399',       // Mint Green
  Romance: '#F472B6',      // Soft Coral Pink
  Sadness: '#2563EB',       // Cobalt Royal Blue
  Satisfaction: '#059669', // Dark Emerald
  Desire: '#DC2626',       // Vivid Crimson
  Surprise: '#E11D48',     // Magenta Rose

  // Fallbacks & Status Colors
  Cool: '#3B82F6',
  Meh: '#9CA3AF',
  Smut: '#FF1493',
  Wonder: '#8B5CF6',
  Active: '#FFD1DC',
  DNF: '#F59E0B'
};

const genres = ["Fantasy", "Sci-Fi", "Literary","Humor","Fiction", "History", "Non-Fiction", "Romance", "Thriller", "Horror", "Memoir", "Poetry"];

// Helper Icons
const SettingsIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
);
const SparklesIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
);

const BellIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const TicketIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" /></svg>
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
  const [quests, setQuests] = useState([]);
  const [triathlonLogs, setTriathlonLogs] = useState([]);
  const [isControlRoomOpen, setIsControlRoomOpen] = useState(false);
  const [featureRequests, setFeatureRequests] = useState([]);
  const [systemUpdates, setSystemUpdates] = useState([]);
  const [isAddingInteraction, setIsAddingInteraction] = useState(false);
  const [interactions, setInteractions] = useState([]);
  const [specimens, setSpecimens] = useState([]); // Adding this to match your new LoveLab schema
  const ADMIN_UID = "6Zs8Wndk6pdTGsPmHrWcBsTbAqG2"; // Copy from the "Verified Researcher" label on your screen

  const [activeSpecimens, setActiveSpecimens] = useState([
    { id: 1, codename: null, active: false }, { id: 2, codename: null, active: false },
    { id: 3, codename: null, active: true }, { id: 4, codename: null, active: false },
    { id: 5, codename: null, active: false }, { id: 6, codename: null, active: false },
    { id: 7, codename: null, active: false }, { id: 8, codename: null, active: false }
  ]);
  const [fallingSpecimen, setFallingSpecimen] = useState(null);
  const [sedimentPile, setSedimentPile] = useState([]);

  // Battle Logic
  const [celebrating, setCelebrating] = useState(false);
  const [roundWinnerId, setRoundWinnerId] = useState(null);
  const [battleIdx, setBattleIdx] = useState(0);
  const [currentChamp, setCurrentChamp] = useState(null);
  const [finalWinner, setFinalWinner] = useState(null);


  const activeSpecimensFiltered = specimens.filter(s => s.status === 'active');

  // =========================================================
  // 2. ALL useEffect HOOKS (Auth & Database Listeners)
  // =========================================================

  useEffect(() => { setHasMounted(true); }, []);

  useEffect(() => {
    if (!hasMounted) return;

    // Pure Google Auth Listener
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u); // Sets user if logged in with Google, otherwise sets null
    });

    return () => unsubscribe();
  }, [hasMounted]);

  useEffect(() => {
    // This is the "Hard Guard"
    if (!user || !user.uid) return;

    // 1. POINT TO YOUR PRIVATE PATH (Fixes seeing other people's books)
    const privateBooksRef = collection(db, 'users', user.uid, 'labs', 'reading_lab', 'books');

    // 2. Updated Books Listener
    const bSub = onSnapshot(privateBooksRef, (snap) => {
      setBooks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Existing Listeners (We can move these to private later if needed)
    const dSub = onSnapshot(collection(db, 'artifacts', platformAppId, 'public', 'data', 'subjects'), (snap) => setDatingSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const tSub = onSnapshot(collection(db, 'artifacts', platformAppId, 'public', 'data', 'triathlon_logs'), (snap) => {
      setTriathlonLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(l => l.ownerId === user?.uid));
    });

    // Listen for Shared Feature Requests
    const fSub = onSnapshot(collection(db, 'artifacts', platformAppId, 'public', 'data', 'featureRequests'), (snap) => {
      setFeatureRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Listen for Shared System Updates
    const uSub = onSnapshot(collection(db, 'artifacts', platformAppId, 'public', 'data', 'systemUpdates'), (snap) => {
      setSystemUpdates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // --- Listener for Specimens (People) ---
    const sRef = collection(db, 'users', user.uid, 'labs', 'lovelab', 'specimens');
    const unsubS = onSnapshot(sRef, (snap) => {
      setSpecimens(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // --- Listener for Interactions (Pulses/Logs) ---
    const iRef = collection(db, 'users', user.uid, 'labs', 'lovelab', 'interactions');
    const unsubI = onSnapshot(iRef, (snap) => {
      setInteractions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Interaction fetch error:", err));

    return () => { bSub(); dSub(); tSub(); fSub(); uSub(); unsubS(); unsubI(); };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // This matches the private path we set in QuestLog.jsx
    const questCol = collection(db, 'users', user.uid, 'labs', 'quest_lab', 'quests');

    const unsubscribe = onSnapshot(questCol, (snapshot) => {
      const qData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuests(qData);
    }, (err) => {
      console.error("Quest sync error:", err);
    });

    return () => unsubscribe();
  }, [user]);


  // =========================================================
  // 3. MEMOIZED DATA (MUST BE DEFINED BEFORE BATTLE LOGIC!)
  // =========================================================

  const readingList = useMemo(() => books.filter(b => b.status === 'READING'), [books]);
  const tbrPool = useMemo(() => books.filter(b => b.status === 'TBR'), [books]);
  const peopleMetCount = useMemo(() => datingSubjects.length, [datingSubjects]);
  const emptySlots = useMemo(() => activeSpecimens.filter(s => !s.codename).length, [activeSpecimens]);



  // =========================================================
  // 4. BATTLE LOGIC useEffect (NOW SAFE TO USE tbrPool!)
  // =========================================================

  React.useEffect(() => {
    if (appState === 'library' && libraryMode === 'battle' && !finalWinner && tbrPool.length > 1) {
      if (!currentChamp) {
        setCurrentChamp(tbrPool[0]);
        setBattleIdx(1);
      }
    }
  }, [appState, libraryMode, finalWinner, tbrPool, currentChamp]);

  // =========================================================
  // 5. HELPER FUNCTIONS & HANDLERS
  // =========================================================

  // Pure Google Sign-In
  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Google Auth error:", error);
    }
  };

  // --- ONE-TIME MIGRATION HANDLER ---
  const handleMigrateOldData = async () => {
    // 1. EXACT OLD USER DOCUMENT ID FROM FIRESTORE
    const OLD_USER_ID = "M7JlpBtDYfXbMN1niJiMePPraCw2";
    const NEW_USER_ID = "2RuyY0rf6AbM2phvo8Spq0AOk6u1";

    if (!NEW_USER_ID) {
      alert("Please log in with Google first!");
      return;
    }


    console.log(`Starting migration from ${OLD_USER_ID} -> ${NEW_USER_ID}...`);

    try {
      // 2. EXPLICITLY CREATE TOP-LEVEL USER DOCUMENT
      const oldUserDocRef = doc(db, 'users', OLD_USER_ID);
      const oldUserSnap = await getDoc(oldUserDocRef);

      const newUserDocRef = doc(db, 'users', NEW_USER_ID);
      if (oldUserSnap.exists()) {
        await setDoc(newUserDocRef, oldUserSnap.data(), { merge: true });
      } else {
        // If the old parent doc didn't have top-level fields, create a basic user record
        await setDoc(newUserDocRef, {
          email: user.email || "",
          uid: NEW_USER_ID,
          createdAt: Date.now()
        }, { merge: true });
      }

      // 3. COPY ALL SUBCOLLECTIONS
      const subcollections = [
        { lab: 'reading_lab', col: 'books' },
        { lab: 'lovelab', col: 'specimens' },
        { lab: 'lovelab', col: 'interactions' },
        { lab: 'quest_lab', col: 'quests' }
      ];

      let totalMigrated = 0;

      for (const item of subcollections) {
        const oldColRef = collection(db, 'users', OLD_USER_ID, 'labs', item.lab, item.col);
        const snapshot = await getDocs(oldColRef);

        console.log(`Found ${snapshot.docs.length} docs in ${item.lab}/${item.col}`);

        for (const document of snapshot.docs) {
          const newDocRef = doc(db, 'users', NEW_USER_ID, 'labs', item.lab, item.col, document.id);
          await setDoc(newDocRef, document.data());
          totalMigrated++;
        }
      }

      alert(`Migration finished! Successfully moved ${totalMigrated} items to your Google profile.`);
      window.location.reload();

    } catch (err) {
      console.error("Migration failed with error:", err);
      alert(`Migration error: ${err.message}`);
    }
  };

  const handleBattleChoice = (winner) => {
    if (!winner) return;
    setRoundWinnerId(winner.id);
    setTimeout(() => {
      setRoundWinnerId(null);
      if (battleIdx >= tbrPool.length - 1) {
        setFinalWinner(winner);
      } else {
        setCurrentChamp(winner);
        setBattleIdx(prev => prev + 1);
      }
    }, 800);
  };

  const handleSaveSession = async (sessionData) => {
    if (!user?.uid || !focusedSubjectId) return;
    const pagesRead = Number(sessionData.endPage) - Number(sessionData.startPage);
    await updateDoc(doc(db, 'users', user.uid, 'labs', 'reading_lab', 'books', focusedSubjectId), {
      status: sessionData.isFinished ? 'FINISHED' : 'READING',
      currentPage: Number(sessionData.endPage),
      sessionStartedAt: null,
      sessions: arrayUnion({
        emotions: sessionData.emotions,
        intensities: sessionData.intensities,
        minutes: Number(sessionData.minutes),
        pagesRead: Number(pagesRead),
        date: new Date().toISOString(),
        mode: sessionData.mode
      }),
      review: sessionData.isFinished ? String(sessionData.conclusion) : ''
    });
    setIsLogging(false);
  };

  const handleStartSession = async (bookId) => {
    if (!user?.uid) return;
    const bookRef = doc(db, 'users', user.uid, 'labs', 'reading_lab', 'books', bookId);
    await updateDoc(bookRef, { sessionStartedAt: serverTimestamp() });
  };

  const handleCancelSession = async (e, bookId) => {
    if (!user?.uid) return;
    e.stopPropagation();
    const bookRef = doc(db, 'users', user.uid, 'labs', 'reading_lab', 'books', bookId);
    await updateDoc(bookRef, { sessionStartedAt: null });
  };

const handleAddBook = async (bookData) => {
    if (!user?.uid) return;
    try {
      const booksColRef = collection(db, 'users', user.uid, 'labs', 'reading_lab', 'books');
      await addDoc(booksColRef, {
        title: bookData.title,
        author: bookData.author || '',
        genre: bookData.genre || 'Fantasy',
        totalPages: Number(bookData.totalPages) || 0,
        currentPage: 0,
        status: bookData.status || 'TBR', // 'READING', 'TBR', 'FINISHED'
        coverUrl: bookData.coverUrl || '',
        createdAt: Date.now(),
        ownerId: user.uid,
        sessions: []
      });
      setIsAddingBook(false);
    } catch (err) {
      console.error("Error adding book:", err);
      alert(`Failed to add book: ${err.message}`);
    }
  };

  // --- SECTION: Love Lab Handlers (Add to page.jsx) ---
  const handleAddPerson = async (data) => {
    if (!user?.uid) return;
    try {
      const colRef = collection(db, 'users', user.uid, 'labs', 'lovelab', 'specimens');
      await addDoc(colRef, {
        ...data,
        status: 'active',
        createdAt: Date.now(),
        logDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
      });
      setIsAddingPerson(false);
    } catch (err) { console.error("Error adding specimen:", err); }
  };

  const triggerSpecimenExpiration = async (s) => {
    if (!user?.uid) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'labs', 'lovelab', 'specimens', s.id);
      await updateDoc(docRef, { status: 'expired' });
    } catch (err) { console.error("Error updating status:", err); }
  };

  const handleRecordInteraction = async (data) => {
    if (!user?.uid) return;
    try {
      const colRef = collection(db, 'users', user.uid, 'labs', 'lovelab', 'interactions');
      await addDoc(colRef, { ...data, timestamp: Date.now() });
      setIsAddingInteraction(false);
    } catch (err) { console.error("Error logging pulse:", err); }
  };

  const submitFeatureRequest = async (data) => {
    if (!user?.uid) return;
    await addDoc(collection(db, 'artifacts', platformAppId, 'public', 'data', 'featureRequests'), {
      ...data,
      userId: user.uid,
      status: 'pending',
      createdAt: Date.now()
    });
  };

  const updateRequestStatus = async (id, status) => {
    if (!user?.uid || user.uid !== ADMIN_UID) return;
    await updateDoc(doc(db, 'artifacts', platformAppId, 'public', 'data', 'featureRequests', id), { status });
  };

  // Locate this in your page.jsx functions
  const handleCompleteRequest = async (req) => {
    if (!user?.uid || user.uid !== ADMIN_UID) return;

    try {
      const requestRef = doc(db, 'artifacts', platformAppId, 'public', 'data', 'featureRequests', req.id);

      // We update the existing doc. 
      // completedAt must be a number (Date.now()) for sorting.
      await updateDoc(requestRef, {
        status: 'done',
        completedAt: Date.now()
      });

      return true;
    } catch (e) {
      console.error("Broadcast failed:", e);
    }
  };

  // =========================================================
  // 6. GUARDS & EARLY RETURNS (AFTER ALL HOOKS & FUNCTIONS!)
  // =========================================================

  if (!hasMounted) {
    return <div className="h-screen bg-[#FDFCF0]" />;
  }

  if (!user) {
    return <AuthGate />;
  }

  // --- 4. MASTER AUTH GUARD ---
  // Place this right here, after all hooks and handlers
  if (!user) {
    return (
      <div className="h-screen w-full bg-[#FDFCF0] flex items-center justify-center font-sans">
        <div className="text-center animate-pulse">
          <div className="w-12 h-12 border-4 border-black border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-['Londrina_Solid'] text-2xl uppercase font-black opacity-40">Synchronizing Labs...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-[#FDFCF0] font-sans text-black overflow-x-hidden text-left">
      <style dangerouslySetInnerHTML={{
        __html: `
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
            <header className="mb-10 flex justify-between items-start">
              <div className="text-left">
                <div className="inline-block bg-white border-[3px] border-black px-3 py-1 rounded-full mb-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black">
                  <p className="font-['Londrina_Solid'] text-xs uppercase tracking-widest text-black">
                    Verified Researcher: {user ? String(user.uid.substring(0, 8)) : "Loading..."}                  </p>
                </div>
                <h1 className="font-['Londrina_Solid'] text-7xl uppercase leading-none font-black text-black">Pattern HQ</h1>
              </div>

              <button
                onClick={() => setIsControlRoomOpen(true)}
                className="mt-2 relative w-14 h-14 flex items-center justify-center border-[4px] border-black rounded-2xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all"
              >
                <BellIcon size={28} className="text-black" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-black rounded-full" />
              </button>
            </header>

            {/* SIGN OUT BUTTON */}
            {user && (
              <div className="mb-6 flex items-center justify-between bg-white border-[3px] border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-left truncate mr-2">
                  <p className="text-[10px] font-black uppercase opacity-40 leading-none">Logged In As</p>
                  <p className="text-sm font-black truncate text-black">{user.email || user.displayName || "Google Account"}</p>
                </div>

                <button
                  onClick={() => auth.signOut()}
                  className="shrink-0 bg-rose-500 text-white border-2 border-black px-4 py-1.5 rounded-xl font-['Londrina_Solid'] text-sm uppercase font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
                >
                  Sign Out
                </button>
              </div>
            )}

            {/* TEMPORARY MIGRATION BUTTON */}
            <button
      onClick={handleMigrateOldData}
      className="w-full mb-6 bg-amber-400 text-black border-[3px] border-black py-3 px-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm font-['Londrina_Solid'] uppercase font-black active:translate-y-0.5 transition-all"
    >
      ⚡ Migrate Old Data to This Google Account
    </button>

            {/* LINK GOOGLE ACCOUNT BUTTON} */}
            {user?.isAnonymous && (
              <button
                onClick={handleGoogleAuth}
                className="w-full mb-6 flex items-center justify-center gap-3 bg-white border-[3px] border-black py-3 px-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm font-['Londrina_Solid'] uppercase font-black active:translate-y-0.5 active:shadow-none transition-all text-black"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Link Google Account</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-5">
              {/* TOP ROW: Reading and Dating */}
              <button onClick={() => setAppState('manage')} className="bg-[#AEC6CF] h-[155px] border-[5px] border-black rounded-[45px] p-5 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between active:translate-y-1 transition-all text-black">
                <span className="font-['Londrina_Solid'] text-2xl uppercase font-bold">Reading</span>
                <div className="text-4xl font-['Londrina_Solid']">
                  {books.length}
                </div>              </button>

              <button onClick={() => setAppState('dating_hub')} className="bg-[#FFD1DC] h-[155px] border-[5px] border-black rounded-[45px] p-5 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between active:translate-y-1 transition-all text-black">
                <span className="font-['Londrina_Solid'] text-2xl uppercase font-bold">Dating</span>
                <div className="text-4xl font-['Londrina_Solid'] text-right">{Number(peopleMetCount)}</div>
              </button>
              <button onClick={() => setAppState('triathlon_lab')} className="bg-[#E2F0CB] h-[155px] border-[5px] border-black rounded-[45px] p-5 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between active:translate-y-1 transition-all">
                <span className="font-['Londrina_Solid'] text-2xl uppercase font-bold">Endurance</span>
                <div className="text-4xl font-['Londrina_Solid']">{triathlonLogs.length} Trials</div>
              </button>
              {/* BOTTOM ROW: Quest Log (No fixed height, grows naturally) */}
              <div className="col-span-2 mt-2">
                <QuestLog
                  quests={quests}
                  user={user}
                  db={db}
                  platformAppId={platformAppId}
                />
              </div>
            </div>
          </div>
        )}
        {/* MODULAR ROUTING */}
        {(appState === 'manage' || appState === 'library' || selectedBook) && (
          <ReadingLab
            {...{
              appState, setAppState, books, user, db, platformAppId, palette, genres,
              focusedSubjectId, setFocusedSubjectId, setIsLogging, isLogging,
              libraryMode, setLibraryMode, isAddingBook, setIsAddingBook,
              handleSaveSession,handleAddBook,
              tbrPool, currentChamp, roundWinnerId, battleIdx, finalWinner,
              selectedBook, setSelectedBook, activeTab, setActiveTab
            }}
          />
        )}

        {/* ENDURANCE LAB VIEW */}
{appState === 'endurance_lab' && (
  <EnduranceLab
    user={user}
    db={db}
    appState={appState}
    setAppState={setAppState}
    triathlonLogs={triathlonLogs}
  />
)}

        {(appState === 'dating_hub' || appState === 'dating_bloom' || ['dating_garden', 'dating_lab', 'dating_playbook'].includes(appState)) && (
          <LoveLab
            {...{
              appState, setAppState, emptySlots,
              activeSpecimens: activeSpecimensFiltered, // Use the filtered list
              sedimentPile,
              setIsAddingPerson, isAddingPerson,
              handleAddPerson,
              SettingsIcon, SparklesIcon,
              triggerSpecimenExpiration,
              handleRecordInteraction,
              isAddingInteraction,
              setIsAddingInteraction,
              interactions,            // This fixed the error!
              likedSubjects: specimens // Pass all specimens for the Archive/Bloom view
            }}
          />
        )}
        {isControlRoomOpen && (
          <ControlRoomModal
            user={user}
            requests={featureRequests}
            updates={[
              ...systemUpdates, // Manual broadcasts
              ...featureRequests
                .filter(r => r.status === 'done') // Only items you marked 'DONE'
                .map(r => ({
                  id: r.id,
                  title: `Deployed: ${r.lab}`,
                  description: r.description,
                  date: r.completedAt || 0, // Must match the name 'date' for sorting
                  version: 'Field Patch'
                }))
            ].sort((a, b) => b.date - a.date)} // Newest at the top
            isAdmin={user?.uid === ADMIN_UID}
            onSave={submitFeatureRequest}
            onApprove={updateRequestStatus}
            onComplete={handleCompleteRequest}
            onCancel={() => setIsControlRoomOpen(false)}
          />
        )}



      </div>
    </div>
  );
}

// ==========================================
// 🛠️ CONTROL ROOM MODAL COMPONENT
// ==========================================

const ControlRoomModal = ({
  user,
  requests = [],
  updates = [],
  onSave,
  onApprove,
  onComplete,
  onCancel,
  isAdmin
}) => {
  const [tab, setTab] = useState('updates'); // 'updates' or 'request'
  const [priority, setPriority] = useState(3);
  const [completingId, setCompletingId] = useState(null);

  const handleDoneClick = async (req) => {
    if (!onComplete) return;
    setCompletingId(req.id);
    try {
      await onComplete(req);
    } catch (err) {
      console.error("Action failed", err);
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[500] flex items-center justify-center p-4 font-sans text-left" onClick={onCancel}>
      <div
        className="bg-[#FDFCF0] border-[6px] border-black rounded-[40px] md:rounded-[50px] w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] text-black relative"
        onClick={e => e.stopPropagation()}
      >
        {/* MOBILE-FRIENDLY CLOSE BUTTON */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 md:top-8 md:right-8 w-10 h-10 flex items-center justify-center text-3xl font-black bg-black text-white rounded-full md:bg-transparent md:text-black md:opacity-20 md:hover:opacity-100 transition-all z-[60]"
          aria-label="Close"
        >
          ✕
        </button>

        <header className="p-6 md:p-8 border-b-4 border-black/5 text-left">
          <h2 className="font-['Londrina_Solid'] text-4xl md:text-5xl uppercase font-black leading-none mb-6 pr-12 text-black">Control Room</h2>

          {/* NAVIGATION TABS */}
          <div className="flex bg-black/5 p-1 rounded-[25px] border-2 border-black/10">
            <button
              onClick={() => setTab('updates')}
              className={`flex-1 py-3 rounded-[20px] font-['Londrina_Solid'] uppercase text-lg transition-all duration-200 ${tab === 'updates' ? 'bg-black text-white shadow-lg' : 'text-black opacity-40 hover:opacity-100'
                }`}
            >
              Status
            </button>
            <button
              onClick={() => setTab('request')}
              className={`flex-1 py-3 rounded-[20px] font-['Londrina_Solid'] uppercase text-lg transition-all duration-200 ${tab === 'request' ? 'bg-black text-white shadow-lg' : 'text-black opacity-40 hover:opacity-100'
                }`}
            >
              Submit Ticket
            </button>
          </div>
        </header>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 text-left scroll-smooth">
          {tab === 'updates' ? (
            <div className="space-y-12">

              {/* --- SECTION: ControlRoomModal Status Tab Content --- */}
              <div className="space-y-12">


                {/* SECTION 2: APPROVED FIELD REQUESTS */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-1 flex-1 bg-black/5 rounded-full" />
                    <h3 className="font-['Londrina_Solid'] text-sm uppercase opacity-40 tracking-[0.2em] whitespace-nowrap text-green-600">Approved Field Requests</h3>
                    <div className="h-1 flex-1 bg-black/5 rounded-full" />
                  </div>
                  <div className="grid gap-4">
                    {requests && requests.filter(r => r.status === 'approved').length > 0 ? (
                      requests.filter(r => r.status === 'approved').map(req => (
                        <div key={req.id} className="bg-white border-[3px] border-black p-5 rounded-[30px] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 rounded-full bg-green-100 border-2 border-black flex items-center justify-center shrink-0">✅</div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="bg-black text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">{req.lab}</span>
                                <span className="text-[8px] font-black opacity-30 uppercase">Priority {req.priority}/5</span>
                              </div>
                              <p className="text-sm font-bold leading-tight text-black">"{req.description}"</p>
                            </div>
                          </div>

                          {/* ADMIN ONLY: DONE BUTTON */}
                          {isAdmin && (
                            <button
                              disabled={completingId === req.id}
                              onClick={() => handleDoneClick(req)}
                              className={`px-6 py-2 rounded-2xl border-2 border-black font-['Londrina_Solid'] text-xl uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all w-full md:w-auto ${completingId === req.id ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-500 text-white'
                                }`}
                            >
                              {completingId === req.id ? '...' : 'Done'}
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="border-4 border-dashed border-black/5 p-8 rounded-[40px] text-center opacity-20 uppercase font-['Londrina_Solid']">
                        No approved requests.
                      </div>
                    )}
                  </div>
                </section>

                {/* A: OFFICIAL SYSTEM LOGS (The big manual ones) */}
                <section>
                  <h3 className="font-['Londrina_Solid'] text-sm uppercase opacity-40 tracking-widest mb-6">Official Broadcasts</h3>
                  <div className="space-y-8">
                    {updates.map(upd => (
                      <div key={upd.id} className="relative pl-6 border-l-4 border-black">
                        <div className="absolute -left-[10px] top-0 w-4 h-4 bg-black rounded-full border-4 border-[#FDFCF0]" />
                        <span className="text-[10px] font-black opacity-30 uppercase">{upd.version} • {new Date(upd.date).toLocaleDateString()}</span>
                        <h4 className="font-['Londrina_Solid'] text-2xl uppercase font-black leading-tight mt-1">{upd.title}</h4>
                        <p className="text-sm opacity-70 mt-1">{upd.description}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* B: COMPLETED FIELD WORK (The ones marked 'done' in featureRequests) */}

              </div>


            </div>
          ) : (
            /* SECTION 3: SUBMIT TICKET TAB */
            <div className="space-y-8 pb-10">
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                if (onSave) {
                  onSave({ lab: fd.get('lab'), description: fd.get('desc'), priority });
                }
                setTab('updates');
              }} className="space-y-6 text-left">
                <div className="bg-white border-4 border-black p-4 rounded-3xl">
                  <label className="text-[9px] font-black uppercase opacity-40 block mb-2 text-black">Target Lab</label>
                  <select name="lab" className="w-full bg-transparent font-['Londrina_Solid'] text-2xl uppercase focus:outline-none cursor-pointer text-black">
                    <option>Reading Lab</option>
                    <option>Love Lab</option>
                    <option>Quest Lab</option>
                    <option>Core System</option>
                  </select>
                </div>

                <div className="bg-white border-4 border-black p-6 rounded-[40px]">
                  <div className="flex justify-between text-[10px] font-black uppercase mb-4 text-black">
                    <span>Priority Magnitude</span>
                    <span className="text-rose-500 font-black">{priority}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1" max="5"
                    value={priority}
                    onChange={e => setPriority(parseInt(e.target.value))}
                    className="w-full h-2 bg-black/10 rounded-full appearance-none accent-black cursor-pointer"
                  />
                </div>

                <div className="bg-white border-4 border-black p-4 rounded-3xl">
                  <label className="text-[10px] font-black uppercase opacity-40 block mb-2 text-black">Requirement Description</label>
                  <textarea
                    name="desc"
                    required
                    placeholder="What should we build?"
                    className="w-full bg-transparent text-sm h-32 focus:outline-none resize-none text-black"
                  />
                </div>

                <button type="submit" className="w-full bg-black text-white p-6 rounded-[35px] font-['Londrina_Solid'] text-3xl uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-1 transition-all font-black">
                  Submit Ticket
                </button>
              </form>

              {/* ADMIN APPROVAL QUEUE */}
              {isAdmin && (
                <div className="mt-12 pt-8 border-t-4 border-black/5">
                  <h3 className="font-['Londrina_Solid'] text-xl uppercase mb-4 opacity-40 text-black">Admin Approval Queue</h3>
                  <div className="space-y-4">
                    {requests && requests.filter(r => r.status === 'pending').length > 0 ? (
                      requests.filter(r => r.status === 'pending').map(req => (
                        <div key={req.id} className="bg-white border-2 border-black p-4 rounded-2xl flex justify-between items-center">
                          <div className="text-left">
                            <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-slate-100 rounded text-black">{req.lab}</span>
                            <p className="text-xs font-bold mt-1 text-black">"{req.description}"</p>
                          </div>
                          <button
                            onClick={() => onApprove && onApprove(req.id, 'approved')}
                            className="bg-green-500 text-white p-2 rounded-xl text-[10px] font-black uppercase border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
                          >
                            Approve
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-xs opacity-20 italic text-black">Queue clear.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};