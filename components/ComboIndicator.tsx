import React from 'react';

interface ComboIndicatorProps {
    combo: number;
}

const ComboIndicator: React.FC<ComboIndicatorProps> = ({ combo }) => {
    if (combo <= 1) {
        return null;
    }

    const getComboStyle = () => {
        let colorClass = 'text-yellow-400';
        let shadowColor = 'rgba(250, 204, 21, 0.7)'; // yellow-400
        let glowAnimation = '';
        let scale = Math.min(2.5, 1 + (combo - 1) * 0.07);

        if (combo >= 10) {
            colorClass = 'text-red-500';
            shadowColor = 'rgba(239, 68, 68, 0.7)'; // red-500
            glowAnimation = 'animate-combo-glow-red';
        } else if (combo >= 5) {
            colorClass = 'text-orange-400';
            shadowColor = 'rgba(251, 146, 60, 0.7)'; // orange-400
        }
        
        return {
            colorClass,
            shadowColor,
            glowAnimation,
            scale,
        };
    };

    const { colorClass, shadowColor, glowAnimation, scale } = getComboStyle();

    return (
        <div 
            className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none z-20"
        >
            <div key={combo} className="animate-combo-pop">
                <span 
                    className={`text-6xl font-black transition-transform duration-300 ${colorClass} ${glowAnimation}`} 
                    style={{ 
                        transform: `scale(${scale})`,
                        textShadow: `0 0 15px ${shadowColor}, 0 0 25px ${shadowColor}`
                    }}
                >
                    {combo}x
                </span>
                <span 
                    className={`block text-3xl font-bold tracking-widest text-center mt-2 ${colorClass}`}
                    style={{ 
                        textShadow: `0 0 10px ${shadowColor}`
                    }}
                >
                    COMBO
                </span>
            </div>
        </div>
    );
};

export default ComboIndicator;