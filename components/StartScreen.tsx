
import React from 'react';

interface StartScreenProps {
    onStart: () => void;
    isLoading: boolean;
    error: string | null;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, isLoading, error }) => {
    return (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center z-30 p-8 text-center">
            <h2 className="text-6xl font-extrabold mb-4 text-cyan-300 animate-pulse">Get Ready!</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-md">Type the falling words before they hit the bottom. Lose a life for every word you miss. Good luck!</p>
            {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md mb-4">{error}</p>}
            <button
                onClick={onStart}
                disabled={isLoading}
                className="px-10 py-5 bg-cyan-500 text-slate-900 font-bold text-2xl rounded-lg shadow-lg hover:bg-cyan-400 hover:scale-105 transition-transform duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Loading Words...' : 'Start Game'}
            </button>
        </div>
    );
};

export default StartScreen;
