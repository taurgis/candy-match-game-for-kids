import { useState, useEffect, useCallback } from 'react';
import { BOARD_WIDTH, BOARD_HEIGHT, CANDY_TYPES, MOVES_PER_LEVEL_BASE, getTargetScoreForLevel } from '../constants';
import type { Board, Candy, SpecialType, GameState } from '../types';
import { playSound } from '../lib/audioManager';

type Match = { x: number; y: number }[];

const findMatches = (board: Board): Match[] => {
    const allMatches: Match[] = [];
    const visited = new Set<string>();

    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (visited.has(`${y},${x}`) || !board[y][x]) continue;

            const candy = board[y][x]!;
            const color = candy.color;
            if (candy.special === 'bomb' || candy.special === 'rainbow') continue;

            // Horizontal check - build a potential match
            if (x < BOARD_WIDTH - 2) {
                const hMatch: Match = [{ y, x }];
                for (let i = x + 1; i < BOARD_WIDTH; i++) {
                    const nextCandy = board[y][i];
                    if (nextCandy && nextCandy.color === color) {
                        hMatch.push({ y, x: i });
                    } else {
                        break;
                    }
                }
                if (hMatch.length >= 3) {
                    allMatches.push(hMatch);
                    hMatch.forEach(c => visited.add(`${c.y},${c.x}`));
                }
            }
            
            // Vertical check - clear visited for vertical checks
            visited.clear();

            if (y < BOARD_HEIGHT - 2) {
                const vMatch: Match = [{ y, x }];
                for (let i = y + 1; i < BOARD_HEIGHT; i++) {
                    const nextCandy = board[i][x];
                    if (nextCandy && nextCandy.color === color) {
                        vMatch.push({ y: i, x });
                    } else {
                        break;
                    }
                }
                if (vMatch.length >= 3) {
                    allMatches.push(vMatch);
                     vMatch.forEach(c => visited.add(`${c.y},${c.x}`));
                }
            }
        }
    }
    // Filter out sub-matches included in larger matches to handle L and T shapes correctly
     const uniqueMatches = allMatches.filter((matchA, indexA) => {
        return !allMatches.some((matchB, indexB) => {
            if (indexA === indexB) return false;
            return matchA.every(coordA => matchB.some(coordB => coordA.x === coordB.x && coordA.y === coordB.y));
        });
    });

    return uniqueMatches;
};

const determineSpecialCandyToCreate = (
    matches: Match[], 
    board: Board, 
    level: number, 
    createCandy: (special?: SpecialType, color?: string) => Candy
): { y: number, x: number, candy: Candy } | null => {
    if (matches.length === 0) return null;

    let crossMatchCenter: {y: number, x: number} | null = null;
    let totalMatchedCandies = 0;

    const allMatchCoords = new Map<string, number>();
    matches.forEach(match => {
        match.forEach(coord => {
            const key = `${coord.y},${coord.x}`;
            if (!allMatchCoords.has(key)) {
                totalMatchedCandies++;
            }
            allMatchCoords.set(key, (allMatchCoords.get(key) || 0) + 1);
        });
    });

    for (const [key, count] of allMatchCoords.entries()) {
        if (count > 1) { 
            const [y, x] = key.split(',').map(Number);
            crossMatchCenter = { y, x };
            break;
        }
    }

    if (crossMatchCenter && totalMatchedCandies >= 5 && level >= 7) {
        const candyColor = board[crossMatchCenter.y]?.[crossMatchCenter.x]?.color;
        if (candyColor) {
            return { y: crossMatchCenter.y, x: crossMatchCenter.x, candy: createCandy('jelly', candyColor) };
        }
    }

    const primaryMatch = matches.reduce((longest, current) => current.length > longest.length ? current : longest, matches[0]);
    if (!primaryMatch) return null;

    const firstCoord = primaryMatch[0];
    const candyColor = board[firstCoord.y]?.[firstCoord.x]?.color;
    if (!candyColor) return null;
    
    if (primaryMatch.length >= 6 && level >= 12) {
        return { y: firstCoord.y, x: firstCoord.x, candy: createCandy('rainbow', 'rainbow') };
    }
    
    if (primaryMatch.length === 5 && level >= 10) {
        return { y: firstCoord.y, x: firstCoord.x, candy: createCandy('bomb', 'bomb') };
    }

    if (primaryMatch.length === 4 && level >= 5) {
        const isHorizontal = primaryMatch[0].y === primaryMatch[1].y;
        return { y: firstCoord.y, x: firstCoord.x, candy: createCandy(isHorizontal ? 'column' : 'row', candyColor) };
    }
    
    return null;
}

