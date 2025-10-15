import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, Difficulty } from '../types';
import { leaderboardService } from '../services/leaderboardService';

interface LeaderboardScreenProps {
    onBack: () => void;
    newScoreId?: string | null;
}

type Leaderboards = Record<Difficulty, LeaderboardEntry[]>;

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack, newScoreId }) => {
    const [leaderboards, setLeaderboards] = useState<Leaderboards>({ Easy: [], Medium: [], Hard: [] });
    const [activeTab, setActiveTab] = useState<Difficulty>('Medium');

    useEffect(() => {
        setLeaderboards(leaderboardService.getLeaderboards());
    }, []);

    const renderTab = (difficulty: Difficulty) => (
        <button
            onClick={() => setActiveTab(difficulty)}
            className={`px-6 py-2 text-xl font-bold rounded-t-lg transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                activeTab === difficulty
                    ? 'bg-slate-700/50 border-b-2 border-cyan-400 text-cyan-300'
                    : 'bg-slate-800/30 text-slate-400 hover:bg-slate-700/40 hover:text-white'
            }`}
        >
            {difficulty}
        </button>
    );

    const renderBoard = (board: LeaderboardEntry[]) => {
        if (board.length === 0) {
            return <p className="text-center text-slate-400 py-10 text-xl">No scores yet. Be the first!</p>;
        }
        return (
            <table className="w-full text-left">
                <thead className="text-sm text-cyan-400 uppercase tracking-wider">
                    <tr>
                        <th className="p-3">Rank</th>
                        <th className="p-3">Name</th>
                        <th className="p-3 text-right">Score</th>
                        <th className="p-3 text-center">Grade</th>
                        <th className="p-3 text-right">Level</th>
                        <th className="p-3 text-right">WPM</th>
                        <th className="p-3 text-right">Accuracy</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {board.map((entry, index) => (
                        <tr
                            key={entry.id}
                            className={`text-lg transition-colors duration-300 ${
                                entry.id === newScoreId ? 'bg-cyan-500/20 animate-pulse' : 'hover:bg-slate-700/50'
                            }`}
                            style={{ animationIterationCount: 3 }}
                        >
                            <td className="p-3 font-bold text-slate-300">#{index + 1}</td>
                            <td className="p-3 font-semibold text-white">{entry.name}</td>
                            <td className="p-3 font-bold text-cyan-400 text-right">{entry.score.toLocaleString()}</td>
                            <td className="p-3 font-black text-center text-yellow-300">{entry.grade}</td>
                            <td className="p-3 text-slate-300 text-right">{entry.level}</td>
                            <td className="p-3 text-slate-300 text-right">{entry.wpm}</td>
                            <td className="p-3 text-slate-300 text-right">{entry.accuracy}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-4xl glass-panel max-h-[90vh] flex flex-col">
                <h2 className="text-5xl font-extrabold my-6 text-center text-cyan-300" style={{textShadow: '0 0 10px #0dd'}}>Leaderboard</h2>
                <div className="px-6 border-b border-slate-700">
                    <div className="flex gap-2">
                        {renderTab('Easy')}
                        {renderTab('Medium')}
                        {renderTab('Hard')}
                    </div>
                </div>
                <div className="overflow-y-auto p-6">
                    {renderBoard(leaderboards[activeTab])}
                </div>
            </div>

            <div className="mt-8">
                <button
                    onClick={onBack}
                    className="btn btn-cyan"
                >
                    Back to Menu
                </button>
            </div>
        </div>
    );
};

export default LeaderboardScreen;