import React, { useState, useEffect } from 'react';
import { BossState } from '../types';

interface BossDisplayProps {
    bossState: BossState;
}

const GIBBERISH_CHARS = '!@#$%^&*?~';

const generateGibberish = (length: number) => {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += GIBBERISH_CHARS.charAt(Math.floor(Math.random() * GIBBERISH_CHARS.length));
    }
    return result;
};

const BossDisplay: React.FC<BossDisplayProps> = ({ bossState }) => {
    const { words, currentWordIndex } = bossState;
    const currentWord = words[currentWordIndex] || ''; // Defensive check
    const [displayWord, setDisplayWord] = useState(currentWord);
    const [isGlitching, setIsGlitching] = useState(false);

    useEffect(() => {
        const targetWord = words[currentWordIndex] || ''; // Defensive check

        // Trigger glitch effect when the word changes
        if (currentWordIndex > 0 && targetWord) {
            setIsGlitching(true);
            const wordLength = targetWord.length;
            
            // Show gibberish for a short time
            setDisplayWord(generateGibberish(wordLength));
            
            setTimeout(() => {
                setDisplayWord(targetWord);
                setIsGlitching(false);
            }, 150);
        } else if (targetWord) {
            // Initial word set
            setDisplayWord(targetWord);
        }
    }, [currentWordIndex, words]);

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div 
                className={`text-6xl font-black text-center p-4 rounded-lg bg-slate-900/50 border-2 border-fuchsia-500 ${isGlitching ? 'animate-glitch text-red-500' : 'text-fuchsia-300'}`}
                style={{textShadow: '0 0 15px #d946ef'}}
            >
                {displayWord}
            </div>
        </div>
    );
};

export default BossDisplay;