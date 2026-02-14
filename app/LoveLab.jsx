import React, { useState, useMemo, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  deleteDoc
} from 'firebase/firestore';

/**
 * LoveLab.jsx 
 * Version 6.5: The "Total Restoration" Edition
 * - Restored: Playbook (Tactical Notes) and A/B Testing comparison cards.
 * - Unified Firestore Persistence with Lab-Centric Hierarchy.
 * - Features: Ranked Archetype Bubbles (1-3), w-12 App Toggles, 
 * and Conviction/Belief slider cards.
 */

// ==========================================
// 🔥 FIREBASE SETUP (Safety Checked)
// ==========================================
const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : {
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
const appId = typeof __app_id !== 'undefined' ? __app_id : 'love-lab-v6';

// ==========================================
// 🎨 INLINE SVG ICONS
// ==========================================
const Icon = ({ children, size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{children}</svg>
);
const HeartIcon = (p) => <Icon {...p}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></Icon>;
const TargetIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></Icon>;
const UserIcon = (p) => <Icon {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Icon>;
const SettingsIcon = (p) => <Icon {...p}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></Icon>;
const RefreshCcw = (p) => <Icon {...p}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></Icon>;
const MapPin = (p) => <Icon {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></Icon>;
const Brain = (p) => <Icon {...p}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54Z" /></Icon>;
const Zap = (p) => <Icon {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></Icon>;
const ActivityIcon = (p) => <Icon {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></Icon>;
const Sparkles = (p) => <Icon {...p}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4M3 5h4M19 17v4M17 19h4" /></Icon>;
const MessageCircle = (p) => <Icon {...p}><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></Icon>;
const BookOpen = (p) => <Icon {...p}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></Icon>;

// --- Constants ---
const RINGS = [
  { id: 'void', label: "The Void", radius: 0.95, color: '#94a3b8' },
  { id: 'talking', label: "Talking", radius: 0.65, color: '#3b82f6' },
  { id: 'dating', label: "Dating", radius: 0.4, color: '#ec4899' },
  { id: 'committed', label: "Committed", radius: 0.15, color: '#22c55e' }
];

const MARKOV_STATES = [
  { id: 'matched', label: 'Matched', category: 'Connection', weight: 5 },
  { id: 'texting', label: 'Bantering', category: 'Connection', weight: 3 },
  { id: 'call', label: 'Phone/Video Call', category: 'Bridge', weight: 10 },
  { id: 'date_proposed', label: 'Date Proposed', category: 'Bridge', weight: 8 },
  { id: 'date_confirmed', label: 'Date Confirmed', category: 'Bridge', weight: 12 },
  { id: 'date_1', label: 'Date 1 (Field Obs)', category: 'Observation', weight: 25 },
  { id: 'date_n', label: 'Repeat Date', category: 'Observation', weight: 20 },
  { id: 'entropy', label: 'Fade / Ghost', category: 'Decay', weight: -15 }
];

const ARCHETYPE_DEFINITIONS = {
  Wordsmith: "Focuses on verbal wit, depth of prompts, and conversational flow.",
  Visualist: "High aesthetic standards; values photography, art, and style.",
  Academic: "Values intellectual discourse, research, and lifelong learning.",
  Traveler: "Exploratory spirit; values cultural curiosity and mobility.",
  Enigma: "Mysterious or layered profile; high 'deciphering' interest.",
  Corporate: "High ambition; professional focus and organized lifestyle.",
  Outdoorsy: "Active and nature-oriented; values physical exploration.",
  Creative: "Non-traditional thinker; values artistic expression and novelty.",
  Simple : "Minimalist profile; values clarity, honesty, and straightforwardness."
};
const APPS = [
  { id: 'hinge', name: 'Hinge', icon: <img src="/hinge.svg" className="w-12 h-12 object-contain" />, color: '#6e44ff' },
  { id: 'bumble', name: 'Bumble', icon: '🐝', color: '#ffc800' },
  { id: 'tinder', name: 'Tinder', icon: '🔥', color: '#fe3c72' },
  { id: 'other', name: 'Other', icon: '?', color: '#334155' }
];

// ==========================================
// 🏢 MAIN APP WRAPPER (Persistent State)
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [appState, setAppState] = useState('dating_hub');
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [specimens, setSpecimens] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [isAddingInteraction, setIsAddingInteraction] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const customToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
        if (customToken) {
          await signInWithCustomToken(auth, customToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error("Auth failed", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => { if (u) setUser(u); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const sRef = collection(db, 'users', user.uid, 'labs', 'lovelab', 'specimens');
    const unsubS = onSnapshot(sRef, (snap) => {
      setSpecimens(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error(err));

    const iRef = collection(db, 'users', user.uid, 'labs', 'lovelab', 'interactions');
    const unsubI = onSnapshot(iRef, (snap) => {
      setInteractions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error(err));

    return () => { unsubS(); unsubI(); };
  }, [user]);

  const handleAddPerson = async (data) => {
    if (!user) return;
    try {
      const colRef = collection(db, 'users', user.uid, 'labs', 'lovelab', 'specimens');
      await addDoc(colRef, {
        ...data,
        status: 'pending',
        createdAt: Date.now(),
        logDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
      });
      setIsAddingPerson(false);
    } catch (err) { console.error("Error adding specimen:", err); }
  };

  const updateSpecimenStatus = async (id, status) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'labs', 'lovelab', 'specimens', id);
      await updateDoc(docRef, { status });
    } catch (err) { console.error("Error updating status:", err); }
  };

  const handleRecordInteraction = async (data) => {
    if (!user) return;
    try {
      if (data.type === 'matched') {
        const docRef = doc(db, 'users', user.uid, 'labs', 'lovelab', 'specimens', data.specimenId);
        await updateDoc(docRef, { status: 'active' });
      }
      setIsAddingInteraction(false);
    } catch (err) { console.error("Error logging pulse:", err); }
  };

  if (!user) {
    return (
      <div className="h-screen w-full bg-[#fdfcf0] flex items-center justify-center font-sans text-left">
        <div className="text-center animate-pulse text-left">
          <HeartIcon className="mx-auto mb-4 text-rose-500" size={48} />
          <p className="font-['Londrina_Solid'] text-2xl uppercase font-black opacity-40 text-left text-black">Initialising Database...</p>
        </div>
      </div>
    );
  }

  return (
    <LoveLab
      user={user}
      appState={appState} setAppState={setAppState}
      activeSpecimens={specimens.filter(s => s.status === 'active')}
      isAddingPerson={isAddingPerson} setIsAddingPerson={setIsAddingPerson}
      handleAddPerson={handleAddPerson}
      triggerSpecimenExpiration={(s) => updateSpecimenStatus(s.id, 'expired')}
      likedSubjects={specimens}
      isAddingInteraction={isAddingInteraction}
      setIsAddingInteraction={setIsAddingInteraction}
      handleRecordInteraction={handleRecordInteraction}
      interactions={interactions}
    />
  );
}

// ==========================================
// 🧪 LOVE LAB MAIN UI
// ==========================================
function LoveLab({
  user, appState, setAppState, activeSpecimens,
  setIsAddingPerson, isAddingPerson,
  isAddingInteraction, setIsAddingInteraction, // Add these
  handleAddPerson, handleRecordInteraction,    // Add this
  triggerSpecimenExpiration, likedSubjects, interactions // Add interactions
}) {
  const [selectedDate, setSelectedDate] = useState("TODAY");
  const [isDateActive, setIsDateActive] = useState(false);
  const [entropy, setEntropy] = useState(0.2);
  const [viewingSubject, setViewingSubject] = useState(null);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const particles = useRef([]);
  const requestRef = useRef();

  useEffect(() => {
    if (appState === 'dating_garden') {
      const currentIds = activeSpecimens.map(s => s.id);
      activeSpecimens.forEach(s => {
        const existing = particles.current.find(p => p.id === s.id);
        if (!existing) {
          particles.current.push({
            id: s.id, name: s.name, color: '#fb7185',
            dist: 280 + Math.random() * 40, angle: Math.random() * Math.PI * 2,
            heat: 0, radius: 12, x: 0, y: 0
          });
        }
      });
      particles.current = particles.current.filter(p => currentIds.includes(p.id));
    }
  }, [activeSpecimens, appState]);

  const updateSim = () => {
    const canvas = canvasRef.current;
    if (!canvas || appState !== 'dating_garden') return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width; const h = canvas.height;
    const center = { x: w / 2, y: h / 2 };
    const maxRadius = Math.min(w, h) * 0.42;

    ctx.fillStyle = '#fdfcf0';
    ctx.fillRect(0, 0, w, h);

    RINGS.forEach((ring) => {
      const r = ring.radius * maxRadius;
      ctx.strokeStyle = '#000000'; ctx.lineWidth = 2; ctx.globalAlpha = 0.05;
      ctx.setLineDash([5, 8]); ctx.beginPath(); ctx.arc(center.x, center.y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 0.1; ctx.fillStyle = '#000000'; ctx.font = '900 8px sans-serif';
      ctx.textAlign = 'center'; ctx.fillText(ring.label.toUpperCase(), center.x, center.y - r - 5); ctx.globalAlpha = 1.0;
    });

    particles.current.forEach(p => {
      p.dist += entropy * 1.5;
      if (p.heat > 0) { p.dist -= p.heat * 4; p.heat *= 0.94; }
      p.angle += 0.005;
      if (p.dist > maxRadius) p.dist = maxRadius;
      if (p.dist < 15) p.dist = 15;
      p.x = center.x + Math.cos(p.angle) * p.dist;
      p.y = center.y + Math.sin(p.angle) * p.dist;
    });

    for (let i = 0; i < particles.current.length; i++) {
      for (let j = i + 1; j < particles.current.length; j++) {
        const p1 = particles.current[i]; const p2 = particles.current[j];
        const dx = p2.x - p1.x; const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = p1.radius + p2.radius + 12;
        if (distance < minDistance) {
          p1.angle -= 0.01; p2.angle += 0.01;
          p1.dist -= (minDistance - distance) * 0.1;
          p2.dist += (minDistance - distance) * 0.1;
        }
      }
    }

    particles.current.forEach(p => {
      ctx.save(); ctx.translate(p.x, p.y);
      if (p.heat > 0.1) { ctx.shadowBlur = 15 * p.heat; ctx.shadowColor = '#fb7185'; }
      ctx.fillStyle = '#fb7185'; ctx.beginPath(); ctx.arc(0, 0, p.radius, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#000000'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(-4, -4, 3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#000000'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(p.name, p.x, p.y - 18);
    });
    requestRef.current = requestAnimationFrame(updateSim);
  };

  useEffect(() => {
    if (appState === 'dating_garden') {
      const handleResize = () => {
        if (containerRef.current && canvasRef.current) {
          canvasRef.current.width = containerRef.current.clientWidth;
          canvasRef.current.height = containerRef.current.clientHeight;
        }
      };
      handleResize(); window.addEventListener('resize', handleResize);
      requestRef.current = requestAnimationFrame(updateSim);
      return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(requestRef.current); };
    }
  }, [appState, entropy]);

  const dateTabs = useMemo(() => {
    return [...Array(6)].map((_, i) => {
      if (i === 0) return "TODAY";
      const d = new Date(); d.setDate(d.getDate() - i);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
    });
  }, []);

  const renderCurrentView = () => {
    // --- STATION: THE LAB (A/B) ---
    if (appState === 'dating_lab') {
      return (
        <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in slide-in-from-right duration-500 overflow-y-auto text-black text-left font-sans">
          <header className="bg-[#1a1c2c] border-b-[6px] border-black px-10 py-8 flex justify-between items-center text-white relative shadow-xl shrink-0">
            <button onClick={() => setAppState('dating_hub')} className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity font-bold">BACK</button>
            <h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight font-black">Testing Lab</h2>
            <div className="w-10" />
          </header>
          <div className="p-8 space-y-12 max-w-2xl mx-auto w-full pb-32 text-left">
            {/* Card A */}
            <div className="bg-[#FFD1DC] border-[5px] border-black rounded-[45px] p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full border-4 border-black flex items-center justify-center text-white font-black text-xl">A</div>
                <h3 className="font-['Londrina_Solid'] text-3xl uppercase font-black text-black">Baseline Profile</h3>
              </div>
              <textarea placeholder="Paste Baseline Bio here..." className="w-full bg-white/50 border-4 border-black/10 rounded-2xl p-4 min-h-[120px] mb-4 font-sans text-sm focus:border-blue-500 outline-none transition-all text-black text-left" />
              <div className="grid grid-cols-2 gap-4">
                <LabMetric label="Matches" value={14} color="bg-white/40" />
                <LabMetric label="Conv. Rate" value="5.1%" color="bg-white/40" />
              </div>
            </div>
            {/* Card B */}
            <div className="bg-[#AEC6CF] border-[5px] border-black rounded-[45px] p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-rose-500 rounded-full border-4 border-black flex items-center justify-center text-white font-black text-xl">B</div>
                <h3 className="font-['Londrina_Solid'] text-3xl uppercase font-black text-black">Variant Profile</h3>
              </div>
              <textarea placeholder="Paste Variant Bio here..." className="w-full bg-white/50 border-4 border-black/10 rounded-2xl p-4 min-h-[120px] mb-4 font-sans text-sm focus:border-rose-500 outline-none transition-all text-black text-left" />
              <div className="grid grid-cols-2 gap-4">
                <LabMetric label="Matches" value={8} color="bg-white/40" />
                <LabMetric label="Conv. Rate" value="2.9%" color="bg-white/40" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // --- STATION: ACTIVE GARDEN ---
    if (appState === 'dating_garden') {
      const poolSize = 50;
      const currentCount = likedSubjects.length;
      const threshold = Math.floor(poolSize * 0.37);
      const phase = currentCount <= threshold ? 'Exploration' : 'Selection';

      return (
        <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden text-black text-left font-sans text-left">
          <header className="bg-[#1a1c2c] border-b-[6px] border-black px-10 py-8 flex justify-between items-center text-white relative shadow-xl shrink-0 text-left">
            <button onClick={() => setAppState('dating_hub')} className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity font-bold text-white text-left">BACK</button>
            <h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight font-black text-white text-center text-white text-left">Active Garden</h2>
            <div className="w-10" />
          </header>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden text-left text-left">
            <div className="flex-1 relative flex flex-col bg-white text-left text-left">
              <div className="p-6 bg-white border-b-2 border-black/5 flex justify-between items-center text-left text-left">
                <div className="text-left">
                  <h3 className="font-['Londrina_Solid'] text-2xl uppercase font-black text-black leading-none text-left text-left">Intimacy Orbit</h3>
                  <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest text-black mt-1 text-left text-left">Live Dynamics Monitoring</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => particles.current.forEach(p => p.heat = 2.5)} className="p-1 border-2 border-black rounded-lg bg-white active:scale-95 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-left"><RefreshCcw size={14} /></button>
                  <input type="range" min="0" max="0.8" step="0.1" value={entropy} onChange={(e) => setEntropy(parseFloat(e.target.value))} className="w-24 h-2 bg-black/10 rounded-full appearance-none accent-black border border-black/20 text-left" />
                </div>
              </div>
              <div ref={containerRef} className="flex-1 relative bg-white overflow-hidden cursor-crosshair text-left text-left text-left">
                <canvas ref={canvasRef} className="block w-full h-full text-left" onClick={(e) => {
                  const rect = canvasRef.current.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  particles.current.forEach(p => { if (Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2) < 30) p.heat = 2.5; });
                }} />
              </div>
            </div>

            <div className="w-full md:w-96 p-8 space-y-8 bg-[#FDFCF0] border-l-[6px] border-black overflow-y-auto shrink-0 text-left text-left">
              <div className="bg-[#FFD1DC] border-[5px] border-black rounded-[45px] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center text-black text-left text-left">
                <h3 className="font-['Londrina_Solid'] text-xl uppercase opacity-40 font-bold mb-2 text-black text-left">Phase: {phase}</h3>
                <div className={`font-['Londrina_Solid'] text-5xl uppercase font-black leading-none mb-4 ${phase === 'Exploration' ? 'text-blue-600' : 'text-green-600'} text-left text-left text-left`}>
                  {currentCount}/{poolSize}
                </div>
                <div className="w-full h-6 bg-white/30 border-2 border-black rounded-full overflow-hidden flex p-0.5 mb-2 text-left text-left text-left">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-1000 text-left" style={{ width: `${Math.min((currentCount / poolSize) * 100, 37)}%` }} />
                  {currentCount > threshold && <div className="h-full bg-green-500 rounded-full ml-0.5 text-left" style={{ width: `${((currentCount - threshold) / poolSize) * 100}%` }} />}
                </div>
                <p className="text-[9px] opacity-60 font-black uppercase tracking-tight text-black text-left text-left text-left">Establish Baseline Quality via first 37%</p>
              </div>

              <div className="bg-white border-[5px] border-black rounded-[40px] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-left text-left">
                <h4 className="font-['Londrina_Solid'] text-xl uppercase font-black mb-4 text-left text-black text-left text-left">Live Specimens</h4>
                <div className="space-y-2 text-left text-left text-left text-left text-left">
                  {activeSpecimens.map(s => (
                    <div key={s.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border-2 border-black/5 text-left text-left text-left text-left text-left">
                      <span className="font-bold text-xs uppercase text-black text-left text-left">{s.name}</span>
                      <button onClick={() => triggerSpecimenExpiration(s)} className="text-[10px] font-black uppercase opacity-30 hover:opacity-100 hover:text-red-500 transition-all text-black text-left">Terminate</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // --- STATION: PLAYBOOK (Notes) ---
    if (appState === 'dating_playbook') {
      return (
        <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in slide-in-from-right duration-500 overflow-y-auto text-black text-left font-sans">
          <header className="bg-[#1a1c2c] border-b-[6px] border-black px-10 py-8 flex justify-between items-center text-white relative shadow-xl shrink-0 text-left">
            <button onClick={() => setAppState('dating_hub')} className="font-['Londrina_Solid'] text-xl uppercase opacity-40 hover:opacity-100 transition-opacity font-bold">BACK</button>
            <h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight font-black">Playbook</h2>
            <div className="w-10" />
          </header>
          <div className="p-8 space-y-6 max-w-2xl mx-auto w-full pb-32 text-left">
            <div className="bg-white border-4 border-black p-8 rounded-[40px] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-left">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen size={28} className="text-rose-500" />
                <h4 className="font-['Londrina_Solid'] text-3xl uppercase font-black text-black">Tactical Manual</h4>
              </div>
              <p className="text-xs opacity-60 mb-8 uppercase font-black tracking-widest border-b border-black/5 pb-4">Standard Interventions</p>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { title: 'The Vulnerability Pivot', success: '68%', desc: 'Shifting from banter to deep emotional resonance.' },
                  { title: 'Contextual Bantering', success: '82%', desc: 'Using profile specific detail to initiate high-interest flow.' },
                  { title: 'The Mirror Request', success: '45%', desc: 'Asking for their hypothesis of your profile vibe.' },
                  { title: 'Asynchronous Check-in', success: '59%', desc: 'Low-pressure follow-up after 48 hours of silence.' }
                ].map(t => (
                  <div key={t.title} className="bg-slate-50 p-5 rounded-3xl border-2 border-black/5 group hover:border-black/20 transition-all text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-black text-sm uppercase text-black">{t.title}</span>
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-lg text-[9px] font-black">Success: {t.success}</span>
                    </div>
                    <p className="text-xs opacity-50 font-medium leading-snug">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // --- HUB ---
    return (
      <div className="fixed inset-0 bg-[#FDFCF0] z-50 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden text-black text-left font-sans text-left text-left">
        <header className="flex justify-between items-start mb-10 pt-8 px-2 text-black">
          <div className="text-left">
            <h2 className="font-['Londrina_Solid'] text-6xl uppercase leading-none tracking-tight font-black text-black">Love Lab</h2>
            <p className="font-['Londrina_Solid'] text-xl opacity-30 uppercase font-bold text-black mt-1">Research Hub</p>
          </div>
          <button
            onClick={() => setAppState('garden')}
            className="w-14 h-14 flex items-center justify-center border-[4px] border-black rounded-2xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all"
          >
            <span className="text-3xl font-black opacity-30">✕</span>
          </button>
        </header>

        <div className="flex-1 relative overflow-y-auto p-8 pb-40 text-left text-left text-left text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto w-full mb-10">            {/* Left Button: For brand new people */}
            <button
              onClick={() => setIsAddingPerson(true)}
              className="bg-black text-white border-[5px] border-black rounded-[45px] p-8 shadow-[8px_8px_0_0_rgba(100,100,100,0.5)] active:translate-y-1 transition-all flex items-center justify-center text-3xl font-['Londrina_Solid'] uppercase font-black tracking-tight text-center"
            >
              New Like
            </button>

            {/* Right Button: For existing people in your garden */}
            <button
              onClick={() => setIsAddingInteraction(true)}
className="bg-rose-500 text-white border-[5px] border-black rounded-[45px] p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)] active:translate-y-1 transition-all flex items-center justify-center text-3xl font-['Londrina_Solid'] uppercase font-black tracking-tight text-center"            >
              Log Pulse
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto w-full mb-10 text-left text-left text-left text-left">
            <BentoButton title="Active Garden" bg="bg-[#C1E1C1]" onClick={() => setAppState('dating_garden')}>
              <p className="font-['Londrina_Solid'] text-2xl text-black font-black leading-none text-left text-left text-left text-left">Dynamics Map</p>
              <p className="font-['Londrina_Solid'] text-xl text-black opacity-40 font-bold mt-1 text-left text-left text-left text-left">Live Orbit Map</p>
            </BentoButton>
            <BentoButton title="Testing Lab" bg="bg-[#AEC6CF]" onClick={() => setAppState('dating_lab')}>
              <p className="font-['Londrina_Solid'] text-2xl text-black font-black leading-none text-left text-left text-left text-left">Bio Split Testing</p>
              <p className="font-['Londrina_Solid'] text-xl text-black opacity-40 font-bold mt-1 text-left text-left text-left text-left text-left">Conversion Stats</p>
            </BentoButton>
            <BentoButton title="Playbook" bg="bg-[#FFFACD]" onClick={() => setAppState('dating_playbook')}>
              <p className="font-['Londrina_Solid'] text-2xl text-black font-black leading-none text-left text-left text-left text-left">Tactical Notes</p>
              <p className="font-['Londrina_Solid'] text-xl text-black opacity-40 font-bold mt-1 text-left text-left text-left text-left text-left">Standard Interventions</p>
            </BentoButton>
          </div>
        </div>
      </div>
    );
  };

  // This usually starts around line 350 or near the end of the LoveLab function
  return (
    <>
      {renderCurrentView()}
      {isAddingPerson && (
        <SubjectRegistryModal
          handleAddPerson={handleAddPerson}
          onCancel={() => setIsAddingPerson(false)}
        />
      )}
      {/* Ensure this line uses the exact names from your signature */}
      {isAddingInteraction && (
        <InteractionRegistryModal
          specimens={likedSubjects}
          handleAdd={handleRecordInteraction}
          onCancel={() => setIsAddingInteraction(false)}
        />
      )}
      {viewingSubject && (
        <SubjectCaseFileModal
          subject={viewingSubject}
          interactions={interactions.filter(i => i.specimenId === viewingSubject.id)}
          onCancel={() => setViewingSubject(null)}
        />
      )}
    </>
  );
}

// ==========================================
// 📄 CASE FILE MODAL (Detailed Analysis)
// ==========================================
const SubjectCaseFileModal = ({ subject, interactions, onCancel }) => (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[300] flex items-center justify-center p-6 font-sans text-left text-left text-left text-left text-left" onClick={onCancel}>
    <div className="bg-[#FDFCF0] border-[6px] border-black rounded-[50px] p-10 w-full max-w-md overflow-y-auto text-black shadow-[25px_25px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200 text-left text-left text-left text-left text-left text-left" onClick={e => e.stopPropagation()}>
      <header className="mb-8 flex justify-between items-start text-left text-left text-left text-left text-left text-left">
        <div className="text-left text-left text-left text-left text-left">
          <h2 className="font-['Londrina_Solid'] text-6xl uppercase font-black leading-none text-black text-left text-left text-left text-left text-left">{subject.name}</h2>
          <p className="font-['Londrina_Solid'] text-2xl opacity-40 uppercase tracking-tighter mt-1 text-black text-left text-left text-left text-left text-left">{subject.age} • {subject.app?.toUpperCase()} ARCHIVE</p>
        </div>
        <button onClick={onCancel} className="text-4xl font-black opacity-20 hover:opacity-100 transition-opacity p-2 text-black text-left text-left text-left">✕</button>
      </header>

      <div className="space-y-6 text-left text-left text-left text-left text-left">
        <div className="bg-white border-4 border-black p-4 rounded-3xl flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left text-left text-left text-left text-left text-left">
          <MapPin size={22} className="text-rose-500 text-left text-left text-left" />
          <span className="font-black uppercase text-sm tracking-tight text-black text-left text-left text-left text-left text-left">{subject.location}</span>
        </div>

        <div className="bg-white border-4 border-black p-6 rounded-[35px] text-left">
          <label className="text-[10px] font-black uppercase opacity-40 block mb-4 flex items-center gap-2 text-black"><ActivityIcon size={12} /> Interaction Timeline</label>
          <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
            {interactions.length > 0 ? interactions.sort((a, b) => b.timestamp - a.timestamp).map(i => (
              <div key={i.id} className="border-l-4 border-rose-500 pl-4 py-1">
                <div className="flex justify-between items-start">
                  <span className="font-black uppercase text-[10px] text-black">{MARKOV_STATES.find(m => m.id === i.type)?.label}</span>
                  <span className="text-[8px] opacity-30 font-black text-black">{new Date(i.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-xs font-medium leading-snug mt-1 text-black italic">"{i.notes}"</p>
              </div>
            )) : <p className="text-[10px] italic opacity-30 text-black">No pulses recorded yet.</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 text-left text-left text-left text-left text-left text-left text-left">
          <div className="bg-white border-2 border-black p-5 rounded-3xl space-y-4 text-left text-left text-left text-left text-left text-left">
            <label className="text-[10px] font-black uppercase opacity-40 block mb-1 text-black text-left text-left text-left text-left text-left">Ranked Archetypes</label>
            <div className="space-y-3 text-left text-left text-left text-left text-left text-left">
              {subject.archetypes?.map((a, index) => (
                <div key={a.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-black/5 text-left text-left text-left text-left text-left text-left">
                  <div className="flex items-center gap-2 text-left text-left text-left text-left text-left text-left">
                    <span className="w-5 h-5 bg-black text-white text-[10px] rounded-full flex items-center justify-center font-black text-center text-left text-left text-left text-left text-left">{index + 1}</span>
                    <span className="font-bold text-xs uppercase text-black text-left text-left text-left text-left text-left text-left text-left text-left text-left">{a.id}</span>
                  </div>
                  <span className="bg-black text-white px-2 py-0.5 rounded-lg text-[9px] font-black text-center text-left text-left text-left text-left text-left text-left">{a.value}/10</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-left text-left text-left text-left text-left text-left text-left text-left">
          <div className="col-span-2 grid grid-cols-3 gap-2 text-left text-left text-left text-left text-left text-left text-left text-left text-left">
            <CaseStat label="Pull" val={subject.visualPull} color="bg-rose-100" />
            <CaseStat label="Compat" val={subject.compatibility} color="bg-blue-100" />
            <CaseStat label="Chance" val={subject.probability} color="bg-green-100" />
          </div>
          <CaseStat label="Desire" val={subject.matchDesire} color="bg-yellow-100" />
          <CaseStat label="Invest" val={subject.investmentLevel} color="bg-orange-100" />
        </div>

        <div className="bg-white border-4 border-black p-6 rounded-[35px] space-y-6 text-left text-black text-left text-left text-left text-left text-left text-left text-left text-left">
          <div className="text-left text-black text-left text-left text-left text-left text-left text-left text-left">
            <label className="text-[10px] font-black uppercase opacity-40 block mb-2 flex items-center gap-2 text-black text-left text-left text-left text-left text-left text-left"><TargetIcon size={12} /> The Anchor Point</label>
            <p className="text-sm font-medium leading-relaxed italic opacity-80 text-black text-left text-left text-left text-left text-left text-left text-left text-left">"{subject.anchor}"</p>
          </div>
          <div className="pt-6 border-t-2 border-black/5 text-left text-black text-left text-left text-left text-left text-left text-left text-left">
            <label className="text-[10px] font-black uppercase opacity-40 block mb-2 flex items-center gap-2 text-black text-left text-left text-left text-left text-left text-left text-left"><MessageCircle size={12} /> Interaction Sent</label>
            <p className="text-sm font-bold text-rose-500 leading-relaxed uppercase tracking-tight text-left text-left text-left text-left text-left text-left text-left text-left text-left">"{subject.sentMessage}"</p>
          </div>
        </div>
      </div>

      <button onClick={onCancel} className="w-full mt-10 bg-black text-white p-6 rounded-[40px] font-['Londrina_Solid'] text-3xl uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-1 transition-all text-center text-left text-left text-left text-left text-left text-left text-left">Archive Record</button>
    </div>
  </div>
);

const CaseStat = ({ label, val, color }) => (
  <div className={`${color} border-2 border-black p-2 rounded-2xl flex flex-col items-center text-center text-black text-left text-left text-left text-left`}>
    <span className="text-[7px] font-black uppercase opacity-40 text-black text-center text-left text-left text-left text-left">{label}</span>
    <span className="font-['Londrina_Solid'] text-lg font-black text-black leading-none text-center text-left text-left text-left text-left text-left text-left">{val}</span>
  </div>
);

// ==========================================
// 📒 REGISTRY MODAL (The Unified Form)
// ==========================================
const SubjectRegistryModal = ({ handleAddPerson, onCancel }) => {
  const [selectedApp, setSelectedApp] = useState(APPS[0].id);
  const [selectedArchetypes, setSelectedArchetypes] = useState([]);
  const [visualPull, setVisualPull] = useState(5);
  const [compatibility, setCompatibility] = useState(5);
  const [probability, setProbability] = useState(5);
  const [matchDesire, setMatchDesire] = useState(5);
  const [investmentLevel, setInvestmentLevel] = useState(5);
  const [showInfo, setShowInfo] = useState(false);

  const toggleArchetype = (a) => {
    const existingIndex = selectedArchetypes.findIndex(item => item.id === a);
    if (existingIndex !== -1) {
      setSelectedArchetypes(prev => prev.filter(item => item.id !== a));
    } else if (selectedArchetypes.length < 3) {
      setSelectedArchetypes(prev => [...prev, { id: a, value: 5 }]);
    }
  };

  const updateArchetypeValue = (id, val) => {
    setSelectedArchetypes(prev => prev.map(item => item.id === id ? { ...item, value: parseInt(val) } : item));
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[250] flex items-end justify-center p-6 font-sans text-left text-left text-left text-left text-left text-left text-left" onClick={onCancel}>
      <div className="bg-[#FDFCF0] border-[5px] border-black rounded-[45px] p-8 w-full max-sm max-h-[95vh] overflow-y-auto text-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom text-left text-left text-left text-left text-left text-left text-left text-left text-left" onClick={e => e.stopPropagation()}>

        <div className="flex justify-between gap-2 mb-8 text-left text-left text-left text-left text-left text-left text-left text-left">
          {APPS.map(app => (
            <button
              key={app.id}
              onClick={() => setSelectedApp(app.id)}
              style={{ backgroundColor: selectedApp === app.id ? app.color : '#fff' }}
              className={`flex-1 aspect-square rounded-2xl border-4 border-black flex items-center justify-center transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${selectedApp === app.id ? 'text-white' : 'grayscale opacity-50 translate-x-1 translate-y-1 shadow-none'} text-left text-left text-left text-left text-left`}
            >
              {typeof app.icon === 'string' ? <span className="text-3xl text-left text-left text-left text-left">{app.icon}</span> : app.icon}
            </button>
          ))}
        </div>

        <header className="flex justify-between items-start mb-8 text-left text-left text-left text-left text-left text-left text-left text-left text-left">
          <div className="text-left text-left text-left text-left text-left text-left text-left">
            <h2 className="font-['Londrina_Solid'] text-5xl uppercase font-black leading-none text-black text-left text-left text-left text-left text-left text-left text-left">New Subject</h2>
            <p className="opacity-40 uppercase font-['Londrina_Solid'] text-xl font-bold mt-1 tracking-tight text-black text-left text-left text-left text-left text-left text-left text-left">Impression Log</p>
          </div>
          <button onClick={onCancel} className="text-3xl opacity-30 font-bold p-2 text-black text-left text-left text-left text-left text-left text-left">✕</button>
        </header>

        <form onSubmit={(e) => {
          e.preventDefault(); const fd = new FormData(e.target);
          if (selectedArchetypes.length === 0) return;
          handleAddPerson({
            name: fd.get('name'), age: fd.get('age'), location: fd.get('location'),
            app: selectedApp, archetypes: selectedArchetypes,
            visualPull, compatibility, probability, matchDesire, investmentLevel,
            anchor: fd.get('anchor'), sentMessage: fd.get('sentMessage')
          });
        }} className="space-y-8 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">

          <div className="bg-white border-4 border-black p-4 rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
            <label className="text-[9px] uppercase font-black opacity-40 block mb-1 text-black text-left text-left text-left text-left text-left text-left text-left text-left">Basic Identity</label>
            <div className="flex gap-2 text-left text-left text-left text-left text-left text-left text-left text-left text-left">
              <input required name="name" placeholder="Name" className="flex-1 font-['Londrina_Solid'] text-3xl focus:outline-none placeholder:opacity-20 text-black bg-transparent text-left text-left text-left text-left text-left text-left text-left text-left" />
              <input required name="age" type="number" placeholder="Age" className="w-16 font-['Londrina_Solid'] text-3xl focus:outline-none placeholder:opacity-20 text-black bg-transparent text-left text-left text-left text-left text-left text-left text-left text-left text-left" />
            </div>
          </div>

          <div className="bg-white border-4 border-black p-4 rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
            <label className="text-[9px] uppercase font-black opacity-40 block mb-1 text-black text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Location</label>
            <input required name="location" placeholder="e.g. London / 3 miles" className="w-full text-sm font-bold focus:outline-none text-black bg-transparent text-left text-left text-left text-left text-left text-left text-left text-left text-left" />
          </div>

          {/* RESTORED: Match Conviction Card */}
          <div className="bg-yellow-50 border-4 border-black p-6 rounded-[40px] space-y-6 text-left shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
            <label className="text-[10px] uppercase font-black opacity-40 block mb-1 text-left text-black tracking-widest text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Match Conviction</label>
            <BeliefSlider label="Match Desire" val={matchDesire} setVal={setMatchDesire} />
            <BeliefSlider label="Investment Level" val={investmentLevel} setVal={setInvestmentLevel} />
          </div>

          {/* RESTORED: Systemic Beliefs Card */}
          <div className="bg-slate-50 border-4 border-black p-6 rounded-[40px] space-y-6 text-left shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
            <label className="text-[10px] uppercase font-black opacity-40 block mb-1 text-left text-black tracking-widest text-left text-left text-black text-left text-left text-left text-left text-left text-left text-left text-left text-left text-black text-left text-left text-left text-left text-left text-left">Systemic Beliefs</label>
            <BeliefSlider label="Visual Pull" val={visualPull} setVal={setVisualPull} />
            <BeliefSlider label="Compatibility" val={compatibility} setVal={setCompatibility} />
            <BeliefSlider label="Matching Probability" val={probability} setVal={setProbability} />
          </div>

          <div className="bg-[#FFD1DC] border-4 border-black p-6 rounded-[40px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
{/* --- WRAP THE LABEL IN THIS FLEX DIV --- */}
<div className="flex justify-between items-center mb-3 relative">
  <label className="text-[10px] uppercase font-black opacity-40 text-black tracking-widest">
    Ranked Archetypes (Top 3)
  </label>
  
  {/* THE TRIGGER BUTTON */}
  <button 
    type="button"
    onClick={() => setShowInfo(!showInfo)}
    className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-black hover:bg-black hover:text-white transition-all"
  >
    i
  </button>

  {/* THE TOOLTIP BOX (Step 4 code goes right here) */}
  {showInfo && (
    <div className="absolute top-8 right-0 w-64 bg-white text-black p-4 rounded-2xl z-[300] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-left animate-in fade-in zoom-in-95 duration-200 border-2 border-4 border-black">
      <div className="space-y-3">
        {Object.entries(ARCHETYPE_DEFINITIONS).map(([name, def]) => (
          <div key={name}>
            <span className="font-black uppercase text-[9px] text-rose-600">{name}:</span>
            <p className="text-[10px] leading-tight opacity-80">{def}</p>
          </div>
        ))}
      </div>
      <button onClick={() => setShowInfo(false)} className="mt-3 w-full text-[8px] font-black uppercase tracking-widest opacity-40 border-t border-black/10 pt-2 text-center">Close Info</button>
    </div>
  )}
</div>            <div className="flex flex-wrap gap-2 mb-6 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
              {Object.keys(ARCHETYPE_DEFINITIONS).map(a => {
                const rankIndex = selectedArchetypes.findIndex(item => item.id === a);
                return (
                  <button
                    key={a} type="button" onClick={() => toggleArchetype(a)}
                    className={`relative px-3 py-2 border-2 border-black rounded-xl text-[10px] font-black uppercase transition-all text-center text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left ${rankIndex !== -1 ? 'bg-black text-white scale-105' : 'bg-white text-black'} text-left text-left text-left text-left text-left`}
                  >
                    {a}
                    {rankIndex !== -1 && (
                      <span className="absolute -top-3 -right-2 w-6 h-6 bg-black border-2 border-white text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-sm text-center text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                        {rankIndex + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="space-y-4 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
              {selectedArchetypes.map((sa, index) => (
                <div key={sa.id} className="space-y-1 text-left bg-white/30 p-3 rounded-2xl border border-black/5 text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                  <div className="flex justify-between text-[9px] font-black uppercase text-black text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                    <span><span className="mr-1 bg-black text-white px-1.5 rounded-md text-left text-left text-left text-left text-left text-left">#{index + 1}</span> {sa.id} Intensity</span>
                    <span>{sa.value}/10</span>
                  </div>
                  <input type="range" min="1" max="10" value={sa.value} onChange={e => updateArchetypeValue(sa.id, e.target.value)} className="w-full h-2 bg-black/10 rounded-full appearance-none accent-black cursor-pointer mt-2 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left" />
                </div>
              ))}
              {selectedArchetypes.length === 0 && <p className="text-[9px] font-black uppercase opacity-30 text-center py-4 text-black text-center text-black text-left text-left text-left text-left text-left text-left">Tap tags to set system ranks</p>}
            </div>
          </div>

          <div className="space-y-4 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
            <div className="bg-white border-4 border-black p-5 rounded-3xl text-left text-left text-black text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
              <label className="text-[10px] font-black uppercase opacity-40 block mb-2 text-left text-black text-left text-black text-left text-black text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">The Anchor Point (The Hook)</label>
              <textarea required name="anchor" placeholder="Specific detail that hooked you..." className="w-full text-sm font-medium focus:outline-none h-20 resize-none leading-tight text-black bg-transparent text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left" />
            </div>
            <div className="bg-white border-4 border-black p-5 rounded-3xl text-left text-left text-black text-left text-left text-black text-left text-black text-left text-black text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
              <label className="text-[10px] font-black uppercase opacity-40 block mb-2 text-left text-black text-left text-black text-left text-black text-left text-black text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Sent Interaction (Message sent)</label>
              <textarea required name="sentMessage" placeholder="The exact message sent with the like..." className="w-full text-sm font-medium focus:outline-none h-20 resize-none leading-tight text-black bg-transparent text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left" />
            </div>
          </div>

          <button type="submit" className="w-full bg-black text-white p-7 rounded-[45px] font-['Londrina_Solid'] text-3xl uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-1 transition-all text-center text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Archive Research Record</button>
        </form>
      </div>
    </div>
  );
};

const BeliefSlider = ({ label, val, setVal }) => (
  <div className="space-y-1 text-left text-left text-black text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">
    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-black text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left"><span>{label}</span><span>{val}/10</span></div>
    <input type="range" min="1" max="10" value={val} onChange={e => setVal(parseInt(e.target.value))} className="w-full h-2 bg-black/10 rounded-full appearance-none accent-black cursor-pointer text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left" />
  </div>
);

// --- Helpers ---
const LabMetric = ({ label, value, color }) => (
  <div className={`${color} border-[3px] border-black rounded-2xl p-4 flex flex-col items-center justify-center text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center text-black text-center text-left text-left text-left text-left text-left text-left text-left`}>
    <span className="font-['Londrina_Solid'] text-[10px] uppercase font-black opacity-40 text-center text-black text-left text-left text-left text-left text-left text-left text-left text-left text-left">{label}</span>
    <span className="font-['Londrina_Solid'] text-3xl font-black leading-none mt-1 text-black text-center text-black text-left text-left text-left text-left text-left text-left text-left text-left text-left">{value}</span>
  </div>
);

const BentoButton = ({ title, bg, onClick, children, className = "" }) => (
  <button onClick={onClick} className={`${bg} border-[5px] border-black rounded-[45px] p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between h-[220px] active:scale-95 transition-all group ${className} text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left`}>
    <span className="font-['Londrina_Solid'] text-3xl uppercase text-black font-bold tracking-tight text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">{title}</span>
    <div className="flex flex-col text-black text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">{children}</div>
  </button>
);

const MLMHeart = ({ size = 125, id = "heart", isPlaceholder = false }) => {
  const mlmStripes = ['#98E8C1', '#FFFFFF', '#7BADE2'];
  return (
    <svg width={size} height={size} viewBox="0 0 125 125">
      <defs><clipPath id={`${id}-clip`}><path d="M60 105 C60 105 15 80 15 45 15 20 50 20 60 35 70 20 105 20 105 45 105 80 60 105 60 105 Z" /></clipPath></defs>
      <g transform="translate(2, 2)">
        <path d="M60 105 C60 105 15 80 15 45 15 20 50 20 60 35 70 20 105 20 105 45 105 80 60 105 60 105 Z" fill="black" transform="translate(6, 6)" />
        {isPlaceholder ? <path d="M60 105 C60 105 15 80 15 45 15 20 50 20 60 35 70 20 105 20 105 45 105 80 60 105 60 105 Z" fill="#1a1c2c" /> : (
          <g clipPath={`url(#${id}-clip)`}>
            <rect x="0" y="0" width="120" height="120" fill={mlmStripes[0]} />
            <path d="M-20 40 Q20 25 60 40 T140 40 L140 80 Q100 65 60 80 T-20 80 Z" fill={mlmStripes[1]} transform="rotate(-15, 60, 60)" />
            <path d="M-20 80 Q20 65 60 80 T140 80 L140 160 L-20 160 Z" fill={mlmStripes[2]} transform="rotate(-15, 60, 60)" />
          </g>
        )}
        <path d="M60 105 C60 105 15 80 15 45 15 20 50 20 60 35 70 20 105 20 105 45 105 80 60 105 60 105 Z" fill="none" stroke="black" strokeWidth="6" strokeLinejoin="round" />
      </g>
    </svg>
  );
};


const InteractionRegistryModal = ({ specimens, handleAdd, onCancel }) => {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState('matched');
  const [intensity, setIntensity] = useState(5);
  const filtered = specimens.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[250] flex items-end justify-center p-6 font-sans text-left" onClick={onCancel}>
      <div className="bg-[#FDFCF0] border-[5px] border-black rounded-[45px] p-8 w-full max-sm max-h-[90vh] overflow-y-auto text-black shadow-[15px_15px_0_0_rgba(0,0,0,1)]" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-start mb-8 text-black text-left">
          <div><h2 className="font-['Londrina_Solid'] text-5xl uppercase font-black leading-none">Record Pulse</h2><p className="opacity-40 uppercase font-['Londrina_Solid'] text-xl font-bold mt-1">System Update</p></div>
          <button onClick={onCancel} className="text-3xl opacity-30 font-bold p-2 text-black">✕</button>
        </header>
        <form onSubmit={(e) => {
          e.preventDefault(); if (!selectedId) return;
          handleAdd({ specimenId: selectedId, type: selectedType, intensity, notes: new FormData(e.target).get('notes') });
        }} className="space-y-8 text-left">
          <div className="bg-white border-4 border-black p-4 rounded-3xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-left">
            <label className="text-[9px] uppercase font-black opacity-40 block mb-2 text-black">1. Select Subject</label>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full bg-slate-50 p-2 rounded-xl text-xs font-bold border-2 border-black/5 mb-3 text-black" />
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">{filtered.map(s => (<button key={s.id} type="button" onClick={() => setSelectedId(s.id)} className={`px-3 py-1.5 rounded-xl border-2 border-black text-[10px] font-black uppercase ${selectedId === s.id ? 'bg-black text-white' : 'bg-white text-black opacity-50'}`}>{s.name}</button>))}</div>
          </div>
          <div className="bg-[#FFD1DC] border-4 border-black p-6 rounded-[40px] shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
            <label className="text-[10px] font-black opacity-40 block mb-4 text-black text-left">2. Markov State Transition</label>
            <div className="grid grid-cols-2 gap-2">{MARKOV_STATES.map(m => (<button key={m.id} type="button" onClick={() => setSelectedType(m.id)} className={`px-2 py-2 rounded-xl border-2 border-black text-[9px] font-black uppercase ${selectedType === m.id ? 'bg-black text-white' : 'bg-white text-black opacity-40'}`}>{m.label}</button>))}</div>
          </div>
          <div className="bg-white border-4 border-black p-6 rounded-[40px] text-left text-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
            <div className="flex justify-between text-[10px] font-black uppercase mb-4 text-left"><span>3. Energy ROI</span><span>{intensity}/10</span></div>
            <input type="range" min="1" max="10" value={intensity} onChange={e => setIntensity(parseInt(e.target.value))} className="w-full h-2 accent-black cursor-pointer" />
          </div>
          <div className="bg-white border-4 border-black p-5 rounded-3xl text-left text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <label className="text-[10px] font-black uppercase opacity-40 block mb-2">4. Observation Notes</label>
            <textarea required name="notes" className="w-full text-sm font-medium h-24 focus:outline-none bg-transparent text-black" placeholder="Flow check..." />
          </div>
          <button type="submit" className="w-full bg-black text-white p-7 rounded-[45px] font-['Londrina_Solid'] text-3xl uppercase shadow-[8px_8px_0_0_rgba(0,0,0,0.3)] active:translate-y-1 text-center">Inject Pulse</button>
        </form>
      </div>
    </div>
  );
};