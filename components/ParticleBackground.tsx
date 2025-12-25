import React, { useRef, useEffect } from 'react';
import type { FC } from 'react';

export const ParticleBackground: FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        let particles: Particle[] = [];
        const particleCount = 150;

        let nebula: NebulaCircle[] = [];
        const nebulaCount = 5;
        const colors = ['#3b82f6', '#8b5cf6', '#14b8a6'];

        class Particle {
            x: number; y: number; size: number; speedX: number; speedY: number;

            constructor() {
                this.x = Math.random() * width; this.y = Math.random() * height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = (Math.random() * 0.3 - 0.15); this.speedY = (Math.random() * 0.3 - 0.15);
            }
            update() {
                if (this.x > width || this.x < 0) this.speedX *= -1;
                if (this.y > height || this.y < 0) this.speedY *= -1;
                this.x += this.speedX; this.y += this.speedY;
            }
            draw() {
                if(!ctx) return;
                ctx.fillStyle = 'rgba(156, 163, 175, 0.6)';
                ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
            }
        }

        class NebulaCircle {
            x: number; y: number; radius: number; speedX: number; speedY: number; color: string;

            constructor() {
                this.x = Math.random() * width; this.y = Math.random() * height;
                this.radius = Math.random() * (width / 4) + (width / 8);
                this.speedX = (Math.random() * 0.2 - 0.1); this.speedY = (Math.random() * 0.2 - 0.1);
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }
            update() {
                if (this.x + this.radius > width || this.x - this.radius < 0) this.speedX *= -1;
                if (this.y + this.radius > height || this.y - this.radius < 0) this.speedY *= -1;
                this.x += this.speedX; this.y += this.speedY;
            }
            draw() {
                 if(!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.closePath();
                ctx.fill();
            }
        }

        function init() {
            particles = [];
            nebula = [];
            for (let i = 0; i < particleCount; i++) particles.push(new Particle());
            for (let i = 0; i < nebulaCount; i++) nebula.push(new NebulaCircle());
        }
        init();

        let animationFrameId: number;
        
        const animate = () => {
            if(!ctx) return;
            ctx.clearRect(0, 0, width, height);
            
            // Draw blurred nebula
            ctx.save();
            ctx.filter = 'blur(100px)';
            for(let i = 0; i < nebula.length; i++) {
                nebula[i].update();
                nebula[i].draw();
            }
            ctx.restore();

            // Draw sharp particles on top
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            init();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 bg-gradient-to-br from-[#0a0a0a] to-[#111827]" />;
};