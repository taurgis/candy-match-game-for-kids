import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from './components/GameBoard';
import Scoreboard from './components/Scoreboard';
import Leaderboard from './components/Leaderboard';
import Modal from './components/Modal';
import ProfileSelection from './components/ProfileSelection';
import MainMenu from './components/MainMenu';
import InstallPrompt from './components/InstallPrompt';
import { useGameLogic } from './hooks/useGameLogic';
import type { LeaderboardEntry, Profile } from './types';
import { initAudio, playSound, startMusic, setMusicMuted, setSoundsMuted } from './lib/audioManager';
import { getTargetScoreForLevel } from './constants';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

type GameView = 'profile_selection' | 'menu' | 'game' | 'leaderboard';

const Game: React.FC = () => {
  // Load initial data synchronously to ensure game state is available
  const [allProfiles, setAllProfiles] = useState<Profile[]>(() => {
    const savedProfiles = localStorage.getItem('sweetSwapProfiles');
    return savedProfiles ? JSON.parse(savedProfiles) : [];
  });
  
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(() => {
    return localStorage.getItem('sweetSwapLastProfileId');
  });
  
  const [view, setView] = useState<GameView>(() => {
    const lastProfileId = localStorage.getItem('sweetSwapLastProfileId');
    return lastProfileId ? 'menu' : 'profile_selection';
  });
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    const savedLeaderboard = localStorage.getItem('sweetSwapLeaderboard');
    return savedLeaderboard ? JSON.parse(savedLeaderboard) : [];
  });
  
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(() => localStorage.getItem('sweetSwapMusicMuted') === 'true');
  const [isSoundsMuted, setIsSoundsMuted] = useState(() => localStorage.getItem('sweetSwapSoundsMuted') === 'true');
  const { t } = useLanguage();

  const currentProfile = allProfiles.find(p => p.id === currentProfileId);

  const {
    board, score, level, movesLeft, isGameOver, chainReactionCount, activeSpecialEffects,
    setIsGameOver, levelUp, setBoard, decrementMoves, resetGame,
  } = useGameLogic(currentProfile?.gameState);

  // Save profiles to localStorage
  useEffect(() => {
    localStorage.setItem('sweetSwapProfiles', JSON.stringify(allProfiles));
  }, [allProfiles]);

  // Save leaderboard to localStorage
  useEffect(() => {
    localStorage.setItem('sweetSwapLeaderboard', JSON.stringify(leaderboard));
  }, [leaderboard]);
  
  // Save current game state to the active profile
  useEffect(() => {
    if (!currentProfileId || view !== 'game' || !board || board.length === 0) return;
    
    setAllProfiles(profiles => profiles.map(p => {
      if (p.id === currentProfileId) {
        return { ...p, gameState: { board, score, level, movesLeft } };
      }
      return p;
    }));
  }, [board, score, level, movesLeft, currentProfileId, view]);


  const saveToLeaderboard = useCallback(() => {
    if (score === 0 || !currentProfile) return;
    const newEntry: LeaderboardEntry = { name: `${currentProfile.avatar} ${currentProfile.name}`, score };
    setLeaderboard(prevLeaderboard => {
        const updatedLeaderboard = [...prevLeaderboard, newEntry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
        return updatedLeaderboard;
    });
  }, [score, currentProfile]);

  useEffect(() => {
    if (isGameOver) {
      saveToLeaderboard();
      playSound('gameOver');
    }
  }, [isGameOver, saveToLeaderboard]);
  
  const isLevelComplete = !isGameOver && movesLeft >= 0 && score >= getTargetScoreForLevel(level) && view === 'game';

  useEffect(() => {
      if (isLevelComplete) {
          playSound('levelUp');
      }
  }, [isLevelComplete]);

  // Start music when audio is ready and we are on a screen that should have music
  useEffect(() => {
    if (isAudioReady && view !== 'profile_selection') {
      if (!isMusicMuted) {
        startMusic();
      }
    }
  }, [isAudioReady, view, isMusicMuted]);

  // Set mute states when audio is ready or states change
  useEffect(() => {
    if (isAudioReady) {
      setMusicMuted(isMusicMuted);
      setSoundsMuted(isSoundsMuted);
    }
  }, [isAudioReady, isMusicMuted, isSoundsMuted]);
  
  const handleToggleMusicMute = () => {
    const newMutedState = !isMusicMuted;
    setIsMusicMuted(newMutedState);
    localStorage.setItem('sweetSwapMusicMuted', String(newMutedState));
    playSound('click');
  };

  const handleToggleSoundsMute = () => {
    const newMutedState = !isSoundsMuted;
    setIsSoundsMuted(newMutedState);
    localStorage.setItem('sweetSwapSoundsMuted', String(newMutedState));
    // Don't play a sound here since we're muting/unmuting sounds
  };

  const handleMenuClick = (action: () => void) => {
    if (!isAudioReady) {
      initAudio();
      setIsAudioReady(true);
    }
    playSound('click');
    action();
  };

  const handleSelectProfile = (profileId: string) => {
    setCurrentProfileId(profileId);
    localStorage.setItem('sweetSwapLastProfileId', profileId);
    if (!isAudioReady) {
      initAudio();
      setIsAudioReady(true);
    }
    setView('menu');
  };

  const handleSwitchProfile = () => {
    setCurrentProfileId(null);
    localStorage.removeItem('sweetSwapLastProfileId');
    setView('profile_selection');
  };

  const handleCreateProfile = (name: string, avatar: string) => {
    const newProfile: Profile = {
      id: Date.now().toString(),
      name: name,
      avatar: avatar,
      gameState: null,
    };
    const updatedProfiles = [...allProfiles, newProfile];
    setAllProfiles(updatedProfiles);
    handleSelectProfile(newProfile.id);
  };
  
  const handleDeleteProfile = (profileId: string) => {
    setAllProfiles(allProfiles.filter(p => p.id !== profileId));
    if (currentProfileId === profileId) {
        handleSwitchProfile();
    }
  };

  const startGame = () => {
    resetGame();
    setView('game');
  };
  
  const continueGame = () => {
    setView('game');
  };

  const handleNextLevel = () => {
    levelUp();
  };

  const backToMenu = useCallback(() => {
    saveToLeaderboard(); // Save score whenever returning to menu
    if (isGameOver) {
      // Clear game state for the profile after a loss
      setAllProfiles(profiles => profiles.map(p => 
        p.id === currentProfileId ? { ...p, gameState: null } : p
      ));
    }
    setView('menu');
  }, [saveToLeaderboard, isGameOver, currentProfileId]);
  
  const handleGameOverConfirmed = () => {
    handleMenuClick(backToMenu);
    setIsGameOver(false);
  }

  const renderView = () => {
    switch(view) {
      case 'profile_selection':
        return (
            <ProfileSelection 
                profiles={allProfiles}
                onSelectProfile={handleSelectProfile}
                onCreateProfile={handleCreateProfile}
                onDeleteProfile={handleDeleteProfile}
            />
        );
      case 'menu':
        if (currentProfile) {
            return (
                <MainMenu 
                    profile={currentProfile}
                    onContinueGame={() => handleMenuClick(continueGame)}
                    onStartGame={() => handleMenuClick(startGame)}
                    onShowLeaderboard={() => handleMenuClick(() => setView('leaderboard'))}
                    onSwitchProfile={() => handleMenuClick(handleSwitchProfile)}
                    isMusicMuted={isMusicMuted}
                    isSoundsMuted={isSoundsMuted}
                    onToggleMusicMute={handleToggleMusicMute}
                    onToggleSoundsMute={handleToggleSoundsMute}
                />
            );
        }
        // Fallback if profile is missing for some reason
        handleSwitchProfile();
        return null;

      case 'leaderboard':
        return <Leaderboard scores={leaderboard} onBack={() => handleMenuClick(() => setView('menu'))} />;
      
      case 'game':
        if (!currentProfile) {
            handleSwitchProfile();
            return null;
        }
        return (
          <div className="flex flex-col md:flex-row items-center justify-start md:justify-center gap-4 md:gap-4 p-1 md:p-4 min-h-screen w-full">
            <div className="flex-shrink-0 w-full md:w-auto flex justify-center">
              <GameBoard 
                  board={board} 
                  setBoard={setBoard} 
                  decrementMoves={decrementMoves} 
                  chainReactionCount={chainReactionCount}
                  activeSpecialEffects={activeSpecialEffects}
              />
            </div>
            <div className="flex-shrink-0 w-full md:w-auto flex justify-center">
              <Scoreboard 
                score={score} 
                level={level} 
                movesLeft={movesLeft} 
                onBackToMenu={() => handleMenuClick(backToMenu)}
                onSwitchProfile={() => handleMenuClick(handleSwitchProfile)}
                playerName={currentProfile.name}
                playerAvatar={currentProfile.avatar}
                isMusicMuted={isMusicMuted}
                isSoundsMuted={isSoundsMuted}
                onToggleMusicMute={handleToggleMusicMute}
                onToggleSoundsMute={handleToggleSoundsMute}
              />
            </div>
          </div>
        );
      default:
        handleSwitchProfile();
        return null;
    }
  };

  const containerClass = "min-h-screen bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 flex items-start md:items-center justify-center p-1 md:p-4 pb-safe";

  return (
    <div className={containerClass}>
      {renderView()}
      <InstallPrompt />
      {isGameOver && view === 'game' && (
        <Modal title={t('gameOverTitle')} onConfirm={handleGameOverConfirmed} confirmText={t('mainMenu')}>
          <p className="text-xl text-gray-700">{t('finalScore')} <span className="font-bold text-2xl text-pink-500">{score}</span>.</p>
        </Modal>
      )}
      {isLevelComplete && (
        <Modal 
          title={t('levelCompleteTitle', { level })}
          onConfirm={handleNextLevel} 
          confirmText={t('nextLevel', { level: level + 1 })}
          celebratory={true}
        >
           <p className="text-xl text-gray-700">{t('levelCompleteText')} <span className="font-bold text-2xl text-green-500">{score}</span>.</p>
        </Modal>
      )}
    </div>
  );
};


const App: React.FC = () => (
    <LanguageProvider>
        <Game />
    </LanguageProvider>
);

export default App;
