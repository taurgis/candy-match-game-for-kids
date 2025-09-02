import React from 'react';
import { render, screen, act, cleanup, fireEvent } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';

// Import test runner globals to resolve TypeScript errors for 'describe', 'it', and 'afterEach'.
import { describe, it, afterEach } from '@jest/globals';

// --- Components and Hooks to test ---
import { useGameLogic } from './hooks/useGameLogic.ts';
import Scoreboard from './components/Scoreboard.tsx';
import Leaderboard from './components/Leaderboard.tsx';
import MainMenu from './components/MainMenu.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import type { Board, Candy, Profile } from './types';
import { MOVES_PER_LEVEL_BASE, getTargetScoreForLevel } from './constants.ts';

// A helper function to find matches, simplified from the main hook
const hasInitialMatches = (board: Board): boolean => {
    if (!board || board.length === 0) return false;
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[0].length; x++) {
            const color = board[y][x]?.color;
            if (!color) continue;
            // Check horizontal
            if (x < board[0].length - 2 && board[y][x+1]?.color === color && board[y][x+2]?.color === color) {
                return true;
            }
            // Check vertical
            if (y < board.length - 2 && board[y+1][x]?.color === color && board[y+2][x]?.color === color) {
                return true;
            }
        }
    }
    return false;
};

// --- Test Suites ---

