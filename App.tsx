import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, Word, Difficulty, FloatingScore, PowerUpType, ActivePowerUp } from './types';
import GameScreen from './components/GameScreen';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import ComboIndicator from './components/ComboIndicator';
import { INITIAL_LIVES, LEVEL_UP_SCORE, WORD_FALL_SPEED_INCREASE, WORD_SPAWN_RATE_DECREASE, DIFFICULTY_SETTINGS, POWERUP_THRESHOLDS, POWERUP_DURATIONS, TIMING_WINDOW_MS, MAX_TIMING_BONUS_MULTIPLIER, TIMING_TIERS } from './constants';
import HeartIcon from './components/UI/HeartIcon';
import BackgroundAnimation from './components/BackgroundAnimation';
import PowerUpBar from './components/PowerUpBar';
import { EASY_WORDS } from './data/easy-words';
import { MEDIUM_WORDS } from './data/medium-words';
import { HARD_WORDS } from './data/hard-words';
import PauseScreen from './components/PauseScreen';
import WipeAnimation from './components/WipeAnimation';
import LifeLostOverlay from './components/LifeLostOverlay';

const App: React.FC = () => {
    const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Start);
    const [words, setWords] = useState<Word[]>([]);
    const [typedInput, setTypedInput] = useState<string>('');
    const [score, setScore] = useState<number>(0);
    const [lives, setLives] = useState<number>(INITIAL_LIVES);
    const [level, setLevel] = useState<number>(1);
    const [isShaking, setIsShaking] = useState<boolean>(false);
    const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
    const [inputStatus, setInputStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
    const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
    const [combo, setCombo] = useState<number>(0);
    const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
    const [powerUpProgress, setPowerUpProgress] = useState({ slowTime: 0, clearWords: 0 });
    const [powerUpsReady, setPowerUpsReady] = useState({ slowTime: false, clearWords: false });
    const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
    const [gameWords, setGameWords] = useState<string[]>([]);
    const [isWiping, setIsWiping] = useState(false);
    const [isLosingLife, setIsLosingLife] = useState(false);
    const [lastCompletionTime, setLastCompletionTime] = useState<number | null>(null);

    const animationFrameId = useRef<number | null>(null);
    const lastSpawnTime = useRef<number>(Date.now());
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const inputStatusTimeout = useRef<number | null>(null);
    const resumeAnimation = useRef<{startTime: number, duration: number} | null>(null);
    const prevLivesRef = useRef(lives);
    
    const difficultySettings = DIFFICULTY_SETTINGS[difficulty];
    const isTimeSlowed = activePowerUps.some(p => p.type === 'slow-time');
    const fallSpeedMultiplier = isTimeSlowed ? 0.4 : 1;
    const wordFallSpeed = (difficultySettings.WORD_FALL_SPEED_START + (level - 1) * WORD_FALL_SPEED_INCREASE) * fallSpeedMultiplier;
    const wordSpawnRate = Math.max(200, difficultySettings.WORD_SPAWN_RATE_START - (level - 1) * WORD_SPAWN_RATE_DECREASE);

    const resetGameState = useCallback(() => {
        setWords([]);
        setTypedInput('');
        setScore(0);
        setLives(INITIAL_LIVES);
        setLevel(1);
        setCombo(0);
        setFloatingScores([]);
        setPowerUpProgress({ slowTime: 0, clearWords: 0 });
        setPowerUpsReady({ slowTime: false, clearWords: false });
        setActivePowerUps([]);
        setGameWords([]);
        setIsLosingLife(false);
        setLastCompletionTime(null);
        lastSpawnTime.current = Date.now();
    }, []);

    const startGame = useCallback((selectedDifficulty: Difficulty) => {
        resetGameState();
        setDifficulty(selectedDifficulty);

        let selectedWordList: string[];
        switch (selectedDifficulty) {
            case 'Easy':
                selectedWordList = EASY_WORDS;
                break;
            case 'Hard':
                selectedWordList = HARD_WORDS;
                break;
            case 'Medium':
            default:
                selectedWordList = MEDIUM_WORDS;
                break;
        }

        const shuffledWords = [...selectedWordList].sort(() => Math.random() - 0.5);
        setGameWords(shuffledWords);
        setGameStatus(GameStatus.Playing);
    }, [resetGameState]);

    const spawnWord = useCallback((powerUp?: PowerUpType) => {
        if (!gameContainerRef.current) return;
        if (!powerUp && gameWords.length === 0) return;

        const gameWidth = gameContainerRef.current.offsetWidth;
        
        let wordText: string;
        switch(powerUp) {
            case 'slow-time': wordText = 'SLOW'; break;
            case 'clear-words': wordText = 'WIPE'; break;
            default: wordText = gameWords[Math.floor(Math.random() * gameWords.length)];
        }
        
        let spawnX: number;
        let attempts = 0;
        let positionValid = false;
        
        do {
            spawnX = Math.random() * (gameWidth - (wordText.length * 12));
            positionValid = !words.some(word => 
                word.y < 50 && Math.abs(word.x - spawnX) < 100
            );
            attempts++;
        } while (!positionValid && attempts < 10);

        const newWord: Word = {
            id: Date.now() + Math.random(),
            text: wordText,
            x: Math.max(0, spawnX),
            y: -20,
            status: 'falling',
            powerUp,
        };
        setWords(prev => [...prev, newWord]);
    }, [gameWords, words]);

    const gameLoop = useCallback(() => {
        if (gameStatus !== GameStatus.Playing || isLosingLife) {
             if (resumeAnimation.current && !isLosingLife) resumeAnimation.current = null;
            return;
        }
        
        let speedRampUpMultiplier = 1;
        if (resumeAnimation.current) {
            const elapsed = performance.now() - resumeAnimation.current.startTime;
            const progress = Math.min(elapsed / resumeAnimation.current.duration, 1);
            speedRampUpMultiplier = 0.1 + progress * 0.9;
            if (progress >= 1) {
                resumeAnimation.current = null;
            }
        }
        const currentWordFallSpeed = wordFallSpeed * speedRampUpMultiplier;

        setActivePowerUps(prev => prev.filter(p => p.expiration > Date.now()));

        setWords(prevWords => {
            const gameHeight = gameContainerRef.current?.offsetHeight ?? 800;
            const updatedWords = prevWords.map(word => ({
                ...word,
                y: word.y + currentWordFallSpeed,
            })).filter(word => word.status === 'falling');

            const missedWords = updatedWords.filter(word => word.y >= gameHeight);
            if (missedWords.length > 0) {
                setLives(prevLives => prevLives - missedWords.length);
                setCombo(0);
                setLastCompletionTime(null);
            }

            return prevWords.map(word => ({
                ...word,
                y: word.y + currentWordFallSpeed
            })).filter(word => word.y < gameHeight || word.status === 'destroyed');
        });

        if (Date.now() - lastSpawnTime.current > wordSpawnRate) {
            spawnWord();
            lastSpawnTime.current = Date.now();
        }

        animationFrameId.current = requestAnimationFrame(gameLoop);
    }, [gameStatus, spawnWord, wordFallSpeed, wordSpawnRate, isLosingLife]);

    useEffect(() => {
        if (lives < prevLivesRef.current && gameStatus === GameStatus.Playing) {
            setIsLosingLife(true);
            setTypedInput('');
            setLastCompletionTime(null);
    
            // Screen wipe effect
            setIsWiping(true);
            setTimeout(() => {
                setWords([]); // Clear all words from the board
                setIsWiping(false);
            }, 800); // Wipe animation duration
    
            // Total duration for the life lost sequence
            setTimeout(() => {
                setIsLosingLife(false);
                // Start accelerating back to speed
                resumeAnimation.current = { startTime: performance.now(), duration: 1500 };
            }, 2000); // Total effect duration
        }
        prevLivesRef.current = lives;
    }, [lives, gameStatus]);

    const handleResume = useCallback(() => {
        setGameStatus(GameStatus.Playing);
        resumeAnimation.current = { startTime: performance.now(), duration: 1500 };
    }, []);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
                e.preventDefault();
                if (gameStatus === GameStatus.Playing) {
                    setGameStatus(GameStatus.Paused);
                } else if (gameStatus === GameStatus.Paused) {
                    handleResume();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameStatus, handleResume]);


    useEffect(() => {
        if (gameStatus === GameStatus.Playing) {
            animationFrameId.current = requestAnimationFrame(gameLoop);
        } else {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
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
        }
    }, [level, gameStatus]);

    const activatePowerUp = (powerUp: PowerUpType) => {
        switch (powerUp) {
            case 'slow-time':
                setActivePowerUps(prev => [...prev, { type: 'slow-time', expiration: Date.now() + POWERUP_DURATIONS.slowTime }]);
                break;
            case 'clear-words':
                setIsWiping(true);
                setTimeout(() => {
                    setWords(prev => prev.map(w => w.status === 'falling' ? { ...w, status: 'destroyed' } : w));
                    setTimeout(() => setWords(prev => prev.filter(w => w.status !== 'destroyed')), 600);
                    setIsWiping(false);
                }, 800);
                break;
        }
    };
    
    const handleInputChange = (newValue: string) => {
        const lowercasedValue = newValue.toLowerCase();
    
        if (inputStatusTimeout.current) {
            clearTimeout(inputStatusTimeout.current);
        }
    
        if (lowercasedValue.length > typedInput.length) {
            const isCorrectPrefix = words.some(word => word.status === 'falling' && word.text.toLowerCase().startsWith(lowercasedValue));
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
    
        setTypedInput(newValue);
    };

    useEffect(() => {
        const trimmedInput = typedInput.trim().toLowerCase();
        if (!trimmedInput) return;

        if (gameStatus === GameStatus.Playing) {
            if (trimmedInput === '1' && powerUpsReady.slowTime) {
                spawnWord('slow-time');
                setPowerUpsReady(prev => ({ ...prev, slowTime: false }));
                setPowerUpProgress(prev => ({ ...prev, slowTime: 0 }));
                setTypedInput('');
                return;
            }
            if (trimmedInput === '2' && powerUpsReady.clearWords) {
                spawnWord('clear-words');
                setPowerUpsReady(prev => ({ ...prev, clearWords: false }));
                setPowerUpProgress(prev => ({ ...prev, clearWords: 0 }));
                setTypedInput('');
                return;
            }
        }
    
        const matchedWords = words.filter(word => word.status === 'falling' && word.text.toLowerCase() === trimmedInput);
    
        if (matchedWords.length > 0) {
            const gameHeight = gameContainerRef.current?.offsetHeight ?? 800;
            const now = Date.now();
            const timeSinceLast = lastCompletionTime ? now - lastCompletionTime : Infinity;
            
            let timingBonusMultiplier = 1;
            let timingLabel: { text: string; colorClass: string; } | undefined;

            if (timeSinceLast < TIMING_WINDOW_MS) {
                const remainingTime = TIMING_WINDOW_MS - timeSinceLast;
                const bonusRatio = remainingTime / TIMING_WINDOW_MS;
                timingBonusMultiplier = 1 + bonusRatio * (MAX_TIMING_BONUS_MULTIPLIER - 1);
                
                const tier = TIMING_TIERS.find(t => timeSinceLast <= t.threshold);
                if(tier) {
                    timingLabel = { text: tier.label, colorClass: tier.colorClass };
                }
            }


            let totalPointsGained = 0;
            const newFloatingScores: FloatingScore[] = [];
            const idsToDestroy = new Set<number>();
            let regularWordsCleared = 0;
    
            matchedWords.forEach(matchedWord => {
                idsToDestroy.add(matchedWord.id);
    
                if (matchedWord.powerUp) {
                    activatePowerUp(matchedWord.powerUp);
                } else {
                    regularWordsCleared++;
                    const baseScore = matchedWord.text.length;
                    const zoneHeight = gameHeight / 20;
                    const wordY = Math.max(0, Math.min(gameHeight - 1, matchedWord.y));
                    const zoneIndex = Math.floor(wordY / zoneHeight);
                    const positionBonusMultiplier = (19 - zoneIndex) / 19.0;
                    const positionBonus = Math.ceil(baseScore * positionBonusMultiplier);
                    const comboBonus = Math.round(baseScore * (combo * 0.1));
                    const totalBonus = positionBonus + comboBonus;
                    
                    const pointsBeforeTiming = baseScore + totalBonus;
                    const finalPoints = Math.round(pointsBeforeTiming * timingBonusMultiplier);
                    const timingBonusPoints = finalPoints - pointsBeforeTiming;
                    
                    totalPointsGained += finalPoints;

                    newFloatingScores.push({
                        id: Date.now() + Math.random(),
                        base: baseScore,
                        bonus: totalBonus,
                        timingBonus: timingBonusPoints,
                        timingLabel: timingLabel,
                        timingMultiplier: timingBonusMultiplier > 1 ? timingBonusMultiplier : undefined,
                        x: matchedWord.x,
                        y: matchedWord.y,
                    });
                }
            });

            if (regularWordsCleared > 0) {
                const nextProgress = { ...powerUpProgress };
                const nextReadyState = { ...powerUpsReady };
                let readyStateChanged = false;
    
                if (!powerUpsReady.slowTime) {
                    nextProgress.slowTime = Math.min(powerUpProgress.slowTime + regularWordsCleared, POWERUP_THRESHOLDS.slowTime);
                    if (nextProgress.slowTime >= POWERUP_THRESHOLDS.slowTime) {
                        nextReadyState.slowTime = true;
                        readyStateChanged = true;
                    }
                }
                if (!powerUpsReady.clearWords) {
                    nextProgress.clearWords = Math.min(powerUpProgress.clearWords + regularWordsCleared, POWERUP_THRESHOLDS.clearWords);
                    if (nextProgress.clearWords >= POWERUP_THRESHOLDS.clearWords) {
                        nextReadyState.clearWords = true;
                        readyStateChanged = true;
                    }
                }
                
                setPowerUpProgress(nextProgress);
                if (readyStateChanged) {
                    setPowerUpsReady(nextReadyState);
                }
            }
    
            setScore(prev => prev + totalPointsGained);
            setCombo(prev => prev + 1);
            setLastCompletionTime(now);
    
            setFloatingScores(prev => [...prev, ...newFloatingScores]);
            const newScoreIds = newFloatingScores.map(fs => fs.id);
            setTimeout(() => {
                setFloatingScores(prev => prev.filter(fs => !newScoreIds.includes(fs.id)));
            }, 1000);
    
            setWords(prevWords => prevWords.map(w => idsToDestroy.has(w.id) ? { ...w, status: 'destroyed' } : w));
            setTypedInput('');
            
            setTimeout(() => {
                setWords(prevWords => prevWords.filter(w => !idsToDestroy.has(w.id)));
            }, 600);
        }
    }, [typedInput, words, combo, spawnWord, gameStatus, powerUpProgress, powerUpsReady, lastCompletionTime]);

    useEffect(() => {
        return () => {
            if (inputStatusTimeout.current) {
                clearTimeout(inputStatusTimeout.current);
            }
        };
    }, []);

    const returnToStart = () => {
        setGameStatus(GameStatus.Start);
        resetGameState();
    };

    const renderContent = () => {
        switch (gameStatus) {
            case GameStatus.Start:
                return <StartScreen onStart={startGame} />;
            case GameStatus.Playing:
            case GameStatus.Paused:
                return (
                    <GameScreen
                        words={words}
                        typedInput={typedInput}
                        onInputChange={handleInputChange}
                        gameContainerRef={gameContainerRef}
                        showLevelUp={showLevelUp}
                        inputStatus={inputStatus}
                        floatingScores={floatingScores}
                        isTimeSlowed={isTimeSlowed}
                        isPaused={gameStatus === GameStatus.Paused || isLosingLife}
                        lastCompletionTime={lastCompletionTime}
                    />
                );
            case GameStatus.GameOver:
                return <GameOverScreen score={score} onRestart={returnToStart} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen font-mono p-4 overflow-hidden">
            <BackgroundAnimation isTimeSlowed={isTimeSlowed} />
            <div className="relative z-10 flex flex-col items-center w-full">
                <h1 className="text-5xl font-bold text-cyan-400 mb-2 tracking-widest" style={{ textShadow: '0 0 10px #0ff' }}>
                    TYPING THUNDER
                </h1>
                <div className="w-full max-w-6xl mx-auto flex justify-center items-start gap-8">
                    {/* Left side for Combo */}
                    <div className="w-64 flex-shrink-0 flex justify-center pt-8">
                        {(gameStatus === GameStatus.Playing || gameStatus === GameStatus.Paused) && <ComboIndicator combo={combo} />}
                    </div>

                    {/* Game container */}
                    <div className="w-full max-w-4xl">
                        {(gameStatus === GameStatus.Playing || gameStatus === GameStatus.Paused) && (
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
                        <div className={`w-full max-w-4xl h-[70vh] bg-slate-800/50 border-2 border-cyan-400/50 rounded-lg shadow-2xl shadow-cyan-500/10 relative overflow-hidden ${isShaking ? 'animate-shake' : ''} ${(gameStatus === GameStatus.Playing || gameStatus === GameStatus.Paused) ? 'rounded-t-none border-t-0' : ''}`}>
                            {renderContent()}
                            {(gameStatus === GameStatus.Playing || isWiping) && isWiping && <WipeAnimation />}
                            {gameStatus === GameStatus.Paused && <PauseScreen onResume={handleResume} onQuit={returnToStart} />}
                            {isLosingLife && <LifeLostOverlay />}
                        </div>
                    </div>

                    {/* Right side for Power-ups */}
                    <div className="w-64 flex-shrink-0 pt-8">
                        {(gameStatus === GameStatus.Playing || gameStatus === GameStatus.Paused) && <PowerUpBar progress={powerUpProgress} ready={powerUpsReady} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
