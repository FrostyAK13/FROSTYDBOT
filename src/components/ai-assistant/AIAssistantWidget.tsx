import React, { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AIAssistantPanel from './AIAssistantPanel';
import './AIAssistantWidget.scss';

const AIAssistantWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const openAssistant = useCallback(() => setIsOpen(true), []);

    return (
        <AnimatePresence>
            <motion.div
                className='ai-assistant-widget-container'
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: [0, -8, 0], opacity: 1 }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            >
                <motion.button
                    type='button'
                    onClick={openAssistant}
                    onHoverStart={() => setIsHovering(true)}
                    onHoverEnd={() => setIsHovering(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.96 }}
                    aria-label='Open AI Assistant'
                    className='ai-assistant-button'
                >
                    <div className='ai-assistant-button-bg' />

                    <div className='ai-assistant-button-content'>
                        <span className='ai-assistant-icon'>🤖</span>
                        <span className='ai-assistant-label'>AI</span>
                    </div>

                    <motion.span
                        className='ai-assistant-outer-ring'
                        animate={
                            isHovering
                                ? { scale: [1, 1.18, 1.06], opacity: [1, 0.55, 1] }
                                : { scale: [1, 1.05, 1], opacity: [0.8, 0.55, 0.8] }
                        }
                        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.span
                        className='ai-assistant-inner-ring'
                        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.25, 0.5] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <span className='ai-assistant-arrow' />
                </motion.button>
            </motion.div>

            {isOpen && <AIAssistantPanel onClose={() => setIsOpen(false)} />}
        </AnimatePresence>
    );
};

export default AIAssistantWidget;
