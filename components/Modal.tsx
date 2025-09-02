import React from 'react';
import { playSound } from '../lib/audioManager';

interface ModalProps {
    title: string;
    children: React.ReactNode;
    onConfirm: () => void;
    confirmText: string;
    celebratory?: boolean;
}

const Modal: React.FC<ModalProps> = ({ title, children, onConfirm, confirmText, celebratory }) => {
    const confettiPieces = celebratory ? Array.from({ length: 70 }).map((_, i) => {
        const style = {
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 2 + 3}s`, // 3-5 seconds
            animationDelay: `${Math.random() * 3}s`,
            backgroundColor: ['#f44336', '#e91e63', '#9c27b0', '#ffeb3b', '#03a9f4', '#4caf50'][Math.floor(Math.random() * 6)],
            transform: `rotate(${Math.random() * 360}deg)`,
            width: `${Math.floor(Math.random() * 5) + 8}px`,
            height: `${Math.floor(Math.random() * 8) + 8}px`,
        };
        return <div key={i} className="confetti-piece" style={style}></div>;
    }) : null;
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            {celebratory && <div className="absolute inset-0 pointer-events-none overflow-hidden">{confettiPieces}</div>}
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform scale-100 animate-jump-in">
                <h2 className="text-5xl font-display text-yellow-500 mb-4">{title}</h2>
                <div className="my-6">
                    {children}
                </div>
                <button 
                    onClick={() => { playSound('click'); onConfirm(); }}
                    className="w-full text-3xl font-display bg-green-400 text-white py-3 px-8 rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition-transform duration-150 border-b-8 border-green-600 active:border-b-2"
                >
                    {confirmText}
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
                .confetti-piece {
                    position: absolute;
                    top: -20px;
                    opacity: 0.8;
                    border-radius: 25%;
                    animation: fall linear infinite;
                }
                @keyframes fall {
                    to {
                        transform: translateY(105vh) rotate(720deg);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default Modal;
