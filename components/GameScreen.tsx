import React, { useRef, useEffect } from 'react';
import { Word, FloatingScore } from '../types';
import FallingWord from './FallingWord';
import FlowBar from './FlowBar';

interface GameScreenProps {
    words: Word[];
    typedInput: string;
    onInputChange: (value: string) => void;
    gameContainerRef: React.RefObject<HTMLDivElement>;
    showLevelUp: boolean;
    inputStatus: 'idle' | 'correct' | 'incorrect';
    floatingScores: FloatingScore[];
    isTimeSlowed: boolean;
    isPaused: boolean;
    lastCompletionTime: number | null;
}

const GameScreen: React.FC<GameScreenProps> = ({
    words,
    typedInput,
    onInputChange,
    gameContainerRef,
    showLevelUp,
    inputStatus,
    floatingScores,
    isTimeSlowed,
    isPaused,
    lastCompletionTime,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isPaused) {
            inputRef.current?.focus();
        }
    }, [isPaused]);

    const statusClass = {
        idle: 'border-cyan-400 focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-300',
        correct: 'border-green-400 ring-4 ring-green-500/50',
        incorrect: 'border-red-500 ring-4 ring-red-500/50 animate-shake-short'
    }[inputStatus];

    return (
        <div ref={gameContainerRef} className="h-full w-full relative flex flex-col justify-end p-4">
            {/* Slow Time Effect Overlay */}
            {isTimeSlowed && (
                <div className="absolute inset-0 bg-cyan-900/20 z-10 pointer-events-none transition-opacity duration-300" />
            )}
            
            {/* Level Up Animation */}
            {showLevelUp && (
                <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <h1 className="text-8xl font-black text-yellow-300 animate-level-up" style={{textShadow: '0 0 20px #facc15'}}>
                        LEVEL UP!
                    </h1>
                </div>
            )}

            {/* Floating Scores */}
            {floatingScores.map(fs => (
                <div
                    key={fs.id}
                    className="absolute text-2xl font-bold animate-float-up flex items-baseline"
                    style={{ left: `${fs.x}px`, top: `${fs.y}px`, textShadow: 'none' }}
                >
                    <span className="text-yellow-400" style={{ textShadow: '0 0 8px #facc15' }}>
                        +{fs.base}
                    </span>
                    {fs.bonus > 0 && (
                        <span className="text-green-400 text-xl ml-2" style={{ textShadow: '0 0 8px #4ade80' }}>
                            +{fs.bonus}
                        </span>
                    )}
                    {(fs.timingBonus ?? 0) > 0 && (
                         <span className="text-fuchsia-400 text-xl ml-2" style={{ textShadow: '0 0 8px #f0abfc' }}>
                            +{fs.timingBonus}
                        </span>
                    )}
                    {fs.timingLabel && (
                        <div className="flex items-baseline ml-4 animate-timing-bonus-pop">
                            <span className={`${fs.timingLabel.colorClass} text-3xl font-black`} style={{ textShadow: `0 0 10px currentColor` }}>
                                {fs.timingLabel.text}!
                            </span>
                            {fs.timingMultiplier && (
                                <span className="text-slate-300 text-lg ml-2">
                                    (x{fs.timingMultiplier.toFixed(2)})
                                </span>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {/* Falling Words */}
            <div className="absolute inset-0">
                {words.map(word => (
                    <FallingWord key={word.id} word={word} typedInput={typedInput} />
                ))}
            </div>

            {/* Flow Bar */}
            <FlowBar lastCompletionTime={lastCompletionTime} />

            {/* Input Field */}
            <div className="relative z-20 mt-4">
                <input
                    ref={inputRef}
                    type="text"
                    value={typedInput}
                    onChange={(e) => onInputChange(e.target.value)}
                    className={`w-full p-4 text-2xl text-center bg-slate-900/80 border-2 rounded-lg outline-none transition-all duration-300 text-white placeholder-slate-500 ${statusClass} disabled:bg-slate-700/50`}
                    placeholder="Type words here..."
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    disabled={isPaused}
                />
            </div>
        </div>
    );
};

export default GameScreen;
