import React, { useState } from 'react';
import { Difficulty } from '../types';

interface StartScreenProps {
    onStart: (difficulty: Difficulty) => void;
    isLoading: boolean;
    error: string | null;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, isLoading, error }) => {
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);

    const handleStart = (difficulty: Difficulty) => {
        setSelectedDifficulty(difficulty);
        onStart(difficulty);
    };

    const renderButton = (difficulty: Difficulty, label: string, color: string) => {
        const isThisLoading = isLoading && selectedDifficulty === difficulty;
        return (
            <button
                onClick={() => handleStart(difficulty)}
                disabled={isLoading}
                className={`px-8 py-4 ${color} text-slate-900 font-bold text-xl rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed w-full sm:w-auto`}
            >
                {isThisLoading ? 'Loading...' : label}
            </button>
        );
    };


    return (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center z-30 p-8 text-center">
            <h2 className="text-6xl font-extrabold mb-4 text-cyan-300 animate-pulse">Get Ready!</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-md">Type the falling words before they hit the bottom. Lose a life for every word you miss.</p>
            <p className="text-2xl text-slate-100 mb-6 font-semibold">Select a difficulty:</p>
            {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md mb-4">{error}</p>}
            <div className="flex flex-col sm:flex-row gap-4">
                {renderButton('Easy', 'Easy', 'bg-green-400 hover:bg-green-300')}
                {renderButton('Medium', 'Medium', 'bg-yellow-400 hover:bg-yellow-300')}
                {renderButton('Hard', 'Hard', 'bg-red-500 hover:bg-red-400')}
            </div>
        </div>
    );
};

export default StartScreen;