"use client";
import React, { useState } from 'react';

/**
 * EnduranceLab.jsx
 * 2-Step Station Navigation with Bento Protocols & Unboxed Edge PR Streak Spine
 */

export default function EnduranceLab({
    user,
    db,
    appState,
    setAppState,
    triathlonLogs = [],
    onBack
}) {
    // 1. Initial State starts at null (4 Main Bento Cards Menu)
    const [selectedStation, setSelectedStation] = useState(null);
    const [viewMode, setViewMode] = useState('protocol'); // 'protocol' or 'poolside'
    const [isAddingTool, setIsAddingTool] = useState(false);

    // Active PR value & Milestones (Top-to-Bottom: Highest target to lowest)
    const currentStreakValue = 15;
    const streakMilestones = [50, 30, 15, 7, 1];

    // Goals & Plan state
    const [goals, setGoals] = useState([
        {
            id: 'swim_g1',
            station: 'Swim',
            title: 'Sub-25 Min 1,500m Continuous',
            targetMetric: '1500m',
            deadline: '2026-09-15',
            status: 'active',
            plan: {
                name: 'Aerobic Endurance & Paddle Pyramid',
                tools: [
                    { id: 't1', phase: 'Warmup', type: 'distance', label: 'Easy Freestyle', value: '200m', details: 'Focus on long glide' },
                    { id: 't2', phase: 'Warmup', type: 'gear', label: 'Kickboard Kicks', value: '2 x 50m', details: 'High hip position' },
                    { id: 't3', phase: 'Main Set', type: 'volume', label: 'Pyramid Pace Sets', value: '4 x 100m', details: 'Target 1:40/100m pace' },
                    { id: 't4', phase: 'Main Set', type: 'gear', label: 'Hand Paddles & Pull Buoy', value: '300m', details: 'Breathe every 3 strokes' },
                    { id: 't5', phase: 'Main Set', type: 'rest', label: 'Rest Interval', value: '30s Rest', details: 'Between each 100m set' },
                    { id: 't6', phase: 'Cooldown', type: 'distance', label: 'Easy Backstroke / Breast', value: '100m', details: 'Heart rate recovery' }
                ]
            }
        }
    ]);

    const [completedTools, setCompletedTools] = useState({});
    const [restTimer, setRestTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // Form states for Tool Builder
    const [toolPhase, setToolPhase] = useState('Main Set');
    const [toolType, setToolType] = useState('distance');
    const [toolLabel, setToolLabel] = useState('');
    const [toolValue, setToolValue] = useState('');
    const [toolDetails, setToolDetails] = useState('');

    const activeSwimGoal = goals.find(g => g.station === 'Swim') || goals[0];

    // Back button behavior: Station page -> 4-card menu -> Main HQ Dashboard
    const handleClose = () => {
        if (selectedStation) {
            setSelectedStation(null);
        } else if (onBack) {
            onBack();
        } else if (setAppState) {
            setAppState('garden');
        }
    };

    const toggleToolCompletion = (toolId) => {
        setCompletedTools(prev => ({
            ...prev,
            [toolId]: !prev[toolId]
        }));
    };

    const startRestTimer = (seconds) => {
        setRestTimer(seconds);
        setIsTimerRunning(true);
        const interval = setInterval(() => {
            setRestTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setIsTimerRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleAddToolBlock = (e) => {
        e.preventDefault();
        if (!toolLabel || !toolValue) return;

        const newTool = {
            id: `tool_${Date.now()}`,
            phase: toolPhase,
            type: toolType,
            label: toolLabel,
            value: toolValue,
            details: toolDetails
        };

        setGoals(prev => prev.map(g => {
            if (g.id === activeSwimGoal.id) {
                return {
                    ...g,
                    plan: { ...g.plan, tools: [...g.plan.tools, newTool] }
                };
            }
            return g;
        }));

        setToolLabel('');
        setToolValue('');
        setToolDetails('');
        setIsAddingTool(false);
    };

    const stations = [
        { name: 'Swim', icon: '🏊' },
        { name: 'Bike', icon: '🚴' },
        { name: 'Run', icon: '🏃' },
        { name: 'Brick', icon: '🧱' }
    ];

    return (
<div className="max-w-5xl mx-auto pt-4 md:pt-6 pl-1 pr-2 md:px-4 animate-in fade-in pb-20 relative text-left">
            {/* HEADER */}
<header className="flex justify-between items-center mb-6 md:mb-8 pr-20 md:pr-36">                <div>
                    <h2 className="font-['Londrina_Solid'] text-6xl uppercase text-black leading-none">
                        Endurance Lab
                    </h2>
                    <p className="font-['Londrina_Solid'] text-lg opacity-40 uppercase tracking-tight font-bold">
                        {selectedStation ? `${selectedStation} Station Protocol` : 'Physical Conditioning HQ'}
                    </p>
                </div>

                <button
                    onClick={handleClose}
                    className="w-12 h-12 bg-white border-4 border-black rounded-2xl font-black text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all text-black flex items-center justify-center shrink-0"
                >
                    ✕
                </button>
            </header>

            {/* ========================================================= */}
            {/* STEP 1: INITIAL 4-CARD BENTO GRID MENU                    */}
            {/* ========================================================= */}
            {!selectedStation && (
                <div className="space-y-6 max-w-md mx-auto">
                    <div className="grid grid-cols-2 gap-4">
                        {stations.map((s) => (
                            <div
                                key={s.name}
                                onClick={() => setSelectedStation(s.name)}
                                className="bg-white border-[4px] border-black rounded-[35px] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:scale-[1.02] active:translate-y-1 transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="text-4xl mb-3">{s.icon}</div>
                                <h3 className="font-['Londrina_Solid'] text-3xl uppercase text-black leading-none">{s.name}</h3>
                                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mt-2">Open Station →</p>
                            </div>
                        ))}
                    </div>

                    {/* RECENT TRIALS SUMMARY */}
                    <div className="bg-white border-[4px] border-black rounded-[35px] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black">
                        <h4 className="font-['Londrina_Solid'] text-xl uppercase mb-3 opacity-40">Recent Trials</h4>
                        {triathlonLogs.length > 0 ? (
                            triathlonLogs.slice(0, 3).map((log, i) => (
                                <div key={i} className="flex justify-between border-b-2 border-black/5 pb-2 uppercase font-black text-xs">
                                    <span>{log.type || 'Trial'}</span>
                                    <span>{log.distance || '0'} KM</span>
                                </div>
                            ))
                        ) : (
                            <p className="font-['Londrina_Solid'] text-base opacity-30 uppercase text-center py-2">No completed sessions logged yet.</p>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* STEP 2: ACTIVE STATION PROTOCOL & VERTICAL STREAK SPINE    */}
            {/* ========================================================= */}
            {selectedStation && (
                <div className="flex gap-6 items-start relative min-h-[80vh]">

                    {/* LEFT CONTENT AREA: BENTO BOXES & CHEAT SHEET */}
                    <div className="flex-1 space-y-4 md:space-y-6 pr-20 md:pr-36">
                        {/* VIEW MODE SWITCHER TABS */}
                        <div className="flex bg-white border-[4px] border-black p-1 rounded-[25px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <button
                                onClick={() => setViewMode('protocol')}
                                className={`flex-1 py-2.5 rounded-[18px] font-['Londrina_Solid'] uppercase text-lg transition-all ${viewMode === 'protocol' ? 'bg-black text-white shadow-md' : 'text-black opacity-40 hover:opacity-100'
                                    }`}
                            >
                                📋 Goal & Plan
                            </button>
                            <button
                                onClick={() => setViewMode('poolside')}
                                className={`flex-1 py-2.5 rounded-[18px] font-['Londrina_Solid'] uppercase text-lg transition-all ${viewMode === 'poolside' ? 'bg-blue-500 text-white shadow-md' : 'text-black opacity-40 hover:opacity-100'
                                    }`}
                            >
                                🏊 Poolside Mode
                            </button>
                        </div>

                        {/* BENTO CARD: GOAL HEADER */}
                        <div className="bg-blue-500 text-white border-[4px] border-black rounded-[35px] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
                            <span className="bg-black text-white text-[9px] font-black uppercase px-3 py-1 rounded-full border border-white/20 tracking-widest">
                                Active Target
                            </span>
                            <h3 className="font-['Londrina_Solid'] text-4xl uppercase leading-none mt-3">
                                {activeSwimGoal.title}
                            </h3>
                            <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center text-xs font-black uppercase">
                                <span>Target Metric: <span className="underline">{activeSwimGoal.targetMetric}</span></span>
                                <span>Target Date: {activeSwimGoal.deadline}</span>
                            </div>
                        </div>

                        {/* MODE 1: PROTOCOL BUILDER */}
                        {viewMode === 'protocol' && (
                            <div className="bg-white border-[4px] border-black rounded-[35px] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black animate-in fade-in duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-[10px] font-black opacity-40 uppercase tracking-widest block">Linked Protocol</span>
                                        <h4 className="font-['Londrina_Solid'] text-3xl uppercase leading-tight mt-0.5">
                                            {activeSwimGoal.plan.name}
                                        </h4>
                                    </div>
                                    <button
                                        onClick={() => setIsAddingTool(true)}
                                        className="bg-black text-white border-2 border-black px-3 py-1.5 rounded-xl font-['Londrina_Solid'] text-sm uppercase font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all shrink-0"
                                    >
                                        + Tool Block
                                    </button>
                                </div>

                                <div className="space-y-6 mt-6">
                                    {['Warmup', 'Main Set', 'Cooldown'].map((phase) => {
                                        const phaseTools = activeSwimGoal.plan.tools.filter(t => t.phase === phase);
                                        if (phaseTools.length === 0) return null;

                                        return (
                                            <div key={phase} className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-black" />
                                                    <span className="font-['Londrina_Solid'] text-base uppercase opacity-50 tracking-wider">
                                                        {phase} ({phaseTools.length} Tools)
                                                    </span>
                                                </div>

                                                <div className="space-y-2.5">
                                                    {phaseTools.map((tool) => (
                                                        <div
                                                            key={tool.id}
                                                            className="bg-[#FDFCF0] border-2 border-black p-3.5 rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between"
                                                        >
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border border-black ${tool.type === 'distance' ? 'bg-blue-100' :
                                                                            tool.type === 'gear' ? 'bg-amber-100' :
                                                                                tool.type === 'volume' ? 'bg-green-100' : 'bg-rose-100'
                                                                        }`}>
                                                                        {tool.type}
                                                                    </span>
                                                                    <span className="font-['Londrina_Solid'] text-xl uppercase font-black leading-none">
                                                                        {tool.label}
                                                                    </span>
                                                                </div>
                                                                {tool.details && (
                                                                    <p className="text-xs opacity-60 font-medium">{tool.details}</p>
                                                                )}
                                                            </div>

                                                            <div className="font-['Londrina_Solid'] text-xl font-black bg-white border-2 border-black px-3 py-1 rounded-xl shrink-0">
                                                                {tool.value}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* MODE 2: POOLSIDE CHEAT SHEET */}
                        {viewMode === 'poolside' && (
                            <div className="space-y-6 animate-in zoom-in-95 duration-300">
                                <div className="bg-black text-white border-[4px] border-black rounded-[35px] p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] text-center">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 block mb-1">
                                        Rest Interval Counter
                                    </span>
                                    <div className="font-['Londrina_Solid'] text-6xl font-black text-amber-400 my-1">
                                        {isTimerRunning ? `${restTimer}s` : '00s'}
                                    </div>
                                    <div className="flex justify-center gap-2 mt-3">
                                        {[15, 30, 45, 60].map((sec) => (
                                            <button
                                                key={sec}
                                                onClick={() => startRestTimer(sec)}
                                                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-black uppercase px-3.5 py-1.5 rounded-xl transition-all"
                                            >
                                                +{sec}s
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white border-[4px] border-black rounded-[35px] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black">
                                    <h4 className="font-['Londrina_Solid'] text-3xl uppercase mb-1">Pool Deck Checklist</h4>
                                    <p className="text-xs font-bold opacity-40 uppercase mb-6">Tap blocks as you complete them</p>

                                    <div className="space-y-3">
                                        {activeSwimGoal.plan.tools.map((tool) => {
                                            const isDone = completedTools[tool.id];
                                            return (
                                                <div
                                                    key={tool.id}
                                                    onClick={() => toggleToolCompletion(tool.id)}
                                                    className={`border-[3px] border-black p-4 rounded-[25px] cursor-pointer transition-all flex items-center justify-between active:scale-98 ${isDone
                                                            ? 'bg-slate-100 opacity-40 shadow-none translate-y-0.5'
                                                            : 'bg-[#FDFCF0] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:bg-white'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-xl border-2 border-black flex items-center justify-center font-black text-xl transition-colors ${isDone ? 'bg-green-500 text-white' : 'bg-white'
                                                            }`}>
                                                            {isDone ? '✓' : ''}
                                                        </div>
                                                        <div>
                                                            <span className={`font-['Londrina_Solid'] text-2xl uppercase font-black block leading-none ${isDone ? 'line-through' : ''
                                                                }`}>
                                                                {tool.label}
                                                            </span>
                                                            <span className="text-xs font-bold opacity-60 uppercase mt-1 block">
                                                                {tool.details || tool.phase}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="font-['Londrina_Solid'] text-xl font-black bg-white border-2 border-black px-3 py-1 rounded-xl shrink-0">
                                                        {tool.value}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => {
                                            alert("Session finish recorded!");
                                            setCompletedTools({});
                                        }}
                                        className="w-full bg-blue-500 text-white border-[3px] border-black py-4 rounded-2xl font-['Londrina_Solid'] text-3xl uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all mt-8 font-black"
                                    >
                                        Finish & Log Session
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ========================================================= */}
                    {/* UNBOXED VERTICAL STREAK BAR (Right Edge)                   */}
                    {/* ========================================================= */}
                    <div className="absolute right-0 top-0 bottom-0 flex flex-col items-center justify-between py-2 z-20">

                        {/* Track line */}
                        <div className="absolute top-6 bottom-6 w-[10px] md:w-[16px] bg-[#E5E5E5] rounded-full border-[2px] md:border-[3px] border-black z-0" />

                        {/* Progress line */}
                        <div className="absolute bottom-6 w-[10px] md:w-[16px] bg-gradient-to-t from-[#FF4B4B] via-[#FF9600] to-[#FFC800] rounded-full z-0 border-[2px] md:border-[3px] border-black transition-all duration-500" />

                        {/* STREAK MILESTONE SQUARE CALENDAR BADGES */}
                        <div className="flex flex-col justify-between items-center h-full w-full relative z-10 py-4">
                            {streakMilestones.map((val) => {
                                const isReached = val <= currentStreakValue;
                                const isCurrentTarget = val === currentStreakValue;

                                return (
                                    <div key={val} className="relative group flex items-center justify-center my-3">

                                        {/* 🗓️ SQUARE CALENDAR PAGE BADGE */}
                                        <div className="w-9 h-9 md:w-16 md:h-16 rounded-lg md:rounded-2xl border-[2px] md:border-[3.5px] border-black flex flex-col justify-between overflow-hidden relative shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                                            {/* TOP BINDER PEGS */}
                                            <div className="absolute top-1 left-2.5 w-1.5 h-1.5 rounded-full bg-black z-30" />
                                            <div className="absolute top-1 right-2.5 w-1.5 h-1.5 rounded-full bg-black z-30" />

                                            {/* CALENDAR BANNER STRIPE */}
                                            <div className={`h-4.5 w-full border-b-[2.5px] border-black flex items-center justify-center shrink-0 ${isCurrentTarget || isReached ? 'bg-[#FF4B4B]' : 'bg-slate-300'
                                                }`}>
                                                <span className="text-[7px] font-black uppercase text-white tracking-widest">
                                                    {isReached ? '✓' : '•'}
                                                </span>
                                            </div>

                                            {/* CALENDAR MAIN NUMBER */}
                                            <div className={`flex-1 flex items-center justify-center font-['Londrina_Solid'] text-sm md:text-3xl font-black leading-none ${isCurrentTarget
                                                    ? 'bg-[#FF9600] text-white'
                                                    : isReached
                                                        ? 'bg-[#FFC800] text-black'
                                                        : 'bg-white text-black/40'
                                                }`}>
                                                {val}
                                            </div>
                                        </div>

                                        {/* PR INDICATOR TAG */}
                                        {isCurrentTarget && (
                                            <div className="absolute -left-10 bg-black text-[#FF9600] text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border border-black shadow-sm pointer-events-none">
                                                PR
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                    </div>

                </div>
            )}

            {/* MODAL: ADD TOOL BLOCK */}
            {isAddingTool && (
                <div className="fixed inset-0 bg-black/80 z-[500] p-4 flex items-center justify-center" onClick={() => setIsAddingTool(false)}>
                    <div
                        className="bg-[#FDFCF0] border-[5px] border-black rounded-[40px] p-6 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative text-black"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsAddingTool(false)}
                            className="absolute top-4 right-5 text-2xl font-black opacity-30 hover:opacity-100"
                        >
                            ✕
                        </button>

                        <h3 className="font-['Londrina_Solid'] text-4xl uppercase mb-4">Add Modular Tool</h3>

                        <form onSubmit={handleAddToolBlock} className="space-y-4 text-left">
                            <div>
                                <label className="text-[10px] font-black uppercase opacity-40 block mb-1">Target Phase</label>
                                <select
                                    value={toolPhase}
                                    onChange={(e) => setToolPhase(e.target.value)}
                                    className="w-full bg-white border-3 border-black p-3 rounded-xl font-['Londrina_Solid'] text-xl focus:outline-none uppercase"
                                >
                                    <option value="Warmup">Warmup</option>
                                    <option value="Main Set">Main Set</option>
                                    <option value="Cooldown">Cooldown</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase opacity-40 block mb-1">Tool Type</label>
                                <select
                                    value={toolType}
                                    onChange={(e) => setToolType(e.target.value)}
                                    className="w-full bg-white border-3 border-black p-3 rounded-xl font-['Londrina_Solid'] text-xl focus:outline-none uppercase"
                                >
                                    <option value="distance">🏊 Distance / Laps</option>
                                    <option value="gear">🏋️ Gear / Equipment</option>
                                    <option value="volume">🔄 Sets & Reps</option>
                                    <option value="rest">⏱️ Rest Interval</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase opacity-40 block mb-1">Label / Drill Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Kickboard Kicks or Hand Paddles"
                                    value={toolLabel}
                                    onChange={(e) => setToolLabel(e.target.value)}
                                    className="w-full bg-white border-3 border-black p-3 rounded-xl font-['Londrina_Solid'] text-xl focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase opacity-40 block mb-1">Value / Target Count</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. 400m, 4x 100m, or 30s Rest"
                                    value={toolValue}
                                    onChange={(e) => setToolValue(e.target.value)}
                                    className="w-full bg-white border-3 border-black p-3 rounded-xl font-['Londrina_Solid'] text-xl focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase opacity-40 block mb-1">Instruction / Details (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Target 1:40/100m pace"
                                    value={toolDetails}
                                    onChange={(e) => setToolDetails(e.target.value)}
                                    className="w-full bg-white border-3 border-black p-3 rounded-xl text-sm font-bold focus:outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-black text-white p-4 rounded-2xl font-['Londrina_Solid'] text-2xl uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-1 transition-all mt-2"
                            >
                                Inject Tool Block
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}