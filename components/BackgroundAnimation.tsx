import React, { useRef, useEffect } from 'react';

interface BackgroundAnimationProps {
    isTimeSlowed: boolean;
}

const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({ isTimeSlowed }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        interface Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            radius: number;
            alpha: number;
        }

        const particles: Particle[] = [];
        const particleCount = 100;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 2 + 1,
                alpha: Math.random() * 0.5 + 0.1,
            });
        }

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const speedMultiplier = isTimeSlowed ? 0.3 : 1;
            
            particles.forEach(p => {
                p.x += p.vx * speedMultiplier;
                p.y += p.vy * speedMultiplier;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                const color = isTimeSlowed ? `rgba(100, 255, 255, ${Math.min(1, p.alpha * 1.5)})` : `rgba(0, 255, 255, ${p.alpha})`;
                ctx.fillStyle = color;
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };

    }, [isTimeSlowed]);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none" />;
};

export default BackgroundAnimation;