import React from 'react';

interface ComboIndicatorProps {
    combo: number;
}

const ComboIndicator: React.FC<ComboIndicatorProps> = ({ combo }) => {
    if (combo <= 1) {
        return null; // Don't show for low combos
    }

    const getComboStyle = () => {
        let colorClass = 'text-yellow-400';
        let shadowColor = 'rgba(250, 204, 21, 0.7)';
        let glowAnimation = '';
        let scale = Math.min(2.5, 1 + combo * 0.05);

        if (combo >= 20) {
            colorClass = 'text-red-500';
            shadowColor = 'rgba(239, 68, 68, 0.8)';
            glowAnimation = 'animate-combo-glow-red';
        } else if (combo >= 10) {
            colorClass = 'text-orange-500';
            shadowColor = 'rgba(249, 115, 22, 0.7)';
        } else if (combo >= 5) {
            colorClass = 'text-amber-400';
            shadowColor = 'rgba(251, 191, 36, 0.7)';
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
            className={`flex flex-col items-center justify-center pointer-events-none z-20 transition-transform duration-300 animate-shrink-pulse`}
        >
            <div key={combo} className="animate-combo-pop">
                <span 
                    className={`text-7xl font-black transition-colors duration-300 ${colorClass} ${glowAnimation}`} 
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