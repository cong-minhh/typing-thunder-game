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
    <div className="text-center bg-slate-900/50 p-3 rounded-lg border border-slate-700">
        <div className="text-sm text-slate-400 uppercase tracking-wider">{label}</div>
        <div className={`text-3xl font-bold ${className}`}>{value}</div>
    </div>
);

const getGradeStyles = (grade: string): { color: string, shadow: string } => {
    switch (grade) {
        case 'S': return { color: 'text-yellow-300', shadow: '0 0 25px #fde047' };
        case 'A': return { color: 'text-green-400', shadow: '0 0 20px #4ade80' };
        case 'B': return { color: 'text-sky-400', shadow: '0 0 15px #38bdf8' };
        case 'C': return { color: 'text-orange-400', shadow: '0 0 10px #fb923c' };
        case 'D': return { color: 'text-red-400', shadow: '0 0 8px #f87171' };
        default: return { color: 'text-slate-400', shadow: 'none' };
    }
};


const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, stats, difficulty, onSubmitScore, onRestart, onViewLeaderboard, onMainMenu }) => {
    const [name, setName] = useState('');
    const [isHigh, setIsHigh] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const gradeStyles = getGradeStyles(stats.grade);

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
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8 text-center">
            <h2 className="text-6xl font-extrabold mb-4 text-red-500" style={{textShadow: '0 0 10px #ef4444'}}>Game Over</h2>
            
            <div className="w-full max-w-2xl glass-panel p-6">
                <div className="flex justify-around items-center mb-6">
                    <div>
                        <p className="text-2xl text-slate-300 mb-1">Final Score</p>
                        <p className="text-7xl font-bold text-cyan-400" style={{textShadow: '0 0 10px #0dd'}}>{score.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-2xl text-slate-300 mb-1">Grade</p>
                        <p className={`text-8xl font-black ${gradeStyles.color}`} style={{ textShadow: gradeStyles.shadow }}>{stats.grade}</p>
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
                            <button type="submit" className="btn btn-green">
                                Submit
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
                <button onClick={() => onRestart(difficulty)} className="btn btn-cyan">
                    Play Again
                </button>
                <button onClick={onViewLeaderboard} className="btn btn-violet">
                    Leaderboard
                </button>
                 <button onClick={onMainMenu} className="btn btn-slate">
                    Main Menu
                </button>
            </div>
        </div>
    );
};

export default GameOverScreen;