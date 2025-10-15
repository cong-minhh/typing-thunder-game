import React from 'react';
import { PowerUpType } from '../types';

interface PowerUpActivationFXProps {
    activeFx: PowerUpType | null;
    onComplete: () => void;
}

const FX_MAP: { [key in PowerUpType]?: { className: string; duration: number } } = {
    'slow-time': { className: 'animate-ripple-out', duration: 500 },
    'score-multiplier': { className: 'animate-gold-flash', duration: 800 },
    'shield': { className: 'animate-shield-pulse-effect', duration: 600 },
    'unify': { className: 'animate-scan-down', duration: 700 },
    'frenzy': { className: 'animate-orange-blast', duration: 500 },
    // clear-words has its own WipeAnimation component
};

const PowerUpActivationFX: React.FC<PowerUpActivationFXProps> = ({ activeFx, onComplete }) => {
    if (!activeFx) return null;

    const fx = FX_MAP[activeFx];
    if (!fx) return null;

    return (
        <div
            key={Date.now()} // Remount component to replay animation
            className={`absolute inset-0 z-[60] pointer-events-none ${fx.className}`}
            onAnimationEnd={onComplete}
            style={{ animationDuration: `${fx.duration}ms` }}
        />
    );
};

export default PowerUpActivationFX;