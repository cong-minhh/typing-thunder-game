import React from 'react';

const LevelClear: React.FC = () => {
    return (
        <div className="absolute inset-0 z-50 pointer-events-none flash-container flex items-center justify-center">
            <div>
                <h1 
                    className="text-8xl font-black text-green-400 animate-level-clear-shine whitespace-nowrap" 
                    style={{textShadow: '0 0 20px #4ade80'}}
                >
                    LEVEL CLEAR!
                </h1>
            </div>
        </div>
    );
};

export default LevelClear;