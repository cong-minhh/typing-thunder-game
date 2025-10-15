import React, { useState, useEffect } from 'react';
import { GameStats, Difficulty } from '../types';
import { leaderboardService } from '../services/leaderboardService';

interface GameOverScreenProps {
    score: number;
    stats: GameStats;
    difficulty: Difficulty;
    onSubmitScore: (name: string) => void;
    onRestart: (difficulty: Difficulty) => void;
    onViewLeaderboard: () => void;
    onMainMenu: () => void;
}

const StatDisplay: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className = '' }) => (
    <div className="text-center bg-slate-800/50 p-3 rounded-lg">
        <div className="text-sm text-slate-400 uppercase tracking-wider">{label}</div>
        <div className={`text-3xl font-bold ${className}`}>{value}</div>
    </div>
);

const gradeColorClass = (grade: string) => {
    switch (grade) {
        case 'S': return 'text-yellow-300';
        case 'A': return 'text-green-400';
        case 'B': return 'text-sky-400';
        case 'C': return 'text-orange-400';
        case 'D': return 'text-red-400';
        default: return 'text-slate-400';
    }
};

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, stats, difficulty, onSubmitScore, onRestart, onViewLeaderboard, onMainMenu }) => {
    const [name, setName] = useState('');
    const [isHigh, setIsHigh] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        setIsHigh(leaderboardService.isHighScore(score, difficulty));
    }, [score, difficulty]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() === '') return;
        setSubmitted(true);
        onSubmitScore(name);
    };

    return (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center z-30 p-4 sm:p-8 text-center">
            <h2 className="text-6xl font-extrabold mb-4 text-red-500">Game Over</h2>
            
            <div className="w-full max-w-2xl bg-slate-900/30 p-6 rounded-xl border border-cyan-500/20 shadow-lg">
                <div className="flex justify-around items-center mb-6">
                    <div>
                        <p className="text-2xl text-slate-300 mb-1">Final Score</p>
                        <p className="text-7xl font-bold text-cyan-400">{score}</p>
                    </div>
                    <div>
                        <p className="text-2xl text-slate-300 mb-1">Grade</p>
                        <p className={`text-8xl font-black ${gradeColorClass(stats.grade)}`} style={{ textShadow: '0 0 15px currentColor' }}>{stats.grade}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <StatDisplay label="WPM" value={stats.wpm} className="text-violet-400" />
                    <StatDisplay label="Accuracy" value={`${stats.accuracy}%`} className="text-green-400" />
                    <StatDisplay label="Longest Combo" value={`${stats.longestCombo}x`} className="text-amber-400" />
                </div>
                
                {isHigh && !submitted && (
                    <form onSubmit={handleSubmit} className="mt-4">
                        <h3 className="text-2xl text-yellow-300 font-bold mb-2 animate-pulse">New High Score!</h3>
                        <p className="text-slate-300 mb-3">Enter your name for the leaderboard:</p>
                        <div className="flex justify-center gap-2">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={10}
                                className="px-4 py-2 text-xl text-center bg-slate-800 border-2 border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 text-white"
                                placeholder="Your Name"
                            />
                            <button type="submit" className="px-6 py-2 bg-green-500 text-slate-900 font-bold text-xl rounded-lg hover:bg-green-400 transition-colors">
                                Submit
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
                <button onClick={() => onRestart(difficulty)} className="px-8 py-4 bg-cyan-500 text-slate-900 font-bold text-xl rounded-lg shadow-lg hover:bg-cyan-400 hover:scale-105 transition-transform">
                    Play Again
                </button>
                <button onClick={onViewLeaderboard} className="px-8 py-4 bg-violet-500 text-slate-900 font-bold text-xl rounded-lg shadow-lg hover:bg-violet-400 hover:scale-105 transition-transform">
                    Leaderboard
                </button>
                 <button onClick={onMainMenu} className="px-8 py-4 bg-slate-600 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-slate-500 hover:scale-105 transition-transform">
                    Main Menu
                </button>
            </div>
        </div>
    );
};

export default GameOverScreen;
