import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CANDY_COLORS } from '../constants';
import type { SpecialType } from '../types';

interface InstructionsModalProps {
    onClose: () => void;
}

// A simplified, non-interactive candy for display purposes
const InstructionCandy: React.FC<{ color: string; special?: SpecialType }> = ({ color, special }) => {
    const visualColor = special === 'bomb' ? 'bomb' : special === 'rainbow' ? 'rainbow' : color;
    const colorClass = CANDY_COLORS[visualColor];
    const isSpecial = !!special;

    return (
        <div className={`relative w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg shadow-inner border-b-4 ${colorClass}`}>
            {isSpecial && <div className="absolute inset-0.5 bg-white/20 rounded-md animate-pulse" />}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
                {special === 'row' && <div className="absolute w-full h-2 bg-white/60 rounded-full" />}
                {special === 'column' && <div className="absolute w-2 h-full bg-white/60 rounded-full" />}
                {special === 'jelly' && <div className="absolute inset-1.5 rounded-full bg-white/50 border-2 border-white/80" />}
                {special === 'rainbow' && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 via-yellow-300 to-blue-400" />}
                {special === 'bomb' && <div className="w-6 h-6 rounded-full bg-gray-900" />}
            </div>
        </div>
    );
};

const InstructionRow: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-white/50 rounded-lg">
        <div className="flex items-center justify-center gap-1 md:w-1/3">
            {children}
        </div>
        <div className="text-center md:text-left md:w-2/3">
            <h4 className="text-xl font-bold font-display text-pink-600">{title}</h4>
            <p className="text-gray-700">{description}</p>
        </div>
    </div>
);

const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
    const { t } = useLanguage();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-pink-100 to-purple-200 rounded-2xl shadow-2xl p-4 md:p-6 max-w-2xl w-full text-center transform scale-100 animate-jump-in relative border-4 border-white">
                <h2 className="text-4xl md:text-6xl font-display text-purple-600 mb-4">{t('howToPlay')}</h2>
                
                <div className="max-h-[70vh] overflow-y-auto space-y-4 p-2 custom-scrollbar">
                    <InstructionRow title={t('instructionsGoalTitle')} description={t('instructionsGoalText')}>
                        <InstructionCandy color="red" />
                        <span className="text-3xl font-bold text-gray-600 mx-2">→</span>
                        <div className="font-display text-4xl text-green-500">⭐</div>
                    </InstructionRow>

                    <InstructionRow title={t('instructionsSwapTitle')} description={t('instructionsSwapText')}>
                        <InstructionCandy color="blue" />
                        <span className="text-3xl font-bold text-gray-600 mx-2">↔️</span>
                        <InstructionCandy color="green" />
                    </InstructionRow>
                    
                     <InstructionRow title={t('instructionsMatch4Title')} description={t('instructionsMatch4Text')}>
                        <InstructionCandy color="yellow" />
                        <InstructionCandy color="yellow" />
                        <InstructionCandy color="yellow" />
                        <InstructionCandy color="yellow" />
                        <span className="text-3xl font-bold text-gray-600 mx-2">=</span>
                        <InstructionCandy color="yellow" special="row" />
                    </InstructionRow>

                    <InstructionRow title={t('instructionsMatch5Title')} description={t('instructionsMatch5Text')}>
                        <div className="flex flex-wrap justify-center gap-1">
                            <InstructionCandy color="purple" />
                            <InstructionCandy color="purple" />
                            <InstructionCandy color="purple" />
                            <InstructionCandy color="purple" />
                            <InstructionCandy color="purple" />
                        </div>
                         <span className="text-3xl font-bold text-gray-600 mx-2">=</span>
                        <InstructionCandy color="any" special="bomb" />
                    </InstructionRow>
                    
                    <InstructionRow title={t('instructionsMatchLTTitle')} description={t('instructionsMatchLTText')}>
                         <div className="grid grid-cols-3 grid-rows-3 w-40 h-40">
                             <div className="col-start-2"><InstructionCandy color="orange" /></div>
                             <div className="col-start-2"><InstructionCandy color="orange" /></div>
                             <div className="col-start-1 row-start-3 flex gap-1">
                                <InstructionCandy color="orange" />
                                <InstructionCandy color="orange" />
                                <InstructionCandy color="orange" />
                             </div>
                         </div>
                         <span className="text-3xl font-bold text-gray-600 mx-2">=</span>
                        <InstructionCandy color="orange" special="jelly" />
                    </InstructionRow>

                     <InstructionRow title={t('instructionsMatch6Title')} description={t('instructionsMatch6Text')}>
                        <div className="flex flex-wrap justify-center gap-1">
                            <InstructionCandy color="red" />
                            <InstructionCandy color="red" />
                            <InstructionCandy color="red" />
                            <InstructionCandy color="red" />
                            <InstructionCandy color="red" />
                            <InstructionCandy color="red" />
                        </div>
                         <span className="text-3xl font-bold text-gray-600 mx-2">=</span>
                        <InstructionCandy color="any" special="rainbow" />
                    </InstructionRow>
                </div>

                <button 
                    onClick={onClose}
                    className="mt-4 w-full md:w-auto text-2xl font-display bg-pink-500 text-white py-3 px-12 rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition-transform duration-150 border-b-8 border-pink-700 active:border-b-2"
                >
                    {t('close')}
                </button>
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
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.4);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #ec4899; /* pink-500 */
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d946ef; /* fuchsia-500 */
                }
            `}</style>
        </div>
    );
};

export default InstructionsModal;
