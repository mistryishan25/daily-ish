// ==========================================
// SECTION 2: READING LAB (Save as ReadingLab.jsx)
// ==========================================

const ReadingLab = ({ 
  books, user, setAppState, setFocusedSubjectId, focusedSubjectId, 
  setIsLogging, handleStartReading, readingList 
}) => {
  return (
    <div className="fixed inset-0 bg-[#FDFCF0] z-40 p-8 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto">
      <header className="flex justify-between items-start mb-10">
        <div className="text-left">
          <h2 className="font-['Londrina_Solid'] text-5xl uppercase leading-none">Reading Lab</h2>
          <p className="font-['Londrina_Solid'] text-xl opacity-30 uppercase tracking-tight font-bold">Active Station</p>
        </div>
        <button onClick={() => setAppState('library')} className="w-14 h-14 bg-white border-[4px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all">📚</button>
      </header>
      <div className="flex-1 space-y-4">
        {readingList.map(book => (
          <button key={book.id} onClick={() => setFocusedSubjectId(book.id)} className={`w-full bg-white border-4 border-black p-5 rounded-[30px] flex items-center justify-between text-left transition-all ${focusedSubjectId === book.id ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-blue-500 scale-[1.02]' : 'opacity-50 grayscale shadow-none'}`}>
            <div><p className="font-['Londrina_Solid'] text-2xl uppercase leading-none font-black">{String(book.title)}</p><p className="text-[10px] font-black opacity-30 mt-1 uppercase">Page {Number(book.currentPage)}/{Number(book.totalPages)}</p></div>
            {focusedSubjectId === book.id ? (
              <div onClick={(e) => { e.stopPropagation(); updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'books', book.id), { status: 'DNF' }); }} className="bg-yellow-400 text-black px-5 py-2.5 rounded-2xl border-[3px] border-black font-black text-xl uppercase text-center active:scale-90 transition-all">DNF</div>
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-black shadow-sm" style={{ backgroundColor: palette[book.vibe] || '#000' }} />
            )}
          </button>
        ))}
      </div>
      <button onClick={() => setIsLogging(true)} disabled={!focusedSubjectId} className="w-full bg-black text-white p-6 rounded-[30px] font-['Londrina_Solid'] text-3xl uppercase mt-6 disabled:opacity-20 font-bold">Log Observation</button>
      <button onClick={() => setAppState('garden')} className="w-full font-['Londrina_Solid'] text-xl opacity-30 uppercase text-center mt-6">Back to Garden</button>
    </div>
  );
};

// Internal components for ReadingLab.jsx
const SedimentaryRecord = ({ sessions = [], bookTitle = "Book Title" }) => (
  <div className="w-full animate-in fade-in zoom-in duration-300">
    <div className="bg-white border-[5px] border-black rounded-[45px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col text-black">
      <div className="mb-6 text-left"><h3 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight">{String(bookTitle)}</h3><p className="font-['Londrina_Solid'] text-[10px] opacity-40 uppercase tracking-[0.2em] font-bold mt-1">Emotional Stratigraphy</p></div>
      <div className="bg-[#f9f8f4] border-2 border-dashed border-black/10 rounded-[35px] p-10 flex items-center justify-center min-h-[350px]">
        <div className="flex flex-col-reverse w-16 border-[5px] border-black rounded-full overflow-hidden bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-[280px]">
          {(sessions || []).map((session, i) => (
            <div key={i} style={{ height: `${Math.min(Number(session.minutes) || 10, 100)}%`, backgroundColor: palette[session.emotion] || '#000', opacity: 0.4 + (Number(session.intensity || 3) * 0.12), borderTop: '2px solid rgba(0,0,0,0.1)' }} className="w-full transition-all" />
          ))}
        </div>
      </div>
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
    <div className="w-full animate-in slide-in-from-right duration-300 text-black">
      <div className="bg-white border-[5px] border-black rounded-[45px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col text-black">
        <div className="mb-6 text-black text-left"><h3 className="font-['Londrina_Solid'] text-4xl uppercase leading-none tracking-tight text-black">{String(bookTitle)}</h3><p className="font-['Londrina_Solid'] text-[10px] opacity-40 uppercase tracking-[0.2em] font-bold mt-1 text-black">Visual Page Progress</p></div>
        <div className="bg-[#f9f8f4] border-2 border-dashed border-black/10 rounded-[35px] p-8 flex items-center justify-center min-h-[350px]">
          <div className="relative w-full max-w-[340px] flex shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-xl border-[4px] border-black bg-white overflow-hidden text-black text-left">
            <div className="w-1/2 p-4 border-r-2 border-black/20 relative shadow-inner">{[...Array(Math.max(0, leftPageRows))].map((_, i) => renderRowPill(i))}</div>
            <div className="w-1/2 p-4 relative shadow-inner">{[...Array(Math.max(0, totalRows - leftPageRows))].map((_, i) => renderRowPill(i + leftPageRows))}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
