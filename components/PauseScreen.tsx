import React from 'react';

interface PauseScreenProps {
    onResume: () => void;
    onQuit: () => void;
}

const PauseScreen: React.FC<PauseScreenProps> = ({ onResume, onQuit }) => {
    return (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center z-30 p-8 text-center">
            <h2 className="text-6xl font-extrabold mb-8 text-cyan-300">Paused</h2>
            <div className="flex flex-col sm:flex-row gap-6">
                <button
                    onClick={onResume}
                    className="px-10 py-5 bg-green-500 text-slate-900 font-bold text-2xl rounded-lg shadow-lg hover:bg-green-400 hover:scale-105 transition-transform duration-300"
                >
                    Resume
                </button>
                <button
                    onClick={onQuit}
                    className="px-10 py-5 bg-red-500 text-slate-900 font-bold text-2xl rounded-lg shadow-lg hover:bg-red-400 hover:scale-105 transition-transform duration-300"
                >
                    Quit
                </button>
            </div>
             <p className="text-slate-400 mt-8">Press 'Escape' to resume.</p>
        </div>
    );
};

export default PauseScreen;
