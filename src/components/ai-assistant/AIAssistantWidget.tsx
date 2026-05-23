import React, { Suspense, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './AIAssistantWidget.scss';

const EntryScannerModal = React.lazy(() => import('./EntryScannerModal'));
const AIAssistantPanel = React.lazy(() => import('./AIAssistantPanel'));

type ViewMode = 'scanner' | 'panel' | null;

const AIAssistantWidget: React.FC = () => {
    const [view, setView] = useState<ViewMode>(null);
    const [isHovering, setIsHovering] = useState(false);
    const [externalScanTrigger, setExternalScanTrigger] = useState(0);

    const openScanner = useCallback(() => setView('scanner'), []);
    const openPanel = useCallback(() => setView('panel'), []);
    const close = useCallback(() => setView(null), []);

    const triggerScan = useCallback(() => {
        setView('scanner');
        setExternalScanTrigger(prev => prev + 1);
    }, []);

    type AIAssistantWindow = Window & {
        aiAssistant?: {
            open: () => void;
            scan: () => void;
            openPanel: () => void;
            close: () => void;
        };
    };

    useLayoutEffect(() => {
        const globalWindow = window as AIAssistantWindow;
        globalWindow.aiAssistant = {
            open: openScanner,
            scan: triggerScan,
            openPanel,
            close,
        };
        return () => {
            if (globalWindow.aiAssistant) delete globalWindow.aiAssistant;
        };
    }, [openScanner, triggerScan, openPanel, close]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
                event.preventDefault();
                openScanner();
            }
            if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 's') {
                event.preventDefault();
                triggerScan();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [openScanner, triggerScan]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('ai') === 'open' || params.get('ai') === 'scan') openScanner();
    }, [openScanner]);

    return (
        <>
            {/* Floating AI Button */}
            <div
                className='ai-assistant-widget-container'
                role='button'
                aria-label='Open Entry Scanner'
                tabIndex={0}
                onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openScanner();
                    }
                }}
            >
                <motion.button
                    type='button'
                    onClick={openScanner}
                    onHoverStart={() => setIsHovering(true)}
                    onHoverEnd={() => setIsHovering(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.96 }}
                    aria-label='Open Entry Scanner'
                    aria-expanded={view !== null}
                    className='ai-assistant-button'
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
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
            </div>

            {/* Modals */}
            <Suspense fallback={null}>
                <AnimatePresence>
                    {view === 'scanner' && (
                        <EntryScannerModal
                            key='scanner'
                            onClose={close}
                            onOpenFullPanel={() => {
                                close();
                                setTimeout(openPanel, 120);
                            }}
                        />
                    )}
                    {view === 'panel' && (
                        <AIAssistantPanel key='panel' onClose={close} scanTrigger={externalScanTrigger} />
                    )}
                </AnimatePresence>
            </Suspense>
        </>
    );
};

export default AIAssistantWidget;
