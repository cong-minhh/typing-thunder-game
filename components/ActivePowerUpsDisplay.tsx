import React, { useState, useEffect, useRef } from 'react';
import { ActivePowerUp, PowerUpType } from '../types';

interface ActivePowerUpsDisplayProps {
    activePowerUps: ActivePowerUp[];
}

const POWERUP_CONFIG: { [key in PowerUpType]?: { label: string; color: string; } } = {
    'slow-time': { label: 'SLOW', color: '#0ea5e9' }, // sky-500
    'score-multiplier': { label: 'x2', color: '#eab308' }, // yellow-500
    'frenzy': { label: 'FZY', color: '#f97316' }, // orange-500
};

const CountdownCircle: React.FC<{
    percent: number;
    color: string;
}> = ({ percent, color }) => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <svg className="countdown-circle">
            <circle
                stroke="#1e293b" // slate-800
                strokeWidth="4"
                fill="transparent"
                r={radius}
                cx="32"
                cy="32"
            />
            <circle
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                fill="transparent"
                r={radius}
                cx="32"
                cy="32"
                style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: offset,
                    transition: 'stroke-dashoffset 0.1s linear',
                    filter: `drop-shadow(0 0 5px ${color})`
                }}
            />
        </svg>
    );
};

const ActivePowerUpIcon: React.FC<{ powerUp: ActivePowerUp }> = ({ powerUp }) => {
    const [_, setNow] = useState(Date.now());
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        const animate = () => {
            setNow(Date.now());
            animationFrameId.current = requestAnimationFrame(animate);
        };
        animationFrameId.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, []);

    const config = POWERUP_CONFIG[powerUp.type];
    if (!config) return null;

    const duration = powerUp.expiration - (powerUp.id.includes('-') ? parseInt(powerUp.id.split('-').pop()!) : Date.now());
    const remaining = Math.max(0, powerUp.expiration - Date.now());
    const countdownPercent = (remaining / duration) * 100;

    return (
        <div className="power-up-icon glass-panel" style={{ borderColor: config.color, boxShadow: `0 0 10px ${config.color}` }}>
            <CountdownCircle percent={countdownPercent} color={config.color} />
            {config.label}
        </div>
    );
};

const ActivePowerUpsDisplay: React.FC<ActivePowerUpsDisplayProps> = ({ activePowerUps }) => {
    const powerUpsToShow = activePowerUps.filter(p => p.type !== 'shield');
    if (powerUpsToShow.length === 0) return null;
    
    return (
        <div className="active-power-ups-display">
            {powerUpsToShow.map(p => <ActivePowerUpIcon key={p.id} powerUp={p} />)}
        </div>
    );
};

export default ActivePowerUpsDisplay;