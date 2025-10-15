import React from 'react';
import { POWERUP_THRESHOLDS } from '../constants';

interface PowerUpBarProps {
    progress: {
        slowTime: number;
        bomb: number;
        clearWords: number;
    };
    ready: {
        slowTime: boolean;
        bomb: boolean;
        clearWords: boolean;
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
                    <span className="ml-2 text-xs bg-slate-700 text-cyan-300 border border-cyan-500 rounded-md px-1.5 py-0.5">{hotkey}</span>
                </span>
                <span className={`${isReady ? 'text-yellow-300' : ''}`}>{isReady ? 'READY!' : `${Math.floor(percentage)}%`}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-4 border border-slate-600 overflow-hidden">
                <div
                    className={`${color} h-full rounded-full transition-all duration-300 ease-out`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};


const PowerUpBar: React.FC<PowerUpBarProps> = ({ progress, ready }) => {
    return (
        <div className="w-full bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-cyan-400/30">
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
                label="Chain Lightning"
                progress={progress.clearWords}
                threshold={POWERUP_THRESHOLDS.clearWords}
                color="bg-purple-500"
                isReady={ready.clearWords}
                hotkey="2"
            />
            <PowerUpItem
                label="Explosion"
                progress={progress.bomb}
                threshold={POWERUP_THRESHOLDS.bomb}
                color="bg-red-500"
                isReady={ready.bomb}
                hotkey="3"
            />
        </div>
    );
};

export default PowerUpBar;