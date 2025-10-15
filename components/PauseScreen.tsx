import React from 'react';

interface PauseScreenProps {
    onResume: () => void;
    onQuit: () => void;
}

const PauseScreen: React.FC<PauseScreenProps> = ({ onResume, onQuit }) => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <div className="glass-panel p-12">
                <h2 className="text-6xl font-extrabold mb-8 text-cyan-300" style={{textShadow: '0 0 10px #0dd'}}>Paused</h2>
                <div className="flex flex-col sm:flex-row gap-6">
                    <button
                        onClick={onResume}
                        className="btn btn-green"
                    >
                        Resume
                    </button>
                    <button
                        onClick={onQuit}
                        className="btn btn-red"
                    >
                        Quit
                    </button>
                </div>
                <p className="text-slate-400 mt-8">Press 'Escape' to resume.</p>
            </div>
        </div>
    );
};

export default PauseScreen;