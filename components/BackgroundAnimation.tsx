import React, { useRef, useEffect } from 'react';
import { Difficulty } from '../types';

interface BackgroundAnimationProps {
    isTimeSlowed: boolean;
    difficulty: Difficulty | null;
}

const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({ isTimeSlowed, difficulty }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let isResizing = false;
        const resizeCanvas = () => {
            if (isResizing) return;
            isResizing = true;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            setTimeout(() => { isResizing = false; }, 100);
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }

        const speedMultiplier = isTimeSlowed ? 0.3 : 1;

        const runClearAnimation = () => {
            interface Particle { x: number; y: number; vx: number; vy: number; radius: number; alpha: number; }
            const particles: Particle[] = [];
            const particleCount = 100;
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
                    radius: Math.random() * 2 + 1, alpha: Math.random() * 0.5 + 0.1,
                });
            }
            const animate = () => {
                if (!ctx) return;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(p => {
                    p.x += p.vx * speedMultiplier; p.y += p.vy * speedMultiplier;
                    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    const color = isTimeSlowed ? `rgba(100, 255, 255, ${Math.min(1, p.alpha * 1.5)})` : `rgba(250, 250, 210, ${p.alpha})`;
                    ctx.fillStyle = color;
                    ctx.fill();
                });
                animationFrameId.current = requestAnimationFrame(animate);
            };
            animate();
        };

        const runRainAnimation = (isStorm: boolean) => {
            interface Raindrop { x: number; y: number; length: number; speed: number; }
            const raindrops: Raindrop[] = [];
            const dropCount = isStorm ? 500 : 200;
            for (let i = 0; i < dropCount; i++) {
                raindrops.push({
                    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                    length: Math.random() * 20 + 10,
                    speed: Math.random() * (isStorm ? 8 : 4) + (isStorm ? 6 : 2),
                });
            }
            let lightningOpacity = 0;
            const animate = () => {
                if (!ctx) return;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                raindrops.forEach(drop => {
                    drop.y += drop.speed * speedMultiplier;
                    if (drop.y > canvas.height) {
                        drop.y = -drop.length;
                        drop.x = Math.random() * canvas.width;
                    }
                    ctx.beginPath();
                    ctx.moveTo(drop.x, drop.y);
                    ctx.lineTo(drop.x, drop.y + drop.length);
                    ctx.strokeStyle = `rgba(175, 200, 220, ${isStorm ? 0.8 : 0.6})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                });
                
                if (isStorm) {
                    if (Math.random() > 0.992) lightningOpacity = 1;
                    if (lightningOpacity > 0) {
                        ctx.fillStyle = `rgba(200, 220, 255, ${lightningOpacity * 0.8})`;
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        lightningOpacity -= 0.04;
                    }
                }

                animationFrameId.current = requestAnimationFrame(animate);
            };
            animate();
        };

        switch (difficulty) {
            case 'Hard':
                runRainAnimation(true);
                break;
            case 'Medium':
                runRainAnimation(false);
                break;
            case 'Easy':
            default:
                runClearAnimation();
                break;
        }

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [isTimeSlowed, difficulty]);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none" />;
};

export default BackgroundAnimation;