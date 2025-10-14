
import React from 'react';

const HeartIcon: React.FC = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-8 w-8 text-red-500" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        style={{ filter: 'drop-shadow(0 0 5px #f00)' }}
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" 
        />
    </svg>
);

export default HeartIcon;
