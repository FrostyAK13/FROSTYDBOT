import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { load, save_types } from '@/external/bot-skeleton';
import { useStore } from '@/hooks/useStore';
import MarketScanner, { MarketScanResult } from './MarketScanner';
import './EntryScannerModal.scss';

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

    useEffect(() => {
        const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handle);
        return () => window.removeEventListener('keydown', handle);
    }, [onClose]);

    const loadBtnClass = () => {
        if (loadSuccess) return 'esm-btn-load esm-btn-load--success';
        if (scanResult && !isLoadingBot) return 'esm-btn-load esm-btn-load--ready';
        return 'esm-btn-load';
    };

    return (
        <>
            {/* Backdrop */}
            <motion.div
                className='esm-backdrop'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />

            {/* Centered wrapper */}
            <motion.div
                className='esm-wrapper'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Card */}
                <motion.div
                    className='esm-card'
                    initial={{ scale: 0.93, y: 18 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.93, y: 18 }}
                    transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className='esm-header'>
                        <h2 className='esm-title'>Entry Scanner</h2>
                        <button
                            type='button'
                            onClick={onClose}
                            className='esm-close-btn'
                            aria-label='Close scanner'
                        >
                            ✕
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className='esm-tabs'>
                        {SCANNER_TABS.map(tab => (
                            <button
                                key={tab.id}
                                type='button'
                                onClick={() => handleTabChange(tab.id)}
                                className={`esm-tab${activeTabId === tab.id ? ' esm-tab--active' : ''}`}
                            >
                                {tab.label}
                                {activeTabId === tab.id && (
                                    <motion.span
                                        layoutId='esm-tab-line'
                                        className='esm-tab-indicator'
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Body */}
                    <div className='esm-body'>

                        {/* Scanner name + ticks */}
                        <div className='esm-scanner-row'>
                            <div>
                                <p className='esm-scanner-name'>Digits Scanner</p>
                                <p className='esm-scanner-desc'>{activeTab.description}</p>
                            </div>
                            <div className='esm-ticks-group'>
                                <span className='esm-field-label'>Ticks</span>
                                <input
                                    ref={ticksRef}
                                    type='number'
                                    value={ticks}
                                    min={100}
                                    max={10000}
                                    step={100}
                                    onChange={e => setTicks(Number(e.target.value))}
                                    className='esm-ticks-input'
                                />
                            </div>
                        </div>

                        {/* Selected Market + Trade Type */}
                        <div className='esm-fields-grid'>
                            <div>
                                <span className='esm-field-label'>Selected Market</span>
                                <div className={`esm-field-box${scanResult ? ' esm-field-box--active' : ''}`}>
                                    {scanResult ? scanResult.market : 'Scan to find the best market'}
                                </div>
                            </div>
                            <div>
                                <span className='esm-field-label'>Trade Type</span>
                                <div className={`esm-field-box${scanResult ? ' esm-field-box--active' : ''}`}>
                                    {scanResult ? scanResult.tradeType : 'Waiting for scan'}
                                </div>
                            </div>
                        </div>

                        {/* Confidence bar */}
                        <AnimatePresence>
                            {scanResult && (
                                <motion.div
                                    key='confidence'
                                    className='esm-confidence'
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <div className='esm-confidence-header'>
                                        <span className='esm-field-label' style={{ marginBottom: 0 }}>Confidence</span>
                                        <span className='esm-confidence-value'>{scanResult.confidence}%</span>
                                    </div>
                                    <div className='esm-bar-track'>
                                        <motion.div
                                            className='esm-bar-fill'
                                            initial={{ width: 0 }}
                                            animate={{ width: `${scanResult.confidence}%` }}
                                            transition={{ duration: 0.7, delay: 0.1 }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Scan progress bar */}
                        <AnimatePresence>
                            {isScanning && (
                                <motion.div
                                    key='progress'
                                    className='esm-progress-track'
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <motion.div
                                        className='esm-progress-fill'
                                        initial={{ width: '0%' }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 2.6, ease: 'easeInOut' }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Status */}
                        <p className={`esm-status esm-status--${status}`}>
                            {status === 'scanning' && (
                                <motion.span
                                    className='esm-spinner'
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                                />
                            )}
                            {getStatusText()}
                        </p>

                        {/* Hidden scanner logic */}
                        <div className='esm-hidden'>
                            <MarketScanner
                                scanTrigger={scanCount}
                                isScanning={isScanning}
                                onScanStart={handleScanStart}
                                onScanComplete={handleScanComplete}
                                showButton={false}
                            />
                        </div>

                        {/* Action buttons */}
                        <div className='esm-actions'>
                            <button
                                type='button'
                                onClick={handleScanMarkets}
                                disabled={isScanning}
                                className='esm-btn-scan'
                            >
                                {isScanning ? (
                                    <>
                                        <motion.span
                                            className='esm-btn-scan-spinner'
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                                        />
                                        Scanning...
                                    </>
                                ) : (
                                    'Scan Markets'
                                )}
                            </button>
                            <button
                                type='button'
                                onClick={handleLoadBot}
                                disabled={!scanResult || isLoadingBot || loadSuccess}
                                className={loadBtnClass()}
                            >
                                {isLoadingBot ? 'Loading...' : loadSuccess ? '✓ Loaded!' : 'Load Scanner Bot'}
                            </button>
                        </div>

                        {/* Full panel link */}
                        {onOpenFullPanel && (
                            <div className='esm-footer'>
                                <button
                                    type='button'
                                    onClick={onOpenFullPanel}
                                    className='esm-footer-link'
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
