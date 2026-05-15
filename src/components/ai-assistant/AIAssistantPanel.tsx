import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import EnhancedStrategyGenerator from './EnhancedStrategyGenerator';
import StrategyTemplates from './StrategyTemplates';

interface AIAssistantPanelProps {
    onClose: () => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'generate' | 'templates'>('generate');

    return (
        <>
            {/* Backdrop */}
            <motion.div
                className='fixed inset-0 bg-black z-40'
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                transition={{ duration: 0.3 }}
            />

            {/* AI Panel */}
            <motion.div
                className='fixed right-0 top-0 h-full w-full md:w-[500px] bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 z-50 shadow-2xl flex flex-col border-l border-green-500/30'
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
                {/* Header */}
                <motion.div
                    className='px-6 py-6 border-b border-green-500/20 bg-gradient-to-r from-green-500/5 to-yellow-500/5'
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center gap-3'>
                            <div className='relative'>
                                <div className='w-3 h-3 bg-green-500 rounded-full animate-pulse' />
                                <div className='absolute inset-0 w-3 h-3 bg-green-500 rounded-full blur-md opacity-50' />
                            </div>
                            <h2 className='text-xl font-bold bg-gradient-to-r from-yellow-400 to-green-400 bg-clip-text text-transparent'>
                                AI Trading Strategist
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className='text-gray-400 hover:text-green-400 transition-colors duration-200'
                        >
                            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M6 18L18 6M6 6l12 12'
                                />
                            </svg>
                        </button>
                    </div>
                    <p className='text-sm text-gray-400'>Generate intelligent trading strategies with AI assistance</p>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    className='flex gap-1 px-6 py-4 border-b border-green-500/10'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {['generate', 'templates'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as 'generate' | 'templates')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                                activeTab === tab
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                    : 'text-gray-400 hover:text-green-300'
                            }`}
                        >
                            {tab === 'generate' ? '✨ Generate' : '📋 Templates'}
                        </button>
                    ))}
                </motion.div>

                {/* Content */}
                <motion.div
                    className='flex-1 overflow-y-auto'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <AnimatePresence mode='wait'>
                        {activeTab === 'generate' ? (
                            <EnhancedStrategyGenerator key='generator' />
                        ) : (
                            <StrategyTemplates key='templates' />
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </>
    );
};

export default AIAssistantPanel;
