import React, { useState, useEffect, useRef } from 'react';
import { TIMING_WINDOW_MS } from '../constants';

interface FlowBarProps {
    lastCompletionTime: number | null;
}

const FlowBar: React.FC<FlowBarProps> = ({ lastCompletionTime }) => {
    const [progress, setProgress] = useState(0);
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        if (lastCompletionTime === null) {
            setProgress(0);
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            return;
        }

        const lastTime = lastCompletionTime;

        const animate = () => {
            const timeSinceLastCompletion = Date.now() - lastTime;
            
            if (timeSinceLastCompletion >= TIMING_WINDOW_MS) {
                setProgress(0);
                return; // Stop the animation
            }
            
            const remainingTime = TIMING_WINDOW_MS - timeSinceLastCompletion;
            const newProgress = (remainingTime / TIMING_WINDOW_MS) * 100;
            setProgress(Math.max(0, newProgress));

            animationFrameId.current = requestAnimationFrame(animate);
        };

        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, [lastCompletionTime]);

    if (progress <= 1) return null; // Hide when almost empty

    const gradient = 'linear-gradient(to right, #22d3ee 25%, #fcd34d 0 50%, #a78bfa 0 75%, #f0abfc 0 100%)';

    return (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-1/2 max-w-sm z-20 pointer-events-none">
            <div className="relative h-3">
                 <div className="absolute inset-0 bg-slate-900/50 rounded-full border border-slate-700 overflow-hidden">
                    <div 
                        className={`h-full rounded-full`}
                        style={{ width: `${progress}%`, background: gradient }}
                    ></div>
                 </div>
                 {/* Ticks */}
                 <div className="absolute top-0 h-full w-px bg-slate-900/80" style={{ left: '25%' }}></div>
                 <div className="absolute top-0 h-full w-px bg-slate-900/80" style={{ left: '50%' }}></div>
                 <div className="absolute top-0 h-full w-px bg-slate-900/80" style={{ left: '75%' }}></div>
            </div>
            <div className="relative h-4 text-xs font-bold mt-1">
                <div className="absolute text-center text-cyan-400" style={{ left: '0%', width: '25%' }}>GOOD</div>
                <div className="absolute text-center text-amber-400" style={{ left: '25%', width: '25%' }}>GREAT</div>
                <div className="absolute text-center text-violet-400" style={{ left: '50%', width: '25%' }}>PERFECT</div>
                <div className="absolute text-center text-fuchsia-400" style={{ left: '75%', width: '25%' }}>UNREAL</div>
            </div>
        </div>
    );
};

export default FlowBar;
