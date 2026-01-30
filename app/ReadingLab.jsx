"use client";
import React, { useState, useMemo } from 'react';
import { doc, updateDoc, collection, addDoc, serverTimestamp, arrayUnion, deleteDoc } from 'firebase/firestore';

/**
 * ReadingLab.jsx 
 * Handles: ReadingLab View, LibraryView, AddBookDrawer, ReadingDrawer, 
 * BattleCard, BookGridItem, SedimentaryRecord, StratifiedBookFlow
 */

export default function ReadingLab({
    appState, setAppState, books, user, db, platformAppId, palette, genres,
    focusedSubjectId, setFocusedSubjectId, setIsLogging, isLogging,
    libraryMode, setLibraryMode, isAddingBook, setIsAddingBook,
    handleStartReading, handleSaveSession, handleBattleChoice,
    tbrPool, currentChamp, roundWinnerId, battleIdx, finalWinner,
    selectedBook, setSelectedBook, activeTab, setActiveTab
}) {
    // Local state for the Gauntlet Tooltip
    const [showGauntletInfo, setShowGauntletInfo] = useState(false);

    // --- PERSONAL DATA FILTERING ---
    const myBooks = useMemo(() => books.filter(b => b.ownerId === user?.uid), [books, user]);
    const myReadingList = useMemo(() => myBooks.filter(b => b.status === 'READING'), [myBooks]);
    const myTbrPool = useMemo(() => myBooks.filter(b => b.status === 'TBR'), [myBooks]);

    // --- Persistence Logic ---
    const handleStartSession = async (bookId) => {
        // 1. Old Path (Legacy)
        const oldRef = doc(db, 'artifacts', platformAppId, 'public', 'data', 'books', bookId);

        // 2. New Path (User-Centric)
        const newRef = doc(db, 'users', user.uid, 'reading_lab', 'books', bookId);

        // Shadow Write to both
        await updateDoc(oldRef, { sessionStartedAt: serverTimestamp() });
        await updateDoc(newRef, { sessionStartedAt: serverTimestamp() });
    };

    const handleCancelSession = async (e, bookId) => {
        e.stopPropagation();
        const oldRef = doc(db, 'artifacts', platformAppId, 'public', 'data', 'books', bookId);
        const newRef = doc(db, 'users', user.uid, 'reading_lab', 'books', bookId);

        await updateDoc(oldRef, { sessionStartedAt: null });
        await updateDoc(newRef, { sessionStartedAt: null });
    };
    // Helper to render the main content based on state
    const renderMainContent = () => {
        // --- Sub-View: Library / Battle Gauntlet ---
        if (appState === 'library') {
            return (
                <div className="max-w-md mx-auto animate-in fade-in">
                    <header className="flex justify-between items-center mb-10 pt-4">
                        <button onClick={() => setAppState('manage')} className="text-3xl opacity-30 font-bold text-black">✕</button>
                        <div className="inline-flex bg-white border-[4px] border-black p-1 rounded-[25px] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                            {['library', 'battle'].map(m => (
                                <button key={m} onClick={() => { setLibraryMode(m); }} className={`px-6 py-2 rounded-[20px] font-['Londrina_Solid'] uppercase text-lg transition-all ${libraryMode === m ? 'bg-black text-white' : 'opacity-40 text-black'}`}>{m}</button>
                            ))}
                        </div>
                        <div className="w-8" />
                    </header>

                    <div className="grid grid-cols-2 gap-x-5 gap-y-10 text-black">
                        {libraryMode === 'library' ? (
                            <>
                                <button onClick={() => setIsAddingBook(true)} className="relative w-full aspect-[1/1.25] border-[4px] border-dashed border-black/20 rounded-[24px] p-3 flex flex-col items-center justify-center bg-white/50 hover:border-black/40 text-black">
                                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center text-2xl font-black">+</div>
                                </button>
                                {myBooks.map(b => (
                                    <BookGridItem
                                        key={b.id}
                                        book={b}
                                        palette={palette}
                                        isLive={!!b.sessionStartedAt}
                                        onStartSession={() => handleStartSession(b.id)}
                                        onCancelSession={(e) => handleCancelSession(e, b.id)}
                                        onFinishSession={() => { setFocusedSubjectId(b.id); setIsLogging(true); }}
                                        onSelect={(book) => { setSelectedBook(book); setActiveTab('review'); }}
                                        onDelete={async (id) => {
                                            await deleteDoc(doc(db, 'artifacts', platformAppId, 'public', 'data', 'books', id));
                                        }}
                                        currentUserId={user?.uid}
                                    />
                                ))}
                            </>
                        ) : (
                            <div className="col-span-2 relative text-black">
                                {/* TOOLTIP TRIGGER - Top Right */}
                                {!finalWinner && myTbrPool.length >= 2 && (
                                    <button
                                        onClick={() => setShowGauntletInfo(true)}
                                        className="absolute -top-6 -right-2 w-8 h-8 rounded-full border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center font-black active:translate-y-0.5 transition-all z-30"
                                    >
                                        ?
                                    </button>
                                )}

                                {myTbrPool.length < 2 && !finalWinner ? (
                                    <div className="text-center py-20 font-['Londrina_Solid'] text-3xl opacity-30 uppercase text-black text-center">Min. 2 Subjects Required</div>
                                ) : !finalWinner ? (
                                    <div className="space-y-2 text-center text-black text-center">
                                        <h2 className="font-['Londrina_Solid'] text-5xl uppercase mb-6 text-center">The Gauntlet</h2>
                                        <div className="flex flex-col space-y-0 text-center">
                                            {currentChamp && <div className="pb-7"><BattleCard book={currentChamp} label="The Champ" onClick={() => handleBattleChoice(currentChamp)} isSelectionWinner={roundWinnerId === currentChamp.id} /></div>}

                                            {tbrPool[battleIdx] && (
                                                <>
                                                    <div className="flex justify-center py-2 z-20 relative pointer-events-none text-black">
                                                        <div className="w-16 h-16 rounded-full bg-black border-[6px] border-[#FDFCF0] text-white flex items-center justify-center font-['Londrina_Solid'] text-3xl italic shadow-xl">VS</div>
                                                    </div>
                                                    <div className="pt-7">
                                                        <BattleCard
                                                            book={tbrPool[battleIdx]}
                                                            label="The Challenger"
                                                            onClick={() => handleBattleChoice(tbrPool[battleIdx])}
                                                            isSelectionWinner={roundWinnerId === tbrPool[battleIdx].id}
                                                        />
                                                    </div>
                                                </>
                                            )}                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center animate-in zoom-in py-10 text-black">
                                        <div className="inline-block bg-green-200 border-2 border-black px-4 py-1 rounded-xl mb-4 font-black uppercase text-[10px]">Subject Selected</div>
                                        <h2 className="font-['Londrina_Solid'] text-6xl uppercase leading-none mb-8 text-center">{String(finalWinner.title)}</h2>
                                        <button onClick={() => handleStartReading(finalWinner)} className="w-full bg-black text-white p-6 rounded-3xl font-['Londrina_Solid'] text-3xl uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-1 font-bold">Start READING</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // --- Main Station View ---
        return (
            <div className="fixed inset-0 bg-[#FDFCF0] z-40 p-8 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto text-black text-left">
                <header className="flex justify-between items-start mb-10">
                    <div><h2 className="font-['Londrina_Solid'] text-5xl uppercase leading-none">Reading Lab</h2><p className="font-['Londrina_Solid'] text-xl opacity-30 uppercase tracking-tight font-bold text-left">Active Station</p></div>
                    <button
                        onClick={() => setAppState('library')}
                        className="bg-white border-[3px] border-black px-4 py-2 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all"
                    >
                        <span className="font-['Londrina_Solid'] text-sm uppercase tracking-widest font-black text-black">
                            Archive
                        </span>
                    </button>                </header>
                <div className="flex-1 space-y-4 text-left">
                    {myReadingList.map(book => {
                        const isBookLive = !!book.sessionStartedAt;
                        const isSelected = focusedSubjectId === book.id;

                        return (
                            /* 1. PARENT CONTAINER - Logic updated to prioritize "Live" visibility */
                            <div
                                key={book.id}
                                className={`relative transition-all duration-500 
                ${(isSelected || isBookLive) ? 'opacity-100 grayscale-0' : 'opacity-30 grayscale-[1]'}
                ${isSelected ? 'scale-[1.02] z-20' : 'z-10'}
            `}
                            >

                                {/* 2. THE LASER GLOW (Now always bright if live) */}
                                {isBookLive && (
                                    <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 via-yellow-400 to-pink-500 rounded-[35px] animate-laser-glow blur-[3px] z-0" />
                                )}

                                {/* 3. THE BUTTON (Solid white background) */}
                                <button
                                    onClick={() => setFocusedSubjectId(book.id)}
                                    className={`relative w-full border-4 border-black p-5 rounded-[30px] flex items-center justify-between text-left transition-all bg-white z-10
                    ${isSelected ? 'shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]' : 'shadow-none'}
                `}
                                >
                                    <div className="text-left text-black relative z-10">
                                        <p className="font-['Londrina_Solid'] text-2xl uppercase leading-none font-black">
                                            {String(book.title)}
                                        </p>
                                        <p className="text-[10px] font-black opacity-30 mt-1 uppercase">
                                            Page {Number(book.currentPage)}/{Number(book.totalPages)}
                                            {isBookLive && " • LIVE DATA COLLECTION"}
                                        </p>
                                    </div>

                                    <div className="relative z-10">
                                        {isSelected ? (
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateDoc(doc(db, 'artifacts', platformAppId, 'public', 'data', 'books', book.id), { status: 'DNF' });
                                                }}
                                                className="bg-yellow-400 text-black px-5 py-2.5 rounded-2xl border-[3px] border-black font-black text-xl uppercase text-center active:scale-90 transition-all"
                                            >
                                                DNF
                                            </div>
                                        ) : (
                                            <div className="w-4 h-4 rounded-full border-2 border-black shadow-sm" style={{ backgroundColor: palette[book.vibe] || '#000' }} />
                                        )}
                                    </div>
                                </button>
                            </div>
                        );
                    })}
                </div>
                {/* --- SMART STATION BUTTON --- */}
                {/* --- UPDATED SMART STATION BUTTONS --- */}
                <div className="mt-6 space-y-4">
                    {!focusedSubjectId ? (
                        <button disabled className="w-full bg-black/10 text-black/20 p-6 rounded-[30px] font-['Londrina_Solid'] text-3xl uppercase font-bold cursor-not-allowed">
                            Select a Subject
                        </button>
                    ) : (() => {
                        // We find the book in ALL your books to check the timer status
                        const currentBook = myBooks.find(b => b.id === focusedSubjectId);
                        const isLive = !!currentBook?.sessionStartedAt;

                        if (!isLive) {
                            return (
                                /* CASE B: START SESSION BUTTON (Black) */
                                <button
                                    onClick={() => handleStartSession(focusedSubjectId)}
                                    className="w-full bg-black text-white p-6 rounded-[30px] font-['Londrina_Solid'] text-3xl uppercase font-bold shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-1 transition-all flex items-center justify-center gap-3"
                                >
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z" /></svg>
                                    Start Session
                                </button>
                            );
                        } else {
                            return (
                                /* CASE C: FINISH BUTTON (The Laser Glow) */
                                <div className="space-y-4">
                                    <div className="relative group">
                                        {/* THE LASER GLOW LAYER */}
                                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-yellow-400 to-pink-500 rounded-[35px] animate-laser-glow blur-[4px] z-0" />

                                        <button
                                            onClick={() => setIsLogging(true)}
                                            className="relative w-full bg-white border-[4px] border-black p-6 rounded-[30px] font-['Londrina_Solid'] text-3xl uppercase font-bold shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all z-10 overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-yellow-400/10 animate-pulse pointer-events-none" />
                                            <span className="relative z-20 flex items-center justify-center gap-3">
                                                <span className="w-3 h-3 bg-yellow-400 border-2 border-black rounded-full animate-ping" />
                                                Finish & Log Data
                                            </span>
                                        </button>
                                    </div>

                                    <button
                                        onClick={(e) => handleCancelSession(e, focusedSubjectId)}
                                        className="w-full font-['Londrina_Solid'] text-sm uppercase opacity-30 hover:opacity-100 py-2 transition-opacity"
                                    >
                                        Reset Live Clock
                                    </button>
                                </div>
                            );
                        }
                    })()}
                </div>
                <button onClick={() => setAppState('garden')} className="w-full font-['Londrina_Solid'] text-xl opacity-30 uppercase text-center mt-6 text-black">Back to Garden</button>
            </div>
        );
    };

    return (
        <>
            {renderMainContent()}

            {/* --- Analysis Modal --- */}
            {selectedBook && (
                <div className="fixed inset-0 bg-[#FDFCF0] z-[100] p-6 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto">
                    <button onClick={() => setSelectedBook(null)} className="absolute top-6 right-6 text-4xl opacity-30 text-black font-bold">✕</button>
                    <div className="flex justify-center gap-4 mb-10 mt-12 relative z-10 text-black text-center text-left">
                        {['review', 'capsule', 'pages'].map(t => (
                            <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-4 border-[4px] border-black rounded-[28px] font-['Londrina_Solid'] uppercase text-xl transition-all ${activeTab === t ? 'bg-black text-white shadow-none translate-y-1' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black font-bold'}`}>{t}</button>
                        ))}
                    </div>
                    <div className="flex flex-col items-center flex-1 pb-10 text-black text-left">
                        {activeTab === 'review' && (
                            <div className="w-full space-y-8 animate-in fade-in">
                                <header>
                                    <h2 className="font-['Londrina_Solid'] text-5xl uppercase leading-none mb-2 font-black text-black">
                                        {String(selectedBook.title)}
                                    </h2>
                                    <p className="font-['Londrina_Solid'] text-xl opacity-40 uppercase font-bold text-black">
                                        {String(selectedBook.author)}
                                    </p>
                                </header>

                                {/* The Conclusion / Findings Box */}
                                <div className="bg-white border-[5px] border-black p-8 rounded-[45px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                                    <h4 className="font-['Londrina_Solid'] text-2xl uppercase mb-3 text-green-600 tracking-tight font-black text-left">
                                        Conclusion
                                    </h4>
                                    <p className="text-xl italic font-medium leading-relaxed text-black">
                                        "{String(selectedBook.review || "Ongoing investigation.")}"
                                    </p>
                                </div>

                                {/* POINT 1: RE-ACTIVATE BUTTON (Only shows for DNF books) */}
                                {selectedBook.status === 'DNF' && (
                                    <div className="mt-8 p-6 border-4 border-dashed border-black/10 rounded-[40px] flex flex-col items-center gap-4 bg-white/50">
                                        <p className="font-['Londrina_Solid'] text-sm opacity-40 uppercase tracking-widest">
                                            Research Discontinued
                                        </p>
                                        <button
                                            onClick={async () => {
                                                const bookRef = doc(db, 'artifacts', platformAppId, 'public', 'data', 'books', selectedBook.id);
                                                await updateDoc(bookRef, {
                                                    status: 'READING'
                                                });
                                                setSelectedBook(null); // Close modal to refresh the lab view
                                            }}
                                            className="w-full bg-yellow-400 border-4 border-black py-4 rounded-[25px] font-['Londrina_Solid'] text-2xl uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all"
                                        >
                                            Re-Activate Subject
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'capsule' && <SedimentaryRecord sessions={selectedBook.sessions || []} bookTitle={selectedBook.title} palette={palette} />}
                        {activeTab === 'pages' && <StratifiedBookFlow sessions={selectedBook.sessions || []} bookTitle={selectedBook.title} totalPages={selectedBook.totalPages} palette={palette} />}
                    </div>
                </div>
            )}

            {/* GAUNTLET INFO TOOLTIP MODAL */}
            {showGauntletInfo && (
                <div
                    className="fixed inset-0 bg-black/60 z-[250] p-6 flex items-center justify-center"
                    onClick={() => setShowGauntletInfo(false)}
                >
                    <div
                        className="bg-white border-[5px] border-black rounded-[40px] p-8 w-full max-w-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in duration-300 relative text-left"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={() => setShowGauntletInfo(false)} className="absolute top-4 right-6 text-2xl font-black opacity-20 hover:opacity-100 transition-opacity">✕</button>
                        <div className="inline-block bg-blue-100 border-2 border-black px-3 py-1 rounded-full mb-4 text-left">
                            <p className="font-['Londrina_Solid'] text-xs uppercase tracking-widest font-black text-black text-left">Experimental Logic</p>
                        </div>
                        <h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none font-black text-black mb-4 text-left">The Gauntlet</h2>
                        <div className="space-y-4 font-sans text-sm leading-relaxed text-black/70 text-left">
                            <p>This station facilitates <span className="font-bold text-black text-left">Priority Ranking</span> through binary comparison.</p>
                            <p className="text-left">Select the subject that holds the highest current research value. The "Champ" will face consecutive challengers until the ultimate priority for the next cycle is established.</p>
                            <p className="italic opacity-60 text-left">Objective: Eliminate decision fatigue through structured head-to-head elimination.</p>
                        </div>
                        <button
                            onClick={() => setShowGauntletInfo(false)}
                            className="w-full bg-black text-white p-4 rounded-2xl font-['Londrina_Solid'] text-xl uppercase mt-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-1 transition-all"
                        >
                            Understood
                        </button>
                    </div>
                </div>
            )}

            {isAddingBook && (
                <AddBookDrawer
                    genres={genres}
                    onCancel={() => setIsAddingBook(false)}
       onSave={async (nb) => {
    if (!user) return;
    const bookData = {
        ...nb,
        status: 'TBR',
        currentPage: 1,
        sessions: [],
        ownerId: user.uid,
        createdAt: serverTimestamp()
    };

    // 1. Write to Legacy Collection
    await addDoc(collection(db, 'artifacts', platformAppId, 'public', 'data', 'books'), bookData);

    // 2. Write to New User-Centric Collection
    // Note: We use the same data object to ensure parity
    await addDoc(collection(db, 'users', user.uid, 'reading_lab', 'books'), bookData);

    setIsAddingBook(false);
}}
                />
            )}

            {isLogging && focusedSubjectId && (
                <ReadingDrawer
                    palette={palette}
                    activeBook={books.find(b => b.id === focusedSubjectId)}
                    onCancel={() => setIsLogging(false)}
                    onSave={handleSaveSession}
                />
            )}
        </>
    );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

const ReadingDrawer = ({ activeBook, onSave, onCancel, palette }) => {
    const startPage = Number(activeBook?.currentPage) || 1;
    const totalPages = Number(activeBook?.totalPages) || 400;
    // B. ADD THIS: Time Formatting Logic
    const startTime = activeBook?.sessionStartedAt?.toDate ? activeBook.sessionStartedAt.toDate() : null;

    // Helper to turn dates into "2:30 PM" format
    const formatTime = (date) => date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

    const startTimeDisplay = formatTime(startTime);
    const endTimeDisplay = formatTime(new Date()); // "Now" is the end time

    const elapsedMinutes = startTime ? Math.round((new Date() - startTime) / 60000) : '';
    const [session, setSession] = useState({
        mode: 'Flow',
        endPage: '',
        // endTime: '10:00',
        emotions: [],
        intensities: {},
        sessionCries: 0,
        conclusion: '',
        minutes: elapsedMinutes
    });

    const toggleEmotion = (emo) => {
        setSession(prev => {
            const currentEmos = prev.emotions || [];
            const currentIntensities = { ...prev.intensities };

            if (currentEmos.includes(emo)) {
                // Remove: Filter out the emotion and delete its intensity data
                const nextEmos = currentEmos.filter(e => e !== emo);
                delete currentIntensities[emo];
                return { ...prev, emotions: nextEmos, intensities: currentIntensities };
            } else if (currentEmos.length < 3) {
                // Add: Push to array and initialize intensity at 3
                currentIntensities[emo] = 3;
                return { ...prev, emotions: [...currentEmos, emo], intensities: currentIntensities };
            }
            return prev;
        });
    };


    const isFinished = Number(session.endPage) >= totalPages;

    const calculateMinutes = () => {
        const [startH, startM] = session.startTime.split(':').map(Number);
        const [endH, endM] = session.endTime.split(':').map(Number);
        let diff = (endH * 60 + endM) - (startH * 60 + startM);
        return diff < 0 ? diff + 1440 : diff;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const minutes = Number(session.minutes);
        if (!session.endPage || !activeBook || minutes <= 0) return;
        onSave({ ...session, emotions: session.emotions, startPage, endPage: Number(session.endPage), minutes, isFinished });
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 z-[200] p-6 flex items-end justify-center text-left text-black"
            onClick={onCancel}
        >
            <div
                className="bg-[#FDFCF0] border-[5px] border-black rounded-[40px] p-8 w-full max-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-y-auto max-h-[95vh] text-black"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between mb-8 text-black">
                    <div>
                        <h2 className="font-['Londrina_Solid'] text-4xl uppercase leading-none font-black text-left text-black">Log Session</h2>
                        <p className="font-['Londrina_Solid'] text-lg opacity-40 uppercase truncate font-bold text-left text-black">{String(activeBook?.title)}</p>
                    </div>
                    <button onClick={onCancel} className="text-2xl font-black text-black text-left">✕</button>
                </header>

                <form onSubmit={handleSubmit} className="space-y-5 text-left text-black text-left">
                    {
                        <div className="flex bg-white border-4 border-black p-1 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
                            {['Flow', 'Fragmented'].map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setSession({ ...session, mode: m })}
                                    className={`flex-1 py-2 rounded-xl font-['Londrina_Solid'] uppercase text-lg transition-all ${session.mode === m
                                        ? 'bg-black text-white shadow-inner'
                                        : 'text-black opacity-30 hover:opacity-100'
                                        }`}
                                >
                                    {m === 'Flow' ? 'Relaxed' : 'Busy'}
                                </button>
                            ))}
                        </div>
                    }
                    <div className="grid grid-cols-2 gap-4 text-black text-left">
                        <div className="bg-slate-100 border-4 border-black/10 p-3 rounded-2xl opacity-60 text-left text-black text-left">
                            <label className="text-[10px] font-black block uppercase text-black text-left">Start Page</label>
                            <div className="font-['Londrina_Solid'] text-2xl text-black text-left">{Number(startPage)}</div>
                        </div>
                        <div className={`bg-white border-4 p-3 rounded-2xl transition-all ${isFinished ? 'border-green-500 shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]' : 'border-black'} text-left text-black text-left`}>
                            <label className="text-[10px] font-black block uppercase text-black text-left">End Page</label>
                            <input
                                required
                                type="number"
                                placeholder={`${totalPages} max`}
                                className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none font-black text-black placeholder:opacity-20 text-left"
                                value={session.endPage}
                                onChange={e => setSession({ ...session, endPage: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* --- STEP 3: THE TIMELINE SUMMARY --- */}
                    <div className="bg-slate-100 border-4 border-black/10 p-4 rounded-2xl opacity-60 mb-4">
                        <label className="text-[10px] font-black block uppercase opacity-50 mb-1">Observation Timeline</label>
                        <div className="flex justify-between items-center">
                            <div className="text-left">
                                <span className="text-[8px] font-black uppercase block opacity-40">Start</span>
                                <span className="font-['Londrina_Solid'] text-2xl uppercase">{startTimeDisplay}</span>
                            </div>
                            <div className="w-8 h-[2px] bg-black/20" />
                            <div className="text-right">
                                <span className="text-[8px] font-black uppercase block opacity-40">Current End</span>
                                <span className="font-['Londrina_Solid'] text-2xl uppercase">{endTimeDisplay}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <label className="text-[10px] font-black uppercase opacity-50 block mb-1">Minutes Observed</label>
                        <input
                            type="number"
                            className="w-full bg-transparent font-['Londrina_Solid'] text-4xl focus:outline-none"
                            value={session.minutes}
                            onChange={e => setSession({ ...session, minutes: e.target.value })}
                        />
                    </div>

                    <div className="bg-white border-4 border-black p-3 rounded-2xl flex items-center justify-between text-black text-left">
                        <label className="text-[10px] font-black uppercase opacity-40 text-black text-left">Cries this session?</label>
                        <div className="flex items-center gap-3 text-black">
                            <button
                                type="button"
                                onClick={() => setSession(p => ({ ...p, sessionCries: Math.max(0, p.sessionCries - 1) }))}
                                className="w-8 h-8 border-[3px] border-black rounded-full flex items-center justify-center font-black text-xl leading-none bg-white text-black active:scale-90 transition-transform"
                            >
                                −
                            </button>                            <span className="font-['Londrina_Solid'] text-xl font-black text-black text-left text-left">{session.sessionCries}</span>
                            <button
                                type="button"
                                onClick={() => setSession(p => ({ ...p, sessionCries: p.sessionCries + 1 }))}
                                className="w-8 h-8 border-[3px] border-black rounded-full flex items-center justify-center font-black text-xl leading-none bg-white text-black active:scale-90 transition-transform"
                            >
                                +
                            </button>                        </div>
                    </div>

                    {/* Expressive Emotion Selection */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {['Warmth', 'Joy', 'Sad', 'Intrigue', 'Funny', 'Smut', 'Fast', 'Scared', 'Cool', 'Peace', 'Meh'].map(emo => {
                            const rank = (session.emotions || []).indexOf(emo) + 1;
                            return (
                                <button
                                    key={emo}
                                    type="button"
                                    onClick={() => toggleEmotion(emo)}
                                    className={`relative px-4 py-2 border-2 border-black rounded-xl text-[10px] font-black uppercase transition-all ${rank > 0 ? 'bg-black text-white scale-105' : 'bg-white opacity-40 text-black'
                                        }`}
                                >
                                    {emo}
                                    {rank > 0 && (
                                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 text-black border-2 border-black rounded-full flex items-center justify-center text-[10px] font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            {rank}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Consolidated Intensity Lab Card */}
                    {session.emotions.length > 0 && (
                        <div className="bg-white border-[5px] border-black rounded-[40px] p-6 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in duration-200">
                            <h4 className="font-['Londrina_Solid'] text-xs uppercase opacity-30 mb-6 tracking-[0.2em] font-black">Magnitude Vector</h4>

                            <div className="space-y-8">
                                {session.emotions.map((emo, index) => (
                                    <div key={emo} className="relative">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                {/* Smaller, more integrated Rank Bubble */}
                                                <div className="w-6 h-6 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center font-black text-[10px]">
                                                    {index + 1}
                                                </div>
                                                <span className="font-['Londrina_Solid'] text-lg uppercase font-black">{emo}</span>
                                            </div>
                                            <span className="font-['Londrina_Solid'] text-xl font-black opacity-60">
                                                {session.intensities[emo]}
                                            </span>
                                        </div>

                                        <input
                                            type="range"
                                            min="1"
                                            max="5"
                                            step="1"
                                            value={session.intensities[emo] || 3}
                                            onChange={(e) => setSession({
                                                ...session,
                                                intensities: { ...session.intensities, [emo]: parseInt(e.target.value) }
                                            })}
                                            className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-black
                                   [&::-webkit-slider-thumb]:appearance-none 
                                   [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 
                                   [&::-webkit-slider-thumb]:bg-yellow-400 [&::-webkit-slider-thumb]:border-[3px] 
                                   [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:rounded-full 
                                   [&::-webkit-slider-thumb]:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                                        />

                                        {/* Visual Divider between items (except the last one) */}
                                        {index < session.emotions.length - 1 && (
                                            <div className="absolute -bottom-4 left-0 right-0 h-[2px] bg-black/5 rounded-full" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* <div className="bg-white border-4 border-black p-4 rounded-2xl text-black text-left text-left text-left">
                        <label className="text-[10px] font-black opacity-30 uppercase block mb-1 text-black text-left text-left">Intensity (1-5)</label>
                        <input type="range" min="1" max="5" step="1" className="w-full accent-black text-black text-left" value={session.intensity} onChange={e => setSession({ ...session, intensity: e.target.value })} />
                    </div> */}
                    {isFinished && (
                        <div className="bg-white border-4 border-green-500 p-3 rounded-2xl animate-in slide-in-from-top text-black text-left text-left text-left">
                            <label className="text-[10px] font-black text-green-700 uppercase block mb-1 text-left">Conclusion</label>
                            <textarea required placeholder="Final experimental thoughts..." className="w-full bg-transparent font-sans text-sm focus:outline-none min-h-[60px] resize-none leading-tight text-black text-left text-left" value={session.conclusion} onChange={e => setSession({ ...session, conclusion: e.target.value })} />
                        </div>
                    )}

                    <button type="submit" className="w-full bg-black text-white p-5 rounded-3xl font-['Londrina_Solid'] text-2xl uppercase font-black shadow-[6px_6px_0px_0px_rgba(100,100,100,1)] active:translate-y-1 text-center">Save Observation</button>
                </form>
            </div>
        </div>
    );
};

const AddBookDrawer = ({ onSave, onCancel, genres }) => {
    const [nb, setNb] = useState({ title: '', author: '', totalPages: '', vibe: 'Wonder', genre: [], suggestedBy: '', cries: 0, introduction: '' });
    const toggleGenre = (g) => { setNb(prev => ({ ...prev, genre: prev.genre.includes(g) ? prev.genre.filter(item => item !== g) : [...prev.genre, g] })); };
    return (
        <div
            className="fixed inset-0 bg-black/60 z-[200] p-6 flex items-end justify-center text-left text-black"
            onClick={onCancel}
        >
            <div
                className="bg-[#FDFCF0] border-[5px] border-black rounded-[40px] p-8 w-full max-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-y-auto max-h-[95vh] text-black text-left"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="font-['Londrina_Solid'] text-4xl uppercase mb-6 font-black text-left text-black">Subject Registration</h2>
                <form onSubmit={(e) => { e.preventDefault(); onSave(nb); }} className="space-y-4 text-left text-black">
                    <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between text-black text-left text-left text-left">
                        <label className="text-[10px] uppercase font-black opacity-40 text-black text-left text-left">Cries Hypothesis</label>
                        <div className="flex items-center justify-between font-bold text-black text-left text-left">
                            {/* Minus Button */}
                            <button
                                type="button"
                                onClick={() => setNb(p => ({ ...p, cries: Math.max(0, p.cries - 1) }))}
                                className="w-12 h-12 border-[4px] border-black rounded-full flex items-center justify-center text-2xl font-black leading-none bg-white text-black active:bg-black active:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                                <span className="mb-1">−</span> {/* Using a proper minus sign and tiny margin can help optical centering */}
                            </button>

                            <span className="font-['Londrina_Solid'] text-5xl font-black text-black">{nb.cries}</span>
                            {/* Plus Button */}
                            <button
                                type="button"
                                onClick={() => setNb(p => ({ ...p, cries: p.cries + 1 }))}
                                className="w-12 h-12 border-[4px] border-black rounded-full flex items-center justify-center text-2xl font-black leading-none bg-white text-black active:bg-black active:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                                <span className="mb-0.5">+</span>
                            </button>                      </div>
                    </div>
                    <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left text-black text-left text-left"><label className="text-[10px] uppercase font-black opacity-40 text-left text-black text-left text-left">Title</label><input required className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none font-black text-black text-left text-left" value={nb.title} onChange={e => setNb({ ...nb, title: e.target.value })} /></div>
                    <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left text-black text-left text-left"><label className="text-[10px] uppercase font-black opacity-40 text-left text-black text-left text-left">Author</label><input required className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none font-black text-black text-left text-left" value={nb.author} onChange={e => setNb({ ...nb, author: e.target.value })} /></div>

                    <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left text-black text-left text-left text-left">
                        <label className="text-[10px] uppercase font-black opacity-40 text-left text-black text-left text-left text-left">Hypothesis (Intro)</label>
                        <textarea required className="w-full bg-transparent text-sm h-20 resize-none font-black text-black text-left text-left" value={nb.introduction} onChange={e => setNb({ ...nb, introduction: e.target.value })} />
                    </div>

                    <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left text-black text-left text-left text-left">
                        <label className="text-[10px] uppercase font-black opacity-40 text-left text-black text-left text-left text-left">Suggested By</label>
                        <input className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none font-black text-black text-left text-left" value={nb.suggestedBy} onChange={e => setNb({ ...nb, suggestedBy: e.target.value })} />
                    </div>

                    <div className="bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left text-black text-left text-left text-left"><label className="text-[10px] uppercase font-black opacity-40 text-left text-black text-left text-left text-left">Total Pages</label><input required type="number" className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none font-black text-black text-left text-left" value={nb.totalPages} onChange={e => setNb({ ...nb, totalPages: e.target.value })} /></div>
                    <div className="flex flex-wrap gap-1 mt-2 text-black text-left text-left text-left">{genres.map(g => (<button key={g} type="button" onClick={() => toggleGenre(g)} className={`px-2 py-1 border-2 border-black rounded-lg text-[8px] font-black uppercase transition-all ${nb.genre.includes(g) ? 'bg-blue-500 text-white' : 'bg-white opacity-40 text-black'}`}>{g}</button>))}</div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 pt-2 text-left text-left">
                        <button type="submit" className="w-full bg-black text-white p-5 rounded-3xl font-['Londrina_Solid'] text-2xl uppercase font-black shadow-[6px_6px_0px_0px_rgba(100,100,100,1)] active:translate-y-1 text-center">
                            Inject Archive
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="w-full bg-white border-4 border-black p-4 rounded-3xl font-['Londrina_Solid'] text-xl uppercase font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 text-center text-left text-left"
                        >
                            Abort
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// const BookGridItem = ({ book, onSelect, onDelete, currentUserId, palette, isLive, onStartSession, onCancelSession, onFinishSession }) => (
//     <div className="relative group">
//         <button
//             /* FIX: Ensure newly added books (TBR) are also clickable to view analysis/registration data */
//             onClick={() => (book.status === 'FINISHED' || book.status === 'READING' || book.status === 'DNF' || book.status === 'TBR') && onSelect(book)}
//             className={`relative w-full aspect-[1/1.25] border-black border-[4px] rounded-[24px] p-3 text-left flex flex-col justify-between transition-all active:scale-95 overflow-hidden 
//     ${isLive ? 'bg-white ring-4 ring-yellow-400 shadow-[8px_8px_0px_0px_#facc15]' :
//                     book.status === 'FINISHED' ? 'bg-green-50 shadow-[8px_8px_0px_0px_#22c55e]' :
//                         book.status === 'READING' ? 'bg-blue-50 shadow-[8px_8px_0px_0px_#3b82f6]' :
//                             'bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'}`}        >
//             {book.status === 'DNF' && <div className="absolute inset-0 dnf-stripes z-0 pointer-events-none text-left text-left" />}
//             {book.status === 'FINISHED' && (
//                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 text-left text-left">
//                     <svg width="80%" height="80%" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-10 -rotate-12">
//                         <polyline points="20 6 9 17 4 12" />
//                     </svg>
//                 </div>
//             )}
//             {/* --- STEP 3: THE LIVE INDICATOR --- */}
//             {isLive && (
//                 <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black px-1.5 py-0.5 rounded-full flex items-center gap-1 z-20 animate-bounce shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
//                     {/* Pulsing Red Dot */}
//                     <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse border border-black/20" />
//                     {/* Label */}
//                     <span className="font-black text-[7px] uppercase tracking-tighter text-black">LIVE</span>
//                 </div>
//             )}
//             <div className="flex flex-col gap-1 z-10 text-black text-left text-left text-left">
//                 <div className="flex justify-between items-center text-left text-left text-left">
//                     <div className="font-['Londrina_Solid'] uppercase text-[8px] tracking-widest text-black/30 text-left text-left text-left">{String(book.status)}</div>
//                     <div className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${book.ownerId === currentUserId ? 'bg-black text-white' : 'bg-slate-100 text-black'}`}>{book.ownerId === currentUserId ? 'My Lab' : 'Peer'}</div>
//                 </div>
//             </div>
//             <div className="z-10 text-black text-left text-left text-left">
//                 <h3 className="font-['Londrina_Solid'] text-lg uppercase leading-none mb-1 line-clamp-2 text-left text-left text-left text-left">{String(book.title)}</h3>
//                 <p className="font-['Londrina_Solid'] text-[10px] opacity-40 uppercase truncate text-left text-left text-left text-left">{String(book.author)}</p>
//             </div>
//             <div className="flex justify-between items-center z-10 text-black text-left text-left text-left">
//                 {book.status === 'DNF' ? (
//                     <div className="bg-yellow-400 text-black px-2 py-0.5 rounded-md border-2 border-black font-black text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase text-center font-black text-left text-left">DNF</div>
//                 ) : book.status === 'FINISHED' ? (
//                     <div className="bg-green-500 text-black px-2 py-0.5 rounded-md border-2 border-black font-black text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase text-center font-black text-left text-left">FINISHED</div>
//                 ) : book.status === 'READING' ? (
//                     <div className="bg-blue-400 text-black px-2 py-0.5 rounded-md border-2 border-black font-black text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase text-center font-black text-left text-left">CURRENT</div>
//                 ) : (
//                     <div className="w-3.5 h-3.5 rounded-full border-2 border-black shadow-sm" style={{ backgroundColor: palette[book.vibe] || '#000' }} />
//                 )}
//                 {Number(book.cries) > 0 && <span className="text-[10px] font-black opacity-40 text-black text-left text-left text-left text-left">💧 {Number(book.cries)}</span>}
//             </div>
//             {/* --- STEP 4: SESSION INTERACTION BUTTONS --- */}
//             <div className="mt-3 flex gap-1.5 z-20">
//                 {!isLive ? (
//                     /* 1. Only show "Start" for books you are currently reading */
//                     book.status === 'READING' && (
//                         <button
//                             type="button"
//                             onClick={(e) => {
//                                 e.stopPropagation(); // CRITICAL: Prevents opening the book details
//                                 onStartSession();
//                             }}
//                             className="flex-1 bg-black text-white py-2 rounded-[14px] font-['Londrina_Solid'] text-xs uppercase shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)] active:translate-y-0.5 transition-all"
//                         >
//                             Start Lab
//                         </button>
//                     )
//                 ) : (
//                     /* 2. Show Finish and Reset buttons when clock is ticking */
//                     <>
//                         <button
//                             type="button"
//                             onClick={(e) => {
//                                 e.stopPropagation(); // CRITICAL
//                                 onFinishSession();
//                             }}
//                             className="flex-[2] bg-yellow-400 text-black py-2 rounded-[14px] font-['Londrina_Solid'] text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
//                         >
//                             Finish Trial
//                         </button>
//                         <button
//                             type="button"
//                             onClick={(e) => {
//                                 e.stopPropagation(); // CRITICAL
//                                 onCancelSession(e);
//                             }}
//                             className="flex-1 bg-white text-black py-2 rounded-[14px] font-black text-[8px] uppercase border-2 border-black opacity-40 hover:opacity-100 hover:bg-red-50"
//                         >
//                             Reset
//                         </button>
//                     </>
//                 )}
//             </div>
//         </button>
//         {/* CLEAN SLATE ACTION: Allows manual deletion of subjects */}
//         <button
//             onClick={(e) => { e.stopPropagation(); onDelete(book.id); }}
//             className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full border-2 border-black flex items-center justify-center font-black text-[10px] shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 active:translate-y-0.5"
//         >
//             ✕
//         </button>
//     </div>
// );

const BookGridItem = ({ book, onSelect, onDelete, palette, isLive }) => (
    <div className="relative">
        {/* PERSISTENT MOBILE DELETE BUTTON */}
        <button
            onClick={(e) => {
                e.stopPropagation(); // Guardrail: Prevents triggering the card's main onSelect 
                if (window.confirm("Permanently delete this subject?")) onDelete(book.id);
            }}
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full border-[3px] border-black flex items-center justify-center font-black text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] z-30 active:scale-75 transition-transform"
            aria-label="Delete Book"
        >
            ✕
        </button>

        <button
            onClick={() => onSelect(book)}
            className={`relative w-full aspect-[1/1.25] border-black border-[4px] rounded-[35px] p-4 text-left flex flex-col justify-between transition-all active:scale-95 overflow-hidden 
                ${isLive ? 'bg-white ring-4 ring-yellow-400 shadow-[8px_8px_0px_0px_#facc15]' :
                    book.status === 'FINISHED' ? 'bg-green-50 shadow-[8px_8px_0px_0px_#22c55e]' :
                        'bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'}`}
        >
            {/* DNF Visual Overlay [cite: 6, 7] */}
            {book.status === 'DNF' && <div className="absolute inset-0 dnf-stripes z-0 opacity-10 pointer-events-none" />}

            <div className="z-10">
                <h3 className="font-['Londrina_Solid'] text-xl uppercase leading-none mb-1 line-clamp-2">{String(book.title)}</h3>
                <p className="font-['Londrina_Solid'] text-xs opacity-40 uppercase truncate">{String(book.author)}</p>
            </div>

            <div className="flex justify-between items-center z-10">
                {/* Status Pills [cite: 7] */}
                {book.status === 'DNF' ? (
                    <div className="bg-yellow-400 text-black px-2 py-0.5 rounded-md border-2 border-black font-black text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">DNF</div>
                ) : book.status === 'FINISHED' ? (
                    <div className="bg-green-500 text-black px-2 py-0.5 rounded-md border-2 border-black font-black text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">FINISHED</div>
                ) : book.status === 'READING' ? (
                    <div className="bg-blue-400 text-black px-2 py-0.5 rounded-md border-2 border-black font-black text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">CURRENT</div>
                ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-black shadow-sm" style={{ backgroundColor: palette[book.vibe] || '#000' }} />
                )}

                {/* Magnitude/Cries Indicator [cite: 57] */}
                {Number(book.cries) > 0 && <span className="text-[10px] font-black opacity-40">💧 {Number(book.cries)}</span>}
            </div>
        </button>
    </div>
);

const BattleCard = ({ book, onClick, label, isSelectionWinner }) => {
    if (!book) return null;
    return (
        <div className="relative w-full text-black text-left text-left text-left">{isSelectionWinner && <div className="absolute -inset-3 bg-gradient-to-r from-blue-500 via-pink-500 to-yellow-500 rounded-[45px] animate-laser-glow blur-[2px] z-0 text-left text-left" />}<button onClick={onClick} className={`relative w-full bg-white border-[4px] border-black rounded-[35px] text-left flex flex-col p-5 transition-all active:scale-95 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-10 ${isSelectionWinner ? 'scale-105 border-transparent' : ''}`}><span className="text-[10px] uppercase font-bold opacity-30 tracking-widest text-left text-left text-left">{String(label)}</span><h3 className="font-['Londrina_Solid'] text-2xl uppercase leading-tight line-clamp-1 font-black text-left text-left text-left text-left">{String(book.title)}</h3><p className="font-['Londrina_Solid'] text-lg opacity-40 uppercase truncate text-black text-left text-left text-left text-left">{String(book.author)}</p></button></div>
    );
};

const SedimentaryRecord = ({ sessions = [], bookTitle = "Book Title", palette }) => (
    <div className="w-full animate-in fade-in zoom-in duration-300 text-left text-left">
        <div className="bg-white border-[5px] border-black rounded-[45px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col text-black text-left text-left">
            <div className="mb-6 text-left text-left text-left"><h3 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight text-black text-left text-left text-left text-left">{String(bookTitle)}</h3><p className="font-['Londrina_Solid'] text-[10px] opacity-40 uppercase tracking-[0.2em] font-bold mt-1 text-left text-left text-left text-left">Emotional Stratigraphy</p></div>
            <div className="bg-[#f9f8f4] border-2 border-dashed border-black/10 rounded-[35px] p-10 flex items-center justify-center min-h-[350px] text-left text-left">
                <div className="flex flex-col-reverse w-16 border-[5px] border-black rounded-full overflow-hidden bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-[280px] text-left text-left">
                    {(sessions || []).map((session, i) => (
                        <div key={i} style={{ height: `${Math.min(Number(session.minutes) || 10, 100)}%`, backgroundColor: palette[session.emotion] || '#000', opacity: 0.4 + (Number(session.intensity || 3) * 0.12), borderTop: '2px solid rgba(0,0,0,0.1)' }} className="w-full transition-all text-left text-left" />
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const StratifiedBookFlow = ({ sessions = [], bookTitle = "Book Title", totalPages = 400, pagesPerRow = 50, palette }) => {
    const totalRows = Math.ceil(Number(totalPages) / pagesPerRow);
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
            <div key={rowIdx} className="w-full h-4 mb-3 last:mb-0 bg-white/50 border-2 border-black/5 rounded-full overflow-hidden flex relative text-left text-left text-left">
                {rowSegments.map((seg, i) => {
                    const widthPct = ((Math.min(seg.end, rowEnd) - Math.max(seg.start, rowStart)) / pagesPerRow) * 100;
                    return <div key={i} style={{ width: `${widthPct}%`, backgroundColor: palette[seg.emotion] }} className="h-full border-r border-black/5 last:border-0 text-left text-left text-left text-left" />;
                })}
            </div>
        );
    };



    return (
        <div className="w-full animate-in slide-in-from-right duration-300 text-black text-left text-left">
            <div className="bg-white border-[5px] border-black rounded-[45px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col text-black text-left text-left text-left">
                <div className="mb-6 text-left text-left text-left text-left"><h3 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight text-black text-left text-left text-left text-left">{String(bookTitle)}</h3><p className="font-['Londrina_Solid'] text-[10px] opacity-40 uppercase tracking-[0.2em] font-bold mt-1 text-left text-left text-left text-left text-left text-black text-left text-left">Visual Page Progress</p></div>
                <div className="bg-[#f9f8f4] border-2 border-dashed border-black/10 rounded-[35px] p-8 flex items-center justify-center min-h-[350px] text-left text-left">
                    <div className="relative w-full max-w-[340px] flex shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-xl border-[4px] border-black bg-white overflow-hidden text-left text-left text-left text-left">
                        <div className="w-1/2 p-4 border-r-2 border-black/20 relative shadow-inner text-black text-left text-left text-left text-left text-left text-left text-left">{[...Array(Math.max(0, leftPageRows))].map((_, i) => renderRowPill(i))}</div>
                        <div className="w-1/2 p-4 relative shadow-inner text-black text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">{[...Array(Math.max(0, totalRows - leftPageRows))].map((_, i) => renderRowPill(i + leftPageRows))}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};