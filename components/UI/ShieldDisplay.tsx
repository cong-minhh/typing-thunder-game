import React from 'react';
import ShieldIcon from './ShieldIcon';

interface ShieldDisplayProps {
    count: number;
}

const ShieldDisplay: React.FC<ShieldDisplayProps> = ({ count }) => {
    // Only show a max of 5 icons, then show a number
    const displayCount = Math.min(count, 5);
    const hasMore = count > 5;

    return (
        <div className="flex items-center justify-center h-full -space-x-4">
            {Array.from({ length: displayCount }).map((_, i) => (
                <ShieldIcon key={i} />
            ))}
            {hasMore && (
                <span className="relative z-10 text-white font-bold text-lg bg-slate-900/50 rounded-full px-2" style={{textShadow: '0 0 5px #0ff'}}>
                    +{count - displayCount}
                </span>
            )}
        </div>
    );
};

export default ShieldDisplay;
