import React, { useState, useEffect, useRef } from 'react';
import type { Candy } from '../types';
import { CANDY_COLORS } from '../constants';
import { useResponsive } from '../hooks/useResponsive';

interface CandyPieceProps {
    candy: Candy | null;
    x: number;
    y: number;
    isShaking: boolean;
    isSelected?: boolean;
    isTarget?: boolean;
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerEnter: (e: React.PointerEvent<HTMLDivElement>) => void;
    pieceSize?: number;
    totalPieceSize?: number;
}

const PIECE_SIZE = 56; // Default size for desktop
const PIECE_SIZE_MOBILE = 32; // Smaller size for mobile (iPhone 7 height compatible)
const GAP_SIZE = 4; // Corresponds to gap-1
const GAP_SIZE_MOBILE = 1; // Minimal gap for mobile
const TOTAL_PIECE_SIZE = PIECE_SIZE + GAP_SIZE;
const TOTAL_PIECE_SIZE_MOBILE = PIECE_SIZE_MOBILE + GAP_SIZE_MOBILE;

const CandyIcon: React.FC<{color: string; size: number}> = ({ color, size }) => {
    const iconSize = Math.max(12, size * 0.3); // Scale icon with candy size, minimum 12px
    
    switch (color) {
        case 'red': return <div className="bg-white rounded-full" style={{ width: iconSize, height: iconSize }}></div>;
        case 'orange': return <div className="bg-white transform rotate-45" style={{ width: iconSize, height: iconSize }}></div>;
        case 'yellow': return <div className="w-0 h-0" style={{ 
            borderLeft: `${iconSize/2}px solid transparent`,
            borderRight: `${iconSize/2}px solid transparent`,
            borderBottom: `${iconSize}px solid white`
        }}></div>;
        case 'green': return <div className="bg-white" style={{ width: iconSize * 1.2, height: iconSize * 0.25, margin: `${iconSize * 0.375}px 0` }}></div>;
        case 'blue': return <div className="bg-white" style={{ width: iconSize * 0.25, height: iconSize * 1.2, margin: `0 ${iconSize * 0.375}px` }}></div>;
        case 'purple': return <div className="rounded-sm bg-white" style={{ width: iconSize, height: iconSize }}></div>;
        default: return null;
    }
}

const CandyPiece: React.FC<CandyPieceProps> = ({ candy, x, y, isShaking, isSelected = false, isTarget = false, pieceSize, totalPieceSize, ...pointerProps }) => {
    const [visualCandy, setVisualCandy] = useState(candy);
    const [isMatched, setIsMatched] = useState(false);
    const { isMobile } = useResponsive();
    
    // Use responsive sizing - props take precedence, then responsive detection, then defaults
    const currentPieceSize = pieceSize || (isMobile ? PIECE_SIZE_MOBILE : PIECE_SIZE);
    const currentTotalPieceSize = totalPieceSize || (isMobile ? TOTAL_PIECE_SIZE_MOBILE : TOTAL_PIECE_SIZE);
    
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
    
    // Add visual feedback classes
    let feedbackClass = '';
    if (isSelected) {
        feedbackClass = 'ring-4 ring-yellow-300 ring-opacity-80 scale-105';
    } else if (isTarget) {
        feedbackClass = 'ring-4 ring-green-300 ring-opacity-80 scale-105';
    }
    
    const animationStyle: React.CSSProperties = {};
    let animationClass = '';
    if (isMatched) {
        animationClass = 'animate-vanish';
    } else if (isNew) {
        // Create a cascade effect where candies in lower rows fall from higher up,
        // making them all appear to start from above the board.
        const startYOffset = (y * currentTotalPieceSize) + currentTotalPieceSize;
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
                    width: currentPieceSize,
                    height: currentPieceSize,
                    top: y * currentTotalPieceSize,
                    left: x * currentTotalPieceSize,
                    transition: 'top 1s cubic-bezier(0.34, 1.56, 0.64, 1), left 0.3s ease-in-out',
                    touchAction: 'none',
                    ...animationStyle,
                }}
                className={`relative flex items-center justify-center rounded-lg shadow-inner cursor-grab active:cursor-grabbing border-b-4 overflow-hidden transition-all duration-200 ${colorClass} ${animationClass} ${feedbackClass}`}
                {...pointerProps}
            >
                {isSpecial && (
                     <div
                        className="absolute inset-0 animate-shimmer"
                        style={{ animationDelay: `${Math.random() * 4}s` }}
                    />
                )}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                    {visualCandy.special === 'row' && <div className={`absolute bg-white/60 rounded-full`} style={{ width: '100%', height: currentPieceSize * 0.18 }} />}
                    {visualCandy.special === 'column' && <div className={`absolute bg-white/60 rounded-full`} style={{ height: '100%', width: currentPieceSize * 0.18 }} />}
                    {visualCandy.special === 'jelly' && <div className={`absolute rounded-full bg-white/50 animate-pulse border-2 border-white/80`} style={{ inset: currentPieceSize * 0.1 }} />}
                    
                    {visualCandy.special === 'rainbow' ? (
                         <div className={`rounded-full flex items-center justify-center shadow-lg animate-spin-slow`} style={{ width: currentPieceSize * 0.57, height: currentPieceSize * 0.57 }}>
                            <div className={`rounded-full bg-white`} style={{ width: currentPieceSize * 0.36, height: currentPieceSize * 0.36 }} />
                        </div>
                    ) : visualCandy.special === 'bomb' ? (
                        <div className={`rounded-full bg-gray-900 flex items-center justify-center shadow-lg`} style={{ width: currentPieceSize * 0.43, height: currentPieceSize * 0.43 }}>
                            <div className={`rounded-full bg-gradient-to-br from-red-400 via-yellow-300 to-blue-400 animate-pulse`} style={{ width: currentPieceSize * 0.29, height: currentPieceSize * 0.29 }} />
                        </div>
                    ) : (
                        <CandyIcon color={visualCandy.color} size={currentPieceSize} />
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