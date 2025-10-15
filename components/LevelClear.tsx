import React from 'react';

const LevelClear: React.FC = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none flash-container">
            <h1 
                className="text-8xl font-black text-green-400 animate-level-clear-shine" 
                style={{textShadow: '0 0 20px #4ade80'}}
            >
                LEVEL CLEAR!
            </h1>
        </div>
    );
};

export default LevelClear;