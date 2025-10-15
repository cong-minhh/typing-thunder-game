import React, { useMemo } from 'react';
import { LightningStrikeInfo } from '../types';

interface LightningStrikeProps {
    strike: LightningStrikeInfo;
    onComplete: (id: number) => void;
}

const generateJaggedPath = (start: { x: number, y: number }, end: { x: number, y: number }) => {
    const segments = 10;
    const jaggedness = 15;

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return `M ${start.x} ${start.y}`;
    
    const normal = { x: -dy / length, y: dx / length };

    let pathData = `M ${start.x} ${start.y}`;
    for (let i = 1; i < segments; i++) {
        const progress = i / segments;
        const pointX = start.x + progress * dx;
        const pointY = start.y + progress * dy;
        const offset = (Math.random() - 0.5) * jaggedness;
        const finalX = pointX + offset * normal.x;
        const finalY = pointY + offset * normal.y;
        pathData += ` L ${finalX} ${finalY}`;
    }
    pathData += ` L ${end.x} ${end.y}`;
    return pathData;
};

const LightningStrike: React.FC<LightningStrikeProps> = ({ strike, onComplete }) => {
    
    const pathData = useMemo(() => generateJaggedPath(strike.start, strike.end), [strike.start, strike.end]);

    const handleAnimationEnd = (e: React.AnimationEvent) => {
        if (e.animationName === 'lightning-fade-out') {
            onComplete(strike.id);
        }
    };

    return (
        <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible animate-lightning-strike"
            onAnimationEnd={handleAnimationEnd}
        >
            <defs>
                <filter id="lightning-glow">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <path
                d={pathData}
                fill="none"
                stroke="rgba(186, 230, 253, 0.4)" // sky-200/40
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#lightning-glow)"
            />
            <path
                d={pathData}
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default LightningStrike;