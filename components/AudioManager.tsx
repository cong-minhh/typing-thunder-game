import React, { useRef, useEffect } from 'react';
import { GameStatus, LevelPhase } from '../types';

const BGM_SOURCES = {
    normal: '/assets/audio/normal.mp3',
    wave: '/assets/audio/wave.mp3',
    boss: '/assets/audio/boss.mp3',
};
const FADE_DURATION = 1000;
const MAX_VOLUME = 0.5;

const fadeAudio = (audio: HTMLAudioElement, targetVolume: number, duration: number, onComplete?: () => void) => {
    const startVolume = audio.volume;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        if (elapsedTime >= duration) {
            audio.volume = targetVolume;
            onComplete?.();
            return;
        }
        const progress = elapsedTime / duration;
        audio.volume = startVolume + (targetVolume - startVolume) * progress;
        requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
};


const AudioManager: React.FC<{ gameStatus: GameStatus; levelPhase: LevelPhase }> = ({ gameStatus, levelPhase }) => {
    const normalRef = useRef<HTMLAudioElement>(null);
    const waveRef = useRef<HTMLAudioElement>(null);
    const bossRef = useRef<HTMLAudioElement>(null);
    const currentTrackRef = useRef<HTMLAudioElement | null>(null);
    const prevGameStatusRef = useRef<GameStatus>(gameStatus);
    const audioUnlocked = useRef(false);

    useEffect(() => {
        const unlockAudio = () => {
            if (audioUnlocked.current) return;
            audioUnlocked.current = true;
            
            // Prime all audio elements by playing and immediately pausing them.
            // This is a common workaround for browser autoplay policies.
            const audioElements = [normalRef.current, waveRef.current, bossRef.current];
            audioElements.forEach(audio => {
                if (audio) {
                    const wasMuted = audio.muted;
                    audio.muted = true; // Mute to avoid sound artifacts
                    const promise = audio.play();
                    if (promise !== undefined) {
                        promise.then(() => {
                            audio.pause();
                            audio.muted = wasMuted; // Restore original muted state
                        }).catch(error => {
                            console.warn("Audio priming failed for one track. This is often okay.", error);
                            audio.muted = wasMuted;
                        });
                    }
                }
            });
        };
        // Use `once: true` to automatically clean up the listener after it fires.
        window.addEventListener('click', unlockAudio, { once: true });
        window.addEventListener('keydown', unlockAudio, { once: true });
    }, []);

    useEffect(() => {
        const audioRefs = {
            normal: normalRef.current,
            wave: waveRef.current,
            boss: bossRef.current,
        };

        if (!audioUnlocked.current) {
            prevGameStatusRef.current = gameStatus;
            return;
        }

        const wasPaused = prevGameStatusRef.current === GameStatus.Paused && gameStatus === GameStatus.Playing;

        if (gameStatus === GameStatus.Paused) {
            currentTrackRef.current?.pause();
            prevGameStatusRef.current = gameStatus;
            return;
        }
        
        if (wasPaused) {
            currentTrackRef.current?.play().catch(e => console.error("Audio resume failed", e));
        }

        let targetTrack: HTMLAudioElement | null = null;
        if (gameStatus === GameStatus.Playing) {
            switch (levelPhase) {
                case LevelPhase.Normal:
                    targetTrack = audioRefs.normal;
                    break;
                case LevelPhase.WaveWarning:
                case LevelPhase.WaveAccelerate:
                case LevelPhase.WaveDeluge:
                    targetTrack = audioRefs.wave;
                    break;
                case LevelPhase.Boss:
                    targetTrack = audioRefs.boss;
                    break;
                default:
                    targetTrack = currentTrackRef.current;
            }
        }

        if (targetTrack !== currentTrackRef.current) {
            if (currentTrackRef.current) {
                const oldTrack = currentTrackRef.current;
                fadeAudio(oldTrack, 0, FADE_DURATION, () => {
                    oldTrack.pause();
                    if (oldTrack.currentTime > 0) oldTrack.currentTime = 0;
                });
            }

            if (targetTrack) {
                targetTrack.volume = 0;
                targetTrack.play().catch(e => console.error("Audio play failed", e));
                fadeAudio(targetTrack, MAX_VOLUME, FADE_DURATION);
            }
            currentTrackRef.current = targetTrack;
        }
        
        prevGameStatusRef.current = gameStatus;

    }, [gameStatus, levelPhase]);

    return (
        <>
            <audio ref={normalRef} src={BGM_SOURCES.normal} loop preload="auto" />
            <audio ref={waveRef} src={BGM_SOURCES.wave} loop preload="auto" />
            <audio ref={bossRef} src={BGM_SOURCES.boss} loop preload="auto" />
        </>
    );
};

export default AudioManager;