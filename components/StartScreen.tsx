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
        // A small timeout to give feedback to the user
        setTimeout(() => {
            onStart(difficulty);
            // isLoading will be handled by the parent component changing the screen
        }, 200);
    };

    const renderButton = (difficulty: Difficulty, label: string, colorClass: string) => {
        const isThisLoading = isLoading && selectedDifficulty === difficulty;
        return (
            <button
                onClick={() => handleStart(difficulty)}
                disabled={isLoading}
                className={`btn ${colorClass} w-full sm:w-auto flex-1`}
            >
                {isThisLoading ? 'Loading...' : label}
            </button>
        );
    };


    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <h1 className="text-8xl md:text-9xl font-black text-cyan-300 mb-12 animate-title-glow" style={{ letterSpacing: '0.1em' }}>
                TYPING THUNDER
            </h1>
            
            <div className="glass-panel p-8 sm:p-12 animate-panel-float">
                <p className="text-xl text-slate-300 mb-8 max-w-lg">
                    Unleash a storm of words. Type with lightning speed and precision to dominate the leaderboard.
                </p>
                <p className="text-2xl text-slate-100 mb-6 font-semibold">Choose Your Challenge:</p>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    {renderButton('Easy', 'Easy', 'btn-green')}
                    {renderButton('Medium', 'Medium', 'btn-yellow')}
                    {renderButton('Hard', 'Hard', 'btn-red')}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={onCustomGame} disabled={isLoading} className="btn btn-fuchsia w-full sm:w-auto">
                        Custom Game
                    </button>
                    <button onClick={onHelp} disabled={isLoading} className="btn btn-sky w-full sm:w-auto">
                        How to Play
                    </button>
                    <button onClick={onLeaderboard} disabled={isLoading} className="btn btn-violet w-full sm:w-auto">
                        Leaderboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StartScreen;