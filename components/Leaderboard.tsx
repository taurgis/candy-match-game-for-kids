
import React from 'react';
import type { LeaderboardEntry } from '../types';
import { playSound } from '../lib/audioManager';
import { useLanguage } from '../context/LanguageContext';

interface LeaderboardProps {
    scores: LeaderboardEntry[];
    onBack: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ scores, onBack }) => {
    const medalColors = ['bg-yellow-400', 'bg-gray-300', 'bg-yellow-600'];
    const { t } = useLanguage();

    return (
        <div className="w-full max-w-md bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-2xl text-center">
            <h2 className="text-6xl font-display text-purple-600 mb-6">{t('leaderboardTitle')}</h2>
            <div className="space-y-2">
                {scores.length > 0 ? scores.map((entry, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg shadow ${index < 3 ? medalColors[index] : 'bg-white'}`}>
                        <div className="flex items-center">
                            <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white mr-4 ${index < 3 ? 'bg-white/30' : 'bg-gray-400'}`}>
                                {index + 1}
                            </span>
                            <p className="text-xl font-bold text-gray-800">{entry.name}</p>
                        </div>
                        <p className="text-xl font-black text-purple-700">{entry.score}</p>
                    </div>
                )) : <p className="text-gray-600 text-lg">{t('noScores')}</p>}
            </div>
            <button onClick={() => { playSound('click'); onBack(); }} className="mt-8 text-2xl font-display bg-pink-500 text-white py-3 px-8 rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition-transform duration-150 border-b-8 border-pink-700 active:border-b-2 flex items-center justify-center gap-3">
                <span>{t('backToMenu')}</span>
                <span role="img" aria-label="home" className="text-2xl">🏠</span>
            </button>
        </div>
    );
};

export default Leaderboard;