export const useGameLogic = (initialState?: GameState | null) => {
    const [board, setBoard] = useState<Board>(() => initialState?.board || []);
    const [score, setScore] = useState(() => initialState?.score || 0);
    const [level, setLevel] = useState(() => initialState?.level || 1);
    const [movesLeft, setMovesLeft] = useState(() => initialState?.movesLeft || MOVES_PER_LEVEL_BASE);
    const [isGameOver, setIsGameOver] = useState(false);
    const [chainReactionCount, setChainReactionCount] = useState(0);
    const [activeSpecialEffects, setActiveSpecialEffects] = useState<{type: 'row' | 'column', index: number}[]>([]);
    
    const createCandy = useCallback((special?: SpecialType, color?: string): Candy => {
        const randomCandyType = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)];
        return { 
            ...randomCandyType, 
            color: color || randomCandyType.color,
            id: Date.now() * Math.random(),
            special,
        };
    }, []);

    const createBoard = useCallback(() => {
        const newBoard: Board = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                // Prevent initial matches
                do {
                    newBoard[y][x] = createCandy();
                } while (
                    (x >= 2 && newBoard[y][x]?.color === newBoard[y][x - 1]?.color && newBoard[y][x]?.color === newBoard[y][x - 2]?.color) ||
                    (y >= 2 && newBoard[y][x]?.color === newBoard[y - 1][x]?.color && newBoard[y][x]?.color === newBoard[y - 2][x]?.color)
                );
            }
        }
        setBoard(newBoard);
    }, [createCandy]);

    useEffect(() => {
        // If there's no initial board (new game), create one.
        if (!initialState?.board || initialState.board.length === 0) {
            createBoard();
        }
    }, [initialState, createBoard]);
    

    useEffect(() => {
        const gameLoopTimer = setTimeout(() => {
            if (isGameOver) return;
            const matches = findMatches(board);
            const newBoard = board.map(row => [...row]);

            // --- 1. Process matches and special candies ---
            if (matches.length > 0) {
                const newChainCount = chainReactionCount + 1;
                setChainReactionCount(newChainCount);
                
                if (newChainCount > 1) {
                    playSound('chain');
                } else {
                    playSound('match');
                }
                
                const calculatePointsForMatch = (length: number): number => {
                    if (length === 3) return 30;
                    if (length === 4) return 60;
                    if (length === 5) return 100;
                    return length * 25;
                };

                let scoreFromInitialMatches = 0;
                const initialMatchCoords = new Set<string>();
                matches.forEach(match => {
                    scoreFromInitialMatches += calculatePointsForMatch(match.length);
                    match.forEach(c => initialMatchCoords.add(`${c.y},${c.x}`));
                });

                const coordsToClear = new Set<string>(initialMatchCoords);
                const effectsToTrigger: {type: 'row' | 'column', index: number}[] = [];
                const processedSpecials = new Set<string>();
                
                let chainReactionOccurred = true;
                let hadSpecialActivation = false;
                while(chainReactionOccurred) {
                    chainReactionOccurred = false;
                    const coordsToProcess = [...coordsToClear]; 
                    coordsToProcess.forEach(coord => {
                        if (processedSpecials.has(coord)) return;

                        const [y, x] = coord.split(',').map(Number);
                        const candy = board[y] && board[y][x];
                        if (candy?.special) {
                            hadSpecialActivation = true;
                            processedSpecials.add(coord);

                            if (candy.special === 'row') {
                                effectsToTrigger.push({ type: 'row', index: y });
                                for(let i = 0; i < BOARD_WIDTH; i++) if (!coordsToClear.has(`${y},${i}`)) { coordsToClear.add(`${y},${i}`); chainReactionOccurred = true; }
                            }
                            if (candy.special === 'column') {
                                effectsToTrigger.push({ type: 'column', index: x });
                                for(let i = 0; i < BOARD_HEIGHT; i++) if (!coordsToClear.has(`${i},${x}`)) { coordsToClear.add(`${i},${x}`); chainReactionOccurred = true; }
                            }
                            if (candy.special === 'jelly') {
                                const colorToClear = candy.color;
                                for (let r = 0; r < BOARD_HEIGHT; r++) {
                                    for (let c = 0; c < BOARD_WIDTH; c++) {
                                        if (board[r][c]?.color === colorToClear && !coordsToClear.has(`${r},${c}`)) {
                                            coordsToClear.add(`${r},${c}`);
                                            chainReactionOccurred = true;
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
                
                if (hadSpecialActivation) {
                    playSound('specialActivation');
                }
                
                if (effectsToTrigger.length > 0) {
                    setActiveSpecialEffects(effectsToTrigger);
                }

                const newSpecialCandy = determineSpecialCandyToCreate(matches, board, level, createCandy);
                
                const chainReactionCandiesCount = coordsToClear.size - initialMatchCoords.size;
                const scoreFromSpecials = chainReactionCandiesCount * 10;
                const comboBonus = newChainCount > 1 ? (newChainCount - 1) * 50 : 0;
                setScore(s => s + scoreFromInitialMatches + scoreFromSpecials + comboBonus);
                
                coordsToClear.forEach(coord => {
                    const [y, x] = coord.split(',').map(Number);
                    if(newBoard[y]) newBoard[y][x] = null;
                });
                
                if (newSpecialCandy) {
                    const specialCoordKey = `${newSpecialCandy.y},${newSpecialCandy.x}`;
                    if (coordsToClear.has(specialCoordKey)) {
                        newBoard[newSpecialCandy.y][newSpecialCandy.x] = newSpecialCandy.candy;
                    }
                }

                setBoard(newBoard);
                return;
            }

            // No matches found, clear any lingering effects from the previous turn
            setActiveSpecialEffects([]);

            // --- 2. Apply gravity if no matches were found and board is unsettled ---
            let boardChangedByGravity = false;
            for (let x = 0; x < BOARD_WIDTH; x++) {
                let hasGap = false;
                for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
                    if (newBoard[y][x] === null) {
                        hasGap = true;
                    } else if (hasGap) {
                        boardChangedByGravity = true;
                        break;
                    }
                }
                if (boardChangedByGravity) break;
            }
            
            if (boardChangedByGravity) {
                for (let x = 0; x < BOARD_WIDTH; x++) {
                    const existingCandies = [];
                    for(let y = 0; y < BOARD_HEIGHT; y++) {
                        if(newBoard[y][x]) {
                            existingCandies.push(newBoard[y][x]);
                        }
                    }
                    const newColumn = Array(BOARD_HEIGHT - existingCandies.length).fill(null).concat(existingCandies);
                    for (let y = 0; y < BOARD_HEIGHT; y++) {
                        newBoard[y][x] = newColumn[y];
                    }
                }
                setBoard(newBoard);
                return;
            }

            // --- 3. Fill empty cells if board is stable ---
            let cellsFilled = false;
            for (let y = 0; y < BOARD_HEIGHT; y++) {
                for (let x = 0; x < BOARD_WIDTH; x++) {
                    if (newBoard[y][x] === null) {
                        cellsFilled = true;
                        newBoard[y][x] = createCandy();
                    }
                }
            }
            
            if (cellsFilled) {
                setBoard(newBoard);
            }

        }, 150);

        return () => clearTimeout(gameLoopTimer);
    }, [board, createCandy, level, isGameOver, chainReactionCount]);


    useEffect(() => {
      if (movesLeft <= 0 && score < getTargetScoreForLevel(level)) {
        setIsGameOver(true);
      }
    }, [movesLeft, score, level]);

    const levelUp = () => {
        const newLevel = level + 1;
        setLevel(newLevel);
        setScore(score); // Carry over score, but could reset if desired
        setMovesLeft(Math.max(10, MOVES_PER_LEVEL_BASE - (newLevel - 1)));
        setIsGameOver(false);
        createBoard();
    };
    
    const resetGame = useCallback(() => {
        setScore(0);
        setLevel(1);
        setMovesLeft(MOVES_PER_LEVEL_BASE);
        setIsGameOver(false);
        createBoard();
    }, [createBoard]);
    
    const decrementMoves = () => {
        setMovesLeft(m => m - 1);
        setChainReactionCount(0); // Reset for a new player move.
    };

    return {
        board,
        setBoard,
        score,
        level,
        movesLeft,
        isGameOver,
        setIsGameOver,
        levelUp,
        resetGame,
        decrementMoves,
        chainReactionCount,
        activeSpecialEffects,
    };
};