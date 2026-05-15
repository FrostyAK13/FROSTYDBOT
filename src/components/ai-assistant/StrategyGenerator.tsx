import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AITypingAnimation from './AITypingAnimation';

const StrategyGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedStrategy, setGeneratedStrategy] = useState<string | null>(null);
    const [strategyBlocks, setStrategyBlocks] = useState<string[]>([]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setGeneratedStrategy(null);
        setStrategyBlocks([]);

        // Simulate AI response
        await new Promise(resolve => setTimeout(resolve, 2000));

        const mockStrategy =
            'Create an Over/Under 8 strategy with Martingale progression. Start with $10 stake, double after loss. Add stop-loss at 5 consecutive losses. Take profit at +$100. Risk management: 2% per trade maximum.';

        const mockBlocks = [
            'Trade Type: Over/Under 8',
            'Entry: Martingale (Double on Loss)',
            'Risk Management: 5 Loss Limit',
            'Stop Loss: Activate at 5 Losses',
            'Take Profit: $100 Target',
            'Stake Management: $10 Base',
        ];

        setGeneratedStrategy(mockStrategy);
        setStrategyBlocks(mockBlocks);
        setIsGenerating(false);
    };

    const handleApplyStrategy = () => {
        // Logic to apply strategy to bot builder
        console.log('Applying strategy:', strategyBlocks);
        alert('Strategy blocks have been added to your bot builder!');
    };

    return (
        <motion.div
            className='p-6 space-y-6'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
        >
            {/* Prompt Input */}
            <div className='space-y-3'>
                <label className='block text-sm font-medium text-green-400'>📝 Describe Your Trading Strategy</label>
                <motion.div className='relative' whileFocus={{ scale: 1.02 }}>
                    <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder='e.g., "I want to trade Over/Under 8 with a martingale progression, starting with $10 and doubling after losses. Add stop loss after 5 consecutive losses."'
                        className='w-full px-4 py-3 bg-gray-800/50 border border-green-500/30 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all duration-200 resize-none'
                        rows={4}
                    />
                    <div className='absolute bottom-2 right-2 text-xs text-gray-500'>{prompt.length}/200</div>
                </motion.div>
            </div>

            {/* Generate Button */}
            <motion.button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='w-full py-3 px-4 rounded-lg font-semibold bg-gradient-to-r from-green-500 to-yellow-500 text-gray-950 hover:from-green-400 hover:to-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2'
            >
                {isGenerating ? (
                    <>
                        <motion.div
                            className='w-4 h-4 border-2 border-gray-950/30 border-t-gray-950 rounded-full'
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                        Generating...
                    </>
                ) : (
                    <>⚡ Generate Strategy</>
                )}
            </motion.button>

            {/* Risk Management Tips */}
            <motion.div
                className='p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg space-y-2'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <p className='text-sm font-semibold text-yellow-400'>⚠️ Risk Management Tips</p>
                <ul className='text-xs text-gray-400 space-y-1'>
                    <li>• Always set a stop loss limit</li>
                    <li>• Start with small stakes (2% of account)</li>
                    <li>• Use martingale cautiously (max 4 doublings)</li>
                    <li>• Set daily loss limits</li>
                </ul>
            </motion.div>

            {/* Generated Strategy Display */}
            {generatedStrategy && (
                <motion.div className='space-y-4' initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Strategy Text */}
                    <div className='p-4 bg-green-500/10 border border-green-500/20 rounded-lg'>
                        <p className='text-sm font-semibold text-green-400 mb-2'>🤖 AI Generated Strategy:</p>
                        <AITypingAnimation text={generatedStrategy} />
                    </div>

                    {/* Strategy Blocks */}
                    <div className='space-y-2'>
                        <p className='text-sm font-semibold text-green-400'>🔧 Generated Blocks:</p>
                        <div className='space-y-2'>
                            {strategyBlocks.map((block, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className='flex items-center gap-2 p-3 bg-gray-800/50 border border-green-500/20 rounded-lg hover:border-green-500/50 transition-all'
                                >
                                    <input type='checkbox' defaultChecked className='w-4 h-4 accent-green-500' />
                                    <span className='text-sm text-gray-300'>{block}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Apply Strategy Button */}
                    <motion.button
                        onClick={handleApplyStrategy}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className='w-full py-2 px-4 rounded-lg font-semibold bg-gradient-to-r from-yellow-500 to-green-500 text-gray-950 hover:from-yellow-400 hover:to-green-400 transition-all duration-200'
                    >
                        ✅ Apply Strategy to Bot Builder
                    </motion.button>
                </motion.div>
            )}
        </motion.div>
    );
};

export default StrategyGenerator;
