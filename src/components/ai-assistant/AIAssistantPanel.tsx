import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AITypingAnimation from './AITypingAnimation';
import EnhancedStrategyGenerator from './EnhancedStrategyGenerator';
import StrategyTemplates from './StrategyTemplates';

interface AIAssistantPanelProps {
    onClose: () => void;
}

interface GeneratedStrategy {
    title: string;
    entryType: string;
    riskLevel: string;
    summary: string;
    blocks: string[];
    explanation: string;
    backtest: {
        winRate: number;
        profitFactor: number;
        averagePayout: string;
    };
    riskSuggestions: string[];
}

const promptPresets = [
    'Create a martingale Over/Under bot with stop loss and take profit',
    'Generate a low-risk trading cockpit strategy for Over/Under',
    'Build a premium AI strategy with stop loss, take profit, and backtest preview',
];

const supportedCapabilities = [
    'Over/Under',
    'Rise/Fall',
    'Matches/Differs',
    'Multipliers',
    'Martingale logic',
    'Stop loss',
    'Take profit',
    'Backtest preview',
];

const strategySuggestions = [
    'Use a hybrid entry combining momentum and support validation.',
    'Auto-create bot blocks for entry, risk, and payout flow.',
    'Limit martingale sequences to reduce drawdown.',
    'Apply take profit tiers as market confidence rises.',
];

