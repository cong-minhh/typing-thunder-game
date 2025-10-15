import React from 'react';

const WaveAlert: React.FC = () => {
    return (
        <div className="absolute inset-0 z-50 pointer-events-none animate-screen-shake-subtle flex items-center justify-center">
            <div>
                <h1 
                    className="text-8xl font-black text-red-500 animate-wave-alert-intense whitespace-nowrap" 
                    style={{textShadow: '0 0 20px #ef4444, 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000'}}
                >
                    WAVE INCOMING
                </h1>
            </div>
        </div>
    );
};

export default WaveAlert;