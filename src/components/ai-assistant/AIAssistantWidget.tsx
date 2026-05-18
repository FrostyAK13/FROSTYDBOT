import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AIAssistantPanel from './AIAssistantPanel';
import './AIAssistantWidget.scss';

const AIAssistantWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [externalScanTrigger, setExternalScanTrigger] = useState(0);
    const openAssistant = useCallback(() => setIsOpen(true), []);
    const triggerScan = useCallback(() => {
        setIsOpen(true);
        setExternalScanTrigger(prev => prev + 1);
    }, []);

    type AIAssistantWindow = Window & {
        aiAssistant?: {
            open: () => void;
            scan: () => void;
            close: () => void;
        };
    };

    useLayoutEffect(() => {
        const globalWindow = window as AIAssistantWindow;
        globalWindow.aiAssistant = {
            open: openAssistant,
            scan: triggerScan,
            close: () => setIsOpen(false),
        };

        return () => {
            if (globalWindow.aiAssistant) {
                delete globalWindow.aiAssistant;
            }
        };
    }, [openAssistant, triggerScan]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
                event.preventDefault();
                openAssistant();
            }
            if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 's') {
                event.preventDefault();
                triggerScan();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [openAssistant, triggerScan]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('ai') === 'open') {
            openAssistant();
        }
        if (params.get('ai') === 'scan') {
            triggerScan();
        }
    }, [openAssistant, triggerScan]);

    return (
        <AnimatePresence>
            <motion.div
                className='ai-assistant-widget-container'
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: [0, -8, 0], opacity: 1 }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                onClick={openAssistant}
                role='button'
                aria-label='Open AI Assistant'
                tabIndex={0}
                onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openAssistant();
                    }
                }}
            >
                <motion.button
                    type='button'
                    onClick={event => {
                        event.stopPropagation();
                        openAssistant();
                    }}
                    onHoverStart={() => setIsHovering(true)}
                    onHoverEnd={() => setIsHovering(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.96 }}
                    aria-label='Open AI Assistant'
                    aria-expanded={isOpen}
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

            {isOpen && <AIAssistantPanel onClose={() => setIsOpen(false)} scanTrigger={externalScanTrigger} />}
        </AnimatePresence>
    );
};

export default AIAssistantWidget;
