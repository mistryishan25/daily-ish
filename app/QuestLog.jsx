"use client";
import React, { useState } from 'react';
import { collection, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';

/**
 * QuestLog.jsx
 * Updated: 
 * 1. Auto-deletes action steps if text is cleared.
 * 2. Enhanced layout centering to prevent "sliding" during scroll.
 */

export default function QuestLog({ quests, user, db, platformAppId }) {
    const [isAdding, setIsAdding] = useState(false);
    const [activeQuestId, setActiveQuestId] = useState(null); 
    const [newQuest, setNewQuest] = useState({ 
        title: '', 
        category: 'Skill', 
        deadline: '', 
        initialMilestone: 'Phase 1' 
    });

    const activeQuest = quests.find(q => q.id === activeQuestId);

    const categories = {
        Skill: 'bg-blue-500',
        Creative: 'bg-pink-500',
        Fitness: 'bg-orange-500',
        Impact: 'bg-purple-500'
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newQuest.title || !user) return;
        
        const initialMilestones = [
            {
                title: newQuest.initialMilestone || 'Phase 1',
                steps: []
            }
        ];

        await addDoc(collection(db, 'artifacts', platformAppId, 'public', 'data', 'quests'), {
            title: newQuest.title,
            category: newQuest.category,
            deadline: newQuest.deadline,
            milestones: initialMilestones,
            ownerId: user.uid,
            createdAt: serverTimestamp()
        });
        
        setNewQuest({ title: '', category: 'Skill', deadline: '', initialMilestone: 'Phase 1' });
        setIsAdding(false);
    };

    const updateMilestones = async (questId, newMilestones) => {
        await updateDoc(doc(db, 'artifacts', platformAppId, 'public', 'data', 'quests', questId), {
            milestones: newMilestones
        });
    };

    const addMilestone = (quest) => {
        const next = [...(quest.milestones || []), { title: 'New Milestone', steps: [] }];
        updateMilestones(quest.id, next);
    };

    const addStep = (quest, mIdx) => {
        const next = [...(quest.milestones || [])];
        next[mIdx].steps.push({ text: 'New Step', completed: false });
        updateMilestones(quest.id, next);
    };

    const toggleStep = (quest, mIdx, sIdx) => {
        const next = [...(quest.milestones || [])];
        next[mIdx].steps[sIdx].completed = !next[mIdx].steps[sIdx].completed;
        updateMilestones(quest.id, next);
    };

    // UPDATED: Logic to delete step if text is empty
    const updateStepText = (quest, mIdx, sIdx, text) => {
        const next = [...(quest.milestones || [])];
        
        if (text.trim() === '') {
            // Remove the step entirely if text is deleted
            next[mIdx].steps.splice(sIdx, 1);
        } else {
            next[mIdx].steps[sIdx].text = text;
        }
        
        updateMilestones(quest.id, next);
    };

    const updateMilestoneTitle = (quest, mIdx, title) => {
        const next = [...(quest.milestones || [])];
        next[mIdx].title = title;
        updateMilestones(quest.id, next);
    };

    const deleteMilestone = (quest, mIdx) => {
        const next = (quest.milestones || []).filter((_, i) => i !== mIdx);
        updateMilestones(quest.id, next);
    };

    return (
        <div className="bg-white border-[6px] border-black rounded-[45px] p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full text-black">
            <header className="flex justify-between items-center mb-8">
                <div className="text-left">
                    <h3 className="font-['Londrina_Solid'] text-5xl uppercase leading-none">Quest Board</h3>
                    <p className="font-['Londrina_Solid'] text-sm opacity-30 uppercase tracking-[0.2em] mt-2"> Twenty-twenty-siicckkk</p>
                </div>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-3xl font-black active:translate-y-1 transition-all"
                >
                    +
                </button>
            </header>

            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                {quests.map((quest) => {
                    const allSteps = (quest.milestones || []).flatMap(m => m.steps || []);
                    const totalSteps = allSteps.length;
                    const completedSteps = allSteps.filter(s => s.completed).length;
                    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

                    return (
                        <div 
                            key={quest.id}
                            onClick={() => setActiveQuestId(quest.id)}
                            className="border-[4px] border-black rounded-[35px] bg-[#FDFCF0] cursor-pointer text-left"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${categories[quest.category] || 'bg-black'}`} />
                                        <span className="font-['Londrina_Solid'] text-sm font-black uppercase opacity-40">{quest.category}</span>
                                    </div>
                                    <span className="font-['Londrina_Solid'] text-xs font-black opacity-30 uppercase">{progress}% Done</span>
                                </div>
                                <h4 className="font-['Londrina_Solid'] text-3xl uppercase leading-none mb-4">{quest.title}</h4>
                                <div className="h-4 bg-black/5 rounded-full overflow-hidden border-[3px] border-black">
                                    <div className="h-full bg-yellow-400 border-r-[3px] border-black" style={{ width: `${progress}%` }} />
                                </div>
                                <div className="mt-2 text-[10px] font-black uppercase opacity-40 text-right">
                                    {completedSteps}/{totalSteps} Steps Complete
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* QUEST LAB WORKSPACE - UPDATED CENTERING LOGIC */}
            {activeQuest && (
                <div className="fixed inset-0 bg-[#FDFCF0] z-[400] flex flex-col items-center overflow-y-auto overflow-x-hidden p-6 md:p-12 text-black">
                    <div className="w-full max-w-4xl mx-auto">
                        <header className="flex justify-between items-start mb-12">
                            <div className="text-left">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-4 py-1 rounded-full text-xs font-['Londrina_Solid'] font-black uppercase text-white ${categories[activeQuest.category]}`}>
                                        {activeQuest.category}
                                    </span>
                                    <span className="font-['Londrina_Solid'] text-sm font-black uppercase opacity-30 tracking-widest">
                                        Active Research Objective
                                    </span>
                                </div>
                                <h2 className="font-['Londrina_Solid'] text-7xl uppercase leading-none">{activeQuest.title}</h2>
                            </div>
                            <button 
                                onClick={() => setActiveQuestId(null)} 
                                className="w-16 h-16 bg-white border-4 border-black rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-3xl font-black active:translate-y-1 transition-all"
                            >
                                ✕
                            </button>
                        </header>

                        <div className="w-full pb-20">
                            <div className="space-y-10">
                                {(activeQuest.milestones || []).map((milestone, mIdx) => (
                                    <div key={mIdx} className="bg-white border-[5px] border-black rounded-[45px] p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-left group">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-['Londrina_Solid'] text-2xl pt-1">{mIdx + 1}</div>
                                                <input 
                                                    className="font-['Londrina_Solid'] text-4xl uppercase focus:outline-none bg-transparent flex-1 border-b-4 border-dashed border-transparent focus:border-black/10"
                                                    value={milestone.title}
                                                    onChange={(e) => updateMilestoneTitle(activeQuest, mIdx, e.target.value)}
                                                />
                                            </div>
                                            <button 
                                                onClick={() => deleteMilestone(activeQuest, mIdx)}
                                                className="w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-20 hover:!opacity-100 transition-opacity"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <div className="space-y-4 ml-2">
                                            {(milestone.steps || []).map((step, sIdx) => (
                                                <div key={sIdx} className="flex items-center gap-4">
                                                    <button 
                                                        onClick={() => toggleStep(activeQuest, mIdx, sIdx)}
                                                        className={`w-10 h-10 border-4 border-black rounded-2xl flex items-center justify-center transition-all ${step.completed ? 'bg-black text-white' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5'}`}
                                                    >
                                                        {step.completed && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                                    </button>
                                                    <input 
                                                        className={`flex-1 bg-transparent font-['Londrina_Solid'] text-2xl uppercase focus:outline-none transition-all ${step.completed ? 'opacity-20 line-through' : 'opacity-100'}`}
                                                        value={step.text}
                                                        onChange={(e) => updateStepText(activeQuest, mIdx, sIdx, e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                            <button 
                                                onClick={() => addStep(activeQuest, mIdx)}
                                                className="flex items-center gap-3 mt-6 font-['Londrina_Solid'] text-xl uppercase opacity-30 hover:opacity-100 transition-opacity"
                                            >
                                                <div className="w-6 h-6 border-2 border-black rounded-lg flex items-center justify-center font-black text-sm">+</div>
                                                Add Action Step
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button 
                                    onClick={() => addMilestone(activeQuest)}
                                    className="w-full py-10 border-[5px] border-dashed border-black/20 rounded-[45px] font-['Londrina_Solid'] text-4xl uppercase opacity-20 hover:opacity-100 hover:bg-white hover:border-black transition-all"
                                >
                                    + Add New Milestone
                                </button>
                                
                                <div className="pt-10 flex justify-center">
                                    <button 
                                        onClick={() => { if(confirm('Terminate this research objective?')) { deleteDoc(doc(db, 'artifacts', platformAppId, 'public', 'data', 'quests', activeQuest.id)); setActiveQuestId(null); } }}
                                        className="py-4 px-10 border-4 border-red-500 text-red-500 rounded-[30px] font-['Londrina_Solid'] uppercase text-xl hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        Delete Quest Record
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD QUEST MODAL */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/60 z-[500] p-6 flex items-center justify-center text-black" onClick={() => setIsAdding(false)}>
                    <div className="bg-[#FDFCF0] border-[5px] border-black rounded-[45px] p-10 w-full max-w-lg shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]" onClick={e => e.stopPropagation()}>
                        <h2 className="font-['Londrina_Solid'] text-5xl uppercase mb-8 text-left">Initial Brief</h2>
                        <form onSubmit={handleAdd} className="space-y-6 text-left">
                            <div className="bg-white border-4 border-black p-4 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                                <label className="font-['Londrina_Solid'] text-xs uppercase font-black opacity-40 block mb-1">Quest Title</label>
                                <input required className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none" placeholder="e.g. ASL Performance" value={newQuest.title} onChange={e => setNewQuest({...newQuest, title: e.target.value})} />
                            </div>

                            <div className="bg-white border-4 border-black p-4 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                                <label className="font-['Londrina_Solid'] text-xs uppercase font-black opacity-40 block mb-1">First Milestone</label>
                                <input required className="w-full bg-transparent font-['Londrina_Solid'] text-2xl focus:outline-none" placeholder="e.g. Learn the Basics" value={newQuest.initialMilestone} onChange={e => setNewQuest({...newQuest, initialMilestone: e.target.value})} />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white border-4 border-black p-4 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                                    <label className="font-['Londrina_Solid'] text-xs uppercase font-black opacity-40 block mb-1">Target Date</label>
                                    <input type="date" className="w-full bg-transparent font-['Londrina_Solid'] text-sm focus:outline-none uppercase" value={newQuest.deadline} onChange={e => setNewQuest({...newQuest, deadline: e.target.value})} />
                                </div>
                                <div className="bg-white border-4 border-black p-4 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                                    <label className="font-['Londrina_Solid'] text-xs uppercase font-black opacity-40 block mb-1">Category</label>
                                    <select className="w-full bg-transparent font-['Londrina_Solid'] text-xl uppercase focus:outline-none" value={newQuest.category} onChange={e => setNewQuest({...newQuest, category: e.target.value})}>
                                        {Object.keys(categories).map(cat => <option key={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-black text-white p-6 rounded-[35px] font-['Londrina_Solid'] text-3xl uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-1 mt-4">Initialize Quest</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}