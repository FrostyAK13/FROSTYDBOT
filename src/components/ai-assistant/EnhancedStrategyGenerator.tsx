import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { load, save_types } from '@/external/bot-skeleton';
import { useStore } from '@/hooks/useStore';
import MarketScanner, { MarketScanResult } from './MarketScanner';
import StrategyParametersEditor, { StrategyParameters } from './StrategyParametersEditor';

interface AIScanOpportunity extends MarketScanResult {
    contractType: 'Over 1' | 'Under 8';
    direction: 'Over' | 'Under';
    prediction: number;
    entryPoint: number;
    confidence: number;
    riskLevel: 'Low' | 'Medium' | 'High';
}

const defaultParameters: StrategyParameters = {
    stake: 10,
    stopLoss: 500,
    takeProfit: 200,
    martingaleEnabled: true,
    martingaleMultiplier: 2,
    martingaleLimit: 4,
};

const SCAN_CONFIDENCE_THRESHOLD = 72;

const getOpportunityScore = (result: MarketScanResult) => {
    const rank = { High: 3, Medium: 2, Low: 1 } as const;
    const base = rank[result.volatility] * 24;
    const volatilityBoost = result.volatility === 'High' ? 16 : result.volatility === 'Medium' ? 10 : 4;
    const freshness = (Date.now() - result.timestamp) / 1000;
    const freshnessBonus = freshness < 10 ? 10 : freshness < 30 ? 6 : 2;
    const stabilityBonus = result.volatility === 'High' ? 6 : result.volatility === 'Medium' ? 4 : 0;
    return base + volatilityBoost + freshnessBonus + stabilityBonus;
};

const mapToOpportunity = (result: MarketScanResult): AIScanOpportunity => {
    const contractType: AIScanOpportunity['contractType'] = result.volatility === 'High' ? 'Under 8' : 'Over 1';
    const direction: AIScanOpportunity['direction'] = contractType === 'Over 1' ? 'Over' : 'Under';
    const prediction = contractType === 'Over 1' ? 1 : 8;
    const entryPoint = contractType === 'Over 1' ? 1 : 8;
    const confidence = Math.min(98, 58 + getOpportunityScore(result));
    const riskLevel: AIScanOpportunity['riskLevel'] = confidence >= 82 ? 'Low' : confidence >= 72 ? 'Medium' : 'High';
    return { ...result, contractType, direction, prediction, entryPoint, confidence, riskLevel };
};

const chooseBestOpportunity = (results: MarketScanResult[]): AIScanOpportunity | null => {
    if (!results.length) return null;
    const opportunities = results.map(mapToOpportunity);
    const filtered = opportunities.filter(op => op.confidence >= SCAN_CONFIDENCE_THRESHOLD && op.riskLevel !== 'High');
    if (!filtered.length) return null;
    return filtered.sort((a, b) => getOpportunityScore(b) - getOpportunityScore(a))[0] ?? null;
};

const getInjectedBotXml = (xmlText: string, opportunity: AIScanOpportunity, parameters: StrategyParameters) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
    const setFieldValue = (parent: Element | Document, name: string, value: string) => {
        const field = parent.querySelector(`field[name="${name}"]`);
        if (field) field.textContent = value;
    };
    const marketBlock = xmlDoc.querySelector('block[type="trade_definition_market"]');
    if (marketBlock) {
        setFieldValue(marketBlock, 'MARKET_LIST', 'synthetic_index');
        setFieldValue(marketBlock, 'SUBMARKET_LIST', 'random_index');
        setFieldValue(marketBlock, 'SYMBOL_LIST', opportunity.symbol);
    }
    const contractBlock = xmlDoc.querySelector('block[type="trade_definition_contracttype"]');
    if (contractBlock) setFieldValue(contractBlock, 'TYPE_LIST', opportunity.direction.toLowerCase());
    const tradeTypeBlock = xmlDoc.querySelector('block[type="trade_definition_tradetype"]');
    if (tradeTypeBlock) setFieldValue(tradeTypeBlock, 'TRADETYPE_LIST', 'overunder');
    xmlDoc.querySelectorAll('block[type="variables_set"]').forEach(block => {
        const varField = block.querySelector('field[name="VAR"]');
        const numberField = block.querySelector('block[type="math_number"] field[name="NUM"]');
        if (!varField || !numberField) return;
        const variableName = varField.textContent?.trim();
        if (!variableName) return;
        switch (variableName) {
            case 'PREDICTION': numberField.textContent = String(opportunity.prediction); break;
            case 'ENTRY_POINT': numberField.textContent = String(opportunity.entryPoint); break;
            case 'STAKE': numberField.textContent = String(parameters.stake); break;
            case 'MARTINGALE': numberField.textContent = String(parameters.martingaleEnabled ? parameters.martingaleMultiplier : 1); break;
            case 'TAKE PROFIT': numberField.textContent = String(parameters.takeProfit); break;
            case 'STOP LOSS': numberField.textContent = String(parameters.stopLoss); break;
        }
    });
    return new XMLSerializer().serializeToString(xmlDoc);
};

