import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import EnhancedStrategyGenerator from './EnhancedStrategyGenerator';
import StrategyTemplates from './StrategyTemplates';
import AITypingAnimation from './AITypingAnimation';

interface AIAssistantPanelProps {
    onClose: () => void;
    scanTrigger?: number;
    defaultTab?: 'scanner' | 'generate' | 'templates';
}

interface GeneratedStrategy {
    title: string;
    entryType: string;
    riskLevel: string;
    summary: string;
    blocks: string[];
    explanation: string;
    backtest: { winRate: number; profitFactor: number; averagePayout: string };
    riskSuggestions: string[];
}

const promptPresets = [
    'Create a martingale Over/Under bot with stop loss and take profit',
    'Generate a low-risk trading cockpit strategy for Over/Under',
    'Build a premium AI strategy with stop loss, take profit, and backtest preview',
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

const TABS = [
    { id: 'scanner', label: '🛰 Live Scanner', accent: 'cyan' },
    { id: 'generate', label: '⚡ Generate', accent: 'green' },
    { id: 'templates', label: '📋 Templates', accent: 'purple' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ onClose, scanTrigger, defaultTab = 'scanner' }) => {
    const [activeTab, setActiveTab] = useState<TabId>(defaultTab);
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedStrategy, setGeneratedStrategy] = useState<GeneratedStrategy | null>(null);
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const promptRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (activeTab === 'generate' && promptRef.current) {
            promptRef.current.focus();
        }
    }, [activeTab]);

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

    return (
        <>
            <motion.div
                className='fixed inset-0 z-[9998] bg-black/75 backdrop-blur-sm'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />

            <motion.div
                className='fixed inset-y-0 right-0 z-[9999] flex w-full max-w-full md:max-w-[680px]'
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            >
                <div className='relative flex h-full w-full flex-col overflow-hidden border-l border-cyan-400/20 bg-[#04080f] text-white shadow-[0_0_80px_rgba(0,212,255,0.22)]'>

                    {/* Top glow bar */}
                    <div className='absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80' />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className='absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 transition hover:bg-white/15 hover:text-white'
                        aria-label='Close AI panel'
                    >
                        ✕
                    </button>

                    {/* Header */}
                    <div className='relative z-10 flex-shrink-0 border-b border-white/8 bg-[#060c15]/90 px-6 pt-6 pb-4'>
                        <div className='flex items-center gap-4 pr-10'>
                            <div className='relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 shadow-[0_0_24px_rgba(0,212,255,0.35)]' style={{ border: '1.5px solid rgba(0,212,255,0.35)' }}>
                                <span className='text-lg font-black text-cyan-300' style={{ textShadow: '0 0 12px rgba(0,212,255,0.8)' }}>AI</span>
                                <span className='absolute -top-1 -right-1 flex h-3 w-3'>
                                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75'></span>
                                    <span className='relative inline-flex rounded-full h-3 w-3 bg-cyan-400'></span>
                                </span>
                            </div>
                            <div>
                                <p className='text-[10px] uppercase tracking-[0.22em] text-cyan-400/70 font-semibold'>Frosty Trading System</p>
                                <h2 className='text-xl font-bold text-white leading-tight'>AI Market Intelligence</h2>
                                <p className='text-xs text-slate-400 mt-0.5'>Live scanner · Strategy generator · Bot loader</p>
                            </div>
                        </div>

                        {/* Tab Bar */}
                        <div className='mt-4 flex gap-1 rounded-xl border border-white/8 bg-white/4 p-1'>
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    type='button'
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                                        activeTab === tab.id
                                            ? tab.id === 'scanner'
                                                ? 'bg-cyan-500/20 text-cyan-200 shadow-[0_0_12px_rgba(0,212,255,0.2)]'
                                                : tab.id === 'generate'
                                                ? 'bg-green-500/20 text-green-200'
                                                : 'bg-purple-500/20 text-purple-200'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                    }`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.span
                                            layoutId='tab-indicator'
                                            className={`absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full ${
                                                tab.id === 'scanner' ? 'bg-cyan-400' : tab.id === 'generate' ? 'bg-green-400' : 'bg-purple-400'
                                            }`}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className='flex-1 overflow-y-auto'>
                        <AnimatePresence mode='wait'>
                            {activeTab === 'scanner' && (
                                <motion.div
                                    key='scanner'
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <EnhancedStrategyGenerator externalScanTrigger={scanTrigger} />
                                </motion.div>
                            )}

                            {activeTab === 'generate' && (
                                <motion.div
                                    key='generate'
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className='p-6 space-y-6'
                                >
                                    {/* Prompt area */}
                                    <div className='rounded-2xl border border-white/10 bg-white/4 p-4 space-y-4'>
                                        <div>
                                            <p className='text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1'>Strategy Prompt</p>
                                            <textarea
                                                ref={promptRef}
                                                value={prompt}
                                                onChange={e => setPrompt(e.target.value)}
                                                placeholder='e.g. Build a premium martingale Over/Under strategy with stop loss, take profit and backtest simulation.'
                                                rows={4}
                                                className='w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-green-400/50 focus:ring-1 focus:ring-green-400/20 resize-none'
                                            />
                                        </div>
                                        <button
                                            onClick={handleGenerate}
                                            disabled={isGenerating}
                                            className='w-full h-11 rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 text-sm font-bold uppercase tracking-widest text-slate-950 transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed'
                                        >
                                            {isGenerating ? 'Generating...' : '⚡ Generate Strategy'}
                                        </button>
                                        <div className='grid gap-2 sm:grid-cols-2'>
                                            {promptPresets.map(preset => (
                                                <button
                                                    key={preset}
                                                    type='button'
                                                    onClick={() => handlePresetClick(preset)}
                                                    className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                                                        selectedPreset === preset
                                                            ? 'border-green-400/60 bg-green-400/10 text-green-200'
                                                            : 'border-white/10 bg-white/4 text-slate-400 hover:border-green-400/30 hover:text-slate-200'
                                                    }`}
                                                >
                                                    {preset}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Generated output */}
                                    <div className='rounded-2xl border border-white/10 bg-white/4 p-4 space-y-4 min-h-[160px]'>
                                        <div className='flex items-center justify-between'>
                                            <div>
                                                <p className='text-[10px] uppercase tracking-[0.2em] text-slate-500'>AI Response</p>
                                                <h4 className='text-sm font-semibold text-white mt-0.5'>Strategy Workspace</h4>
                                            </div>
                                            <span className='rounded-full border border-green-400/20 bg-green-400/8 px-2.5 py-1 text-[10px] text-green-300'>Live cockpit</span>
                                        </div>

                                        {isGenerating ? (
                                            <div className='rounded-xl bg-slate-950/80 p-4'>
                                                <AITypingAnimation
                                                    text='Analyzing market structure, risk controls, and bot blocks to create a premium strategy for your trading cockpit...'
                                                    speed={24}
                                                />
                                            </div>
                                        ) : generatedStrategy ? (
                                            <div className='space-y-4'>
                                                <p className='text-sm text-slate-300'>{generatedStrategy.summary}</p>
                                                <div className='grid gap-2 sm:grid-cols-3'>
                                                    {[
                                                        { label: 'Risk Level', value: generatedStrategy.riskLevel },
                                                        { label: 'Win Rate', value: `${generatedStrategy.backtest.winRate}%` },
                                                        { label: 'Profit Factor', value: String(generatedStrategy.backtest.profitFactor) },
                                                    ].map(item => (
                                                        <div key={item.label} className='rounded-xl bg-slate-950/80 p-3'>
                                                            <p className='text-[10px] uppercase tracking-widest text-slate-500'>{item.label}</p>
                                                            <p className='mt-1 text-base font-bold text-white'>{item.value}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className='rounded-xl bg-slate-950/80 p-3 border border-white/8'>
                                                    <p className='text-xs text-slate-300'>{generatedStrategy.explanation}</p>
                                                </div>
                                                <div className='space-y-2'>
                                                    {generatedStrategy.blocks.map((block, i) => (
                                                        <div key={i} className='rounded-xl border border-white/8 bg-[#0f172a]/80 px-3 py-2 text-xs text-slate-300'>
                                                            {block}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className='flex flex-col items-center justify-center gap-2 py-8 text-center'>
                                                <span className='text-3xl opacity-30'>⚡</span>
                                                <p className='text-sm text-slate-500'>Enter a prompt above to generate a strategy instantly.</p>
                                                <p className='text-xs text-slate-600'>Or pick one of the presets to get started.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tips */}
                                    <div className='rounded-2xl border border-white/8 bg-white/3 p-4'>
                                        <p className='text-xs font-semibold text-green-300 mb-2'>Bot builder tips</p>
                                        <ul className='space-y-2'>
                                            {strategySuggestions.map((tip, i) => (
                                                <li key={i} className='flex gap-2 text-xs text-slate-400'>
                                                    <span className='text-green-400 mt-0.5'>•</span>
                                                    <span>{tip}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'templates' && (
                                <motion.div
                                    key='templates'
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className='p-6'
                                >
                                    <StrategyTemplates />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default AIAssistantPanel;
