import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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

    return {
        ...result,
        contractType,
        direction,
        prediction,
        entryPoint,
        confidence,
        riskLevel,
    };
};

const chooseBestOpportunity = (results: MarketScanResult[]): AIScanOpportunity | null => {
    if (!results.length) return null;
    const opportunities = results.map(mapToOpportunity);
    const filtered = opportunities.filter(op => op.confidence >= SCAN_CONFIDENCE_THRESHOLD && op.riskLevel !== 'High');
    if (!filtered.length) return null;
    const sorted = filtered.sort((a, b) => getOpportunityScore(b) - getOpportunityScore(a));
    return sorted[0] ?? null;
};

const getInjectedBotXml = (xmlText: string, opportunity: AIScanOpportunity, parameters: StrategyParameters) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

    const setFieldValue = (parent: Element | Document, name: string, value: string) => {
        const field = parent.querySelector(`field[name="${name}"]`);
        if (field) {
            field.textContent = value;
        }
    };

    const marketBlock = xmlDoc.querySelector('block[type="trade_definition_market"]');
    if (marketBlock) {
        setFieldValue(marketBlock, 'MARKET_LIST', 'synthetic_index');
        setFieldValue(marketBlock, 'SUBMARKET_LIST', 'random_index');
        setFieldValue(marketBlock, 'SYMBOL_LIST', opportunity.symbol);
    }

    const contractBlock = xmlDoc.querySelector('block[type="trade_definition_contracttype"]');
    if (contractBlock) {
        setFieldValue(contractBlock, 'TYPE_LIST', opportunity.direction.toLowerCase());
    }

    const tradeTypeBlock = xmlDoc.querySelector('block[type="trade_definition_tradetype"]');
    if (tradeTypeBlock) {
        setFieldValue(tradeTypeBlock, 'TRADETYPE_LIST', 'overunder');
    }

    xmlDoc.querySelectorAll('block[type="variables_set"]').forEach(block => {
        const varField = block.querySelector('field[name="VAR"]');
        const numberField = block.querySelector('block[type="math_number"] field[name="NUM"]');
        if (!varField || !numberField) return;

        const variableName = varField.textContent?.trim();
        if (!variableName) return;

        switch (variableName) {
            case 'PREDICTION':
                numberField.textContent = String(opportunity.prediction);
                break;
            case 'ENTRY_POINT':
                numberField.textContent = String(opportunity.entryPoint);
                break;
            case 'STAKE':
                numberField.textContent = String(parameters.stake);
                break;
            case 'MARTINGALE':
                numberField.textContent = String(parameters.martingaleEnabled ? parameters.martingaleMultiplier : 1);
                break;
            case 'TAKE PROFIT':
                numberField.textContent = String(parameters.takeProfit);
                break;
            case 'STOP LOSS':
                numberField.textContent = String(parameters.stopLoss);
                break;
            default:
                break;
        }
    });

    return new XMLSerializer().serializeToString(xmlDoc);
};

