import React, { useState, useEffect } from 'react';

const PIECE_SIZE = 56;
const GAP_SIZE = 4;
const TOTAL_PIECE_SIZE = PIECE_SIZE + GAP_SIZE;

interface SpecialEffect {
    type: 'row' | 'column';
    index: number;
    id: string;
}

interface SpecialEffectsLayerProps {
    effects: { type: 'row' | 'column'; index: number }[];
}

const SpecialEffectsLayer: React.FC<SpecialEffectsLayerProps> = ({ effects }) => {
    const [activeEffects, setActiveEffects] = useState<SpecialEffect[]>([]);

    useEffect(() => {
        if (effects.length > 0) {
            const newEffects = effects.map(e => ({ ...e, id: `${e.type}-${e.index}-${Math.random()}` }));
            setActiveEffects(prev => [...prev, ...newEffects]);

            const timer = setTimeout(() => {
                setActiveEffects(currentEffects => currentEffects.filter(ae => !newEffects.some(ne => ne.id === ae.id)));
            }, 500); // Animation duration

            return () => clearTimeout(timer);
        }
    }, [effects]);

    return (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            {activeEffects.map(({ type, index, id }) => {
                if (type === 'row') {
                    const style: React.CSSProperties = {
                        top: index * TOTAL_PIECE_SIZE + PIECE_SIZE / 2 - 8, // 8 is half of height 16px (h-4)
                        left: -PIECE_SIZE,
                        right: -PIECE_SIZE,
                        height: '16px',
                    };
                    return (
                        <div
                            key={id}
                            className="absolute bg-white/80 rounded-full animate-zap-horizontal shadow-lg"
                            style={style}
                        />
                    );
                }
                if (type === 'column') {
                     const style: React.CSSProperties = {
                        left: index * TOTAL_PIECE_SIZE + PIECE_SIZE / 2 - 8, // 8 is half of width 16px (w-4)
                        top: -PIECE_SIZE,
                        bottom: -PIECE_SIZE,
                        width: '16px',
                    };
                    return (
                        <div
                            key={id}
                            className="absolute bg-white/80 rounded-full animate-zap-vertical shadow-lg"
                            style={style}
                        />
                    );
                }
                return null;
            })}
             <style>{`
                @keyframes zap-horizontal {
                    0% { transform: scaleX(0); }
                    50% { transform: scaleX(1); opacity: 0.9; }
                    100% { transform: scaleX(0); opacity: 0; }
                }
                .animate-zap-horizontal {
                    transform-origin: center;
                    animation: zap-horizontal 0.5s ease-out forwards;
                }
                 @keyframes zap-vertical {
                    0% { transform: scaleY(0); }
                    50% { transform: scaleY(1); opacity: 0.9; }
                    100% { transform: scaleY(0); opacity: 0; }
                }
                .animate-zap-vertical {
                    transform-origin: center;
                    animation: zap-vertical 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default SpecialEffectsLayer;