const RISK_COLORS = { Low: 'text-green-400', Medium: 'text-yellow-400', High: 'text-red-400' } as const;
const RISK_BG = { Low: 'bg-green-400/10 border-green-400/20', Medium: 'bg-yellow-400/10 border-yellow-400/20', High: 'bg-red-400/10 border-red-400/20' } as const;

interface EnhancedStrategyGeneratorProps {
    externalScanTrigger?: number;
}

const EnhancedStrategyGenerator: React.FC<EnhancedStrategyGeneratorProps> = ({ externalScanTrigger }) => {
    const [selectedOpportunity, setSelectedOpportunity] = useState<AIScanOpportunity | null>(null);
    const [parameters, setParameters] = useState<StrategyParameters>(defaultParameters);
    const [isLoadingBot, setIsLoadingBot] = useState(false);
    const [loadSuccess, setLoadSuccess] = useState(false);
    const [scanCount, setScanCount] = useState(0);
    const [isScanning, setIsScanning] = useState(false);
    const [showParams, setShowParams] = useState(false);
    const [nextScanIn, setNextScanIn] = useState(30);

    const store = useStore();
    const dashboard = store?.dashboard;

    const handleScanStart = () => {
        setIsScanning(true);
        setSelectedOpportunity(null);
        setLoadSuccess(false);
    };

    const handleScanComplete = (results: MarketScanResult[]) => {
        setIsScanning(false);
        setNextScanIn(30);
        const best = chooseBestOpportunity(results);
        setSelectedOpportunity(best);
    };

    const refreshScan = React.useCallback(() => {
        if (isScanning) return;
        setScanCount(prev => prev + 1);
    }, [isScanning]);

    const previousExternalScanTrigger = React.useRef<number | undefined>(externalScanTrigger);
    React.useEffect(() => {
        if (externalScanTrigger === undefined || externalScanTrigger === previousExternalScanTrigger.current) return;
        previousExternalScanTrigger.current = externalScanTrigger;
        refreshScan();
    }, [externalScanTrigger, refreshScan]);

    useEffect(() => {
        refreshScan();
        const scanInterval = window.setInterval(() => refreshScan(), 30000);

        const countdownInterval = window.setInterval(() => {
            setNextScanIn(prev => {
                if (prev <= 1) return 30;
                return prev - 1;
            });
        }, 1000);

        return () => {
            window.clearInterval(scanInterval);
            window.clearInterval(countdownInterval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLoadBot = async () => {
        if (!selectedOpportunity) return;
        setIsLoadingBot(true);
        setLoadSuccess(false);
        try {
            const response = await fetch('/bots/FROSTY_ENTRY_LOOP.xml');
            if (!response.ok) throw new Error('Bot file not found');
            const xmlContent = await response.text();
            const injectedXml = getInjectedBotXml(xmlContent, selectedOpportunity, parameters);
            await load({
                block_string: injectedXml,
                file_name: 'FROSTY Entry Loop',
                workspace: (window as unknown as { Blockly?: { derivWorkspace?: unknown } }).Blockly?.derivWorkspace,
                from: save_types.LOCAL,
                drop_event: null,
                strategy_id: null,
                showIncompatibleStrategyDialog: null,
            });
            dashboard?.setActiveTab(1);
            window.location.hash = 'bot_builder';
            setLoadSuccess(true);
            setTimeout(() => setLoadSuccess(false), 4000);
        } catch (error) {
            console.error('Error loading bot:', error);
        }
        setIsLoadingBot(false);
    };

    const maxRiskPerSequence = parameters.stake * Math.pow(parameters.martingaleMultiplier, parameters.martingaleLimit);

    return (
        <div className='p-5 space-y-5'>

            {/* ─── Scan header ─── */}
            <div className='rounded-2xl border bg-[#050d18] p-5' style={{ borderColor: 'rgba(0,212,255,0.18)', boxShadow: '0 0 40px rgba(0,212,255,0.08)' }}>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                    <div className='space-y-1'>
                        <div className='flex items-center gap-2'>
                            <span className='flex h-2 w-2 rounded-full bg-cyan-400' style={{ boxShadow: '0 0 8px rgba(0,212,255,0.8)' }} />
                            <p className='text-[10px] uppercase tracking-[0.22em] text-cyan-400/80 font-semibold'>Live AI Market Scanner</p>
                        </div>
                        <h3 className='text-xl font-bold text-white'>Frosty Entry Loop</h3>
                        <p className='text-xs text-slate-400 max-w-[320px]'>
                            {isScanning
                                ? 'Scanning volatility indices for the strongest Over 1 / Under 8 setup...'
                                : selectedOpportunity
                                ? 'Best setup ready. Load it into the Frosty Entry Loop bot or refresh to rescan.'
                                : 'No strong setup found yet. Refresh to scan again.'}
                        </p>
                        {!isScanning && (
                            <p className='text-[10px] text-slate-600'>Next auto-scan in {nextScanIn}s</p>
                        )}
                    </div>
                    <div className='flex gap-2 flex-shrink-0'>
                        <button
                            type='button'
                            onClick={refreshScan}
                            disabled={isScanning}
                            className='h-10 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-4 text-xs font-bold text-cyan-200 transition hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {isScanning ? (
                                <span className='flex items-center gap-1.5'>
                                    <motion.span
                                        className='inline-block h-3 w-3 rounded-full border-2 border-cyan-400/30 border-t-cyan-300'
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                    />
                                    Scanning...
                                </span>
                            ) : '↻ Refresh Scan'}
                        </button>
                        <button
                            type='button'
                            onClick={handleLoadBot}
                            disabled={!selectedOpportunity || isLoadingBot}
                            className={`h-10 rounded-xl px-4 text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                                loadSuccess
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110'
                            }`}
                        >
                            {isLoadingBot ? 'Loading...' : loadSuccess ? '✓ Loaded!' : '→ Load to Bot'}
                        </button>
                    </div>
                </div>

                {/* Hidden scanner logic */}
                <div className='hidden'>
                    <MarketScanner
                        autoScanOnMount
                        scanTrigger={scanCount}
                        isScanning={isScanning}
                        onScanStart={handleScanStart}
                        onScanComplete={handleScanComplete}
                        showButton={false}
                    />
                </div>

                {/* Scan progress bar */}
                <AnimatePresence>
                    {isScanning && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className='mt-4 overflow-hidden'
                        >
                            <div className='h-1 w-full rounded-full bg-white/8 overflow-hidden'>
                                <motion.div
                                    className='h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-400'
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 2.6, ease: 'easeInOut' }}
                                />
                            </div>
                            <p className='mt-1.5 text-center text-[10px] text-slate-500'>Analyzing volatility markets...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ─── Scan Results ─── */}
                <AnimatePresence>
                    {selectedOpportunity && !isScanning && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3 }}
                            className='mt-5 space-y-3'
                        >
                            {/* 4-column stats */}
                            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                                {[
                                    { label: 'Selected Market', value: selectedOpportunity.market, sub: selectedOpportunity.symbol, color: 'text-white' },
                                    { label: 'Contract Type', value: selectedOpportunity.contractType, sub: selectedOpportunity.direction, color: 'text-cyan-200' },
                                    { label: 'Prediction', value: String(selectedOpportunity.prediction), sub: 'Entry value', color: 'text-white' },
                                    { label: 'Entry Point', value: String(selectedOpportunity.entryPoint), sub: 'Signal level', color: 'text-white' },
                                ].map(item => (
                                    <div key={item.label} className='rounded-xl border border-white/8 bg-[#0b1828]/90 p-3'>
                                        <p className='text-[9px] uppercase tracking-[0.2em] text-slate-500'>{item.label}</p>
                                        <p className={`mt-1.5 text-base font-bold ${item.color}`}>{item.value}</p>
                                        <p className='text-[10px] text-slate-500 mt-0.5'>{item.sub}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Confidence + Risk + Signal */}
                            <div className='grid grid-cols-3 gap-3'>
                                <div className='rounded-xl border border-cyan-500/15 bg-cyan-500/8 p-3'>
                                    <p className='text-[9px] uppercase tracking-[0.2em] text-slate-500'>Confidence</p>
                                    <div className='mt-1.5 flex items-end gap-1'>
                                        <span className='text-xl font-black text-cyan-300' style={{ textShadow: '0 0 12px rgba(0,212,255,0.5)' }}>
                                            {selectedOpportunity.confidence}%
                                        </span>
                                    </div>
                                    <div className='mt-2 h-1 w-full rounded-full bg-white/8 overflow-hidden'>
                                        <motion.div
                                            className='h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-400'
                                            initial={{ width: 0 }}
                                            animate={{ width: `${selectedOpportunity.confidence}%` }}
                                            transition={{ duration: 0.8, delay: 0.2 }}
                                        />
                                    </div>
                                </div>

                                <div className={`rounded-xl border p-3 ${RISK_BG[selectedOpportunity.riskLevel]}`}>
                                    <p className='text-[9px] uppercase tracking-[0.2em] text-slate-500'>Risk Level</p>
                                    <p className={`mt-1.5 text-base font-bold ${RISK_COLORS[selectedOpportunity.riskLevel]}`}>
                                        {selectedOpportunity.riskLevel}
                                    </p>
                                    <p className='text-[10px] text-slate-500 mt-0.5'>
                                        {selectedOpportunity.riskLevel === 'Low' ? 'Safe entry' : selectedOpportunity.riskLevel === 'Medium' ? 'Moderate' : 'Use caution'}
                                    </p>
                                </div>

                                <div className='rounded-xl border border-white/8 bg-[#0b1828]/90 p-3'>
                                    <p className='text-[9px] uppercase tracking-[0.2em] text-slate-500'>Entry Signal</p>
                                    <p className='mt-1.5 text-sm font-semibold text-white leading-tight'>
                                        {selectedOpportunity.entryPoint} on {selectedOpportunity.market.replace(' Index', '')}
                                    </p>
                                    <p className='text-[10px] text-slate-500 mt-0.5'>{selectedOpportunity.entryPoint} signal</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty state */}
                {!selectedOpportunity && !isScanning && (
                    <div className='mt-4 rounded-xl border border-white/8 bg-white/3 p-6 text-center'>
                        <p className='text-sm text-slate-500'>Waiting to identify a high-probability setup.</p>
                        <p className='text-xs text-slate-600 mt-1'>Refresh to scan or wait for the next automatic scan.</p>
                    </div>
                )}
            </div>

            {/* ─── Manual Inputs Toggle ─── */}
            <div className='rounded-2xl border border-white/8 bg-[#070d18] overflow-hidden'>
                <button
                    type='button'
                    onClick={() => setShowParams(v => !v)}
                    className='w-full flex items-center justify-between px-5 py-4 text-left transition hover:bg-white/4'
                >
                    <div>
                        <p className='text-[10px] uppercase tracking-[0.2em] text-slate-500'>Manual Inputs</p>
                        <p className='text-sm font-semibold text-white mt-0.5'>Stake, Stop Loss, Take Profit & Martingale</p>
                    </div>
                    <div className='flex items-center gap-3'>
                        <span className='text-xs text-slate-400'>
                            ${parameters.stake} stake · {parameters.martingaleEnabled ? `${parameters.martingaleMultiplier}x martin` : 'No martin'}
                        </span>
                        <motion.span
                            animate={{ rotate: showParams ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className='text-slate-400 text-sm'
                        >
                            ▾
                        </motion.span>
                    </div>
                </button>

                <AnimatePresence>
                    {showParams && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className='overflow-hidden'
                        >
                            <div className='border-t border-white/8 px-5 pb-5 pt-4'>
                                <p className='text-xs text-slate-500 mb-4'>Keep these settings editable. AI will not override them automatically.</p>
                                <StrategyParametersEditor parameters={parameters} onParametersChange={setParameters} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ─── Risk Summary ─── */}
            <div className='rounded-2xl border border-yellow-500/15 bg-yellow-500/5 p-4'>
                <p className='text-xs font-bold text-yellow-400 mb-3'>⚠️ Risk Summary</p>
                <div className='grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs'>
                    {[
                        { label: 'Max Loss Per Trade', value: `$${parameters.stake}` },
                        { label: 'Daily Stop Loss', value: `$${parameters.stopLoss}` },
                        { label: 'Daily Profit Target', value: `$${parameters.takeProfit}` },
                        ...(parameters.martingaleEnabled
                            ? [
                                { label: 'Martingale Multiplier', value: `${parameters.martingaleMultiplier}x` },
                                { label: 'Max Risk Per Sequence', value: `$${maxRiskPerSequence.toFixed(2)}` },
                              ]
                            : []),
                    ].map(item => (
                        <div key={item.label} className='flex items-center justify-between gap-2'>
                            <span className='text-slate-500'>• {item.label}</span>
                            <span className='text-slate-200 font-semibold'>{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── Load to Bot CTA (bottom) ─── */}
            <AnimatePresence>
                {selectedOpportunity && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className='rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/8 to-blue-600/6 p-5'
                    >
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                            <div className='space-y-1'>
                                <p className='text-xs font-bold text-cyan-300'>🎯 Setup Ready to Deploy</p>
                                <p className='text-sm text-slate-300'>
                                    {selectedOpportunity.contractType} on <span className='text-white font-semibold'>{selectedOpportunity.market}</span>
                                </p>
                                <p className='text-xs text-slate-500'>
                                    {selectedOpportunity.confidence}% confidence · {selectedOpportunity.riskLevel} risk · ${parameters.stake} base stake
                                </p>
                            </div>
                            <button
                                type='button'
                                onClick={handleLoadBot}
                                disabled={isLoadingBot}
                                className={`flex-shrink-0 h-12 rounded-xl px-6 text-sm font-bold transition disabled:opacity-60 disabled:cursor-not-allowed ${
                                    loadSuccess
                                        ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                                        : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110 shadow-[0_0_20px_rgba(0,212,255,0.25)]'
                                }`}
                            >
                                {isLoadingBot ? (
                                    <span className='flex items-center gap-2'>
                                        <motion.span
                                            className='inline-block h-4 w-4 rounded-full border-2 border-slate-800/40 border-t-slate-800'
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                        />
                                        Loading...
                                    </span>
                                ) : loadSuccess ? (
                                    '✓ Bot Loaded!'
                                ) : (
                                    '→ Load to Bot Builder'
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── AI Scan Insights ─── */}
            <div className='rounded-2xl border border-slate-700/50 bg-white/3 p-4'>
                <p className='text-xs font-bold text-cyan-300 mb-3'>AI Scan Insights</p>
                <ul className='space-y-2'>
                    {[
                        'Continuous scanner refreshes every 30 seconds while the panel is open.',
                        'Only one high-probability market is selected at a time.',
                        'The AI prioritizes market stability and avoids weak or unstable entries.',
                        'Only Over 1 or Under 8 setups are considered for Frosty Entry Loop.',
                    ].map((tip, i) => (
                        <li key={i} className='flex gap-2 text-xs text-slate-400'>
                            <span className='text-cyan-500 mt-0.5 flex-shrink-0'>•</span>
                            <span>{tip}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default EnhancedStrategyGenerator;