describe('Sweet Swap Saga Tests', () => {

    // Cleanup after each test
    afterEach(() => {
        cleanup();
        sinon.restore();
    });

    // --- useGameLogic Hook Tests ---
    describe('useGameLogic Hook', () => {
        it('should create a new board with no initial matches', () => {
            let hookResult: any;
            const TestComponent = () => {
                hookResult = useGameLogic(null);
                return null;
            };

            render(<TestComponent />);
            
            act(() => {
                hookResult.resetGame();
            });

            expect(hookResult.board).to.not.be.empty;
            expect(hookResult.board.length).to.equal(8);
            expect(hasInitialMatches(hookResult.board)).to.be.false;
        });

        it('should update score and board after a valid match', (done) => {
            let hookResult: any;
            const TestComponent = () => {
                hookResult = useGameLogic(null);
                return null;
            };
            render(<TestComponent />);

            act(() => {
                hookResult.resetGame();
            });

            // Wait for initial board creation
            setTimeout(() => {
                // Manually set up a board that has a valid swap leading to a match
                const boardWithPotentialMatch: Board = hookResult.board.map((row: (Candy|null)[]) => row.map((c: Candy | null) => (c ? {...c} : null)));
                
                // Set up a guaranteed match after a swap
                // Let's swap (0,2) and (1,2) to create a horizontal match of 'red'
                const candy1 = { id: 1, color: 'red' };
                const candy2 = { id: 2, color: 'red' };
                const candyToSwap1 = { id: 3, color: 'blue' }; // at (0,2)
                const candyToSwap2 = { id: 4, color: 'red' };  // at (1,2)
                
                boardWithPotentialMatch[0][0] = candy1;
                boardWithPotentialMatch[0][1] = candy2;
                boardWithPotentialMatch[0][2] = candyToSwap1;
                boardWithPotentialMatch[1][2] = candyToSwap2;

                act(() => {
                    hookResult.setBoard(boardWithPotentialMatch);
                    hookResult.setScore(0); // Reset score for a clean test
                });

                // Now simulate the swap that creates the match
                const boardAfterSwap = boardWithPotentialMatch.map((row: (Candy | null)[]) => row.map(c => c ? {...c} : null));
                [boardAfterSwap[0][2], boardAfterSwap[1][2]] = [boardAfterSwap[1][2], boardAfterSwap[0][2]];

                act(() => {
                    hookResult.setBoard(boardAfterSwap);
                    hookResult.decrementMoves();
                });

                // Wait for the game loop (150ms) + buffer
                setTimeout(() => {
                    try {
                        expect(hookResult.score).to.be.greaterThan(0);
                        expect(hookResult.movesLeft).to.equal(MOVES_PER_LEVEL_BASE - 1);
                        
                        // Check that the matched candies are now null
                        expect(hookResult.board[0][0]).to.be.null;
                        expect(hookResult.board[0][1]).to.be.null;
                        // The swapped candy that made the match is also gone
                        expect(hookResult.board[0][2]).to.be.null; 

                        done(); // Mocha's async test complete callback
                    } catch (e) {
                        done(e); // Pass error to Mocha
                    }
                }, 250);
            }, 50); // initial wait for resetGame
        });

        it('should enter game over state when moves run out', () => {
            let hookResult: any;
            const TestComponent = () => {
                hookResult = useGameLogic(null);
                return null;
            };
            render(<TestComponent />);

            act(() => {
                hookResult.resetGame();
                hookResult.setMovesLeft(1);
                hookResult.setScore(0);
            });
            
            act(() => {
                hookResult.decrementMoves();
            });

            expect(hookResult.isGameOver).to.be.true;
        });

        it('should level up correctly', () => {
            let hookResult: any;
            const TestComponent = () => {
                hookResult = useGameLogic(null);
                return null;
            };
            render(<TestComponent />);

            act(() => {
                hookResult.resetGame(); // Starts at level 1
            });
            
            act(() => {
                hookResult.levelUp();
            });
            
            expect(hookResult.level).to.equal(2);
            expect(hookResult.movesLeft).to.equal(MOVES_PER_LEVEL_BASE - 1); // 30 - (2 - 1)
            expect(hookResult.board).to.not.be.empty;
            expect(hasInitialMatches(hookResult.board)).to.be.false;
        });

        it('should create a special striped candy from a 4-match', (done) => {
            let hookResult: any;
            const TestComponent = () => {
                hookResult = useGameLogic(null);
                return null;
            };
            render(<TestComponent />);

            act(() => {
                hookResult.resetGame();
            });

            setTimeout(() => {
                const boardWithPotentialMatch: Board = hookResult.board.map((row: (Candy|null)[]) => row.map((c: Candy|null) => (c ? {...c} : null)));
                
                const redCandy = (id: number) => ({ id, color: 'red' });
                boardWithPotentialMatch[0][0] = redCandy(1);
                boardWithPotentialMatch[0][1] = redCandy(2);
                boardWithPotentialMatch[0][2] = redCandy(3);
                boardWithPotentialMatch[0][3] = { id: 4, color: 'blue' }; 
                boardWithPotentialMatch[1][3] = redCandy(5);
                
                act(() => {
                    hookResult.setLevel(5); 
                    hookResult.setBoard(boardWithPotentialMatch);
                });

                const boardAfterSwap = boardWithPotentialMatch.map(row => row.map(c => (c ? {...c} : null)));
                [boardAfterSwap[0][3], boardAfterSwap[1][3]] = [boardAfterSwap[1][3], boardAfterSwap[0][3]];

                act(() => {
                    hookResult.setBoard(boardAfterSwap);
                });

                setTimeout(() => {
                    try {
                        const boardState = hookResult.board;
                        // The special candy replaces one of the matched candies. In this case, logic places it at [0,0].
                        // The other 3 matched candies ([0,1], [0,2], [0,3] after swap) should be null.
                        const newCandy = boardState[0][0];

                        expect(newCandy).to.not.be.null;
                        expect(newCandy.special).to.be.oneOf(['row', 'column']);

                        done();
                    } catch (e) {
                        done(e);
                    }
                }, 500); // Allow time for match, clear, and gravity
            }, 50);
        });

    });

    // --- Scoreboard Component Tests ---
    describe('Scoreboard Component', () => {
        it('should render all stats correctly', () => {
            const mockProps = {
                score: 1234,
                level: 5,
                movesLeft: 22,
                playerName: 'Tester',
                playerAvatar: '🧪',
                onBackToMenu: () => {},
                onSwitchProfile: () => {},
                isMuted: false,
                onToggleMute: () => {},
            };

            render(
                <LanguageProvider>
                    <Scoreboard {...mockProps} />
                </LanguageProvider>
            );

            expect(screen.getByText('Tester')).to.exist;
            expect(screen.getByText('1234')).to.exist;
            expect(screen.getByText(/Level 5|Level 5/i)).to.exist; 
            expect(screen.getByText('22')).to.exist;
            expect(screen.getByText('🧪')).to.exist;
        });
    });

    // --- Leaderboard Component Tests ---
    describe('Leaderboard Component', () => {
        it('should display a message when there are no scores', () => {
            render(
                <LanguageProvider>
                    <Leaderboard scores={[]} onBack={() => {}} />
                </LanguageProvider>
            );
            expect(screen.getByText(/no scores yet/i)).to.exist;
        });

        it('should render a list of scores', () => {
            const scores = [
                { name: '🦄 Alice', score: 5000 },
                { name: '🤖 Bob', score: 3000 },
            ];
            render(
                <LanguageProvider>
                    <Leaderboard scores={scores} onBack={() => {}} />
                </LanguageProvider>
            );
            expect(screen.getByText('🦄 Alice')).to.exist;
            expect(screen.getByText('5000')).to.exist;
            expect(screen.getByText('🤖 Bob')).to.exist;
            expect(screen.getByText('3000')).to.exist;
        });
    });

    // --- MainMenu Component Tests ---
    describe('MainMenu Component', () => {
        const mockProfile: Profile = { id: '1', name: 'Tester', avatar: '🧪', gameState: null };
        const noOp = () => {};
        
        it('shows "Play Game" button when there is no saved game', () => {
            render(
                <LanguageProvider>
                    <MainMenu profile={mockProfile} onStartGame={noOp} onContinueGame={noOp} onShowLeaderboard={noOp} onSwitchProfile={noOp} isMuted={false} onToggleMute={noOp} />
                </LanguageProvider>
            );
            expect(screen.getByText(/play game/i)).to.exist;
            expect(screen.queryByText(/continue/i)).to.be.null;
        });

        it('shows "Continue" and "New Game" buttons when there is a saved game', () => {
            const profileWithSave: Profile = { ...mockProfile, gameState: { board: [[]], score: 100, level: 1, movesLeft: 20 } };
            render(
                <LanguageProvider>
                    <MainMenu profile={profileWithSave} onStartGame={noOp} onContinueGame={noOp} onShowLeaderboard={noOp} onSwitchProfile={noOp} isMuted={false} onToggleMute={noOp} />
                </LanguageProvider>
            );
            expect(screen.getByText(/continue/i)).to.exist;
            expect(screen.getByText(/new game/i)).to.exist;
        });
        
        it('calls onStartGame when "New Game" is clicked', () => {
            const onStartGameSpy = sinon.spy();
            const profileWithSave: Profile = { ...mockProfile, gameState: { board: [[]], score: 100, level: 1, movesLeft: 20 } };

            render(
                <LanguageProvider>
                    <MainMenu profile={profileWithSave} onStartGame={onStartGameSpy} onContinueGame={noOp} onShowLeaderboard={noOp} onSwitchProfile={noOp} isMuted={false} onToggleMute={noOp} />
                </LanguageProvider>
            );
            fireEvent.click(screen.getByText(/new game/i));
            expect(onStartGameSpy.calledOnce).to.be.true;
        });
        
        it('calls onContinueGame when "Continue" is clicked', () => {
            const onContinueGameSpy = sinon.spy();
            const profileWithSave: Profile = { ...mockProfile, gameState: { board: [[]], score: 100, level: 1, movesLeft: 20 } };

            render(
                <LanguageProvider>
                    <MainMenu profile={profileWithSave} onStartGame={noOp} onContinueGame={onContinueGameSpy} onShowLeaderboard={noOp} onSwitchProfile={noOp} isMuted={false} onToggleMute={noOp} />
                </LanguageProvider>
            );
            fireEvent.click(screen.getByText(/continue/i));
            expect(onContinueGameSpy.calledOnce).to.be.true;
        });
    });
});
