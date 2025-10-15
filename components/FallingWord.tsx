import React from 'react';
import { Word } from '../types';

interface FallingWordProps {
    word: Word;
    typedInput: string;
}

const FallingWord = React.forwardRef<HTMLDivElement, FallingWordProps>(({ word, typedInput }, ref) => {
    const isTyping = word.status === 'falling' && word.text.startsWith(typedInput) && typedInput !== '';
    const isDestroyed = word.status === 'destroyed';

    const typedPart = isTyping ? typedInput : '';
    const untypedPart = isTyping ? word.text.substring(typedInput.length) : word.text;
    
    const wordStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${word.x}px`,
        top: `${word.y}px`,
        textShadow: isTyping ? '0 0 8px #0ff' : '0 0 5px #000',
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

    const explosionColors = ['bg-cyan-400', 'bg-green-400', 'bg-yellow-400'];

    return (
        <div ref={ref} style={wordStyle} className="relative">
            {/* The visible word text */}
            <div
                className={`select-none text-2xl font-semibold transition-colors duration-150 ${isTyping ? 'text-cyan-300' : 'text-slate-300'}`}
            >
                {typedPartSpans}
                <span>{untypedPart}</span>
            </div>
            {/* Particle explosion on destroy */}
            {isDestroyed && Array.from({ length: 15 }).map((_, i) => {
                 const color = explosionColors[i % explosionColors.length];
                 return (
                    <div
                        key={i}
                        className={`absolute top-1/2 left-1/2 w-2 h-2 ${color} rounded-full animate-explode-particle`}
                        style={{
                            '--x': `${(Math.random() - 0.5) * 150}px`,
                            '--y': `${(Math.random() - 0.5) * 150}px`,
                            '--s': `${Math.random() + 0.5}`,
                        } as React.CSSProperties}
                    />
                 );
            })}
        </div>
    );
});

const areEqual = (prevProps: FallingWordProps, nextProps: FallingWordProps) => {
    return (
        prevProps.word.id === nextProps.word.id &&
        prevProps.word.y === nextProps.word.y &&
        prevProps.word.status === nextProps.word.status &&
        (
            !nextProps.word.text.startsWith(nextProps.typedInput) || // Not currently being typed
            prevProps.typedInput === nextProps.typedInput // Or input hasn't changed for this word
        )
    );
}


export default React.memo(FallingWord, areEqual);