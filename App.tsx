import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, Word, Difficulty, FloatingScore } from './types';
import { fetchWords } from './services/geminiService';
import GameScreen from './components/GameScreen';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import ComboIndicator from './components/ComboIndicator';
import { INITIAL_LIVES, LEVEL_UP_SCORE, WORD_FALL_SPEED_INCREASE, WORD_SPAWN_RATE_DECREASE, DIFFICULTY_SETTINGS } from './constants';
import HeartIcon from './components/UI/HeartIcon';

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
    const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
    const [combo, setCombo] = useState<number>(0);
    const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);

    const animationFrameId = useRef<number | null>(null);
    const lastSpawnTime = useRef<number>(Date.now());
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const inputStatusTimeout = useRef<number | null>(null);
    const wordComplexityLevel = useRef<number>(1);
    
    const difficultySettings = DIFFICULTY_SETTINGS[difficulty];
    const wordFallSpeed = difficultySettings.WORD_FALL_SPEED_START + (level - 1) * WORD_FALL_SPEED_INCREASE;
    const wordSpawnRate = Math.max(200, difficultySettings.WORD_SPAWN_RATE_START - (level - 1) * WORD_SPAWN_RATE_DECREASE);

    const resetGameState = useCallback(() => {
        setWords([]);
        setTypedInput('');
        setScore(0);
        setLives(INITIAL_LIVES);
        setLevel(1);
        setError(null);
        setCombo(0);
        setFloatingScores([]);
        lastSpawnTime.current = Date.now();
    }, []);

    const startGame = useCallback(async (selectedDifficulty: Difficulty) => {
        resetGameState();
        setIsLoading(true);
        setError(null);
        setDifficulty(selectedDifficulty);

        const startComplexity = DIFFICULTY_SETTINGS[selectedDifficulty].COMPLEXITY_START_LEVEL;
        wordComplexityLevel.current = startComplexity;

        try {
            const newWords = await fetchWords(startComplexity);
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
            })).filter(word => word.status === 'falling');

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
                setCombo(0); // Reset combo on missed word
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
        if (gameStatus === GameStatus.Playing && score > 0 && score >= level * LEVEL_UP_SCORE) {
            setLevel(prevLevel => prevLevel + 1);
        }
    }, [score, level, gameStatus]);

    useEffect(() => {
        if (level > 1 && gameStatus === GameStatus.Playing) {
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 1500);
            
            const fetchNewWords = async () => {
                wordComplexityLevel.current += 1;
                try {
                    const additionalWords = await fetchWords(wordComplexityLevel.current);
                    setWordBank(prev => [...new Set([...prev, ...additionalWords])]);
                } catch (err) {
                    console.error(`Failed to fetch more words for complexity ${wordComplexityLevel.current}:`, err);
                }
            };
            fetchNewWords();
        }
    }, [level, gameStatus]);


    const handleInputChange = (newValue: string) => {
        const lowercasedValue = newValue.toLowerCase();
    
        if (inputStatusTimeout.current) {
            clearTimeout(inputStatusTimeout.current);
        }
    
        if (lowercasedValue.length > typedInput.length) {
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
            const gameHeight = gameContainerRef.current?.offsetHeight ?? 800;
            const basePoints = matchedWord.text.length;
            
            // Position bonus: More points for words higher up.
            const positionMultiplier = 1 - (matchedWord.y / gameHeight);
            const pointsFromPosition = Math.ceil(basePoints * Math.max(0.1, positionMultiplier));
            
            // Combo bonus: Multiplier increases with combo.
            const comboBonusMultiplier = 1 + (combo * 0.1);
            const finalPoints = Math.round(pointsFromPosition * comboBonusMultiplier);

            setScore(prev => prev + finalPoints);
            setCombo(prev => prev + 1);

            const newFloatingScore: FloatingScore = {
                id: Date.now(),
                value: finalPoints,
                x: matchedWord.x,
                y: matchedWord.y,
            };
            setFloatingScores(prev => [...prev, newFloatingScore]);
            setTimeout(() => {
                setFloatingScores(prev => prev.filter(fs => fs.id !== newFloatingScore.id));
            }, 1000);

            setWords(prevWords => prevWords.map(w => w.id === matchedWord.id ? { ...w, status: 'destroyed' } : w));
            setTypedInput('');
            
            setTimeout(() => {
                setWords(prevWords => prevWords.filter(w => w.id !== matchedWord.id));
            }, 600);
        }
    }, [typedInput, words, combo]);

    useEffect(() => {
        return () => {
            if (inputStatusTimeout.current) {
                clearTimeout(inputStatusTimeout.current);
            }
        };
    }, []);

    const returnToStart = () => {
        setGameStatus(GameStatus.Start);
    };

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
                        gameContainerRef={gameContainerRef}
                        showLevelUp={showLevelUp}
                        inputStatus={inputStatus}
                        floatingScores={floatingScores}
                    />
                );
            case GameStatus.GameOver:
                return <GameOverScreen score={score} onRestart={returnToStart} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen font-mono p-4">
            <h1 className="text-5xl font-bold text-cyan-400 mb-2 tracking-widest" style={{ textShadow: '0 0 10px #0ff' }}>
                TYPING THUNDER
            </h1>
            <div className="w-full max-w-6xl mx-auto flex justify-center items-start gap-8">
                {/* Left side for Combo */}
                <div className="w-64 flex-shrink-0 flex justify-center pt-8">
                    {gameStatus === GameStatus.Playing && <ComboIndicator combo={combo} />}
                </div>

                {/* Game container */}
                <div className="w-full max-w-4xl">
                    {gameStatus === GameStatus.Playing && (
                        <div className="p-4 bg-slate-900/50 backdrop-blur-sm flex justify-between items-center z-10 border-b border-x border-t border-cyan-400/30 rounded-t-lg">
                            <div className="flex items-center space-x-4">
                                <h2 className="text-xl font-bold">Score: <span key={score} className="text-cyan-400 w-24 inline-block animate-score-pop">{score}</span></h2>
                                <h2 className="text-xl font-bold">Level: <span className="text-green-400">{level}</span></h2>
                            </div>
                            <div className="flex items-center space-x-2">
                                {Array.from({ length: lives }).map((_, i) => (
                                    <HeartIcon key={i} />
                                ))}
                            </div>
                        </div>
                    )}
                    <div className={`w-full max-w-4xl h-[70vh] bg-slate-800/50 border-2 border-cyan-400/50 rounded-lg shadow-2xl shadow-cyan-500/10 relative overflow-hidden ${isShaking ? 'animate-shake' : ''} ${gameStatus === GameStatus.Playing ? 'rounded-t-none border-t-0' : ''}`}>
                        {renderContent()}
                    </div>
                </div>


                {/* Right side spacer for balance */}
                <div className="w-64 flex-shrink-0"></div>
            </div>
        </div>
    );
};

export default App;