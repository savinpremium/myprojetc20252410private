
import React, { useRef, useEffect } from 'react';
import type { FC } from 'react';

export const RayBackground: FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        let rays: Ray[] = [];
        const rayCount = 8;
        const colors = ['rgba(59, 130, 246, 0.1)', 'rgba(139, 92, 246, 0.1)'];

        class Ray {
            x: number; y: number; angle: number; speed: number; length: number; width: number; color: string;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.angle = Math.random() * Math.PI * 2;
                this.speed = (Math.random() - 0.5) * 0.005;
                this.length = Math.random() * 800 + 400;
                this.width = Math.random() * 150 + 50;
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.angle += this.speed;
            }

            draw() {
                if (!ctx) return;
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);

                const gradient = ctx.createLinearGradient(-this.length / 2, 0, this.length / 2, 0);
                const transparentColor = this.color.replace('0.1', '0');
                gradient.addColorStop(0, transparentColor);
                gradient.addColorStop(0.5, this.color);
                gradient.addColorStop(1, transparentColor);
                
                ctx.fillStyle = gradient;
                ctx.fillRect(-this.length / 2, -this.width / 2, this.length, this.width);
                
                ctx.restore();
            }
        }

        function init() {
            rays = [];
            for (let i = 0; i < rayCount; i++) {
                rays.push(new Ray());
            }
        }
        init();

        let animationFrameId: number;

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'lighter';

            for (let i = 0; i < rays.length; i++) {
                rays[i].update();
                rays[i].draw();
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

    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
};