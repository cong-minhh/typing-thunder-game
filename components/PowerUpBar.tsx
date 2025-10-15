import React from 'react';
import { POWERUP_THRESHOLDS } from '../constants';
import { PowerUpType } from '../types';

interface PowerUpBarProps {
    progress: {
        slowTime: number;
        bomb: number;
        clearWords: number;
    };
}

const PowerUpItem: React.FC<{
    label: string;
    progress: number;
    threshold: number;
    color: string;
}> = ({ label, progress, threshold, color }) => {
    const percentage = (progress / threshold) * 100;

    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1 text-sm font-bold text-slate-300">
                <span>{label}</span>
                <span>{Math.floor(percentage)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-4 border border-slate-600">
                <div
                    className={`${color} h-full rounded-full transition-all duration-300 ease-out`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};


const PowerUpBar: React.FC<PowerUpBarProps> = ({ progress }) => {
    return (
        <div className="w-full bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-cyan-400/30">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 text-center tracking-wider" style={{textShadow: '0 0 5px #0ff'}}>POWER-UPS</h3>
            <PowerUpItem
                label="Slow Time"
                progress={progress.slowTime}
                threshold={POWERUP_THRESHOLDS.slowTime}
                color="bg-sky-500"
            />
            <PowerUpItem
                label="Chain Lightning"
                progress={progress.clearWords}
                threshold={POWERUP_THRESHOLDS.clearWords}
                color="bg-purple-500"
            />
            <PowerUpItem
                label="Explosion"
                progress={progress.bomb}
                threshold={POWERUP_THRESHOLDS.bomb}
                color="bg-red-500"
            />
        </div>
    );
};

export default PowerUpBar;