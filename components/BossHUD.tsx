import React from 'react';
import { BossState } from '../types';

interface BossHUDProps {
    bossState: BossState;
    isHit: boolean;
}

const BossHUD: React.FC<BossHUDProps> = ({ bossState, isHit }) => {
    const healthPercentage = (bossState.health / bossState.maxHealth) * 100;
    const timerSeconds = (bossState.timer / 1000).toFixed(1);

    return (
        <div className="absolute top-0 left-0 right-0 p-4 z-30">
            <div className="max-w-xl mx-auto">
                <h2 className="text-center text-2xl font-bold text-fuchsia-400 mb-2" style={{textShadow: '0 0 10px #f0abfc'}}>-- BOSS --</h2>
                {/* Health Bar */}
                <div className={`w-full bg-slate-700 rounded-full h-6 border-2 border-slate-500 overflow-hidden ${isHit ? 'animate-boss-health-hit' : ''}`}>
                    <div
                        className="bg-gradient-to-r from-red-500 to-red-700 h-full rounded-full transition-all duration-300 ease-out relative"
                        style={{ width: `${healthPercentage}%` }}
                    >
                         <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                </div>
                {/* Timer */}
                <div className={`text-center text-4xl font-black mt-2 text-red-400 ${bossState.timer < 5000 ? 'animate-boss-timer-pulse' : ''}`}>
                    {timerSeconds}
                </div>
            </div>
        </div>
    );
};

export default BossHUD;