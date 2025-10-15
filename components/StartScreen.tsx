import React, { useState } from 'react';
import { Difficulty } from '../types';

interface StartScreenProps {
    onStart: (difficulty: Difficulty) => void;
    onCustomGame: () => void;
    onHelp: () => void;
    onLeaderboard: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onCustomGame, onHelp, onLeaderboard }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);


    const handleStart = (difficulty: Difficulty) => {
        setSelectedDifficulty(difficulty);
        setIsLoading(true);
        setTimeout(() => {
            onStart(difficulty);
        }, 200);
    };

    const renderButton = (difficulty: Difficulty, label: string, colorClass: string) => {
        const isThisLoading = isLoading && selectedDifficulty === difficulty;
        return (
            <button
                onClick={() => handleStart(difficulty)}
                disabled={isLoading}
                className={`btn btn-difficulty ${colorClass} w-full`}
            >
                {isThisLoading ? 'LOADING...' : label}
            </button>
        );
    };


    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center start-screen-bg">
            <div className="glass-panel p-8 sm:p-12 w-full max-w-md">
                <h1 className="text-6xl md:text-7xl font-black text-cyan-300 mb-4 animate-title-flicker" style={{ letterSpacing: '0.05em' }}>
                    TYPING
                </h1>
                 <h1 className="text-6xl md:text-7xl font-black text-cyan-300 mb-12 animate-title-flicker" style={{animationDelay: '0.1s', letterSpacing: '0.05em'}}>
                    THUNDER
                </h1>

                <div className="flex flex-col gap-4 mb-10">
                    {renderButton('Easy', 'Easy', 'btn-green')}
                    {renderButton('Medium', 'Medium', 'btn-yellow')}
                    {renderButton('Hard', 'Hard', 'btn-red')}
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                     <button onClick={onCustomGame} disabled={isLoading} className="btn btn-secondary w-full">
                        Custom
                    </button>
                    <button onClick={onHelp} disabled={isLoading} className="btn btn-secondary w-full">
                        Help
                    </button>
                    <button onClick={onLeaderboard} disabled={isLoading} className="btn btn-secondary w-full">
                        Scores
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StartScreen;