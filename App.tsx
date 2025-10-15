import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, Word, Difficulty, FloatingScore, PowerUpType, ActivePowerUp, LevelPhase, BossState, GameSettings } from './types';
import GameScreen from './components/GameScreen';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import ComboIndicator from './components/ComboIndicator';
import { LEVEL_UP_SCORE, WORD_FALL_SPEED_INCREASE, WORD_SPAWN_RATE_DECREASE, DIFFICULTY_PRESETS, POWERUP_THRESHOLDS, POWERUP_DURATIONS, TIMING_WINDOW_MS, MAX_TIMING_BONUS_MULTIPLIER, TIMING_TIERS, WORDS_PER_LEVEL_UNTIL_WAVE, WAVE_WARNING_DURATION_MS, BOSS_HEALTH_BASE, BOSS_HEALTH_PER_LEVEL, BOSS_TIMER_DURATION_MS, BOSS_WORDS_BASE, BOSS_WORDS_PER_LEVEL, BOSS_SLOW_SPAWN_RATE_MS, WAVE_ACCELERATE_DURATION_MS, WAVE_ACCELERATE_END_SPEED_MULTIPLIER, WAVE_ACCELERATE_SPAWN_RATE_MS, WAVE_ACCELERATE_START_SPEED_MULTIPLIER, WAVE_DELUGE_WORD_COUNT, WAVE_DELUGE_SPAWN_RATE_MS, WAVE_DELUGE_SPEED_MULTIPLIER } from './constants';
import HeartIcon from './components/UI/HeartIcon';
import BackgroundAnimation from './components/BackgroundAnimation';
import PowerUpBar from './components/PowerUpBar';
import { EASY_WORDS } from './data/easy-words';
import { MEDIUM_WORDS } from './data/medium-words';
import { HARD_WORDS } from './data/hard-words';
import PauseScreen from './components/PauseScreen';
import WipeAnimation from './components/WipeAnimation';
import LifeLostOverlay from './components/LifeLostOverlay';
import AudioManager from './components/AudioManager';
import SettingsScreen from './components/SettingsScreen';
import HelpScreen from './components/HelpScreen';
import ShieldIcon from './components/UI/ShieldIcon';

const POWERUP_SPAWN_CHANCE = 0.05; // 5% chance

const powerUpTypeToStateKey: { [key in PowerUpType]: keyof typeof POWERUP_THRESHOLDS } = {
    'slow-time': 'slowTime',
    'clear-words': 'clearWords',
    'shield': 'shield',
    'score-multiplier': 'scoreMultiplier'
};

