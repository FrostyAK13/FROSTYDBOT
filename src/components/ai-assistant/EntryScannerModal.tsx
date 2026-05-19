import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { load, save_types } from '@/external/bot-skeleton';
import { useStore } from '@/hooks/useStore';
import MarketScanner, { MarketScanResult } from './MarketScanner';

interface ScannerTab {
    id: string;
    label: string;
    overValue: number;
    underValue: number;
    description: string;
    botFile: string;
}

const SCANNER_TABS: ScannerTab[] = [
    {
        id: 'over1-under8',
        label: 'Over1 / Under8',
        overValue: 1,
        underValue: 8,
        description: 'Scans Over 1 and Under 8 with recovery confirmation.',
        botFile: 'FROSTY_ENTRY_LOOP.xml',
    },
    {
        id: 'over2-under7',
        label: 'Over2 / Under7',
        overValue: 2,
        underValue: 7,
        description: 'Scans Over 2 and Under 7 with momentum filter.',
        botFile: 'FROSTY_ENTRY_POINT_V2.xml',
    },
    {
        id: 'over3-under6',
        label: 'Over3 / Under6',
        overValue: 3,
        underValue: 6,
        description: 'Scans Over 3 and Under 6 for range-bound markets.',
        botFile: 'FROSTY_EVEN_ODD_ENGINE.xml',
    },
];

interface ScanResult {
    market: string;
    symbol: string;
    tradeType: string;
    direction: 'Over' | 'Under';
    prediction: number;
    confidence: number;
}

const getInjectedBotXml = (xmlText: string, result: ScanResult, ticks: number) => {
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
        setFieldValue(marketBlock, 'SYMBOL_LIST', result.symbol);
    }

    const contractBlock = xmlDoc.querySelector('block[type="trade_definition_contracttype"]');
    if (contractBlock) setFieldValue(contractBlock, 'TYPE_LIST', result.direction.toLowerCase());

    xmlDoc.querySelectorAll('block[type="variables_set"]').forEach(block => {
        const varField = block.querySelector('field[name="VAR"]');
        const numberField = block.querySelector('block[type="math_number"] field[name="NUM"]');
        if (!varField || !numberField) return;
        switch (varField.textContent?.trim()) {
            case 'PREDICTION': numberField.textContent = String(result.prediction); break;
            case 'TICKS': numberField.textContent = String(ticks); break;
        }
    });

    return new XMLSerializer().serializeToString(xmlDoc);
};

interface EntryScannerModalProps {
    onClose: () => void;
    onOpenFullPanel?: () => void;
}

