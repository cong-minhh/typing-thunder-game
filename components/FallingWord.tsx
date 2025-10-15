import React from 'react';
import { Word } from '../types';

interface FallingWordProps {
    word: Word;
    typedInput: string;
}

const FallingWord: React.FC<FallingWordProps> = ({ word, typedInput }) => {
    const lowercasedInput = typedInput.toLowerCase();
    const lowercasedWordText = word.text.toLowerCase();
    const isTyping = word.status === 'falling' && lowercasedWordText.startsWith(lowercasedInput) && lowercasedInput !== '';
    const isDestroyed = word.status === 'destroyed';
    const isPowerUp = !!word.powerUp;
    const isWaveWord = !!word.isWaveWord;
    const isTransformed = !!word.isTransformed;
    const isProjectile = !!word.isProjectile;

    const typedPart = isTyping ? word.text.substring(0, typedInput.length) : '';
    const untypedPart = isTyping ? word.text.substring(typedInput.length) : word.text;
    
    const wordStyle: React.CSSProperties = {
        position: 'absolute',
        left: 0,
        top: 0,
        transform: `translate(${word.x}px, ${word.y}px)`,
        textShadow: isTyping ? '0 0 8px #0ff' : 
                     isPowerUp ? '0 0 8px #fff' : 
                     isWaveWord ? '0 0 8px #ef4444' : 
                     isTransformed ? '0 0 15px #fff, 0 0 25px #fff' : 
                     isProjectile ? '0 0 15px #d946ef, 0 0 25px #d946ef' : // fuchsia-500
                     '0 0 5px #000',
        opacity: isDestroyed ? 0 : 1,
        transition: 'opacity 0.1s linear, transform 0.05s linear', // smooth transform for bouncing
    };

    const typedPartSpans = typedPart.split('').map((char, index) => (
        <span
            key={index}
            className="animate-letter-pop text-yellow-400 font-bold"
            style={{ textShadow: '0 0 8px #facc15' }} // yellow-400 glow
        >
            {char}
        </span>
    ));

    return (
        <div style={wordStyle} className="relative">
            {/* The visible word text */}
            <div
                className={`select-none font-semibold transition-colors duration-150 whitespace-nowrap ${
                    isPowerUp ? 'rainbow-text font-extrabold text-3xl' :
                    isWaveWord ? 'text-red-400 text-2xl' :
                    isTransformed ? 'text-white animate-pulse text-2xl' :
                    isProjectile ? 'text-fuchsia-400 text-4xl font-black animate-pulse' :
                    isTyping ? 'text-cyan-300 text-2xl' : 'text-slate-300 text-2xl'
                }`}
            >
                {typedPartSpans}
                <span>{untypedPart}</span>
            </div>
            {/* Particle explosion on destroy */}
            {isDestroyed && Array.from({ length: isPowerUp ? 16 : 8 }).map((_, i) => (
                 <div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-explode-particle"
                    style={{
                        '--x': `${(Math.random() - 0.5) * (isPowerUp ? 250 : 150)}px`,
                        '--y': `${(Math.random() - 0.5) * (isPowerUp ? 250 : 150)}px`,
                        '--s': `${Math.random() + (isPowerUp ? 1 : 0.5)}`,
                        '--duration': `${0.5 + Math.random() * 0.4}s`,
                        '--delay': `${Math.random() * 0.1}s`,
                        background: isPowerUp ? 'white' : isWaveWord ? '#f87171' : isProjectile ? '#d946ef' : 'cyan' 
                    } as React.CSSProperties}
                 />
            ))}
        </div>
    );
};

export default React.memo(FallingWord);