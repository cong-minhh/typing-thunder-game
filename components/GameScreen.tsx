import React, { useRef, useEffect } from 'react';
import { Word, FloatingScore } from '../types';
import FallingWord from './FallingWord';
import HeartIcon from './UI/HeartIcon';
import ComboIndicator from './ComboIndicator';

interface GameScreenProps {
    words: Word[];
    typedInput: string;
    onInputChange: (value: string) => void;
    score: number;
    lives: number;
    level: number;
    gameContainerRef: React.RefObject<HTMLDivElement>;
    showLevelUp: boolean;
    inputStatus: 'idle' | 'correct' | 'incorrect';
    combo: number;
    floatingScores: FloatingScore[];
}

const GameScreen: React.FC<GameScreenProps> = ({
    words,
    typedInput,
    onInputChange,
    score,
    lives,
    level,
    gameContainerRef,
    showLevelUp,
    inputStatus,
    combo,
    floatingScores,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const statusClass = {
        idle: 'border-cyan-400 focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-300',
        correct: 'border-green-400 ring-4 ring-green-500/50',
        incorrect: 'border-red-500 ring-4 ring-red-500/50 animate-shake-short'
    }[inputStatus];

    return (
        <div ref={gameContainerRef} className="h-full w-full relative flex flex-col justify-end p-4">
            {/* Game Header */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-slate-900/50 backdrop-blur-sm flex justify-between items-center z-10 border-b border-cyan-400/30">
                <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-bold">Score: <span key={score} className="text-cyan-400 w-24 inline-block animate-score-pop">{score}</span></h2>
                    <h2 className="text-xl font-bold">Level: <span className="text-green-400">{level}</span></h2>
                </div>
                <div className="flex items-center space-x-2">
                    {Array.from({ length: lives }).map((_, i) => (
                        <HeartIcon key={i} />
                    ))}
                </div>
            </div>

            {/* Combo Indicator */}
            <ComboIndicator combo={combo} />

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
                    className="absolute text-yellow-400 text-2xl font-bold animate-float-up"
                    style={{ left: `${fs.x}px`, top: `${fs.y}px` }}
                >
                    +{fs.value}
                </div>
            ))}

            {/* Falling Words */}
            <div className="absolute inset-0">
                {words.map(word => (
                    <FallingWord key={word.id} word={word} typedInput={typedInput} />
                ))}
            </div>

            {/* Input Field */}
            <div className="relative z-20 mt-4">
                <input
                    ref={inputRef}
                    type="text"
                    value={typedInput}
                    onChange={(e) => onInputChange(e.target.value)}
                    className={`w-full p-4 text-2xl text-center bg-slate-900/80 border-2 rounded-lg outline-none transition-all duration-300 text-white placeholder-slate-500 ${statusClass}`}
                    placeholder="Type words here..."
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                />
            </div>
        </div>
    );
};

export default GameScreen;