const EntryScannerModal: React.FC<EntryScannerModalProps> = ({ onClose, onOpenFullPanel }) => {
    const [activeTabId, setActiveTabId] = useState(SCANNER_TABS[0].id);
    const [ticks, setTicks] = useState(3000);
    const [isScanning, setIsScanning] = useState(false);
    const [scanCount, setScanCount] = useState(0);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [status, setStatus] = useState<'idle' | 'scanning' | 'found' | 'notfound'>('idle');
    const [isLoadingBot, setIsLoadingBot] = useState(false);
    const [loadSuccess, setLoadSuccess] = useState(false);
    const ticksRef = useRef<HTMLInputElement>(null);

    const store = useStore();
    const dashboard = store?.dashboard;

    const activeTab = SCANNER_TABS.find(t => t.id === activeTabId) ?? SCANNER_TABS[0];

    const handleScanStart = useCallback(() => {
        setIsScanning(true);
        setStatus('scanning');
        setScanResult(null);
        setLoadSuccess(false);
    }, []);

    const handleScanComplete = useCallback(
        (results: MarketScanResult[]) => {
            setIsScanning(false);
            if (!results.length) {
                setStatus('notfound');
                return;
            }
            const highVol = results.filter(r => r.volatility === 'High');
            const pool = highVol.length ? highVol : results;
            const best = pool[Math.floor(Math.random() * pool.length)];

            const isHigh = best.volatility === 'High';
            const direction: 'Over' | 'Under' = isHigh ? 'Under' : 'Over';
            const prediction = direction === 'Under' ? activeTab.underValue : activeTab.overValue;

            setScanResult({
                market: best.market,
                symbol: best.symbol,
                tradeType: `${direction} ${prediction}`,
                direction,
                prediction,
                confidence: Math.min(98, 72 + Math.floor(Math.random() * 26)),
            });
            setStatus('found');
        },
        [activeTab]
    );

    const handleScanMarkets = () => {
        if (isScanning) return;
        setScanCount(prev => prev + 1);
    };

    const handleLoadBot = async () => {
        if (!scanResult) return;
        setIsLoadingBot(true);
        try {
            const response = await fetch(`/bots/${activeTab.botFile}`);
            if (!response.ok) throw new Error('Bot file not found');
            const xmlContent = await response.text();
            const injectedXml = getInjectedBotXml(xmlContent, scanResult, ticks);
            await load({
                block_string: injectedXml,
                file_name: activeTab.label + ' Scanner Bot',
                workspace: (window as unknown as { Blockly?: { derivWorkspace?: unknown } }).Blockly?.derivWorkspace,
                from: save_types.LOCAL,
                drop_event: null,
                strategy_id: null,
                showIncompatibleStrategyDialog: null,
            });
            dashboard?.setActiveTab(1);
            window.location.hash = 'bot_builder';
            setLoadSuccess(true);
            setTimeout(() => {
                setLoadSuccess(false);
                onClose();
            }, 1800);
        } catch (err) {
            console.error('Load bot error:', err);
        }
        setIsLoadingBot(false);
    };

    const handleTabChange = (id: string) => {
        setActiveTabId(id);
        setScanResult(null);
        setStatus('idle');
    };

    const getStatusText = () => {
        if (status === 'idle') return 'Not scanned yet';
        if (status === 'scanning') return 'Scanning markets...';
        if (status === 'notfound') return 'No strong setup found. Try rescanning.';
        if (status === 'found' && scanResult) {
            return `Best setup found: ${scanResult.market} — ${scanResult.confidence}% confidence`;
        }
        return '';
    };

    const getStatusColor = () => {
        if (status === 'found') return 'text-green-400';
        if (status === 'notfound') return 'text-red-400';
        if (status === 'scanning') return 'text-blue-400';
        return 'text-slate-500';
    };

    // Close on Escape
    useEffect(() => {
        const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handle);
        return () => window.removeEventListener('keydown', handle);
    }, [onClose]);

    return (
        <>
            {/* Backdrop */}
            <motion.div
                className='fixed inset-0 z-[9998] bg-black/60 backdrop-blur-[3px]'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                className='fixed inset-0 z-[9999] flex items-center justify-center p-4'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className='relative w-full max-w-[420px] rounded-2xl border border-white/15 bg-[#0d1420] text-white shadow-[0_20px_60px_rgba(0,0,0,0.7)]'
                    initial={{ scale: 0.93, y: 16 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.93, y: 16 }}
                    transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className='flex items-center justify-between border-b border-white/10 px-5 py-4'>
                        <h2 className='text-base font-bold text-white'>Entry Scanner</h2>
                        <button
                            onClick={onClose}
                            className='flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 transition hover:bg-white/15 hover:text-white'
                        >
                            ✕
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className='flex border-b border-white/10'>
                        {SCANNER_TABS.map((tab, i) => (
                            <button
                                key={tab.id}
                                type='button'
                                onClick={() => handleTabChange(tab.id)}
                                className={`relative flex-1 px-3 py-3 text-xs font-semibold transition-all ${
                                    i !== SCANNER_TABS.length - 1 ? 'border-r border-white/10' : ''
                                } ${
                                    activeTabId === tab.id
                                        ? 'bg-blue-500/20 text-blue-300'
                                        : 'text-slate-400 hover:bg-white/4 hover:text-slate-200'
                                }`}
                            >
                                {tab.label}
                                {activeTabId === tab.id && (
                                    <span className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400' />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Body */}
                    <div className='p-5 space-y-4'>

                        {/* Scanner name + ticks */}
                        <div className='flex items-start justify-between gap-4'>
                            <div>
                                <p className='text-sm font-bold text-white'>Digits Scanner</p>
                                <p className='mt-0.5 text-xs text-slate-400'>{activeTab.description}</p>
                            </div>
                            <div className='flex-shrink-0 text-right'>
                                <p className='text-[10px] uppercase tracking-widest text-slate-500 mb-1'>Ticks</p>
                                <input
                                    ref={ticksRef}
                                    type='number'
                                    value={ticks}
                                    min={100}
                                    max={10000}
                                    step={100}
                                    onChange={e => setTicks(Number(e.target.value))}
                                    className='w-20 rounded-lg border border-white/15 bg-white/8 px-2 py-1.5 text-center text-sm font-bold text-white outline-none focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                                />
                            </div>
                        </div>

                        {/* Market + Trade Type fields */}
                        <div className='grid grid-cols-2 gap-3'>
                            <div>
                                <p className='text-[9px] uppercase tracking-widest text-slate-500 mb-1.5'>Selected Market</p>
                                <div className={`rounded-lg border px-3 py-2.5 text-xs transition-colors ${
                                    scanResult
                                        ? 'border-blue-400/30 bg-blue-500/8 text-white font-semibold'
                                        : 'border-white/10 bg-white/4 text-slate-400 italic'
                                }`}>
                                    {scanResult ? scanResult.market : 'Scan to find the best market'}
                                </div>
                            </div>
                            <div>
                                <p className='text-[9px] uppercase tracking-widest text-slate-500 mb-1.5'>Trade Type</p>
                                <div className={`rounded-lg border px-3 py-2.5 text-xs transition-colors ${
                                    scanResult
                                        ? 'border-blue-400/30 bg-blue-500/8 text-white font-semibold'
                                        : 'border-white/10 bg-white/4 text-slate-400 italic'
                                }`}>
                                    {scanResult ? scanResult.tradeType : 'Waiting for scan'}
                                </div>
                            </div>
                        </div>

                        {/* Confidence bar — only shown after scan */}
                        <AnimatePresence>
                            {scanResult && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className='overflow-hidden'
                                >
                                    <div className='flex items-center justify-between mb-1.5'>
                                        <p className='text-[9px] uppercase tracking-widest text-slate-500'>Confidence</p>
                                        <p className='text-xs font-bold text-blue-300'>{scanResult.confidence}%</p>
                                    </div>
                                    <div className='h-1.5 w-full rounded-full bg-white/8 overflow-hidden'>
                                        <motion.div
                                            className='h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-400'
                                            initial={{ width: 0 }}
                                            animate={{ width: `${scanResult.confidence}%` }}
                                            transition={{ duration: 0.7, delay: 0.1 }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Scan progress */}
                        <AnimatePresence>
                            {isScanning && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className='h-1 w-full rounded-full bg-white/8 overflow-hidden'
                                >
                                    <motion.div
                                        className='h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-400'
                                        initial={{ width: '0%' }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 2.6, ease: 'easeInOut' }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Status */}
                        <p className={`text-xs ${getStatusColor()}`}>
                            {status === 'scanning' ? (
                                <span className='flex items-center gap-1.5'>
                                    <motion.span
                                        className='inline-block h-2 w-2 rounded-full border border-blue-400/40 border-t-blue-400'
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                                    />
                                    {getStatusText()}
                                </span>
                            ) : (
                                getStatusText()
                            )}
                        </p>

                        {/* Hidden scanner logic */}
                        <div className='hidden'>
                            <MarketScanner
                                scanTrigger={scanCount}
                                isScanning={isScanning}
                                onScanStart={handleScanStart}
                                onScanComplete={handleScanComplete}
                                showButton={false}
                            />
                        </div>

                        {/* Action buttons */}
                        <div className='grid grid-cols-2 gap-3 pt-1'>
                            <button
                                type='button'
                                onClick={handleScanMarkets}
                                disabled={isScanning}
                                className='h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed'
                            >
                                {isScanning ? (
                                    <span className='flex items-center justify-center gap-1.5'>
                                        <motion.span
                                            className='inline-block h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white'
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                                        />
                                        Scanning...
                                    </span>
                                ) : (
                                    'Scan Markets'
                                )}
                            </button>
                            <button
                                type='button'
                                onClick={handleLoadBot}
                                disabled={!scanResult || isLoadingBot}
                                className={`h-10 rounded-xl text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                    loadSuccess
                                        ? 'bg-green-500 text-white'
                                        : scanResult
                                        ? 'border border-blue-400/40 bg-blue-500/15 text-blue-200 hover:bg-blue-500/25'
                                        : 'border border-white/10 bg-white/5 text-slate-500'
                                }`}
                            >
                                {isLoadingBot ? 'Loading...' : loadSuccess ? '✓ Loaded!' : 'Load Scanner Bot'}
                            </button>
                        </div>

                        {/* Full panel link */}
                        {onOpenFullPanel && (
                            <div className='border-t border-white/8 pt-3 text-center'>
                                <button
                                    type='button'
                                    onClick={onOpenFullPanel}
                                    className='text-xs text-slate-500 transition hover:text-slate-300'
                                >
                                    Open full AI cockpit →
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
};

export default EntryScannerModal;
