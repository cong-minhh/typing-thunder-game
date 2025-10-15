import React from 'react';

const ShieldIcon: React.FC = () => (
    <div className="relative w-10 h-10 animate-shield-pulse">
        <svg
            className="w-full h-full text-cyan-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 0 10px #06b6d4)' }}
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    </div>
);

export default ShieldIcon;