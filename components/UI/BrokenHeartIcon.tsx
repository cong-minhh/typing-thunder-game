import React from 'react';

const BrokenHeartIcon: React.FC = () => (
    <div className="relative w-32 h-32 animate-broken-heart">
        <svg className="absolute w-32 h-32 text-red-500 -translate-x-2 -translate-y-1 -rotate-6 transition-transform duration-1000" style={{ filter: 'drop-shadow(0 0 8px #f00)' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364L12 7.636V20.364z" />
        </svg>
        <svg className="absolute w-32 h-32 text-red-500 translate-x-2 translate-y-1 rotate-6 transition-transform duration-1000" style={{ filter: 'drop-shadow(0 0 8px #f00)' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 20.364l7.682-7.682a4.5 4.5 0 10-6.364-6.364L12 7.636V20.364z" />
        </svg>
    </div>
);

export default BrokenHeartIcon;
