import React from 'react';
import { playSound } from '../lib/audioManager';
import { getTargetScoreForLevel } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface ScoreboardProps {
    score: number;
    level: number;
    movesLeft: number;
    onBackToMenu: () => void;
    onSwitchProfile: () => void;
    playerName: string;
    playerAvatar: string;
    isMuted: boolean;
    onToggleMute: () => void;
}

const StatBox: React.FC<{ title: string; value: string | number, color: string, icon?: string }> = ({ title, value, color, icon }) => (
    <div className={`w-full p-4 rounded-xl shadow-lg border-b-8 ${color}`}>
        <p className="text-xl font-bold text-white text-shadow-sm flex items-center justify-center gap-2">
            {icon && <span role="img" aria-hidden="true">{icon}</span>}
            {title}
        </p>
        <p className="text-5xl font-black text-white text-shadow-md">{value}</p>
    </div>
);


const Scoreboard: React.FC<ScoreboardProps> = ({ score, level, movesLeft, onBackToMenu, onSwitchProfile, playerName, playerAvatar, isMuted, onToggleMute }) => {
    const targetScore = getTargetScoreForLevel(level);
    const progress = Math.min((score / targetScore) * 100, 100);
    const { t } = useLanguage();

    return (
        <div className="w-full max-w-sm bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg flex flex-col gap-4 text-center font-display">
            <div className="flex items-center justify-center gap-4">
                <div className="text-5xl bg-white rounded-full p-2 shadow-inner">{playerAvatar}</div>
                <div>
                    <h2 className="text-3xl text-pink-500">{playerName}</h2>
                    <p className="text-2xl text-gray-600">{t('level')} {level}</p>
                </div>
            </div>
            
            <StatBox title={t('score')} value={score} color="bg-green-400 border-green-600" icon="⭐" />
            
            <div>
                <p className="text-xl font-bold text-gray-600">{t('goal')} {targetScore}</p>
                <div className="w-full bg-gray-200 rounded-full h-6 border-2 border-gray-300 mt-1">
                    <div 
                        className="bg-yellow-400 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <StatBox title={t('movesLeft')} value={movesLeft} color="bg-blue-400 border-blue-600" icon="✋" />
            
            <div className="flex justify-center items-center gap-4 my-2">
              <LanguageSwitcher />
              <button
                  onClick={onToggleMute}
                  className="w-10 h-10 text-2xl rounded-full transition-transform transform hover:scale-110 flex items-center justify-center shadow-sm bg-white"
                  aria-label={isMuted ? "Unmute music" : "Mute music"}
              >
                  {isMuted ? '🔇' : '🎵'}
              </button>
            </div>

             <button onClick={() => { playSound('click'); onSwitchProfile(); }} className="mt-4 text-2xl font-display bg-purple-400 text-white py-3 px-8 rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition-transform duration-150 border-b-8 border-purple-600 active:border-b-2 flex items-center justify-center gap-3">
                <span>{t('switchProfile')}</span>
            </button>
            <button onClick={() => { playSound('click'); onBackToMenu(); }} className="text-xl font-display bg-red-400 text-white py-2 px-6 rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition-transform duration-150 border-b-4 border-red-600 active:border-b-2 flex items-center justify-center gap-3">
                <span>{t('mainMenu')}</span>
                <span role="img" aria-label="home" className="text-xl">🏠</span>
            </button>
        </div>
    );
};

export default Scoreboard;
