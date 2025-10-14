import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, Word } from './types';
import { fetchWords } from './services/geminiService';
import GameScreen from './components/GameScreen';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import { INITIAL_LIVES, LEVEL_UP_SCORE, WORD_FALL_SPEED_START, WORD_FALL_SPEED_INCREASE, WORD_SPAWN_RATE_START, WORD_SPAWN_RATE_DECREASE } from './constants';

const App: React.FC = () => {
    const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Start);
    const [words, setWords] = useState<Word[]>([]);
    const [typedInput, setTypedInput] = useState<string>('');
    const [score, setScore] = useState<number>(0);
    const [lives, setLives] = useState<number>(INITIAL_LIVES);
    const [level, setLevel] = useState<number>(1);
    const [wordBank, setWordBank] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isShaking, setIsShaking] = useState<boolean>(false);
    const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
    const [inputStatus, setInputStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

    const animationFrameId = useRef<number | null>(null);
    const lastSpawnTime = useRef<number>(Date.now());
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const inputStatusTimeout = useRef<number | null>(null);

    const wordFallSpeed = WORD_FALL_SPEED_START + (level - 1) * WORD_FALL_SPEED_INCREASE;
    const wordSpawnRate = Math.max(200, WORD_SPAWN_RATE_START - (level - 1) * WORD_SPAWN_RATE_DECREASE);

    const resetGameState = useCallback(() => {
        setWords([]);
        setTypedInput('');
        setScore(0);
        setLives(INITIAL_LIVES);
        setLevel(1);
        setError(null);
        lastSpawnTime.current = Date.now();
    }, []);

    const startGame = useCallback(async () => {
        resetGameState();
        setIsLoading(true);
        try {
            const newWords = await fetchWords();
            setWordBank(newWords);
            setGameStatus(GameStatus.Playing);
        } catch (err) {
            setError('Failed to fetch words from Gemini. Please try again.');
            console.error(err);
            setGameStatus(GameStatus.Start);
        } finally {
            setIsLoading(false);
        }
    }, [resetGameState]);

    const spawnWord = useCallback(() => {
        if (wordBank.length === 0 || !gameContainerRef.current) return;

        const gameWidth = gameContainerRef.current.offsetWidth;
        const randomWord = wordBank[Math.floor(Math.random() * wordBank.length)];
        
        let spawnX: number;
        let attempts = 0;
        let positionValid = false;
        
        do {
            spawnX = Math.random() * (gameWidth - (randomWord.length * 12));
            positionValid = !words.some(word => 
                word.y < 50 && Math.abs(word.x - spawnX) < 100
            );
            attempts++;
        } while (!positionValid && attempts < 10);


        const newWord: Word = {
            id: Date.now() + Math.random(),
            text: randomWord,
            x: Math.max(0, spawnX),
            y: -20,
            status: 'falling',
        };
        setWords(prev => [...prev, newWord]);
    }, [wordBank, words]);

    const gameLoop = useCallback(() => {
        if (gameStatus !== GameStatus.Playing) return;

        setWords(prevWords => {
            const gameHeight = gameContainerRef.current?.offsetHeight ?? 800;
            const updatedWords = prevWords.map(word => ({
                ...word,
                y: word.y + wordFallSpeed,
            })).filter(word => word.status === 'falling'); // Only move falling words

            const missedWords = updatedWords.filter(word => word.y >= gameHeight);
            if (missedWords.length > 0) {
                setLives(prevLives => {
                    const newLives = prevLives - missedWords.length;
                    if (newLives < prevLives) {
                        setIsShaking(true);
                        setTimeout(() => setIsShaking(false), 500);
                    }
                    return newLives;
                });
            }

            return prevWords.map(word => ({
                ...word,
                y: word.y + wordFallSpeed
            })).filter(word => word.y < gameHeight || word.status === 'destroyed');
        });

        if (Date.now() - lastSpawnTime.current > wordSpawnRate) {
            spawnWord();
            lastSpawnTime.current = Date.now();
        }

        animationFrameId.current = requestAnimationFrame(gameLoop);
    }, [gameStatus, spawnWord, wordFallSpeed, wordSpawnRate]);

    useEffect(() => {
        if (gameStatus === GameStatus.Playing) {
            animationFrameId.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [gameStatus, gameLoop]);

    useEffect(() => {
        if (lives <= 0) {
            setGameStatus(GameStatus.GameOver);
        }
    }, [lives]);
    
    useEffect(() => {
        if (score > 0 && score >= level * LEVEL_UP_SCORE) {
            setLevel(prevLevel => prevLevel + 1);
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 1500);
        }
    }, [score, level]);

    const handleInputChange = (newValue: string) => {
        const lowercasedValue = newValue.toLowerCase();
    
        if (inputStatusTimeout.current) {
            clearTimeout(inputStatusTimeout.current);
        }
    
        if (lowercasedValue.length > typedInput.length) { // A character was added
            const isCorrectPrefix = words.some(word => word.status === 'falling' && word.text.startsWith(lowercasedValue));
            if (isCorrectPrefix) {
                setInputStatus('correct');
            } else {
                setInputStatus('incorrect');
            }
            
            inputStatusTimeout.current = window.setTimeout(() => {
                setInputStatus('idle');
            }, 300);
    
        } else {
            setInputStatus('idle');
        }
    
        setTypedInput(lowercasedValue);
    };

    useEffect(() => {
        const trimmedInput = typedInput.trim().toLowerCase();
        if (!trimmedInput) return;

        const matchedWord = words.find(word => word.status === 'falling' && word.text === trimmedInput);
        if (matchedWord) {
            setScore(prev => prev + matchedWord.text.length);
            setWords(prevWords => prevWords.map(w => w.id === matchedWord.id ? { ...w, status: 'destroyed' } : w));
            setTypedInput('');
            
            setTimeout(() => {
                setWords(prevWords => prevWords.filter(w => w.id !== matchedWord.id));
            }, 600);
        }
    }, [typedInput, words]);

    useEffect(() => {
        // Cleanup timeout on component unmount
        return () => {
            if (inputStatusTimeout.current) {
                clearTimeout(inputStatusTimeout.current);
            }
        };
    }, []);

    const renderContent = () => {
        switch (gameStatus) {
            case GameStatus.Start:
                return <StartScreen onStart={startGame} isLoading={isLoading} error={error} />;
            case GameStatus.Playing:
                return (
                    <GameScreen
                        words={words}
                        typedInput={typedInput}
                        onInputChange={handleInputChange}
                        score={score}
                        lives={lives}
                        level={level}
                        gameContainerRef={gameContainerRef}
                        showLevelUp={showLevelUp}
                        inputStatus={inputStatus}
                    />
                );
            case GameStatus.GameOver:
                return <GameOverScreen score={score} onRestart={startGame} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen font-mono p-4">
            <h1 className="text-5xl font-bold text-cyan-400 mb-2 tracking-widest" style={{ textShadow: '0 0 10px #0ff' }}>
                TYPING THUNDER
            </h1>
            <div className={`w-full max-w-4xl h-[70vh] bg-slate-800/50 border-2 border-cyan-400/50 rounded-lg shadow-2xl shadow-cyan-500/10 relative overflow-hidden ${isShaking ? 'animate-shake' : ''}`}>
                {renderContent()}
            </div>
        </div>
    );
};

export default App;