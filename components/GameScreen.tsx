import React from 'react';
import { Word, FloatingScore, LevelPhase, BossState } from '../types';
import FallingWord from './FallingWord';
import FlowBar from './FlowBar';
import WaveAlert from './WaveAlert';
import BossHUD from './BossHUD';
import BossDisplay from './BossDisplay';
import LevelClear from './LevelClear';

interface GameScreenProps {
    words: Word[];
    typedInput: string;
    gameContainerRef: React.RefObject<HTMLDivElement>;
    showLevelUp: boolean;
    floatingScores: FloatingScore[];
    isTimeSlowed: boolean;
    lastCompletionTime: number | null;
    levelPhase: LevelPhase;
    bossState: BossState | null;
    isBossHit: boolean;
    showLevelClear: boolean;
    isScoreBoosted: boolean;
    isFrenzyActive: boolean;
}

const GameScreen: React.FC<GameScreenProps> = ({
    words, typedInput, gameContainerRef, showLevelUp,
    floatingScores, isTimeSlowed, lastCompletionTime,
    levelPhase, bossState, isBossHit, showLevelClear, isScoreBoosted, isFrenzyActive
}) => {
    return (
        <div ref={gameContainerRef} className={`h-full w-full relative p-4 ${levelPhase === LevelPhase.WaveAccelerate ? 'animate-screen-shake-continuous' : ''}`}>
            {isTimeSlowed && <div className="absolute inset-0 bg-cyan-900/20 z-10 pointer-events-none transition-opacity duration-300" />}
            {isScoreBoosted && <div className="absolute inset-0 border-4 border-yellow-400 rounded-lg pointer-events-none z-10 animate-pulse" style={{ animationDuration: '0.5s' }} />}
            {isFrenzyActive && <div className="absolute inset-0 border-4 border-orange-500 rounded-lg pointer-events-none z-10 animate-pulse" style={{ animationDuration: '0.4s' }} />}
            
            {levelPhase === LevelPhase.WaveAccelerate && <div className="absolute inset-0 pointer-events-none z-0 animate-vignette-pulse" />}
            {levelPhase === LevelPhase.WaveDeluge && <div className="absolute inset-0 pointer-events-none z-0 animate-deluge-bg" />}

            {showLevelUp && (
                <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <h1 className="text-8xl font-black text-yellow-300 animate-level-up" style={{textShadow: '0 0 20px #facc15'}}>LEVEL UP!</h1>
                </div>
            )}
            
            {levelPhase === LevelPhase.WaveWarning && <WaveAlert />}
            {levelPhase === LevelPhase.LevelTransition && showLevelClear && <LevelClear />}
            {levelPhase === LevelPhase.Boss && bossState && <BossHUD bossState={bossState} isHit={isBossHit} />}

            {floatingScores.map(fs => (
                <div key={fs.id} className="absolute text-2xl font-bold animate-float-up flex items-baseline" style={{ left: `${fs.x}px`, top: `${fs.y}px`, textShadow: '1px 1px 2px #000' }}>
                    <span className="text-yellow-400" style={{ textShadow: '0 0 8px #facc15' }}>+{fs.base}</span>
                    {fs.bonus > 0 && <span className="text-green-400 text-xl ml-2" style={{ textShadow: '0 0 8px #4ade80' }}>+{fs.bonus}</span>}
                    {(fs.timingBonus ?? 0) > 0 && <span className="text-fuchsia-400 text-xl ml-2" style={{ textShadow: '0 0 8px #f0abfc' }}>+{fs.timingBonus}</span>}
                    {fs.timingLabel && (
                        <div className="flex items-baseline ml-4 animate-timing-bonus-pop">
                            <span className={`${fs.timingLabel.colorClass} text-3xl font-black`} style={{ textShadow: `0 0 10px currentColor` }}>{fs.timingLabel.text}!</span>
                            {fs.timingMultiplier && <span className="text-slate-300 text-lg ml-2">(x{fs.timingMultiplier.toFixed(2)})</span>}
                            {fs.scoreMultiplier && <span className="text-yellow-400 text-xl ml-2 font-bold animate-pulse">(x{fs.scoreMultiplier})</span>}
                        </div>
                    )}
                </div>
            ))}

            <div className="absolute inset-0">
                {words.map(word => (<FallingWord key={word.id} word={word} typedInput={typedInput} />))}
                {levelPhase === LevelPhase.Boss && bossState && <BossDisplay bossState={bossState} />}
            </div>

            <FlowBar lastCompletionTime={lastCompletionTime} />
        </div>
    );
};

export default GameScreen;