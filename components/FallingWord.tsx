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

    const typedPart = isTyping ? word.text.substring(0, typedInput.length) : '';
    const untypedPart = isTyping ? word.text.substring(typedInput.length) : word.text;
    
    const wordStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${word.x}px`,
        top: `${word.y}px`,
        textShadow: isTyping ? '0 0 8px #0ff' : (isPowerUp ? '0 0 8px #fff' : '0 0 5px #000'),
        opacity: isDestroyed ? 0 : 1,
        transition: 'opacity 0.1s linear',
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
                className={`select-none text-2xl font-semibold transition-colors duration-150 ${
                    isPowerUp ? 'rainbow-text font-extrabold text-3xl' : 
                    isTyping ? 'text-cyan-300' : 'text-slate-300'
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
                        background: isPowerUp ? 'white' : 'cyan'
                    } as React.CSSProperties}
                 />
            ))}
        </div>
    );
};

export default React.memo(FallingWord);