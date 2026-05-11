"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, updateDoc, onSnapshot, serverTimestamp, arrayUnion, addDoc } from 'firebase/firestore';// import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
// LOCAL IMPORTS (Ensure files are in the same folder)
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


const palette = {
  // --- Rudimentary Emotions ---
  Warmth: '#FFB347',   // Cozy
  Joy: '#FFD700',      // Happy
  Sad: '#AEC6CF',      // Crying
  Scared: '#2F4F4F',   // Spooky
  Fast: '#FF1493',     // Page-turner
  Funny: '#FDFD96',    // Laughing
  Angry: '#FF6961',    // Character-hate
  Cool: '#779ECB',     // "That was sick"
  Peace: '#9370DB',    // Calm
  Meh: '#D3D3D3',      // Bored/Simple

  // --- The Favorites/Status ---
  Smut: '#FF1493',     // Deep Pink
  Wonder: '#9370DB',
  Active: '#FFD1DC',
  DNF: '#FFB347'
};
const genres = ["Fantasy", "Sci-Fi", "Literary", "Non-Fiction", "Romance", "Thriller", "Horror", "Memoir", "Poetry"];

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


useEffect(() => { setHasMounted(true); }, []);

useEffect(() => {
  if (!hasMounted) return;
  const unsubscribe = onAuthStateChanged(auth, (u) => {
    // Only set the user if they are NOT anonymous
    if (u && !u.isAnonymous) {
      setUser(u);
    } else {
      setUser(null);
    }
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

  // --- 1. MEMOIZED DATA (Safe & Clean) ---
  const readingList = useMemo(() => books.filter(b => b.status === 'READING'), [books]);
  const tbrPool = useMemo(() => books.filter(b => b.status === 'TBR'), [books]);

  // const myTbrPool = useMemo(() => myBooks.filter(b => b.status === 'TBR'), [myBooks]);

  // const peopleMetCount = useMemo(() => 
  //   datingSubjects.length + sedimentPile.length, 
  //   [datingSubjects, sedimentPile]
  // );
  const peopleMetCount = useMemo(() =>
    datingSubjects.length,
    [datingSubjects]
  );
  const emptySlots = useMemo(() =>
    activeSpecimens.filter(s => !s.codename).length,
    [activeSpecimens]
  );

  if (!hasMounted) {
  return <div className="h-screen bg-[#FDFCF0]" />; // Stay on blank paper while mounting
}
  // --- ADD THE GATE HERE ---
  if (!user) {
    return <AuthGate />;
  }

  // --- 3. BATTLE LOGIC ---
  React.useEffect(() => {
    if (appState === 'library' && libraryMode === 'battle' && !finalWinner && tbrPool.length > 1) {
      if (!currentChamp) {
        setCurrentChamp(tbrPool[0]);
        setBattleIdx(1);
      }
    }
  }, [appState, libraryMode, finalWinner, tbrPool, currentChamp]);

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

            <div className="grid grid-cols-2 gap-5">
              {/* TOP ROW: Reading and Dating */}
              <button onClick={() => setAppState('manage')} className="bg-[#AEC6CF] h-[155px] border-[5px] border-black rounded-[45px] p-5 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between active:translate-y-1 transition-all text-black">
                <span className="font-['Londrina_Solid'] text-2xl uppercase font-bold">Reading</span>
                <div className="text-4xl font-['Londrina_Solid']">{books.filter(b => b.ownerId === user?.uid).length}</div>
              </button>

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
              handleSaveSession,
              tbrPool, currentChamp, roundWinnerId, battleIdx, finalWinner,
              selectedBook, setSelectedBook, activeTab, setActiveTab
            }}
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