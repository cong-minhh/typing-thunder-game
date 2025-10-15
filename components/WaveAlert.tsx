import React from 'react';

const WaveAlert: React.FC = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none animate-screen-shake-subtle">
            <h1 
                className="text-8xl font-black text-red-500 animate-wave-alert-intense" 
                style={{textShadow: '0 0 20px #ef4444, 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000'}}
            >
                WAVE INCOMING
            </h1>
        </div>
    );
};

export default WaveAlert;