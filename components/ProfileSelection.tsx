import React, { useState } from 'react';
import type { Profile } from '../types';
import { AVATARS } from '../constants';
import { playSound } from '../lib/audioManager';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface ProfileSelectionProps {
    profiles: Profile[];
    onSelectProfile: (profileId: string) => void;
    onCreateProfile: (name: string, avatar: string) => void;
    onDeleteProfile: (profileId: string) => void;
}

const ProfileSelection: React.FC<ProfileSelectionProps> = ({ profiles, onSelectProfile, onCreateProfile, onDeleteProfile }) => {
    const [newProfileName, setNewProfileName] = useState("");
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
    const [deletingProfile, setDeletingProfile] = useState<Profile | null>(null);
    const [mathAnswer, setMathAnswer] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const { t } = useLanguage();

    const handleCreateClick = () => {
        if (newProfileName.trim() === "") return;
        playSound('click');
        onCreateProfile(newProfileName.trim(), selectedAvatar);
        setNewProfileName("");
    };

    const handleSelectClick = (profileId: string) => {
        playSound('click');
        onSelectProfile(profileId);
    };
    
    const handleConfirmDelete = () => {
        if (mathAnswer.trim() === '54') {
            if (!deletingProfile) return;
            playSound('click');
            onDeleteProfile(deletingProfile.id);
            setDeletingProfile(null);
            setMathAnswer('');
            setDeleteError('');
        } else {
            playSound('swapFail');
            setDeleteError(t('incorrectAnswer'));
            setMathAnswer('');
        }
    };

    return (
        <>
            <div className="w-full max-w-lg bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl flex flex-col gap-6 text-center">
                <div className="flex justify-between items-center">
                    <h1 className="text-6xl font-display text-pink-500">{t('choosePlayer')}</h1>
                    <LanguageSwitcher />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-64 overflow-y-auto p-2 bg-pink-100 rounded-lg">
                    {profiles.map(profile => (
                        <div key={profile.id} className="relative group">
                            <button onClick={() => handleSelectClick(profile.id)} className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-white rounded-xl shadow-md transform hover:scale-105 transition-transform duration-150 border-4 border-transparent hover:border-pink-400">
                                <span className="text-4xl">{profile.avatar}</span>
                                <span className="font-bold text-gray-700 truncate">{profile.name}</span>
                            </button>
                            <button onClick={() => setDeletingProfile(profile)} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                X
                            </button>
                        </div>
                    ))}
                </div>
                <div className="bg-white p-4 rounded-xl shadow-inner mt-4">
                    <h2 className="text-3xl font-display text-green-500 mb-4">{t('newPlayer')}</h2>
                    <div className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder={t('name')}
                            value={newProfileName}
                            onChange={e => setNewProfileName(e.target.value)}
                            className="w-full p-3 text-xl text-center rounded-full border-4 border-pink-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition"
                        />
                        <div>
                            <p className="text-center text-gray-600 mb-2 font-semibold">{t('chooseAvatar')}</p>
                            <div className="bg-pink-100 p-3 rounded-2xl flex items-center justify-center flex-wrap gap-2">
                                {AVATARS.map(avatar => (
                                    <button
                                        key={avatar}
                                        onClick={() => setSelectedAvatar(avatar)}
                                        className={`w-12 h-12 text-3xl rounded-full transition-transform transform hover:scale-110 flex items-center justify-center shadow-sm ${selectedAvatar === avatar ? 'bg-yellow-300 ring-4 ring-white' : 'bg-white'}`}
                                    >
                                        {avatar}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button onClick={handleCreateClick} className="mt-4 w-full text-2xl font-display bg-green-500 text-white py-3 px-8 rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition-transform duration-150 border-b-8 border-green-700 active:border-b-2">
                        {t('createProfile')}
                    </button>
                </div>
            </div>

            {deletingProfile && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform scale-100 animate-jump-in">
                        <h2 className="text-4xl font-display text-red-500 mb-4">{t('deleteProfileTitle')}</h2>
                        <div className="my-6 text-gray-700 text-lg">
                            <p>{t('deleteProfileConfirm')} <span className="font-bold">{deletingProfile.avatar} {deletingProfile.name}</span>?</p>
                            <p className="font-bold mt-2">{t('deleteProfileWarning')}</p>

                            <div className="mt-6 text-left">
                                <label htmlFor="math-check" className="font-bold text-gray-600">{t('parentalLock')}</label>
                                <p className="text-xl">{t('parentalLockQuestion')}</p>
                                <input
                                    id="math-check"
                                    type="number"
                                    value={mathAnswer}
                                    onChange={e => {
                                        setMathAnswer(e.target.value);
                                        if (deleteError) setDeleteError('');
                                    }}
                                    className="mt-2 w-full p-3 text-xl text-center rounded-full border-4 border-gray-300 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition"
                                />
                                {deleteError && <p className="text-red-500 text-center mt-2">{deleteError}</p>}
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    playSound('click');
                                    setDeletingProfile(null);
                                    setMathAnswer('');
                                    setDeleteError('');
                                }}
                                className="w-full text-2xl font-display bg-gray-400 text-white py-3 px-6 rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition-transform duration-150 border-b-8 border-gray-600 active:border-b-2"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="w-full text-2xl font-display bg-red-500 text-white py-3 px-6 rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition-transform duration-150 border-b-8 border-red-700 active:border-b-2"
                            >
                                {t('delete')}
                            </button>
                        </div>
                    </div>
                    <style>{`
                        @keyframes jump-in {
                            0% { transform: scale(0.5); opacity: 0; }
                            80% { transform: scale(1.05); opacity: 1; }
                            100% { transform: scale(1); opacity: 1; }
                        }
                        .animate-jump-in {
                            animation: jump-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                        }
                    `}</style>
                </div>
            )}
        </>
    );
};

export default ProfileSelection;
