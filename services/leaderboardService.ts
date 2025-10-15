import { LeaderboardEntry, Difficulty } from '../types';
import { LEADERBOARD_MAX_SIZE } from '../constants';

const LEADERBOARD_KEY = 'typingThunderLeaderboard';

type Leaderboards = Record<Difficulty, LeaderboardEntry[]>;

const getLeaderboards = (): Leaderboards => {
    try {
        const data = localStorage.getItem(LEADERBOARD_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            // Ensure all difficulty keys exist
            return {
                Easy: parsed.Easy || [],
                Medium: parsed.Medium || [],
                Hard: parsed.Hard || [],
            };
        }
    } catch (error) {
        console.error("Failed to load leaderboards from localStorage", error);
    }
    return { Easy: [], Medium: [], Hard: [] };
};

const saveLeaderboards = (leaderboards: Leaderboards) => {
    try {
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboards));
    } catch (error) {
        console.error("Failed to save leaderboards to localStorage", error);
    }
};

const isHighScore = (score: number, difficulty: Difficulty): boolean => {
    const leaderboards = getLeaderboards();
    const board = leaderboards[difficulty];
    if (board.length < LEADERBOARD_MAX_SIZE) {
        return true;
    }
    const lowestScore = board[board.length - 1]?.score ?? 0;
    return score > lowestScore;
};

const addScore = (entry: LeaderboardEntry) => {
    const leaderboards = getLeaderboards();
    const board = leaderboards[entry.difficulty];

    const newBoard = [...board, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, LEADERBOARD_MAX_SIZE);

    leaderboards[entry.difficulty] = newBoard;
    saveLeaderboards(leaderboards);
};

export const leaderboardService = {
    getLeaderboards,
    isHighScore,
    addScore,
};