const createStrategyFromPrompt = (prompt: string): GeneratedStrategy => {
    const normalized = prompt.toLowerCase();
    const hasMartingale = normalized.includes('martingale');
    const hasRisk = normalized.includes('risk') || normalized.includes('stop loss');

    return {
        title: hasMartingale ? 'AI Martingale Over/Under Architect' : 'AI Precision Over/Under Strategy',
        entryType: 'Over/Under 8',
        riskLevel: hasMartingale ? 'Medium-High' : hasRisk ? 'Moderate' : 'Medium',
        summary: `Optimized for a futuristic bot builder dashboard, this strategy converts your prompt into a structured ${hasMartingale ? 'martingale-enhanced' : hasRisk ? 'risk-managed' : 'strategy-aware'} Over/Under trading strategy.`,
        blocks: [
            `Trade Type: ${hasMartingale ? 'Over/Under 8 with Martingale' : 'Over/Under 8'}`,
            'Entry Condition: Price momentum confirmation on last candle',
            `Stake Profile: Base stake $12${hasMartingale ? ' with 2x martingale' : ''}`,
            'Stop Loss: 3 consecutive invalid signals',
            'Take Profit: +$120 or 1.8% of account balance',
            'Risk Control: trailing stop + max daily drawdown guard',
        ],
        explanation: `I interpreted your input and built a refined strategy for the Bot Builder cockpit. It uses ${hasMartingale ? 'martingale progression with cautious limits' : 'strict risk management and fixed stake sizing'} to keep the trading flow premium, responsive, and backtest-ready.`,
        backtest: {
            winRate: hasMartingale ? 63 : 57,
            profitFactor: hasMartingale ? 1.88 : 1.45,
            averagePayout: hasMartingale ? '$118' : '$96',
        },
        riskSuggestions: [
            'Enable daily loss limit to preserve capital.',
            'Use take profit scaling when the market is trending strongly.',
            hasMartingale
                ? 'Cap martingale chains to 3 levels and reset after the first win.'
                : 'Keep stop loss tight and avoid overleveraging.',
        ],
    };
};

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'generate' | 'templates'>('generate');
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedStrategy, setGeneratedStrategy] = useState<GeneratedStrategy | null>(null);
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

    const quickTags = useMemo(
        () => [
            'Martingale Over/Under',
            'Stop Loss + Take Profit',
            'Risk Management',
            'Backtest Preview',
            'Auto Block Generation',
        ],
        []
    );

    const handleGenerate = () => {
        if (!prompt.trim()) {
            setGeneratedStrategy(
                createStrategyFromPrompt('Create a premium AI Over/Under strategy with stop loss and take profit')
            );
            return;
        }

        setIsGenerating(true);
        setGeneratedStrategy(null);
        setTimeout(() => {
            setGeneratedStrategy(createStrategyFromPrompt(prompt));
            setIsGenerating(false);
        }, 1200);
    };

    const handlePresetClick = (value: string) => {
        setPrompt(value);
        setSelectedPreset(value);
        setGeneratedStrategy(null);
    };

    const latestBlocks = generatedStrategy?.blocks ?? [];

    return (
        <>
            <motion.div
                className='fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />

            <motion.div
                className='fixed inset-y-0 right-0 z-[9999] flex w-full max-w-full md:max-w-[560px]'
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            >
                <div className='relative flex h-full w-full flex-col overflow-hidden border-l border-green-400/15 bg-[#06090F] text-white shadow-[0_0_60px_rgba(0,255,127,0.18)]'>
                    <button
                        onClick={onClose}
                        className='absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10'
                        aria-label='Close AI panel'
                    >
                        ✕
                    </button>

                    <div className='relative flex h-full flex-col overflow-hidden'>
                        <div className='absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#101420] via-[#06090F]/40 to-transparent' />
                        <div className='relative z-10 flex flex-col gap-4 px-6 pt-8 pb-4'>
                            <div className='space-y-4'>
                                <div className='flex items-center gap-4'>
                                    <div className='flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#ffd800] via-[#ffaa16] to-[#00ff7f] shadow-[0_0_30px_rgba(255,215,0,0.3),0_0_60px_rgba(0,255,127,0.2)]'>
                                        <span className='text-xl font-black text-slate-950'>AI</span>
                                    </div>
                                    <div className='space-y-1'>
                                        <p className='text-xs uppercase tracking-[0.16em] text-green-300/80'>
                                            Futuristic Bot Builder Cockpit
                                        </p>
                                        <h2 className='text-2xl font-semibold text-white'>AI Assistant</h2>
                                        <p className='max-w-[22rem] text-sm text-slate-300'>
                                            Convert natural language into trading strategies, generate bot blocks, and
                                            preview risk-managed Over/Under plans.
                                        </p>
                                    </div>
                                </div>

                                <div className='grid gap-2 sm:grid-cols-2'>
                                    {supportedCapabilities.map(capability => (
                                        <span
                                            key={capability}
                                            className='inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300'
                                        >
                                            {capability}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className='flex flex-wrap gap-3 rounded-3xl border border-white/10 bg-white/5 px-3 py-3'>
                                <button
                                    type='button'
                                    onClick={() => setActiveTab('generate')}
                                    className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                                        activeTab === 'generate'
                                            ? 'bg-green-400/15 text-white ring-1 ring-green-400/30'
                                            : 'bg-transparent text-slate-300 hover:bg-white/5'
                                    }`}
                                >
                                    Generate
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setActiveTab('templates')}
                                    className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                                        activeTab === 'templates'
                                            ? 'bg-green-400/15 text-white ring-1 ring-green-400/30'
                                            : 'bg-transparent text-slate-300 hover:bg-white/5'
                                    }`}
                                >
                                    Templates
                                </button>
                            </div>

                            <div className='grid gap-2 sm:grid-cols-[1fr_auto]'>
                                <div className='space-y-2'>
                                    <p className='text-xs uppercase tracking-[0.18em] text-slate-400'>
                                        Prompt your strategy
                                    </p>
                                    <textarea
                                        value={prompt}
                                        onChange={e => setPrompt(e.target.value)}
                                        placeholder='e.g. Build a premium martingale Over/Under strategy with stop loss, take profit and backtest simulation.'
                                        className='min-h-[128px] w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-sm text-slate-100 outline-none ring-1 ring-transparent transition focus:border-green-400/40 focus:ring-2 focus:ring-green-400/20'
                                    />
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className='h-14 rounded-3xl bg-gradient-to-br from-[#d4b70d] to-[#00ff7f] px-6 text-sm font-semibold uppercase tracking-[0.12em] text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70'
                                >
                                    {isGenerating ? 'Generating...' : 'Generate Strategy'}
                                </button>
                            </div>

                            <div className='grid gap-2 sm:grid-cols-2'>
                                {promptPresets.map(preset => (
                                    <button
                                        key={preset}
                                        type='button'
                                        onClick={() => handlePresetClick(preset)}
                                        className={`rounded-2xl border px-3 py-2 text-sm transition ${
                                            selectedPreset === preset
                                                ? 'border-green-400 bg-green-400/15 text-white'
                                                : 'border-white/10 bg-white/5 text-slate-300 hover:border-green-400/40 hover:bg-white/10'
                                        }`}
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className='flex flex-1 flex-col overflow-hidden border-t border-white/10'>
                            <div className='flex items-center justify-between gap-3 border-b border-white/10 px-6 py-4'>
                                <div>
                                    <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>AI Assistant</p>
                                    <h3 className='text-lg font-semibold text-white'>Strategy workspace</h3>
                                </div>
                                <div className='rounded-2xl border border-green-400/15 bg-white/5 px-3 py-1 text-xs text-green-300'>
                                    Live cockpit
                                </div>
                            </div>

                            <div className='flex-1 overflow-y-auto p-6 space-y-6'>
                                <AnimatePresence mode='wait'>
                                    {activeTab === 'generate' ? (
                                        <motion.div
                                            key='generate'
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -12 }}
                                            transition={{ duration: 0.25 }}
                                            className='space-y-6'
                                        >
                                            <div className='space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)]'>
                                                <div className='space-y-3'>
                                                    <div className='flex items-center justify-between gap-3'>
                                                        <div>
                                                            <p className='text-xs uppercase tracking-[0.18em] text-slate-400'>
                                                                AI response
                                                            </p>
                                                            <h4 className='text-base font-semibold text-white'>
                                                                Instant strategy synthesis
                                                            </h4>
                                                        </div>
                                                        <span className='inline-flex items-center gap-2 rounded-full bg-green-400/10 px-3 py-1 text-xs font-semibold text-green-200'>
                                                            Trading cockpit
                                                        </span>
                                                    </div>
                                                    <div className='flex flex-wrap gap-2'>
                                                        {supportedCapabilities.slice(0, 4).map(tag => (
                                                            <span
                                                                key={tag}
                                                                className='rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300'
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                {isGenerating ? (
                                                    <div className='rounded-3xl bg-slate-950/90 p-4'>
                                                        <AITypingAnimation
                                                            text='Analyzing market structure, risk controls, and bot blocks to create a premium strategy for your trading cockpit...'
                                                            speed={24}
                                                        />
                                                    </div>
                                                ) : generatedStrategy ? (
                                                    <div className='space-y-4'>
                                                        <p className='text-sm text-slate-300'>
                                                            {generatedStrategy.summary}
                                                        </p>
                                                        <div className='grid gap-3'>
                                                            <div className='rounded-3xl bg-slate-950/90 p-4 border border-white/10'>
                                                                <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>
                                                                    Strategy Overview
                                                                </p>
                                                                <p className='mt-2 text-sm text-slate-200'>
                                                                    {generatedStrategy.explanation}
                                                                </p>
                                                            </div>
                                                            <div className='grid gap-2 sm:grid-cols-3'>
                                                                <div className='rounded-3xl bg-slate-950/80 p-4 text-xs text-slate-300'>
                                                                    <p className='font-semibold text-slate-100'>
                                                                        Risk Level
                                                                    </p>
                                                                    <p className='mt-2'>
                                                                        {generatedStrategy.riskLevel}
                                                                    </p>
                                                                </div>
                                                                <div className='rounded-3xl bg-slate-950/80 p-4 text-xs text-slate-300'>
                                                                    <p className='font-semibold text-slate-100'>
                                                                        Win Rate
                                                                    </p>
                                                                    <p className='mt-2'>
                                                                        {generatedStrategy.backtest.winRate}%
                                                                    </p>
                                                                </div>
                                                                <div className='rounded-3xl bg-slate-950/80 p-4 text-xs text-slate-300'>
                                                                    <p className='font-semibold text-slate-100'>
                                                                        Profit Factor
                                                                    </p>
                                                                    <p className='mt-2'>
                                                                        {generatedStrategy.backtest.profitFactor}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className='text-sm text-slate-400'>
                                                        Use the prompt above to convert natural language into a strategy
                                                        instantly.
                                                    </p>
                                                )}
                                            </div>

                                            {generatedStrategy && (
                                                <div className='grid gap-4 md:grid-cols-[1fr_1fr]'>
                                                    <div className='space-y-3 rounded-3xl border border-white/10 bg-slate-950/90 p-4'>
                                                        <div className='flex items-center justify-between'>
                                                            <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>
                                                                Bot blocks
                                                            </p>
                                                            <span className='text-xs text-green-300'>
                                                                Auto-generated
                                                            </span>
                                                        </div>
                                                        <div className='space-y-2 text-sm text-slate-200'>
                                                            {latestBlocks.map((block, index) => (
                                                                <div
                                                                    key={index}
                                                                    className='rounded-2xl border border-white/10 bg-[#0f172a]/90 p-3'
                                                                >
                                                                    {block}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className='space-y-3 rounded-3xl border border-white/10 bg-slate-950/90 p-4'>
                                                        <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>
                                                            Risk management
                                                        </p>
                                                        <ul className='space-y-2 text-sm text-slate-300'>
                                                            {generatedStrategy.riskSuggestions.map((item, index) => (
                                                                <li key={index} className='flex gap-2'>
                                                                    <span className='mt-0.5 text-green-300'>•</span>
                                                                    <span>{item}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}

                                            <div className='space-y-3 rounded-3xl border border-white/10 bg-slate-900/80 p-4'>
                                                <div className='flex items-center justify-between'>
                                                    <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>
                                                        Quick strategy templates
                                                    </p>
                                                    <span className='text-xs text-slate-400'>Instant ideas</span>
                                                </div>
                                                <div className='grid gap-2 sm:grid-cols-2'>
                                                    {quickTags.map(tag => (
                                                        <button
                                                            key={tag}
                                                            type='button'
                                                            onClick={() => setPrompt(tag)}
                                                            className='rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:border-green-400/40 hover:bg-white/10'
                                                        >
                                                            {tag}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className='space-y-3 rounded-3xl border border-white/10 bg-[#071014]/95 p-4'>
                                                <div className='flex items-center justify-between'>
                                                    <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>
                                                        Strategy suggestions
                                                    </p>
                                                    <span className='text-xs text-green-300'>Bot builder tips</span>
                                                </div>
                                                <ul className='space-y-2 text-sm text-slate-300'>
                                                    {strategySuggestions.map((suggestion, index) => (
                                                        <li key={index} className='flex gap-2'>
                                                            <span className='mt-0.5 text-green-300'>•</span>
                                                            <span>{suggestion}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <EnhancedStrategyGenerator />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key='templates'
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -12 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <StrategyTemplates />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default AIAssistantPanel;
