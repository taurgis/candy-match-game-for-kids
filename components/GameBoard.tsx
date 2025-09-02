import React, { useState, useEffect } from 'react';
import type { Board } from '../types';
import CandyPiece from './CandyPiece';
import SpecialEffectsLayer from './SpecialEffectsLayer';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants';
import { playSound } from '../lib/audioManager';
import { useLanguage } from '../context/LanguageContext';

interface GameBoardProps {
    board: Board;
    setBoard: React.Dispatch<React.SetStateAction<Board>>;
    decrementMoves: () => void;
    chainReactionCount: number;
    activeSpecialEffects: { type: 'row' | 'column'; index: number }[];
}

const PIECE_SIZE = 56; // Corresponds to md:w-14
const GAP_SIZE = 4; // Corresponds to gap-1
const TOTAL_PIECE_SIZE = PIECE_SIZE + GAP_SIZE;

const GameBoard: React.FC<GameBoardProps> = ({ board, setBoard, decrementMoves, chainReactionCount, activeSpecialEffects }) => {
    const [startCell, setStartCell] = useState<{ x: number; y: number } | null>(null);
    const [endCell, setEndCell] = useState<{ x: number; y: number } | null>(null);
    const [invalidSwap, setInvalidSwap] = useState<({ x: number; y: number }[]) | null>(null);
    const [swappingCandies, setSwappingCandies] = useState<{ from: { x: number; y: number }, to: { x: number; y: number } }[] | null>(null);
    const [comboMessage, setComboMessage] = useState<string | null>(null);
    const { t } = useLanguage();

    useEffect(() => {
        if (chainReactionCount > 1) {
            setComboMessage(`${t('combo')} x${chainReactionCount}`);
            const timer = setTimeout(() => setComboMessage(null), 1500);
            return () => clearTimeout(timer);
        }
    }, [chainReactionCount, t]);

    const checkColumnForMatches = (currentBoard: Board, x: number, y: number): boolean => {
        const candy = currentBoard[y][x];
        if (!candy || candy.special === 'bomb' || candy.special === 'rainbow') return false;
        const color = candy.color;
        // Check down
        if (y < BOARD_HEIGHT - 2 && currentBoard[y + 1][x]?.color === color && currentBoard[y + 2][x]?.color === color) return true;
        // Check up
        if (y > 1 && currentBoard[y - 1][x]?.color === color && currentBoard[y - 2][x]?.color === color) return true;
        // Check middle
        if (y > 0 && y < BOARD_HEIGHT - 1 && currentBoard[y - 1][x]?.color === color && currentBoard[y + 1][x]?.color === color) return true;
        return false;
    }

    const checkRowForMatches = (currentBoard: Board, x: number, y: number): boolean => {
        const candy = currentBoard[y][x];
        if (!candy || candy.special === 'bomb' || candy.special === 'rainbow') return false;
        const color = candy.color;
        // Check right
        if (x < BOARD_WIDTH - 2 && currentBoard[y][x + 1]?.color === color && currentBoard[y][x + 2]?.color === color) return true;
        // Check left
        if (x > 1 && currentBoard[y][x - 1]?.color === color && currentBoard[y][x - 2]?.color === color) return true;
        // Check middle
        if (x > 0 && x < BOARD_WIDTH - 1 && currentBoard[y][x - 1]?.color === color && currentBoard[y][x + 1]?.color === color) return true;
        return false;
    }
    
    const handlePointerDown = (x: number, y: number) => {
        if (invalidSwap || swappingCandies) return;
        setStartCell({ x, y });
    };

    const handlePointerEnter = (x: number, y: number) => {
        if (startCell) {
            setEndCell({ x, y });
        }
    };

    const handlePointerUp = () => {
        if (!startCell || !endCell) {
            setStartCell(null);
            setEndCell(null);
            return;
        }

        const startX = startCell.x;
        const startY = startCell.y;
        const endX = endCell.x;
        const endY = endCell.y;

        const dx = Math.abs(startX - endX);
        const dy = Math.abs(startY - endY);

        if (dx + dy !== 1) { // Not an adjacent swap
            setStartCell(null);
            setEndCell(null);
            return;
        }

        const startCandy = board[startY]?.[startX];
        const endCandy = board[endY]?.[endX];
        
        if (!startCandy || !endCandy) return;

        // --- 1. Handle Special + Special Combinations ---
        if (startCandy.special && endCandy.special) {
            let comboHandled = true;
            let newBoard = board.map(row => [...row]);
            const coordsToClear = new Set<string>();
            const specials = [startCandy.special, endCandy.special].sort();

            if (
                (specials[0] === 'bomb' && specials[1] === 'bomb') ||
                (specials[0] === 'rainbow' && specials[1] === 'rainbow') ||
                (specials[0] === 'bomb' && specials[1] === 'rainbow')
            ) {
                newBoard = board.map(row => row.map(() => null));
            }
            else if (
                (specials[0] === 'column' || specials[0] === 'row') &&
                (specials[1] === 'column' || specials[1] === 'row')
            ) {
                for(let i = 0; i < BOARD_WIDTH; i++) coordsToClear.add(`${startY},${i}`);
                for(let i = 0; i < BOARD_HEIGHT; i++) coordsToClear.add(`${i},${startX}`);
            }
            else if (
                specials.includes('bomb') && (specials.includes('row') || specials.includes('column'))
            ) {
                const stripedCandy = startCandy.special !== 'bomb' ? startCandy : endCandy;
                const stripedLocation = startCandy.special !== 'bomb' ? startCell : endCell;
                if (stripedCandy.special === 'row') {
                    for (let y = stripedLocation.y - 1; y <= stripedLocation.y + 1; y++) {
                        if (y >= 0 && y < BOARD_HEIGHT) {
                            for (let i = 0; i < BOARD_WIDTH; i++) coordsToClear.add(`${y},${i}`);
                        }
                    }
                } else { // 'column'
                    for (let x = stripedLocation.x - 1; x <= stripedLocation.x + 1; x++) {
                         if (x >= 0 && x < BOARD_WIDTH) {
                            for (let i = 0; i < BOARD_HEIGHT; i++) coordsToClear.add(`${i},${x}`);
                        }
                    }
                }
            } else {
                comboHandled = false;
            }

            if (comboHandled) {
                playSound('combo');
                if (coordsToClear.size > 0) {
                     coordsToClear.forEach(coord => {
                        const [y, x] = coord.split(',').map(Number);
                        if (newBoard[y]) newBoard[y][x] = null;
                    });
                }
                newBoard[startY][startX] = null;
                newBoard[endY][endX] = null;
                setBoard(newBoard);
                decrementMoves();
                setStartCell(null);
                setEndCell(null);
                return;
            }
        }

        if (startCandy?.special === 'rainbow' || endCandy?.special === 'rainbow') {
            playSound('specialActivation');
            const newBoard = board.map(row => row.map(() => null));
            setBoard(newBoard);
            decrementMoves();
            setStartCell(null);
            setEndCell(null);
            return;
        }

        if (startCandy?.special === 'bomb' || endCandy?.special === 'bomb') {
            const bombCell = startCandy?.special === 'bomb' ? startCell : endCell;
            const otherCell = startCandy?.special === 'bomb' ? endCell : startCell;
            const colorToClear = board[otherCell.y][otherCell.x]?.color;

            if(colorToClear) {
                playSound('specialActivation');
                const newBoard = board.map(row => [...row]);
                for(let y=0; y < BOARD_HEIGHT; y++) {
                    for(let x=0; x < BOARD_WIDTH; x++) {
                        if(newBoard[y][x]?.color === colorToClear || (y === bombCell.y && x === bombCell.x)) {
                            newBoard[y][x] = null;
                        }
                    }
                }
                setBoard(newBoard);
                decrementMoves();
                setStartCell(null);
                setEndCell(null);
                return;
            }
        }

        const newBoard = board.map(row => [...row]);
        [newBoard[startY][startX], newBoard[endY][endX]] = [newBoard[endY][endX], newBoard[startY][startX]];

        const isStartValid = checkColumnForMatches(newBoard, startX, startY) || checkRowForMatches(newBoard, startX, startY);
        const isEndValid = checkColumnForMatches(newBoard, endX, endY) || checkRowForMatches(newBoard, endX, endY);

        if (isStartValid || isEndValid) {
            playSound('swapSuccess');
            setSwappingCandies([
                { from: startCell, to: endCell },
                { from: endCell, to: startCell }
            ]);

            setTimeout(() => {
                setBoard(newBoard);
                decrementMoves();
                setSwappingCandies(null);
            }, 300);
        } else {
            playSound('swapFail');
            setInvalidSwap([{...startCell}, {...endCell}]);
            setTimeout(() => setInvalidSwap(null), 300);
        }

        setStartCell(null);
        setEndCell(null);
    };

    const boardWidth = BOARD_WIDTH * TOTAL_PIECE_SIZE - GAP_SIZE;
    const boardHeight = BOARD_HEIGHT * TOTAL_PIECE_SIZE - GAP_SIZE;

    return (
        <div className="bg-pink-100/70 p-4 rounded-2xl shadow-2xl border-4 border-white relative">
             {comboMessage && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div 
                        key={comboMessage} /* Use key to re-trigger animation */
                        className="text-7xl font-display text-white animate-combo-popup" 
                        style={{textShadow: '0 0 10px rgba(233, 30, 99, 0.8), 0 0 20px rgba(233, 30, 99, 0.8), 3px 3px 0 #e91e63, 6px 6px 0 #ff9800'}}
                    >
                        {comboMessage}
                    </div>
                </div>
            )}
            <SpecialEffectsLayer effects={activeSpecialEffects} />
            <div 
                className="relative" 
                style={{ width: boardWidth, height: boardHeight }}
                onPointerUp={handlePointerUp}
                onPointerLeave={() => { if (!swappingCandies) { setStartCell(null); setEndCell(null); } }}
            >
                {board.flatMap((row, y) => 
                    row.map((candy, x) => {
                        if (!candy) return null;
                        
                        const isShaking = invalidSwap?.some(cell => cell.x === x && cell.y === y);

                        const swapInfo = swappingCandies?.find(s => s.from.x === x && s.from.y === y);
                        const visualX = swapInfo ? swapInfo.to.x : x;
                        const visualY = swapInfo ? swapInfo.to.y : y;

                        return (
                            <CandyPiece 
                                key={candy.id}
                                candy={candy}
                                x={visualX}
                                y={visualY}
                                isShaking={isShaking || false}
                                onPointerDown={() => handlePointerDown(x, y)}
                                onPointerEnter={() => handlePointerEnter(x, y)}
                            />
                        )
                    })
                )}
            </div>
             <style>{`
                @keyframes combo-popup {
                    0% { transform: scale(0.5) rotate(-15deg); opacity: 0; }
                    50% { transform: scale(1.1) rotate(5deg); opacity: 1; }
                    100% { transform: scale(1) translateY(-30px) rotate(0deg); opacity: 0; }
                }
                .animate-combo-popup {
                    animation: combo-popup 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>
        </div>
    );
};

export default GameBoard;
