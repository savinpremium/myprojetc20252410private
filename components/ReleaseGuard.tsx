
import React, { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { ParticleBackground } from './ParticleBackground';

interface ReleaseGuardProps {
    children: React.ReactNode;
}

export const ReleaseGuard: FC<ReleaseGuardProps> = ({ children }) => {
    // Target: Dec 26, 2025, 08:20 PM (20:20)
    const targetDate = new Date('2025-12-26T20:20:00').getTime();
    const [timeLeft, setTimeLeft] = useState(targetDate - Date.now());
    const [isReleased, setIsReleased] = useState(false);
    const [ribbonCut, setRibbonCut] = useState(false);
    const [autoIgnite, setAutoIgnite] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = Date.now();
            const difference = targetDate - now;
            setTimeLeft(difference);
            
            if (difference <= 0 && !isReleased) {
                setIsReleased(true);
                clearInterval(timer);
                
                // Auto-transition sequence
                setTimeout(() => {
                    setAutoIgnite(true);
                    setTimeout(() => {
                        handleCutRibbon();
                    }, 2000); // 2 seconds for the "splitting" animation
                }, 1500); // Wait 1.5s after timer hits zero to show "Unlocked" state
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate, isReleased]);

    // Fireworks Logic for the Grand Reveal
    useEffect(() => {
        if (!isReleased || ribbonCut || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: any[] = [];
        const colors = ['#FFD700', '#FFFFFF', '#4facfe', '#00f2fe'];

        class Particle {
            x: number; y: number; vx: number; vy: number; alpha: number; color: string;
            constructor(x: number, y: number, color: string) {
                this.x = x; this.y = y;
                this.vx = (Math.random() - 0.5) * 12;
                this.vy = (Math.random() - 0.5) * 12;
                this.alpha = 1;
                this.color = color;
            }
            update() {
                this.x += this.vx; this.y += this.vy;
                this.vy += 0.08;
                this.alpha -= 0.012;
            }
            draw() {
                if (!ctx) return;
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const createFirework = () => {
            const x = Math.random() * canvas.width;
            const y = Math.random() * (canvas.height / 1.5);
            const color = colors[Math.floor(Math.random() * colors.length)];
            for (let i = 0; i < 60; i++) particles.push(new Particle(x, y, color));
        };

        let frame: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (Math.random() < 0.08) createFirework();
            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update();
                particles[i].draw();
                if (particles[i].alpha <= 0) particles.splice(i, 1);
            }
            frame = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(frame);
    }, [isReleased, ribbonCut]);

    const days = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60 * 24)));
    const hours = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    const minutes = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));
    const seconds = Math.max(0, Math.floor((timeLeft % (1000 * 60)) / 1000));

    const handleCutRibbon = () => {
        setRibbonCut(true);
        localStorage.setItem('infinity_released_v3', 'true');
    };

    useEffect(() => {
        if (localStorage.getItem('infinity_released_v3') === 'true') {
            setRibbonCut(true);
        }
    }, []);

    if (ribbonCut) return <>{children}</>;

    return (
        <div className={`fixed inset-0 z-[100] bg-[#020202] flex flex-col items-center justify-center overflow-hidden font-inter transition-all duration-1000 ${autoIgnite ? 'opacity-0 scale-110' : 'opacity-100'}`}>
            <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />
            <ParticleBackground />
            
            {/* Super Borders */}
            <div className="absolute inset-0 pointer-events-none z-50">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent shadow-[0_0_15px_rgba(234,179,8,0.5)]"></div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent shadow-[0_0_15px_rgba(234,179,8,0.5)]"></div>
                <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-transparent via-blue-500/30 to-transparent"></div>
                <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-transparent via-blue-500/30 to-transparent"></div>
            </div>

            <div className={`relative z-10 flex flex-col items-center text-center px-6 transition-all duration-1000 ${isReleased ? 'translate-y-[-5vh]' : ''}`}>
                <div className="mb-12">
                    <div className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600/10 via-white/5 to-indigo-600/10 border border-white/10 rounded-full mb-10 animate-pulse shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                        <span className="text-[11px] font-black text-white uppercase tracking-[0.6em]">Neural Awakening Sequence</span>
                    </div>
                    
                    <h2 className="text-8xl md:text-[12rem] font-black text-white tracking-tighter uppercase mb-6 leading-[0.8] drop-shadow-[0_10px_30px_rgba(0,0,0,1)]">
                        FUSION<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 animate-gradient-flow">ALPHA 3.0</span>
                    </h2>
                    
                    <p className="text-gray-400 max-w-xl mx-auto text-xl font-medium tracking-tight leading-relaxed opacity-60">
                        Synchronizing across 128 nodes. Deploying proprietary reasoning models. 
                        The gateway to infinite intelligence is opening.
                    </p>
                </div>

                {!isReleased ? (
                    <div className="flex gap-4 md:gap-12 items-center justify-center scale-75 md:scale-100">
                        <TimeBlock value={days} label="Days" />
                        <span className="text-7xl font-black text-gray-800 animate-pulse">:</span>
                        <TimeBlock value={hours} label="Hours" />
                        <span className="text-7xl font-black text-gray-800 animate-pulse">:</span>
                        <TimeBlock value={minutes} label="Minutes" />
                        <span className="text-7xl font-black text-gray-800 animate-pulse">:</span>
                        <TimeBlock value={seconds} label="Seconds" />
                    </div>
                ) : (
                    <div className="animate-in fade-in zoom-in duration-1000 flex flex-col items-center">
                         <div className="text-white text-4xl font-black uppercase tracking-[0.5em] mb-4 text-blue-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]">
                            RELEASE PROTOCOL ACTIVE
                         </div>
                         <div className="h-1 w-64 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-width-expand"></div>
                    </div>
                )}
            </div>

            {/* Cinematic Auto-Splitting Ribbons */}
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-[2000ms] ${ribbonCut ? 'scale-150' : 'scale-100'}`}>
                
                {/* Upper Half Ribbon */}
                <div className={`h-1/2 w-full absolute top-0 bg-gradient-to-b from-transparent to-red-600/10 border-b-[3px] border-yellow-500/50 flex items-end justify-center overflow-hidden transition-transform duration-[1500ms] ease-in-out ${autoIgnite ? '-translate-y-full opacity-0' : 'translate-y-0'}`}>
                    <div className="ribbon-text-container-top flex whitespace-nowrap pb-4">
                        {[...Array(6)].map((_, i) => (
                            <span key={i} className="text-4xl md:text-6xl font-black text-white/5 uppercase tracking-[2em] px-20 italic">
                                INFINITY AI RELEASE 2026 • FUSION TIER
                            </span>
                        ))}
                    </div>
                </div>

                {/* Lower Half Ribbon */}
                <div className={`h-1/2 w-full absolute bottom-0 bg-gradient-to-t from-transparent to-red-600/10 border-t-[3px] border-yellow-500/50 flex items-start justify-center overflow-hidden transition-transform duration-[1500ms] ease-in-out ${autoIgnite ? 'translate-y-full opacity-0' : 'translate-y-0'}`}>
                    <div className="ribbon-text-container-bottom flex whitespace-nowrap pt-4">
                        {[...Array(6)].map((_, i) => (
                            <span key={i} className="text-4xl md:text-6xl font-black text-white/5 uppercase tracking-[2em] px-20 italic">
                                INFINITY AI RELEASE 2026 • FUSION TIER
                            </span>
                        ))}
                    </div>
                </div>

                {/* Central Horizon Ribbon (The one that actually "cuts") */}
                <div className={`h-40 w-full absolute flex items-center justify-center transition-all duration-1000 ${isReleased ? 'opacity-100' : 'opacity-0 scale-95'}`}>
                    <div className={`absolute inset-0 bg-red-600 shadow-[0_0_100px_rgba(220,38,38,0.6)] border-y-[6px] border-yellow-500 transition-all duration-[1000ms] ${autoIgnite ? 'scale-y-0 opacity-0' : 'scale-y-100 opacity-100'}`}>
                         <div className="h-full w-full flex items-center justify-center">
                            <div className="ribbon-text-main flex whitespace-nowrap">
                                {[...Array(4)].map((_, i) => (
                                    <span key={i} className="text-5xl md:text-7xl font-black text-red-950/40 uppercase tracking-[1em] px-20 italic">
                                        IGNITING FUSION
                                    </span>
                                ))}
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slide-ribbon-main {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .ribbon-text-main {
                    animation: slide-ribbon-main 15s linear infinite;
                }
                .ribbon-text-container-top {
                    animation: slide-ribbon-main 40s linear infinite;
                }
                .ribbon-text-container-bottom {
                    animation: slide-ribbon-main 40s linear infinite reverse;
                }
                .time-card {
                    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
                    box-shadow: 0 10px 40px -10px rgba(0,0,0,1);
                    position: relative;
                }
                .time-card::after {
                    content: '';
                    position: absolute;
                    inset: -1px;
                    border-radius: inherit;
                    padding: 1px;
                    background: linear-gradient(to bottom, rgba(255,255,255,0.1), transparent);
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                }
                .animate-width-expand {
                    animation: width-expand 1.5s ease-out forwards;
                }
                @keyframes width-expand {
                    from { width: 0; }
                    to { width: 24rem; }
                }
                .animate-gradient-flow {
                    background-size: 200% auto;
                    animation: gradient-flow 3s linear infinite;
                }
                @keyframes gradient-flow {
                    to { background-position: 200% center; }
                }
            `}</style>
        </div>
    );
};

const TimeBlock: FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center group">
        <div className="time-card border border-white/5 rounded-[2.5rem] w-28 md:w-48 py-10 md:py-16 flex items-center justify-center backdrop-blur-3xl transition-all duration-500 group-hover:border-blue-500/40 group-hover:shadow-[0_0_50px_rgba(59,130,246,0.15)]">
            <span className="text-6xl md:text-[10rem] font-black text-white tracking-tighter leading-none">{String(value).padStart(2, '0')}</span>
        </div>
        <span className="mt-6 text-[12px] md:text-sm font-black text-gray-500 uppercase tracking-[0.5em] group-hover:text-blue-400 transition-colors duration-500">{label}</span>
    </div>
);
