import React, { useRef, useEffect, useState } from 'react';
import { Word, FloatingScore, TrailParticle } from '../types';
import FallingWord from './FallingWord';

interface GameScreenProps {
    words: Word[];
    typedInput: string;
    onInputChange: (value: string) => void;
    gameContainerRef: React.RefObject<HTMLDivElement>;
    showLevelUp: boolean;
    inputStatus: 'idle' | 'correct' | 'incorrect';
    floatingScores: FloatingScore[];
}

const GameScreen: React.FC<GameScreenProps> = ({
    words,
    typedInput,
    onInputChange,
    gameContainerRef,
    showLevelUp,
    inputStatus,
    floatingScores,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [trailParticles, setTrailParticles] = useState<TrailParticle[]>([]);
    const wordElementsRef = useRef<Map<number, HTMLDivElement | null>>(new Map());
    const wordsRef = useRef(words);
    wordsRef.current = words;

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        let animationFrameId: number;

        const trailLoop = () => {
            const now = Date.now();
            const newParticles: TrailParticle[] = [];

            const currentWords = wordsRef.current;
            currentWords.forEach(word => {
                if (word.status !== 'falling') return;
                
                const el = wordElementsRef.current.get(word.id);
                if (el && Math.random() > 0.5) {
                    const gameContainerRect = gameContainerRef.current?.getBoundingClientRect();
                    if (gameContainerRect) {
                        const wordRect = el.getBoundingClientRect();
                        const x = (wordRect.left - gameContainerRect.left) + (wordRect.width / 2);
                        const y = (wordRect.top - gameContainerRect.top) + (wordRect.height / 2);

                        newParticles.push({
                            id: Math.random(),
                            x: x + (Math.random() - 0.5) * wordRect.width,
                            y: y,
                            expiration: now + 700,
                        });
                    }
                }
            });

            setTrailParticles(prev => [
                ...prev.filter(p => p.expiration > now),
                ...newParticles,
            ]);

            animationFrameId = requestAnimationFrame(trailLoop);
        };

        trailLoop();
        
        return () => {
            cancelAnimationFrame(animationFrameId);
        }
    }, [gameContainerRef]);

    const statusClass = {
        idle: 'border-cyan-400 focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-300',
        correct: 'border-green-400 ring-4 ring-green-500/50',
        incorrect: 'border-red-500 ring-4 ring-red-500/50 animate-shake-short'
    }[inputStatus];

    return (
        <div ref={gameContainerRef} className="h-full w-full relative flex flex-col justify-end p-4">
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
                    <span className="text-yellow-400 animate-base-score-pop" style={{ textShadow: '0 0 8px #facc15' }}>
                        +{fs.base}
                    </span>
                    {fs.bonus > 0 && (
                        <span className="text-green-400 text-xl ml-2 animate-bonus-score-slide-in" style={{ textShadow: '0 0 8px #4ade80' }}>
                            +{fs.bonus}
                        </span>
                    )}
                </div>
            ))}
            
            {/* Trail Particles */}
            {trailParticles.map(p => (
                <div
                    key={p.id}
                    className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full pointer-events-none animate-trail-fade-out"
                    style={{
                        left: `${p.x}px`,
                        top: `${p.y}px`,
                        filter: 'blur(1px)',
                    }}
                />
            ))}

            {/* Falling Words */}
            <div className="absolute inset-0">
                {words.map(word => (
                    <FallingWord 
                        key={word.id} 
                        word={word} 
                        typedInput={typedInput} 
                        ref={el => {
                            if (el) {
                                wordElementsRef.current.set(word.id, el);
                            } else {
                                wordElementsRef.current.delete(word.id);
                            }
                        }}
                    />
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