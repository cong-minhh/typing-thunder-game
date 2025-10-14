
import React from 'react';

interface GameOverScreenProps {
    score: number;
    onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart }) => {
    return (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center z-30 p-8 text-center">
            <h2 className="text-6xl font-extrabold mb-4 text-red-500">Game Over</h2>
            <p className="text-3xl text-slate-300 mb-2">Your Final Score:</p>
            <p className="text-7xl font-bold text-cyan-400 mb-10">{score}</p>
            <button
                onClick={onRestart}
                className="px-10 py-5 bg-cyan-500 text-slate-900 font-bold text-2xl rounded-lg shadow-lg hover:bg-cyan-400 hover:scale-105 transition-transform duration-300"
            >
                Play Again
            </button>
        </div>
    );
};

export default GameOverScreen;
