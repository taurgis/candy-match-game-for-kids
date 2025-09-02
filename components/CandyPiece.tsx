import React, { useState, useEffect, useRef } from 'react';
import type { Candy } from '../types';
import { CANDY_COLORS } from '../constants';

interface CandyPieceProps {
    candy: Candy | null;
    x: number;
    y: number;
    isShaking: boolean;
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerEnter: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const PIECE_SIZE = 56; // Corresponds to md:w-14
const GAP_SIZE = 4; // Corresponds to gap-1
const TOTAL_PIECE_SIZE = PIECE_SIZE + GAP_SIZE;

const CandyIcon: React.FC<{color: string}> = ({ color }) => {
    switch (color) {
        case 'red': return <div className="w-4 h-4 bg-white rounded-full"></div>;
        case 'orange': return <div className="w-4 h-4 bg-white transform rotate-45"></div>;
        case 'yellow': return <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-white"></div>;
        case 'green': return <div className="w-4 h-1 bg-white my-1.5"></div>;
        case 'blue': return <div className="w-1 h-4 bg-white mx-1.5"></div>;
        case 'purple': return <div className="w-4 h-4 rounded-sm bg-white"></div>;
        default: return null;
    }
}

const CandyPiece: React.FC<CandyPieceProps> = ({ candy, x, y, isShaking, ...pointerProps }) => {
    const [visualCandy, setVisualCandy] = useState(candy);
    const [isMatched, setIsMatched] = useState(false);
    
    // A candy is "new" if this component is being mounted for the first time.
    // Because of the `key={candy.id}` in GameBoard, any new candy gets a fresh component instance.
    const isMountingRef = useRef(true);
    const isNew = isMountingRef.current;

    useEffect(() => {
        // This effect handles the "disappearing" animation when a candy is matched.
        if (!candy && visualCandy) {
            setIsMatched(true);
            const timer = setTimeout(() => {
                setVisualCandy(null);
                setIsMatched(false);
            }, 300);
            return () => clearTimeout(timer);
        } else if (candy && visualCandy?.id === candy.id && visualCandy.special !== candy.special) {
            // Handle special type changes without re-animating
             setVisualCandy(candy);
        }
        
        // Mark this component as having mounted.
        isMountingRef.current = false;
    }, [candy, visualCandy]);

    if (!visualCandy) {
        return null;
    }
    
    const visualCandyColor = visualCandy.special === 'bomb' ? 'bomb' : visualCandy.special === 'rainbow' ? 'rainbow' : visualCandy.color;
    const colorClass = CANDY_COLORS[visualCandyColor];
    const isSpecial = !!visualCandy.special;
    
    const animationStyle: React.CSSProperties = {};
    let animationClass = '';
    if (isMatched) {
        animationClass = 'animate-vanish';
    } else if (isNew) {
        // Create a cascade effect where candies in lower rows fall from higher up,
        // making them all appear to start from above the board.
        const startYOffset = (y * TOTAL_PIECE_SIZE) + TOTAL_PIECE_SIZE;
        animationStyle['--start-y-pos'] = `-${startYOffset}px`;
        animationClass = 'animate-drop-in';
    } else if (isShaking) {
        animationClass = 'animate-shake';
    }
    
    return (
        <>
            <div 
                style={{
                    position: 'absolute',
                    width: PIECE_SIZE,
                    height: PIECE_SIZE,
                    top: y * TOTAL_PIECE_SIZE,
                    left: x * TOTAL_PIECE_SIZE,
                    transition: 'top 1s cubic-bezier(0.34, 1.56, 0.64, 1), left 0.3s ease-in-out',
                    touchAction: 'none',
                    ...animationStyle,
                }}
                className={`relative flex items-center justify-center rounded-lg shadow-inner cursor-grab active:cursor-grabbing border-b-4 overflow-hidden ${colorClass} ${animationClass}`}
                {...pointerProps}
            >
                {isSpecial && (
                     <div
                        className="absolute inset-0 animate-shimmer"
                        style={{ animationDelay: `${Math.random() * 4}s` }}
                    />
                )}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                    {visualCandy.special === 'row' && <div className="absolute w-full h-2.5 bg-white/60 rounded-full" />}
                    {visualCandy.special === 'column' && <div className="absolute w-2.5 h-full bg-white/60 rounded-full" />}
                    {visualCandy.special === 'jelly' && <div className="absolute inset-1.5 rounded-full bg-white/50 animate-pulse border-2 border-white/80" />}
                    
                    {visualCandy.special === 'rainbow' ? (
                         <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-spin-slow">
                            <div className="w-5 h-5 rounded-full bg-white" />
                        </div>
                    ) : visualCandy.special === 'bomb' ? (
                        <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center shadow-lg">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-400 via-yellow-300 to-blue-400 animate-pulse" />
                        </div>
                    ) : (
                        <CandyIcon color={visualCandy.color} />
                    )}
                </div>
            </div>
            <style>{`
                @keyframes vanish {
                    from { transform: scale(1); opacity: 1; }
                    to { transform: scale(0) rotate(90deg); opacity: 0; }
                }
                .animate-vanish {
                    animation: vanish 0.3s ease-out forwards;
                }
                
                @keyframes drop-in {
                    from { 
                        transform: translateY(var(--start-y-pos));
                        opacity: 0;
                    }
                    70% {
                        transform: translateY(10px); /* Bounce over the final spot */
                        opacity: 1;
                    }
                    to { 
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-drop-in {
                    /* A bouncy easing function */
                    animation: drop-in 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 4s linear infinite;
                }
                 @keyframes shimmer {
                    0% {
                        transform: translateX(-150%) skewX(-25deg);
                    }
                    100% {
                        transform: translateX(150%) skewX(-25deg);
                    }
                }
                .animate-shimmer {
                    background: linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 0) 0%,
                        rgba(255, 255, 255, 0.4) 50%,
                        rgba(255, 255, 255, 0) 100%
                    );
                    animation: shimmer 3.5s infinite;
                }
            `}</style>
        </>
    );
};

export default CandyPiece;