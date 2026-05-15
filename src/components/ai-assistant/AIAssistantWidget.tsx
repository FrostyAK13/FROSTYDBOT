import React, { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AIAssistantPanel from './AIAssistantPanel';

const AIAssistantWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const openAssistant = useCallback(() => setIsOpen(true), []);

    return (
        <AnimatePresence>
            <motion.div
                className='fixed right-6 bottom-6 z-[100000] pointer-events-auto'
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: [0, -8, 0], opacity: 1 }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            >
                <motion.button
                    type='button'
                    onClick={openAssistant}
                    onHoverStart={() => setIsHovering(true)}
                    onHoverEnd={() => setIsHovering(false)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label='Open AI Assistant'
                    className='relative flex h-[6.5rem] w-[6.5rem] items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(218,213,117,0.96),_rgba(16,255,120,0.18),_rgba(255,231,170,0.16))] text-white shadow-[0_0_46px_rgba(0,255,127,0.28),0_0_24px_rgba(255,213,0,0.2),inset_0_0_18px_rgba(255,255,255,0.12)] cursor-pointer outline-none transition-all duration-300 ease-in-out'
                    style={{
                        backdropFilter: 'blur(22px)',
                        WebkitBackdropFilter: 'blur(22px)',
                    }}
                >
                    <span className='relative z-20 flex items-center justify-center text-4xl font-black uppercase tracking-[0.18em] text-white leading-none'>
                        AI
                    </span>

                    <motion.span
                        className='absolute inset-0 rounded-full pointer-events-none'
                        animate={
                            isHovering
                                ? { scale: [1, 1.16, 1.05], opacity: [0.9, 0.45, 0.9] }
                                : { scale: [1, 1.04, 1], opacity: [0.75, 0.58, 0.75] }
                        }
                        transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            border: '1px solid rgba(255, 255, 255, 0.18)',
                            boxShadow: '0 0 32px rgba(0,255,127,0.32), inset 0 0 22px rgba(255,215,0,0.18)',
                        }}
                    />
                    <motion.span
                        className='absolute inset-0 rounded-full pointer-events-none'
                        style={{
                            background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 48%)',
                            opacity: 0.65,
                        }}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.25, 0.7] }}
                        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </motion.button>
            </motion.div>

            {isOpen && <AIAssistantPanel onClose={() => setIsOpen(false)} />}
        </AnimatePresence>
    );
};

export default AIAssistantWidget;
