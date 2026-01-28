"use client";
import React from 'react';

/**
 * EnduranceLab.jsx - Minimal Version
 * Purely for verifying the routing and basic layout.
 */

export default function EnduranceLab({ logs, onBack }) {
    const stations = [
        { name: 'Swim', color: '#3b82f6' },
        { name: 'Bike', color: '#22c55e' },
        { name: 'Run', color: '#f97316' },
        { name: 'Brick', color: '#a855f7' }
    ];

    return (
        <div className="max-w-md mx-auto pt-10 text-left animate-in fade-in">
            {/* Header */}
            <header className="flex justify-between items-center mb-10">
                <h2 className="font-['Londrina_Solid'] text-6xl uppercase text-black">Endurance</h2>
                <button 
                    onClick={onBack} 
                    className="w-12 h-12 bg-white border-4 border-black rounded-2xl font-black text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all"
                >
                    ✕
                </button>
            </header>

            {/* Simple Grid */}
            <div className="grid grid-cols-2 gap-4">
                {stations.map((s) => (
                    <div 
                        key={s.name}
                        className="bg-white border-[4px] border-black rounded-[30px] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <div className="w-4 h-4 rounded-full mb-3" style={{ backgroundColor: s.color }} />
                        <h3 className="font-['Londrina_Solid'] text-3xl uppercase text-black">{s.name}</h3>
                        <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">Station Active</p>
                    </div>
                ))}
            </div>

            {/* History Summary */}
            <div className="mt-8 bg-white border-[4px] border-black rounded-[35px] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black">
                <h4 className="font-['Londrina_Solid'] text-xl uppercase mb-2 opacity-40 text-left">Recent Data Points</h4>
                <div className="space-y-2">
                    {logs.length > 0 ? (
                        logs.slice(0, 3).map((log, i) => (
                            <div key={i} className="flex justify-between border-b border-black/5 pb-1 uppercase font-black text-[10px]">
                                <span>{log.type || 'Unknown'}</span>
                                <span>{log.distance || '0'} KM</span>
                            </div>
                        ))
                    ) : (
                        <p className="font-['Londrina_Solid'] text-lg opacity-20 uppercase">No trials logged yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}