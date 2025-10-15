import React, { useState, useEffect, useRef } from 'react';
import { Grade } from '../types';
import { GRADE_PROGRESS_THRESHOLDS } from '../constants';

interface GradeMeterProps {
    progress: number;
    grade: Grade;
    multiplier: number;
}

const GRADE_ORDER: Grade[] = ['F', 'D', 'C', 'B', 'A', 'S'];

const getGradeStyles = (grade: Grade): { color: string, shadow: string } => {
    switch (grade) {
        case 'S': return { color: 'text-yellow-300', shadow: '0 0 15px #fde047' };
        case 'A': return { color: 'text-green-400', shadow: '0 0 12px #4ade80' };
        case 'B': return { color: 'text-sky-400', shadow: '0 0 10px #38bdf8' };
        case 'C': return { color: 'text-orange-400', shadow: '0 0 8px #fb923c' };
        case 'D': return { color: 'text-red-400', shadow: '0 0 6px #f87171' };
        default: return { color: 'text-slate-400', shadow: 'none' };
    }
};

const useAnimatedValue = (value: number) => {
    const [displayValue, setDisplayValue] = useState(value);
    const valueRef = useRef(value);

    useEffect(() => {
        const startValue = valueRef.current;
        const endValue = value;
        const duration = 500;
        let startTime: number | null = null;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.round(startValue + (endValue - startValue) * progress);
            
            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                valueRef.current = endValue;
            }
        };

        requestAnimationFrame(animate);

        return () => { valueRef.current = endValue; };
    }, [value]);

    return displayValue;
};


const GradeMeter: React.FC<GradeMeterProps> = ({ progress, grade, multiplier }) => {
    const [isGradeUp, setIsGradeUp] = useState(false);
    const [isBarFlash, setIsBarFlash] = useState(false);
    const prevGradeRef = useRef(grade);
    const prevProgressRef = useRef(progress);
    const animatedProgress = useAnimatedValue(progress);

    useEffect(() => {
        if (grade !== prevGradeRef.current) {
            setIsGradeUp(true);
            setTimeout(() => setIsGradeUp(false), 400);
            prevGradeRef.current = grade;
        }
        if (progress > prevProgressRef.current) {
            setIsBarFlash(true);
            setTimeout(() => setIsBarFlash(false), 500);
        }
        prevProgressRef.current = progress;
    }, [grade, progress]);

    const currentGradeIndex = GRADE_ORDER.indexOf(grade);
    const nextGrade = currentGradeIndex < GRADE_ORDER.length - 1 ? GRADE_ORDER[currentGradeIndex + 1] : null;
    
    const lowerBound = GRADE_PROGRESS_THRESHOLDS[grade];
    const upperBound = nextGrade ? GRADE_PROGRESS_THRESHOLDS[nextGrade] : lowerBound;
    
    const progressInTier = progress - lowerBound;
    const tierTotal = upperBound - lowerBound;
    
    const percentage = tierTotal > 0 ? (progressInTier / tierTotal) * 100 : 100;
    const gradeStyles = getGradeStyles(grade);

    return (
        <div className="w-full glass-panel p-3">
            <h3 className="text-lg font-bold text-cyan-400 mb-2 text-center tracking-wider" style={{textShadow: '0 0 5px #0ff'}}>STYLE METER</h3>
            <div className="flex items-center justify-between mb-2">
                <div 
                    key={grade} 
                    className={`text-6xl font-black ${gradeStyles.color} ${isGradeUp ? 'animate-grade-up' : ''}`} 
                    style={{ textShadow: gradeStyles.shadow }}
                >
                    {grade}
                </div>
                <div className="text-right">
                     <p className="text-slate-400 text-sm">Multiplier</p>
                     <p className="text-2xl font-bold text-yellow-300">x{multiplier}</p>
                </div>
            </div>
            <div className="w-full bg-slate-900/70 rounded-full h-5 border-2 border-slate-600 overflow-hidden mb-1">
                <div
                    className={`h-full rounded-full grade-meter-bar-inner ${isBarFlash ? 'animate-bar-flash' : ''}`}
                    style={{ 
                        width: `${percentage}%`,
                        background: `linear-gradient(to right, ${getGradeStyles(grade).color.replace('text-', '')}-600, ${getGradeStyles(grade).color.replace('text-', '')}-400)`,
                    }}
                ></div>
            </div>
            <p className="text-right text-sm text-slate-300 font-semibold">{animatedProgress.toLocaleString()} / {nextGrade ? upperBound.toLocaleString() : '---'}</p>
        </div>
    );
};

export default GradeMeter;
