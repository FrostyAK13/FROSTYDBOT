import React from 'react';
import { motion } from 'framer-motion';

interface Template {
    id: string;
    name: string;
    description: string;
    type: string;
    riskLevel: 'Low' | 'Medium' | 'High';
    blocks: string[];
    icon: string;
}

const templates: Template[] = [
    {
        id: 'martingale-ou8',
        name: 'Martingale Over/Under 8',
        description: 'Double stake after each loss with automatic stop loss',
        type: 'Over/Under 8',
        riskLevel: 'High',
        blocks: [
            'Trade Type: Over/Under 8',
            'Entry: Martingale (Double on Loss)',
            'Stop Loss: 4 Consecutive Losses',
            'Take Profit: +$100',
            'Base Stake: $10',
        ],
        icon: '🎲',
    },
    {
        id: 'conservative-ou8',
        name: 'Conservative Over/Under',
        description: 'Low-risk strategy with fixed stakes and tight stop loss',
        type: 'Over/Under 8',
        riskLevel: 'Low',
        blocks: [
            'Trade Type: Over/Under 8',
            'Entry: Fixed $5 Stake',
            'Stop Loss: 3 Consecutive Losses',
            'Take Profit: +$50',
            'Daily Loss Limit: $100',
        ],
        icon: '🛡️',
    },
    {
        id: 'aggressive-scaling',
        name: 'Aggressive Scaling',
        description: 'Increase stakes on wins with structured scaling',
        type: 'Over/Under 8',
        riskLevel: 'High',
        blocks: [
            'Trade Type: Over/Under 8',
            'Entry: Scaling (Increase on Win)',
            'Win Streak Target: 3 Wins',
            'Stake Increase: +$5 Per Win',
            'Reset on Loss',
        ],
        icon: '📈',
    },
    {
        id: 'balanced-hybrid',
        name: 'Balanced Hybrid',
        description: 'Mix of martingale and fixed stakes for balance',
        type: 'Over/Under 8',
        riskLevel: 'Medium',
        blocks: [
            'Trade Type: Over/Under 8',
            'Entry: Hybrid (Fixed + Martingale)',
            'Base Stake: $10',
            'Max Doubling: 3x',
            'Daily Profit Target: $75',
        ],
        icon: '⚖️',
    },
    {
        id: 'anti-martingale',
        name: 'Anti-Martingale',
        description: 'Increase stakes only after wins to compound profits',
        type: 'Over/Under 8',
        riskLevel: 'Medium',
        blocks: [
            'Trade Type: Over/Under 8',
            'Entry: Anti-Martingale',
            'Increase on Win: +50%',
            'Reset on Loss',
            'Take Profit: +$150',
        ],
        icon: '🚀',
    },
    {
        id: 'risk-optimal',
        name: 'Risk Optimal',
        description: 'Kelly Criterion-based sizing with optimal risk management',
        type: 'Over/Under 8',
        riskLevel: 'Low',
        blocks: [
            'Trade Type: Over/Under 8',
            'Entry: Kelly Criterion',
            'Win Rate: 55%',
            'Stake: 2% of Bankroll',
            'Trailing Stop Loss',
        ],
        icon: '🎯',
    },
];

const StrategyTemplates: React.FC = () => {
    const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null);

    const getRiskColor = (level: 'Low' | 'Medium' | 'High') => {
        switch (level) {
            case 'Low':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'Medium':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'High':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
        }
    };

    return (
        <motion.div
            className='p-6 space-y-4'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
        >
            <div className='grid gap-4 grid-cols-1'>
                {templates.map((template, index) => (
                    <motion.button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        className='p-4 bg-gradient-to-r from-gray-800/30 to-gray-800/10 border border-green-500/20 rounded-lg hover:border-green-500/50 transition-all duration-200 text-left group'
                    >
                        <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <span className='text-xl'>{template.icon}</span>
                                    <h3 className='font-semibold text-green-400 group-hover:text-green-300'>
                                        {template.name}
                                    </h3>
                                </div>
                                <p className='text-xs text-gray-400 mb-3'>{template.description}</p>
                                <div className='flex items-center gap-2'>
                                    <span className='text-xs px-2 py-1 bg-gray-700/50 rounded text-gray-300'>
                                        {template.type}
                                    </span>
                                    <span
                                        className={`text-xs px-2 py-1 rounded border ${getRiskColor(
                                            template.riskLevel
                                        )}`}
                                    >
                                        {template.riskLevel} Risk
                                    </span>
                                </div>
                            </div>
                            <span className='text-green-400 group-hover:translate-x-1 transition-transform'>→</span>
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Selected Template Details */}
            {selectedTemplate && (
                <motion.div
                    className='mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg space-y-4'
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                >
                    <div className='flex items-center justify-between'>
                        <h3 className='text-sm font-semibold text-green-400'>📋 Selected Template</h3>
                        <button
                            onClick={() => setSelectedTemplate(null)}
                            className='text-gray-400 hover:text-green-400 transition-colors'
                        >
                            ✕
                        </button>
                    </div>

                    <div className='space-y-2'>
                        <p className='text-sm font-semibold text-gray-200'>{selectedTemplate.name}</p>
                        <div className='space-y-1'>
                            {selectedTemplate.blocks.map((block, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className='flex items-center gap-2 text-xs text-gray-300'
                                >
                                    <span className='w-1.5 h-1.5 bg-green-400 rounded-full' />
                                    {block}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <motion.button
                        onClick={() => setSelectedTemplate(null)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className='w-full py-2 px-4 rounded-lg font-semibold bg-gradient-to-r from-green-500 to-yellow-500 text-gray-950 hover:from-green-400 hover:to-yellow-400 transition-all duration-200'
                    >
                        ✅ Apply This Template
                    </motion.button>
                </motion.div>
            )}

            {/* Info Box */}
            <motion.div
                className='p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                💡 <strong>Tip:</strong> Templates can be customized after applying to the bot builder
            </motion.div>
        </motion.div>
    );
};

export default StrategyTemplates;
