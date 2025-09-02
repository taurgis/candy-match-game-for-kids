import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    const switchLang = (lang: 'nl' | 'en') => {
        setLanguage(lang);
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={() => switchLang('nl')}
                className={`w-10 h-10 text-2xl rounded-full transition-transform transform hover:scale-110 flex items-center justify-center shadow-sm ${language === 'nl' ? 'bg-yellow-300 ring-4 ring-white' : 'bg-white opacity-70'}`}
                aria-label="Schakel over naar Nederlands"
            >
                🇳🇱
            </button>
            <button
                onClick={() => switchLang('en')}
                className={`w-10 h-10 text-2xl rounded-full transition-transform transform hover:scale-110 flex items-center justify-center shadow-sm ${language === 'en' ? 'bg-yellow-300 ring-4 ring-white' : 'bg-white opacity-70'}`}
                aria-label="Switch to English"
            >
                🇬🇧
            </button>
        </div>
    );
};

export default LanguageSwitcher;
