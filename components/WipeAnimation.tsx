import React from 'react';

const WipeAnimation: React.FC = () => {
    return (
        <div 
            className="absolute inset-0 z-40 bg-gradient-to-t from-cyan-300 via-cyan-400 to-cyan-500 animate-wipe-clean"
            style={{ mixBlendMode: 'lighten' }}
        >
        </div>
    );
};

export default WipeAnimation;