const App: React.FC = () => {
    const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Start);
    const [words, setWords] = useState<Word[]>([]);
    const [typedInput, setTypedInput] = useState<string>('');
    const [score, setScore] = useState<number>(0);
    const [gameSettings, setGameSettings] = useState<GameSettings>(DIFFICULTY_PRESETS.Medium);
    const [lives, setLives] = useState<number>(gameSettings.startingLives);
    const [level, setLevel] = useState<number>(1);
    const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
    const [inputStatus, setInputStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
    const [combo, setCombo] = useState<number>(0);
    const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
    const [powerUpProgress, setPowerUpProgress] = useState({ slowTime: 0, clearWords: 0, shield: 0, scoreMultiplier: 0 });
    const [powerUpsReady, setPowerUpsReady] = useState({ slowTime: false, clearWords: false, shield: false, scoreMultiplier: false });
    const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
    const [gameWords, setGameWords] = useState<string[]>([]);
    const [isWiping, setIsWiping] = useState(false);
    const [isLosingLife, setIsLosingLife] = useState(false);
    const [lastCompletionTime, setLastCompletionTime] = useState<number | null>(null);
    const [difficultyForVisuals, setDifficultyForVisuals] = useState<Difficulty | null>(null);
    const [shieldActive, setShieldActive] = useState(false);


    // New state for waves and bosses
    const [levelPhase, setLevelPhase] = useState<LevelPhase>(LevelPhase.Normal);
    const [wordsClearedThisLevel, setWordsClearedThisLevel] = useState(0);
    const [bossState, setBossState] = useState<BossState | null>(null);
    const [isBossHit, setIsBossHit] = useState(false);
    const [showLevelClear, setShowLevelClear] = useState(false);
    const [waveState, setWaveState] = useState<{startTime: number, wordsSpawned: number}>({startTime: 0, wordsSpawned: 0});

    const animationFrameId = useRef<number | null>(null);
    const lastSpawnTime = useRef<number>(Date.now());
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const inputStatusTimeout = useRef<number | null>(null);
    const resumeAnimation = useRef<{startTime: number, duration: number} | null>(null);
    const prevLivesRef = useRef(lives);
    const bossTimerInterval = useRef<number | null>(null);
    
    const isTimeSlowed = activePowerUps.some(p => p.type === 'slow-time');
    const isScoreBoosted = activePowerUps.some(p => p.type === 'score-multiplier');
    const fallSpeedMultiplier = isTimeSlowed ? 0.4 : 1;
    let baseWordFallSpeed = gameSettings.fallSpeedStart + (level - 1) * WORD_FALL_SPEED_INCREASE;
    let wordFallSpeed = baseWordFallSpeed;
    let wordSpawnRate = Math.max(200, gameSettings.spawnRateStart - (level - 1) * WORD_SPAWN_RATE_DECREASE);

    if (levelPhase === LevelPhase.WaveAccelerate) {
        const elapsed = Date.now() - waveState.startTime;
        const progress = Math.min(elapsed / WAVE_ACCELERATE_DURATION_MS, 1);
        const speedMultiplier = WAVE_ACCELERATE_START_SPEED_MULTIPLIER + (WAVE_ACCELERATE_END_SPEED_MULTIPLIER - WAVE_ACCELERATE_START_SPEED_MULTIPLIER) * progress;
        wordFallSpeed *= speedMultiplier;
        wordSpawnRate = WAVE_ACCELERATE_SPAWN_RATE_MS;
    } else if (levelPhase === LevelPhase.WaveDeluge) {
        wordFallSpeed *= WAVE_DELUGE_SPEED_MULTIPLIER;
        wordSpawnRate = WAVE_DELUGE_SPAWN_RATE_MS;
    } else if (levelPhase === LevelPhase.Boss) {
        wordSpawnRate = BOSS_SLOW_SPAWN_RATE_MS;
    }

    wordFallSpeed *= fallSpeedMultiplier;


    const resetGameState = useCallback((settings: GameSettings) => {
        setWords([]);
        setTypedInput('');
        setScore(0);
        setLives(settings.startingLives);
        setLevel(1);
        setCombo(0);
        setFloatingScores([]);
        setPowerUpProgress({ slowTime: 0, clearWords: 0, shield: 0, scoreMultiplier: 0 });
        setPowerUpsReady({ slowTime: false, clearWords: false, shield: false, scoreMultiplier: false });
        setActivePowerUps([]);
        setShieldActive(false);
        setIsLosingLife(false);
        setLastCompletionTime(null);
        setLevelPhase(LevelPhase.Normal);
        setWordsClearedThisLevel(0);
        setBossState(null);
        setShowLevelClear(false);
        setWaveState({ startTime: 0, wordsSpawned: 0 });
        if (bossTimerInterval.current) clearInterval(bossTimerInterval.current);
        lastSpawnTime.current = Date.now();
    }, []);

    const beginPlaying = useCallback((selectedDifficulty: Difficulty) => {
        let selectedWordList: string[];
        switch (selectedDifficulty) {
            case 'Easy': selectedWordList = EASY_WORDS; break;
            case 'Hard': selectedWordList = HARD_WORDS; break;
            case 'Medium': default: selectedWordList = MEDIUM_WORDS; break;
        }

        const shuffledWords = [...selectedWordList].sort(() => Math.random() - 0.5);
        setGameWords(shuffledWords);
        setGameStatus(GameStatus.Playing);
    }, []);

    const handleStartPreset = useCallback((difficulty: Difficulty) => {
        const newSettings = DIFFICULTY_PRESETS[difficulty];
        setGameSettings(newSettings);
        resetGameState(newSettings);
        setDifficultyForVisuals(difficulty);
        beginPlaying(difficulty);
    }, [resetGameState, beginPlaying]);
    
    const handleOpenSettings = () => {
        setGameStatus(GameStatus.Settings);
    };

    const handleOpenHelp = () => {
        setGameStatus(GameStatus.Help);
    };

    const handleStartCustomGame = useCallback((settings: GameSettings) => {
        setGameSettings(settings);
        resetGameState(settings);
        
        let difficultyForWords: Difficulty = 'Medium';
        if (settings.spawnRateStart <= 1400 || settings.fallSpeedStart >= 0.8) {
            difficultyForWords = 'Hard';
        } else if (settings.spawnRateStart >= 1800 && settings.fallSpeedStart <= 0.5) {
            difficultyForWords = 'Easy';
        }
        setDifficultyForVisuals(difficultyForWords);
        beginPlaying(difficultyForWords);
    }, [resetGameState, beginPlaying]);

    const spawnWord = useCallback((isWaveWord = false) => {
        if (!gameContainerRef.current || gameWords.length === 0) return;

        // Random chance to spawn a power-up word
        if (!isWaveWord && Math.random() < POWERUP_SPAWN_CHANCE) {
            const availablePowerUps: { type: PowerUpType; text: string }[] = [
                { type: 'slow-time', text: 'SLOW' },
                { type: 'clear-words', text: 'WIPE' },
                { type: 'shield', text: 'SHIELD' },
                { type: 'score-multiplier', text: 'BOOST' },
            ];
            const chosenPowerUp = availablePowerUps[Math.floor(Math.random() * availablePowerUps.length)];
            const wordWidth = chosenPowerUp.text.length * 15;
            const spawnX = Math.random() * (gameContainerRef.current.offsetWidth - wordWidth);
            
            const newWord: Word = {
                id: Date.now() + Math.random(),
                text: chosenPowerUp.text,
                x: Math.max(0, spawnX),
                y: -20,
                status: 'falling',
                powerUp: chosenPowerUp.type,
            };
            setWords(prev => [...prev, newWord]);
            return;
        }
    
        const gameWidth = gameContainerRef.current.offsetWidth;
        let wordText: string;
        
        if (isWaveWord) {
            // Get short to medium words for waves
            const shortWords = EASY_WORDS.filter(w => w.length >= 3 && w.length <= 6);
            wordText = shortWords[Math.floor(Math.random() * shortWords.length)];
        } else {
             wordText = gameWords[Math.floor(Math.random() * gameWords.length)];
        }
        
        const charWidth = 15; // Estimated width for a text-2xl monospace char
        const wordWidth = wordText.length * charWidth;
        let spawnX: number;
        let attempts = 0;
        let positionValid = false;
        
        do {
            spawnX = Math.random() * (gameWidth - wordWidth);
            // Improved collision check: Check for horizontal overlap with other recently spawned words.
            positionValid = !words.some(word => 
                word.y < 50 && // Only check against words near the top
                spawnX < word.x + (word.text.length * charWidth) && 
                spawnX + wordWidth > word.x
            );
            attempts++;
        } while (!positionValid && attempts < 20); // Increased attempts for deluge

        const newWord: Word = {
            id: Date.now() + Math.random(),
            text: wordText,
            x: Math.max(0, spawnX),
            y: -20,
            status: 'falling',
            isWaveWord,
        };
        setWords(prev => [...prev, newWord]);
    }, [gameWords, words]);


    const gameLoop = useCallback(() => {
        const canRun = gameStatus === GameStatus.Playing && !isLosingLife && levelPhase !== LevelPhase.WaveWarning && levelPhase !== LevelPhase.LevelTransition;
        if (!canRun) {
            if (resumeAnimation.current && !isLosingLife) resumeAnimation.current = null;
            return;
        }
        
        let speedRampUpMultiplier = 1;
        if (resumeAnimation.current) {
            const elapsed = performance.now() - resumeAnimation.current.startTime;
            const progress = Math.min(elapsed / resumeAnimation.current.duration, 1);
            speedRampUpMultiplier = 0.1 + progress * 0.9;
            if (progress >= 1) resumeAnimation.current = null;
        }
        const currentWordFallSpeed = wordFallSpeed * speedRampUpMultiplier;

        setActivePowerUps(prev => prev.filter(p => p.expiration > Date.now()));

        setWords(prevWords => {
            const gameHeight = gameContainerRef.current?.offsetHeight ?? 800;
            const updatedWords = prevWords.map(word => ({ ...word, y: word.y + currentWordFallSpeed })).filter(word => word.status === 'falling');

            // Power-up words that fall off screen do not cost a life.
            const missedWords = updatedWords.filter(word => word.y >= gameHeight && !word.powerUp);
            if (missedWords.length > 0) {
                let livesToLose = missedWords.length;
                if (shieldActive) {
                    livesToLose -= 1;
                    setShieldActive(false);
                }
                if (livesToLose > 0) {
                    setLives(prevLives => prevLives - livesToLose);
                    setCombo(0);
                    setLastCompletionTime(null);
                }
            }

            return prevWords.map(word => ({ ...word, y: word.y + currentWordFallSpeed })).filter(word => word.y < gameHeight || word.status === 'destroyed');
        });

        if (Date.now() - lastSpawnTime.current > wordSpawnRate) {
            if (levelPhase === LevelPhase.Normal || levelPhase === LevelPhase.Boss) {
                 spawnWord(false);
                 lastSpawnTime.current = Date.now();
            } else if (levelPhase === LevelPhase.WaveAccelerate) {
                spawnWord(true);
                lastSpawnTime.current = Date.now();
            } else if (levelPhase === LevelPhase.WaveDeluge && waveState.wordsSpawned < WAVE_DELUGE_WORD_COUNT) {
                spawnWord(true);
                setWaveState(prev => ({...prev, wordsSpawned: prev.wordsSpawned + 1}));
                lastSpawnTime.current = Date.now();
            }
        }
        
        animationFrameId.current = requestAnimationFrame(gameLoop);
    }, [gameStatus, spawnWord, wordFallSpeed, wordSpawnRate, isLosingLife, levelPhase, waveState, shieldActive]);

    useEffect(() => {
        if (lives < prevLivesRef.current && gameStatus === GameStatus.Playing) {
            setIsLosingLife(true);
            setTypedInput('');
            setLastCompletionTime(null);
    
            setIsWiping(true);
            setTimeout(() => {
                // Clear all falling words, but preserve boss state.
                setWords([]);
                setIsWiping(false);
            }, 800);
    
            setTimeout(() => {
                setIsLosingLife(false);
                resumeAnimation.current = { startTime: performance.now(), duration: 1500 };
            }, 2000);
        }
        prevLivesRef.current = lives;
    }, [lives, gameStatus]);

    // Level Phase management
    useEffect(() => {
        if (gameStatus !== GameStatus.Playing) return;

        if (levelPhase === LevelPhase.Normal && wordsClearedThisLevel >= WORDS_PER_LEVEL_UNTIL_WAVE) {
            setLevelPhase(LevelPhase.WaveWarning);
        } else if (levelPhase === LevelPhase.WaveWarning) {
            const timer = setTimeout(() => {
                setWaveState({ startTime: Date.now(), wordsSpawned: 0 });
                setLevelPhase(LevelPhase.WaveAccelerate);
            }, WAVE_WARNING_DURATION_MS);
            return () => clearTimeout(timer);
        } else if (levelPhase === LevelPhase.WaveAccelerate) {
            const timeSinceStart = Date.now() - waveState.startTime;
            if (timeSinceStart >= WAVE_ACCELERATE_DURATION_MS) {
                setWaveState({ startTime: Date.now(), wordsSpawned: 0 });
                setLevelPhase(LevelPhase.WaveDeluge);
            }
        } else if (levelPhase === LevelPhase.WaveDeluge) {
            if (waveState.wordsSpawned >= WAVE_DELUGE_WORD_COUNT && words.filter(w => w.isWaveWord && w.status === 'falling').length === 0) {
                setLevelPhase(LevelPhase.Boss);
            }
        } else if (levelPhase === LevelPhase.Boss && !bossState) {
            // Setup boss
            const numBossWords = BOSS_WORDS_BASE + (level - 1) * BOSS_WORDS_PER_LEVEL;
            const bossWords = [...EASY_WORDS].sort(() => 0.5 - Math.random()).slice(0, numBossWords);
            const bossHealth = BOSS_HEALTH_BASE + (level - 1) * BOSS_HEALTH_PER_LEVEL;

            setBossState({
                words: bossWords,
                currentWordIndex: 0,
                health: bossHealth,
                maxHealth: bossHealth,
                timer: BOSS_TIMER_DURATION_MS,
                maxTimer: BOSS_TIMER_DURATION_MS,
            });
        } else if (levelPhase === LevelPhase.LevelTransition) {
            setShowLevelClear(true);
            setTimeout(() => {
                setShowLevelClear(false);
                setLevel(prev => prev + 1);
                setWordsClearedThisLevel(0);
                setBossState(null);
                setLevelPhase(LevelPhase.Normal);
            }, 2000);
        }

    }, [gameStatus, levelPhase, wordsClearedThisLevel, bossState, spawnWord, level, words, waveState]);
    
    // Boss timer
    useEffect(() => {
        if (levelPhase === LevelPhase.Boss && bossState && gameStatus === GameStatus.Playing && !isLosingLife) {
            const timerInterval = isTimeSlowed ? 100 / 0.4 : 100;
            bossTimerInterval.current = window.setInterval(() => {
                setBossState(prev => {
                    if (!prev) return null;
                    const newTimer = prev.timer - 100;
                    if (newTimer <= 0) {
                        setLives(l => l - 1);
                        if (bossTimerInterval.current) clearInterval(bossTimerInterval.current);
                        setLevelPhase(LevelPhase.Normal); // Boss escaped
                        setBossState(null);
                        return null;
                    }
                    return { ...prev, timer: newTimer };
                });
            }, timerInterval);
        } else {
            if (bossTimerInterval.current) clearInterval(bossTimerInterval.current);
        }
        return () => { if (bossTimerInterval.current) clearInterval(bossTimerInterval.current); };
    }, [levelPhase, bossState, gameStatus, isLosingLife, isTimeSlowed]);


    const handleResume = useCallback(() => {
        setGameStatus(GameStatus.Playing);
        resumeAnimation.current = { startTime: performance.now(), duration: 1500 };
    }, []);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                if (gameStatus === GameStatus.Playing) setGameStatus(GameStatus.Paused);
                else if (gameStatus === GameStatus.Paused) handleResume();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameStatus, handleResume]);


    useEffect(() => {
        if (gameStatus === GameStatus.Playing) {
            animationFrameId.current = requestAnimationFrame(gameLoop);
        } else {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        }
        return () => { if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); };
    }, [gameStatus, gameLoop]);

    useEffect(() => { if (lives <= 0) setGameStatus(GameStatus.GameOver); }, [lives]);
    useEffect(() => { if (level > 1 && gameStatus === GameStatus.Playing && levelPhase === LevelPhase.Normal) {
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 1500);
        }
    }, [level, gameStatus, levelPhase]);

    const activatePowerUp = useCallback((powerUpType: PowerUpType) => {
        if (powerUpType === 'slow-time') {
            setActivePowerUps(prev => [...prev, { type: 'slow-time', expiration: Date.now() + POWERUP_DURATIONS.slowTime }]);
        } else if (powerUpType === 'clear-words') {
            setIsWiping(true);
            setTimeout(() => {
                setWords(prev => prev.map(w => w.status === 'falling' ? { ...w, status: 'destroyed' } : w));
                setTimeout(() => setWords(prev => prev.filter(w => w.status !== 'destroyed')), 600);
                setIsWiping(false);
            }, 800);
        } else if (powerUpType === 'shield') {
            setShieldActive(true);
        } else if (powerUpType === 'score-multiplier') {
            setActivePowerUps(prev => [...prev, { type: 'score-multiplier', expiration: Date.now() + POWERUP_DURATIONS.scoreMultiplier }]);
        }
    }, []);

    const processWordCompletion = (matchedWords: Word[]) => {
        const now = Date.now();
        const timeSinceLast = lastCompletionTime ? now - lastCompletionTime : Infinity;
        
        let timingBonusMultiplier = 1;
        let timingLabel: { text: string; colorClass: string; } | undefined;

        if (timeSinceLast < TIMING_WINDOW_MS) {
            const remainingTime = TIMING_WINDOW_MS - timeSinceLast;
            const bonusRatio = remainingTime / TIMING_WINDOW_MS;
            timingBonusMultiplier = 1 + bonusRatio * (MAX_TIMING_BONUS_MULTIPLIER - 1);
            const tier = TIMING_TIERS.find(t => timeSinceLast <= t.threshold);
            if(tier) timingLabel = { text: tier.label, colorClass: tier.colorClass };
        }

        const scoreMultiplier = isScoreBoosted ? 2 : 1;
        let totalPointsGained = 0;
        const newFloatingScores: FloatingScore[] = [];
        const idsToDestroy = new Set<number>();
        let regularWordsCleared = 0;

        matchedWords.forEach(matchedWord => {
            idsToDestroy.add(matchedWord.id);
            regularWordsCleared++;
            const baseScore = matchedWord.text.length;
            const finalPoints = Math.round(baseScore * timingBonusMultiplier * scoreMultiplier);
            totalPointsGained += finalPoints;

            newFloatingScores.push({
                id: Date.now() + Math.random(), base: baseScore, bonus: 0,
                timingBonus: finalPoints - baseScore, timingLabel,
                timingMultiplier: timingBonusMultiplier > 1 ? timingBonusMultiplier : undefined,
                scoreMultiplier: scoreMultiplier > 1 ? scoreMultiplier : undefined,
                x: matchedWord.x, y: matchedWord.y,
            });
        });

        if (regularWordsCleared > 0 && levelPhase !== LevelPhase.Boss) {
            setWordsClearedThisLevel(prev => prev + regularWordsCleared);
        }
        
        if (regularWordsCleared > 0) {
            const nextProgress = { ...powerUpProgress };
            const nextReadyState = { ...powerUpsReady };
            let readyStateChanged = false;
            
            const powerUpKeys: (keyof typeof POWERUP_THRESHOLDS)[] = ['slowTime', 'clearWords', 'shield', 'scoreMultiplier'];
            powerUpKeys.forEach(key => {
                if (!nextReadyState[key]) {
                    nextProgress[key] = Math.min(nextProgress[key] + regularWordsCleared, POWERUP_THRESHOLDS[key]);
                    if (nextProgress[key] >= POWERUP_THRESHOLDS[key]) {
                        nextReadyState[key] = true;
                        readyStateChanged = true;
                    }
                }
            });

            setPowerUpProgress(nextProgress);
            if (readyStateChanged) setPowerUpsReady(nextReadyState);
        }

        setScore(prev => prev + totalPointsGained);
        setCombo(prev => prev + 1);
        setLastCompletionTime(now);

        setFloatingScores(prev => [...prev, ...newFloatingScores]);
        const newScoreIds = newFloatingScores.map(fs => fs.id);
        setTimeout(() => setFloatingScores(prev => prev.filter(fs => !newScoreIds.includes(fs.id))), 1000);

        setWords(prevWords => prevWords.map(w => idsToDestroy.has(w.id) ? { ...w, status: 'destroyed' } : w));
        setTypedInput('');
        
        setTimeout(() => setWords(prevWords => prevWords.filter(w => !idsToDestroy.has(w.id))), 600);
    };
    
    const handleInputCompletion = (currentInput: string) => {
        const trimmedInput = currentInput.trim().toLowerCase();
        if (!trimmedInput || gameStatus !== GameStatus.Playing) return;

        // --- Boss Word Check ---
        if (levelPhase === LevelPhase.Boss && bossState) {
            const currentBossWord = bossState.words[bossState.currentWordIndex % bossState.words.length];
            if (currentBossWord && trimmedInput === currentBossWord.toLowerCase()) {
                const newHealth = bossState.health - 1;
                setIsBossHit(true);
                setTimeout(() => setIsBossHit(false), 300);

                const points = (currentBossWord.length || 5) * 5 * (isScoreBoosted ? 2 : 1);
                setScore(s => s + points);
                setCombo(prev => prev + 1);
                setLastCompletionTime(Date.now());

                if (newHealth <= 0) {
                    setWords([]);
                    setLevelPhase(LevelPhase.LevelTransition);
                } else {
                    setBossState(prev => prev ? { ...prev, health: newHealth, currentWordIndex: prev.currentWordIndex + 1 } : null);
                }
                setTypedInput('');
                return; // IMPORTANT: Exit after handling boss word
            }
        }

        // --- Falling Word Check (if not a boss word) ---
        const matchedWords = words.filter(word => word.status === 'falling' && word.text.toLowerCase() === trimmedInput);
        if (matchedWords.length > 0) {
            const powerUpWord = matchedWords.find(w => w.powerUp);
            if (powerUpWord) { // It's a power-up word
                activatePowerUp(powerUpWord.powerUp!);
                setWords(prev => prev.map(w => w.id === powerUpWord.id ? { ...w, status: 'destroyed' } : w));
                setTimeout(() => setWords(prev => prev.filter(w => w.id !== powerUpWord.id)), 600);

                setFloatingScores(prev => [...prev, {
                    id: Date.now(), base: 0, bonus: 0,
                    timingLabel: { text: `${powerUpWord.text}!`, colorClass: 'text-cyan-400' },
                    x: powerUpWord.x, y: powerUpWord.y
                }]);
                setTypedInput('');
            } else { // It's a regular falling word
                processWordCompletion(matchedWords);
            }
        }
    };

    const handleInputChange = (newValue: string) => {
        if (gameStatus !== GameStatus.Playing) return;

        const lowercasedValue = newValue.toLowerCase();
        if (inputStatusTimeout.current) clearTimeout(inputStatusTimeout.current);

        if (lowercasedValue.length > typedInput.length) {
            let isCorrectPrefix = false;
            if (levelPhase === LevelPhase.Boss && bossState) {
                const bossWord = bossState.words[bossState.currentWordIndex % bossState.words.length];
                const isBossWordPrefix = bossWord?.toLowerCase().startsWith(lowercasedValue);
                const isDistractionWordPrefix = words.some(word => word.status === 'falling' && word.text.toLowerCase().startsWith(lowercasedValue));
                isCorrectPrefix = !!isBossWordPrefix || isDistractionWordPrefix;
            } else {
                isCorrectPrefix = words.some(word => word.status === 'falling' && word.text.toLowerCase().startsWith(lowercasedValue));
            }
            setInputStatus(isCorrectPrefix ? 'correct' : 'incorrect');
            inputStatusTimeout.current = window.setTimeout(() => setInputStatus('idle'), 300);
        } else {
            setInputStatus('idle');
        }

        setTypedInput(newValue);
        handleInputCompletion(newValue);
    };

    // Power-up hotkey handler
    useEffect(() => {
        const isPaused = gameStatus === GameStatus.Paused || isLosingLife || levelPhase === LevelPhase.WaveWarning || levelPhase === LevelPhase.LevelTransition;
        const handlePowerUpKeys = (e: KeyboardEvent) => {
            if (gameStatus !== GameStatus.Playing || isPaused) return;

            const powerUpHotkeys: { [key: string]: PowerUpType } = {
                '1': 'slow-time', '2': 'clear-words', '3': 'shield', '4': 'score-multiplier'
            };

            const powerUpType = powerUpHotkeys[e.key];
            if (!powerUpType) return;

            const stateKey = powerUpTypeToStateKey[powerUpType];
            
            if (powerUpsReady[stateKey]) {
                e.preventDefault(); 
                activatePowerUp(powerUpType);
                setPowerUpsReady(prev => ({ ...prev, [stateKey]: false }));
                setPowerUpProgress(prev => ({ ...prev, [stateKey]: 0 }));
            }
        };
        
        window.addEventListener('keydown', handlePowerUpKeys);
        return () => window.removeEventListener('keydown', handlePowerUpKeys);
    }, [gameStatus, isLosingLife, levelPhase, powerUpsReady, activatePowerUp]);

    useEffect(() => { return () => { if (inputStatusTimeout.current) clearTimeout(inputStatusTimeout.current); }; }, []);

    const returnToStart = () => {
        if (gameStatus === GameStatus.GameOver || gameStatus === GameStatus.Paused || gameStatus === GameStatus.Help) {
            resetGameState(gameSettings);
        }
        setDifficultyForVisuals(null);
        setGameStatus(GameStatus.Start);
    };

    const renderContent = () => {
        switch (gameStatus) {
            case GameStatus.Start: return <StartScreen onStart={handleStartPreset} onCustomGame={handleOpenSettings} onHelp={handleOpenHelp} />;
            case GameStatus.Settings: return <SettingsScreen initialSettings={gameSettings} onStartGame={handleStartCustomGame} onBack={returnToStart} />;
            case GameStatus.Help: return <HelpScreen onBack={returnToStart} />;
            case GameStatus.Playing:
            case GameStatus.Paused:
                return (
                    <GameScreen
                        words={words} typedInput={typedInput} onInputChange={handleInputChange} gameContainerRef={gameContainerRef}
                        showLevelUp={showLevelUp} inputStatus={inputStatus} floatingScores={floatingScores}
                        isTimeSlowed={isTimeSlowed} isPaused={gameStatus === GameStatus.Paused || isLosingLife || levelPhase === LevelPhase.WaveWarning || levelPhase === LevelPhase.LevelTransition}
                        lastCompletionTime={lastCompletionTime} levelPhase={levelPhase} bossState={bossState} isBossHit={isBossHit} showLevelClear={showLevelClear}
                        isScoreBoosted={isScoreBoosted}
                    />
                );
            case GameStatus.GameOver: return <GameOverScreen score={score} onRestart={returnToStart} />;
            default: return null;
        }
    };
    
    const backgroundClass = {
        Easy: 'bg-sky-900',
        Medium: 'bg-slate-900',
        Hard: 'bg-gray-950',
    }[difficultyForVisuals ?? 'Medium'] || 'bg-slate-900';


    return (
        <div className={`relative flex flex-col items-center justify-center min-h-screen font-mono p-4 overflow-hidden transition-colors duration-1000 ${backgroundClass}`}>
            <AudioManager gameStatus={gameStatus} levelPhase={levelPhase} />
            <BackgroundAnimation isTimeSlowed={isTimeSlowed} difficulty={difficultyForVisuals} />
            <div className="relative z-10 flex flex-col items-center w-full">
                <h1 className="text-5xl font-bold text-cyan-400 mb-2 tracking-widest" style={{ textShadow: '0 0 10px #0ff' }}>TYPING THUNDER</h1>
                <div className="w-full max-w-6xl mx-auto flex justify-center items-start gap-8">
                    <div className="w-64 flex-shrink-0 flex justify-center pt-8">
                        {(gameStatus === GameStatus.Playing || gameStatus === GameStatus.Paused) && <ComboIndicator combo={combo} />}
                    </div>
                    <div className="w-full max-w-4xl">
                        {(gameStatus === GameStatus.Playing || gameStatus === GameStatus.Paused) && (
                            <div className="p-4 bg-slate-900/50 backdrop-blur-sm flex justify-between items-center z-10 border-b border-x border-t border-cyan-400/30 rounded-t-lg">
                                <div className="flex items-center space-x-4">
                                    <h2 className="text-xl font-bold">Score: <span key={score} className="text-cyan-400 w-24 inline-block animate-score-pop">{score}</span></h2>
                                    <h2 className="text-xl font-bold">Level: <span className="text-green-400">{level}</span></h2>
                                </div>
                                <div className="relative flex items-center space-x-2">
                                    {shieldActive && <ShieldIcon />}
                                    {Array.from({ length: lives }).map((_, i) => (<HeartIcon key={i} />))}
                                </div>
                            </div>
                        )}
                        <div className={`w-full max-w-4xl h-[70vh] bg-slate-800/50 border-2 border-cyan-400/50 rounded-lg shadow-2xl shadow-cyan-500/10 relative overflow-hidden ${(gameStatus === GameStatus.Playing || gameStatus === GameStatus.Paused) ? 'rounded-t-none border-t-0' : ''}`}>
                            {renderContent()}
                            {(gameStatus === GameStatus.Playing || isWiping) && isWiping && <WipeAnimation />}
                            {gameStatus === GameStatus.Paused && <PauseScreen onResume={handleResume} onQuit={returnToStart} />}
                            {isLosingLife && <LifeLostOverlay />}
                        </div>
                    </div>
                    <div className="w-64 flex-shrink-0 pt-8">
                        {(gameStatus === GameStatus.Playing || gameStatus === GameStatus.Paused) && <PowerUpBar progress={powerUpProgress} ready={powerUpsReady} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;