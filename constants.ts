import type { Candy } from './types';

export const BOARD_WIDTH = 8;
export const BOARD_HEIGHT = 8;

export const CANDY_TYPES: Omit<Candy, 'id' | 'special'>[] = [
    { color: 'red' },
    { color: 'orange' },
    { color: 'yellow' },
    { color: 'green' },
    { color: 'blue' },
    { color: 'purple' },
];

export const CANDY_COLORS: { [key: string]: string } = {
    red: 'bg-red-500 border-red-700',
    orange: 'bg-orange-500 border-orange-700',
    yellow: 'bg-yellow-400 border-yellow-600',
    green: 'bg-green-500 border-green-700',
    blue: 'bg-blue-500 border-blue-700',
    purple: 'bg-purple-500 border-purple-700',
    bomb: 'bg-gray-800 border-gray-900',
    rainbow: 'bg-gradient-to-br from-red-400 via-yellow-300 to-blue-400 border-white',
};

export const MOVES_PER_LEVEL_BASE = 30;

export const AVATARS = ['🐶', '🐱', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐰', '🐸', '🐵', '🦄'];

/**
 * Calculates the target score for a given level.
 * The curve starts easy and ramps up to keep the game engaging.
 * Level 1: 500
 * Level 2: 1200
 * Level 3: 2100
 * @param level The current game level.
 * @returns The target score for that level.
 */
export const getTargetScoreForLevel = (level: number): number => {
    // This formula calculates the sum of an arithmetic progression.
    // The score for level L is the sum of increments for all levels up to L.
    // The increment for level `i` is (300 + i * 200).
    // The formula for the total score is: L*500 + 200 * (L-1)*L/2
    return level * 500 + 200 * (level - 1) * level / 2;
};
