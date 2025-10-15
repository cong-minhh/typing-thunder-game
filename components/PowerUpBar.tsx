import React from 'react';
import { POWERUP_THRESHOLDS } from '../constants';
import { PowerUpType } from '../types';

interface PowerUpBarProps {
    progress: {
        slowTime: number;
        clearWords: number;
        shield: number;
        scoreMultiplier: number;
        unify: number;
        frenzy: number;
    };
    ready: {
        slowTime: boolean;
        clearWords: boolean;
        shield: boolean;
        scoreMultiplier: boolean;
        unify: boolean;
        frenzy: boolean;
    };
}

const PowerUpItem: React.FC<{
    label: string;
    progress: number;
    threshold: number;
    color: string;
    isReady: boolean;
    hotkey: string;
}> = ({ label, progress, threshold, color, isReady, hotkey }) => {
    const percentage = (progress / threshold) * 100;

    return (
        <div className={`mb-4 p-2 rounded-lg transition-all duration-300 ${isReady ? 'animate-pulse-glow-cyan bg-cyan-500/20' : ''}`}>
            <div className="flex justify-between items-baseline mb-1 text-sm font-bold text-slate-300">
                <span className="flex items-center">
                    {label}
                    <span className="ml-2 text-xs bg-slate-900 text-cyan-300 border-b-2 border-slate-600 rounded-md px-1.5 py-0.5">{hotkey}</span>
                </span>
                <span className={`font-extrabold ${isReady ? 'text-yellow-300 text-base' : ''}`}>{isReady ? 'READY!' : `${Math.floor(percentage)}%`}</span>
            </div>
            <div className="w-full bg-slate-900/70 rounded-full h-4 border border-slate-600 overflow-hidden">
                <div
                    className={`${color} h-full rounded-full transition-all duration-300 ease-out`}
                    style={{ width: `${percentage}%`, boxShadow: `0 0 8px ${isReady ? '#0ff' : 'transparent'}` }}
                ></div>
            </div>
        </div>
    );
};


const PowerUpBar: React.FC<PowerUpBarProps> = ({ progress, ready }) => {
    return (
        <div className="w-full glass-panel p-4">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 text-center tracking-wider" style={{textShadow: '0 0 5px #0ff'}}>POWER-UPS</h3>
            <PowerUpItem
                label="Slow Time"
                progress={progress.slowTime}
                threshold={POWERUP_THRESHOLDS.slowTime}
                color="bg-sky-500"
                isReady={ready.slowTime}
                hotkey="1"
            />
            <PowerUpItem
                label="Screen Wipe"
                progress={progress.clearWords}
                threshold={POWERUP_THRESHOLDS.clearWords}
                color="bg-purple-500"
                isReady={ready.clearWords}
                hotkey="2"
            />
            <PowerUpItem
                label="Shield"
                progress={progress.shield}
                threshold={POWERUP_THRESHOLDS.shield}
                color="bg-green-500"
                isReady={ready.shield}
                hotkey="3"
            />
            <PowerUpItem
                label="Score Boost"
                progress={progress.scoreMultiplier}
                threshold={POWERUP_THRESHOLDS.scoreMultiplier}
                color="bg-yellow-500"
                isReady={ready.scoreMultiplier}
                hotkey="4"
            />
             <PowerUpItem
                label="Unify"
                progress={progress.unify}
                threshold={POWERUP_THRESHOLDS.unify}
                color="bg-slate-400"
                isReady={ready.unify}
                hotkey="5"
            />
             <PowerUpItem
                label="Frenzy"
                progress={progress.frenzy}
                threshold={POWERUP_THRESHOLDS.frenzy}
                color="bg-orange-500"
                isReady={ready.frenzy}
                hotkey="6"
            />
        </div>
    );
};

export default PowerUpBar;