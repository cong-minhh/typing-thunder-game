import React, { useState, useEffect } from 'react';
import { ActivePowerUp, PowerUpType } from '../types';
import { POWERUP_DURATIONS } from '../constants';

const POWERUP_INFO: Record<string, { name: string, icon: string, color: string }> = {
    'slow-time': { name: 'Slow Time', icon: '⏱️', color: 'bg-sky-500' },
    'score-multiplier': { name: 'Score Boost', icon: '💰', color: 'bg-yellow-500' },
    'frenzy': { name: 'Frenzy', icon: '🔥', color: 'bg-orange-500' },
    'clear-words': { name: 'Wipe', icon: '💨', color: 'bg-purple-500' },
    'shield': { name: 'Shield', icon: '🛡️', color: 'bg-green-500' },
    'unify': { name: 'Unify', icon: '🔗', color: 'bg-slate-400' },
};

const PowerUpTimer: React.FC<{ powerUp: ActivePowerUp }> = ({ powerUp }) => {
    const [remaining, setRemaining] = useState(powerUp.expiration - Date.now());
    const info = POWERUP_INFO[powerUp.type];
    const duration = POWERUP_DURATIONS[powerUp.type as keyof typeof POWERUP_DURATIONS];

    useEffect(() => {
        const interval = setInterval(() => {
            const newRemaining = powerUp.expiration - Date.now();
            if (newRemaining > 0) {
                setRemaining(newRemaining);
            } else {
                setRemaining(0);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [powerUp.expiration]);

    if (!info || !duration) return null;

    const progress = (remaining / duration) * 100;
    const secondsLeft = (remaining / 1000).toFixed(1);

    return (
        <div className="relative flex items-center gap-3 p-2 bg-slate-900/70 rounded-lg overflow-hidden animate-powerup-enter">
            <span className="text-2xl">{info.icon}</span>
            <div className="flex-grow">
                <p className="font-bold text-slate-200">{info.name}</p>
                <p className="text-sm text-cyan-300">{secondsLeft}s</p>
            </div>
            <div className="powerup-timer-bar" style={{ width: `${progress}%` }}></div>
        </div>
    );
};

const ActivePowerUpsDisplay: React.FC<{ activePowerUps: ActivePowerUp[] }> = ({ activePowerUps }) => {
    const timedPowerUps = activePowerUps.filter(p => p.type !== 'shield' && p.type !== 'clear-words' && p.type !== 'unify');

    if (timedPowerUps.length === 0) return null;

    return (
        <div className="w-full glass-panel p-3">
            <h3 className="text-lg font-bold text-cyan-400 mb-2 text-center tracking-wider" style={{textShadow: '0 0 5px #0ff'}}>ACTIVE</h3>
            <div className="flex flex-col gap-2">
                {timedPowerUps.map(p => (
                    <PowerUpTimer key={p.type + p.expiration} powerUp={p} />
                ))}
            </div>
        </div>
    );
};

export default ActivePowerUpsDisplay;
