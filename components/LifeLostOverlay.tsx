import React from 'react';
import BrokenHeartIcon from './UI/BrokenHeartIcon';

const LifeLostOverlay: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-black/50 z-50 flex flex-col items-center justify-center animate-time-stop-bg backdrop-blur-sm">
            <BrokenHeartIcon />
            <h1 className="text-6xl font-black text-red-500 mt-4 animate-streak-text" style={{ textShadow: '0 0 15px #ef4444' }}>
                STREAK BROKEN
            </h1>
        </div>
    );
};

export default LifeLostOverlay;
