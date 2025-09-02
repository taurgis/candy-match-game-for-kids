import React, { useState } from 'react';
import type { Profile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import InstructionsModal from './InstructionsModal';

interface MainMenuProps {
    profile: Profile;
    onContinueGame: () => void;
    onStartGame: () => void;
    onShowLeaderboard: () => void;
    onSwitchProfile: () => void;
    isMusicMuted: boolean;
    isSoundsMuted: boolean;
    onToggleMusicMute: () => void;
    onToggleSoundsMute: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ profile, onContinueGame, onStartGame, onShowLeaderboard, onSwitchProfile, isMusicMuted, isSoundsMuted, onToggleMusicMute, onToggleSoundsMute }) => {
    const [showInstructions, setShowInstructions] = useState(false);
    const savedGameExists = !!profile?.gameState;
    const { t } = useLanguage();

    return (
        <>
            {showInstructions && <InstructionsModal onClose={() => setShowInstructions(false)} />}
            <div className="relative w-full h-full flex flex-col items-center justify-center text-center overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-red-400 rounded-full animate-float opacity-70 blur-sm"></div>
                <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-yellow-300 rounded-xl transform rotate-45 animate-float-delay-1 opacity-70 blur-sm"></div>
                <div className="absolute bottom-1/4 left-1/3 w-10 h-10 bg-blue-400 rounded-full animate-float-delay-2 opacity-70 blur-sm"></div>
                <div className="absolute bottom-1/3 right-1/3 w-14 h-14 bg-green-400 rounded-2xl animate-float-delay-1 opacity-70 blur-sm"></div>

                <div className="flex flex-col items-center z-10">
                    <h1 className="text-5xl sm:text-7xl md:text-9xl font-display text-white" style={{textShadow: '3px 3px 0 #e91e63, 6px 6px 0 #ff9800'}}>{t('gameTitle1')}</h1>
                    <h2 className="text-3xl sm:text-5xl md:text-7xl font-display text-yellow-300 -mt-4 mb-8" style={{textShadow: '2px 2px 0 #e91e63'}}>{t('gameTitle2')}</h2>
                    
                    <div className="flex items-center gap-4 md:gap-8">
                        <div className="hidden md:block animate-bounce-slow text-6xl md:text-8xl">{profile.avatar}</div>
                        <div className="bg-white/80 backdrop-blur-md p-4 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-3 md:gap-4 border-4 md:border-8 border-white transform -rotate-2">
                            <h3 className="text-xl md:text-3xl font-bold text-pink-500">{t('welcome')} {profile.name}!</h3>
                            {savedGameExists ? (
                                <>
                                    <button onClick={onContinueGame} className="w-full text-xl md:text-3xl font-display bg-purple-500 text-white py-3 md:py-4 px-6 md:px-8 rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition-transform duration-150 border-b-4 md:border-b-8 border-purple-700 active:border-b-2 flex items-center justify-center gap-2 md:gap-3 animate-pulse-slow">
                                        <span>{t('continueGame')}</span> <span role="img" aria-label="play" className="text-lg md:text-2xl">▶️</span>
                                    </button>
                                    <button onClick={onStartGame} className="w-full text-lg md:text-2xl font-display bg-green-400 text-white py-2 md:py-3 px-6 md:px-8 rounded-full shadow-md transform hover:scale-105 active:scale-95 transition-transform duration-150 border-b-2 md:border-b-4 border-green-600 active:border-b-2 flex items-center justify-center gap-2 md:gap-3">
                                        <span>{t('newGame')}</span> <span role="img" aria-label="play" className="text-base md:text-xl">▶️</span>
                                    </button>
                                </>
                            ) : (
                            <button onClick={onStartGame} className="w-full text-xl md:text-3xl font-display bg-green-500 text-white py-3 md:py-4 px-6 md:px-8 rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition-transform duration-150 border-b-4 md:border-b-8 border-green-700 active:border-b-2 flex items-center justify-center gap-2 md:gap-3">
                                <span>{t('playGame')}</span> <span role="img" aria-label="play" className="text-lg md:text-2xl">▶️</span>
                            </button>
                            )}
                            <button onClick={onShowLeaderboard} className="w-full text-lg md:text-2xl font-display bg-blue-400 text-white py-2 md:py-3 px-6 md:px-8 rounded-full shadow-md transform hover:scale-105 active:scale-95 transition-transform duration-150 border-b-2 md:border-b-4 border-blue-600 active:border-b-2 flex items-center justify-center gap-2 md:gap-3">
                                <span>{t('leaderboard')}</span> <span role="img" aria-label="trophy" className="text-base md:text-xl">🏆</span>
                            </button>
                            <button onClick={() => setShowInstructions(true)} className="w-full text-lg md:text-2xl font-display bg-yellow-400 text-white py-2 md:py-3 px-6 md:px-8 rounded-full shadow-md transform hover:scale-105 active:scale-95 transition-transform duration-150 border-b-2 md:border-b-4 border-yellow-600 active:border-b-2 flex items-center justify-center gap-2 md:gap-3">
                                <span>{t('howToPlay')}</span> <span role="img" aria-label="question mark" className="text-base md:text-xl">❓</span>
                            </button>
                             <button onClick={onSwitchProfile} className="w-full text-base md:text-xl font-display bg-gray-400 text-white py-1 md:py-2 px-4 md:px-6 rounded-full shadow-md transform hover:scale-105 active:scale-95 transition-transform duration-150 border-b-2 md:border-b-4 border-gray-600 active:border-b-2">
                                {t('switchProfile')}
                            </button>
                            <div className="flex justify-center items-center gap-2 md:gap-4 mt-1 md:mt-2">
                              <LanguageSwitcher />
                              <button
                                  onClick={onToggleMusicMute}
                                  className="w-8 h-8 md:w-10 md:h-10 text-lg md:text-2xl rounded-full transition-transform transform hover:scale-110 flex items-center justify-center shadow-sm bg-white"
                                  aria-label={isMusicMuted ? "Unmute music" : "Mute music"}
                              >
                                  {isMusicMuted ? '🔇' : '🎵'}
                              </button>
                              <button
                                  onClick={onToggleSoundsMute}
                                  className="w-8 h-8 md:w-10 md:h-10 text-lg md:text-2xl rounded-full transition-transform transform hover:scale-110 flex items-center justify-center shadow-sm bg-white"
                                  aria-label={isSoundsMuted ? "Unmute sounds" : "Mute sounds"}
                              >
                                  {isSoundsMuted ? '🔇' : '🔊'}
                              </button>
                            </div>
                        </div>
                    </div>
                </div>
                <style>{`@keyframes float{0%{transform:translateY(0px) rotate(0deg)}50%{transform:translateY(-20px) rotate(10deg)}100%{transform:translateY(0px) rotate(0deg)}}.animate-float{animation:float 6s ease-in-out infinite}.animate-float-delay-1{animation:float 7s ease-in-out infinite;animation-delay:1.5s}.animate-float-delay-2{animation:float 5s ease-in-out infinite;animation-delay:.5s}@keyframes bounce-slow{0%,100%{transform:translateY(-5%);animation-timing-function:cubic-bezier(.8,0,1,1)}50%{transform:translateY(0);animation-timing-function:cubic-bezier(0,0,.2,1)}}.animate-bounce-slow{animation:bounce-slow 2s infinite}@keyframes pulse-slow{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.95;transform:scale(1.03)}}.animate-pulse-slow{animation:pulse-slow 2.5s infinite}`}</style>
            </div>
        </>
    );
};

export default MainMenu;