const EnhancedStrategyGenerator: React.FC = () => {
    const [selectedOpportunity, setSelectedOpportunity] = useState<AIScanOpportunity | null>(null);
    const [parameters, setParameters] = useState<StrategyParameters>(defaultParameters);
    const [isLoadingBot, setIsLoadingBot] = useState(false);
    const [scanCount, setScanCount] = useState(0);
    const [isScanning, setIsScanning] = useState(false);
    const [, setScanResults] = useState<MarketScanResult[]>([]);
    const [, setLastScanTimestamp] = useState<number | null>(null);

    const { dashboard } = useStore();

    const handleScanStart = () => {
        setIsScanning(true);
        setSelectedOpportunity(null);
    };

    const handleScanComplete = (results: MarketScanResult[]) => {
        setScanResults(results);
        setIsScanning(false);
        setLastScanTimestamp(Date.now());
        const best = chooseBestOpportunity(results);
        setSelectedOpportunity(best);
    };

    const refreshScan = () => {
        if (isScanning) return;
        setScanCount(prev => prev + 1);
    };

    const getScanMessage = () => {
        if (isScanning) return 'Scanning volatility indices for the strongest Over 1 / Under 8 setup...';
        if (!selectedOpportunity) return 'No strong Frosty Entry Loop setup found yet. Refresh to scan again.';
        return 'Best setup ready. Load it into the Frosty Entry Loop bot or refresh to rescan.';
    };

    const handleLoadBot = async () => {
        if (!selectedOpportunity) return;
        setIsLoadingBot(true);

        try {
            const botFileName = 'FROSTY_ENTRY_LOOP.xml';
            const response = await fetch(`/bots/${botFileName}`);
            if (!response.ok) {
                throw new Error('FROSTY Entry Loop bot file not found');
            }

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

            dashboard.setActiveTab(1);
            window.location.hash = 'bot_builder';

            alert(
                `✅ FROSTY Entry Loop loaded with best volatility setup:\n` +
                    `${selectedOpportunity.market} (${selectedOpportunity.symbol})\n` +
                    `Direction: ${selectedOpportunity.direction}\n` +
                    `Contract: ${selectedOpportunity.contractType}\n` +
                    `Prediction: ${selectedOpportunity.prediction}\n` +
                    `Entry Point: ${selectedOpportunity.entryPoint}\n` +
                    `Confidence: ${selectedOpportunity.confidence}%\n` +
                    `Risk Level: ${selectedOpportunity.riskLevel}\n` +
                    `Stake: $${parameters.stake}\n` +
                    `Stop Loss: $${parameters.stopLoss}\n` +
                    `Take Profit: $${parameters.takeProfit}\n` +
                    `Martingale: ${parameters.martingaleEnabled ? `${parameters.martingaleMultiplier}x (Max ${parameters.martingaleLimit})` : 'Disabled'}`
            );
        } catch (error) {
            console.error('Error loading FROSTY Entry Loop:', error);
            alert('Unable to load FROSTY Entry Loop. See console for details.');
        }

        setIsLoadingBot(false);
    };

    useEffect(() => {
        refreshScan();
        const interval = window.setInterval(() => {
            refreshScan();
        }, 30000);
        return () => window.clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <motion.div
            className='p-6 space-y-6'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
        >
            <div className='rounded-3xl border border-cyan-500/15 bg-[#071014]/95 p-5 shadow-[0_0_30px_rgba(0,212,255,0.12)]'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                        <p className='text-xs uppercase tracking-[0.18em] text-cyan-200/70'>Live AI Market Scanner</p>
                        <h3 className='text-2xl font-semibold text-white'>Frosty Entry Loop Opportunity</h3>
                        <p className='text-sm text-slate-400'>{getScanMessage()}</p>
                    </div>
                    <div className='grid gap-2 sm:grid-cols-2'>
                        <button
                            type='button'
                            onClick={refreshScan}
                            disabled={isScanning}
                            className='rounded-3xl border border-cyan-500/15 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/15 disabled:opacity-60 disabled:cursor-not-allowed'
                        >
                            Refresh Scan
                        </button>
                        <button
                            type='button'
                            onClick={handleLoadBot}
                            disabled={!selectedOpportunity || isLoadingBot}
                            className='rounded-3xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed'
                        >
                            {isLoadingBot ? 'Loading Bot...' : 'Load to Bot'}
                        </button>
                    </div>
                </div>

                <div className='mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]'>
                    <div className='rounded-3xl border border-white/10 bg-slate-950/80 p-4'>
                        <div className='grid gap-4'>
                            <MarketScanner
                                autoScanOnMount
                                scanTrigger={scanCount}
                                isScanning={isScanning}
                                onScanStart={handleScanStart}
                                onScanComplete={handleScanComplete}
                                showButton={false}
                            />
                            {selectedOpportunity ? (
                                <>
                                    <div className='grid gap-3 sm:grid-cols-2'>
                                        <div className='rounded-3xl bg-[#0b1420]/95 p-4 border border-cyan-500/10'>
                                            <p className='text-xs uppercase tracking-[0.18em] text-slate-400'>
                                                Selected Market
                                            </p>
                                            <p className='mt-2 text-lg font-semibold text-white'>
                                                {selectedOpportunity.market}
                                            </p>
                                            <p className='text-sm text-slate-400'>{selectedOpportunity.symbol}</p>
                                        </div>
                                        <div className='rounded-3xl bg-[#0b1420]/95 p-4 border border-cyan-500/10'>
                                            <p className='text-xs uppercase tracking-[0.18em] text-slate-400'>
                                                Contract Type
                                            </p>
                                            <p className='mt-2 text-lg font-semibold text-white'>
                                                {selectedOpportunity.contractType}
                                            </p>
                                            <p className='text-sm text-cyan-200'>{selectedOpportunity.direction}</p>
                                        </div>
                                    </div>
                                    <div className='grid gap-3 sm:grid-cols-3'>
                                        <div className='rounded-3xl bg-[#0b1420]/95 p-4 border border-white/10'>
                                            <p className='text-[10px] uppercase tracking-[0.2em] text-slate-500'>
                                                Prediction
                                            </p>
                                            <p className='mt-2 text-lg font-semibold text-white'>
                                                {selectedOpportunity.prediction}
                                            </p>
                                        </div>
                                        <div className='rounded-3xl bg-[#0b1420]/95 p-4 border border-white/10'>
                                            <p className='text-[10px] uppercase tracking-[0.2em] text-slate-500'>
                                                Entry Point
                                            </p>
                                            <p className='mt-2 text-lg font-semibold text-white'>
                                                {selectedOpportunity.entryPoint}
                                            </p>
                                        </div>
                                        <div className='rounded-3xl bg-[#0b1420]/95 p-4 border border-white/10'>
                                            <p className='text-[10px] uppercase tracking-[0.2em] text-slate-500'>
                                                Confidence
                                            </p>
                                            <p className='mt-2 text-lg font-semibold text-cyan-300'>
                                                {selectedOpportunity.confidence}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className='grid gap-3 sm:grid-cols-2'>
                                        <div className='rounded-3xl bg-[#0b1420]/95 p-4 border border-white/10'>
                                            <p className='text-[10px] uppercase tracking-[0.2em] text-slate-500'>
                                                Risk Level
                                            </p>
                                            <p className='mt-2 text-lg font-semibold text-white'>
                                                {selectedOpportunity.riskLevel}
                                            </p>
                                        </div>
                                        <div className='rounded-3xl bg-[#0b1420]/95 p-4 border border-white/10'>
                                            <p className='text-[10px] uppercase tracking-[0.2em] text-slate-500'>
                                                Entry Signal
                                            </p>
                                            <p className='mt-2 text-sm text-slate-300'>
                                                {selectedOpportunity.entryPoint} on {selectedOpportunity.market}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className='rounded-3xl border border-cyan-500/10 bg-[#0b1420]/95 p-6 text-center text-sm text-slate-400'>
                                    AI is waiting to identify the strongest single volatility setup. Refresh or wait for
                                    the next scan.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className='rounded-3xl border border-white/10 bg-[#071014]/90 p-4'>
                        <p className='text-xs uppercase tracking-[0.18em] text-slate-400'>Manual Inputs</p>
                        <p className='mt-2 text-sm text-slate-300'>
                            Keep these settings editable. AI will not override them automatically.
                        </p>
                        <StrategyParametersEditor parameters={parameters} onParametersChange={setParameters} />
                    </div>
                </div>
            </div>

            <motion.div
                className='p-4 rounded-3xl border border-slate-700 bg-[#0b1420]/80'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <p className='text-sm font-semibold text-cyan-300'>AI Scan Insights</p>
                <ul className='mt-3 space-y-2 text-sm text-slate-400'>
                    <li>• Continuous scanner refreshes every 30 seconds while the panel is open.</li>
                    <li>• Only one high-probability market is selected at a time.</li>
                    <li>• The AI prioritizes market stability and avoids weak or unstable entries.</li>
                    <li>• Only Over 1 or Under 8 setups are considered for Frosty Entry Loop.</li>
                </ul>
            </motion.div>
        </motion.div>
    );
};

export default EnhancedStrategyGenerator;
