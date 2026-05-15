import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { load, save_types } from '@/external/bot-skeleton';
import { useStore } from '@/hooks/useStore';
import MarketScanner, { MarketScanResult } from './MarketScanner';
import StrategyParametersEditor, { StrategyParameters } from './StrategyParametersEditor';

const EnhancedStrategyGenerator: React.FC = () => {
    const [scanResults, setScanResults] = useState<MarketScanResult[]>([]);
    const [selectedMarket, setSelectedMarket] = useState<MarketScanResult | null>(null);
    const [contractDirection, setContractDirection] = useState<'Over' | 'Under'>('Over');
    const [prediction, setPrediction] = useState('');
    const [isLoadingBot, setIsLoadingBot] = useState(false);
    const [parameters, setParameters] = useState<StrategyParameters>({
        stake: 10,
        stopLoss: 500,
        takeProfit: 200,
        martingaleEnabled: true,
        martingaleMultiplier: 2,
        martingaleLimit: 4,
    });

    const { dashboard } = useStore();

    const handleScanComplete = (results: MarketScanResult[]) => {
        setScanResults(results);
        if (results.length > 0) {
            const best = results.reduce((winner, market) => {
                const rank = { High: 3, Medium: 2, Low: 1 } as const;
                return rank[market.volatility] > rank[winner.volatility] ? market : winner;
            }, results[0]);
            setSelectedMarket(best);
            const direction = best.volatility === 'Low' ? 'Under' : 'Over';
            setContractDirection(direction);
            setPrediction(`AI predicts a ${direction} entry on ${best.market} using ${best.entryPoint}.`);
        }
    };

    const handleLoadBot = async () => {
        if (!selectedMarket) return;
        setIsLoadingBot(true);

        try {
            const botFileName = 'FROSTY_DOMINATOR.xml';
            const response = await fetch(`/bots/${botFileName}`);
            if (!response.ok) {
                throw new Error('Frosty Dominator bot file not found');
            }

            const xmlContent = await response.text();

            await load({
                block_string: xmlContent,
                file_name: 'FROSTY Dominator',
                workspace: (window as unknown as { Blockly?: { derivWorkspace?: unknown } }).Blockly?.derivWorkspace,
                from: save_types.LOCAL,
                drop_event: null,
                strategy_id: null,
                showIncompatibleStrategyDialog: null,
            });

            dashboard.setActiveTab(1);
            window.location.hash = 'bot_builder';

            alert(
                `✅ Frosty Dominator loaded with the best market:\n` +
                    `${selectedMarket.market} (${selectedMarket.symbol})\n` +
                    `Prediction: ${contractDirection}\n` +
                    `Entry: ${selectedMarket.entryPoint}\n` +
                    `Stake: $${parameters.stake}\n` +
                    `Stop Loss: $${parameters.stopLoss}\n` +
                    `Take Profit: $${parameters.takeProfit}\n` +
                    `Martingale: ${parameters.martingaleEnabled ? `${parameters.martingaleMultiplier}x (Max ${parameters.martingaleLimit})` : 'Disabled'}`
            );
        } catch (error) {
            console.error('Error loading Frosty Dominator:', error);
            alert('Unable to load Frosty Dominator. Check console for details.');
        }

        setIsLoadingBot(false);
    };

    return (
        <motion.div
            className='p-6 space-y-6'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
        >
            {/* Market Scanner Section */}
            <div className='space-y-3'>
                <p className='text-sm font-semibold text-blue-400'>🔍 Step 1: Scan Markets</p>
                <MarketScanner onScanComplete={handleScanComplete} />
            </div>

            {/* Scan Results */}
            <AnimatePresence>
                {scanResults.length > 0 && (
                    <motion.div
                        className='space-y-3'
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <p className='text-sm font-semibold text-green-400'>📊 Step 2: Select Market</p>
                        <div className='grid gap-2'>
                            {scanResults.map((result, index) => (
                                <motion.button
                                    key={result.symbol}
                                    onClick={() => setSelectedMarket(result)}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                                        selectedMarket?.symbol === result.symbol
                                            ? 'border-green-500 bg-green-500/10'
                                            : 'border-gray-600 bg-gray-800/30 hover:border-green-500/50'
                                    }`}
                                >
                                    <div className='flex items-center justify-between'>
                                        <div className='flex-1'>
                                            <p className='font-semibold text-green-400'>{result.market}</p>
                                            <p className='text-xs text-gray-400'>
                                                Entry: {result.entryPoint} | Volatility: {result.volatility}
                                            </p>
                                            <div className='flex gap-1 mt-2'>
                                                {result.tradeTypes.map(type => (
                                                    <span
                                                        key={type}
                                                        className='text-xs px-2 py-1 bg-gray-700/50 text-gray-300 rounded'
                                                    >
                                                        {type}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {selectedMarket?.symbol === result.symbol && (
                                            <span className='text-green-400 text-lg'>✓</span>
                                        )}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Strategy Parameters Editor */}
            <AnimatePresence>
                {scanResults.length > 0 && (
                    <motion.div
                        className='space-y-3'
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {selectedMarket && (
                            <div className='rounded-3xl border border-green-500/15 bg-slate-950/80 p-4'>
                                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                                    <div className='space-y-1'>
                                        <p className='text-xs uppercase tracking-[0.18em] text-slate-400'>
                                            Best Market
                                        </p>
                                        <h3 className='text-lg font-semibold text-white'>{selectedMarket.market}</h3>
                                        <p className='text-sm text-slate-300'>{prediction}</p>
                                    </div>
                                    <div className='grid gap-2 sm:grid-cols-3'>
                                        <div className='rounded-2xl bg-[#071014]/90 px-3 py-2 text-xs text-slate-300 border border-white/10'>
                                            <p className='text-[10px] uppercase tracking-[0.2em] text-slate-500'>
                                                Entry
                                            </p>
                                            <p className='mt-2 font-semibold text-white'>{selectedMarket.entryPoint}</p>
                                        </div>
                                        <div className='rounded-2xl bg-[#071014]/90 px-3 py-2 text-xs text-slate-300 border border-white/10'>
                                            <p className='text-[10px] uppercase tracking-[0.2em] text-slate-500'>
                                                Direction
                                            </p>
                                            <p className='mt-2 font-semibold text-green-300'>{contractDirection}</p>
                                        </div>
                                        <div className='rounded-2xl bg-[#071014]/90 px-3 py-2 text-xs text-slate-300 border border-white/10'>
                                            <p className='text-[10px] uppercase tracking-[0.2em] text-slate-500'>
                                                Volatility
                                            </p>
                                            <p className='mt-2 font-semibold text-slate-100'>
                                                {selectedMarket.volatility}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <p className='text-sm font-semibold text-yellow-400'>⚙️ Step 3: Configure Parameters</p>
                        <StrategyParametersEditor parameters={parameters} onParametersChange={setParameters} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Load Bot Button */}
            <AnimatePresence>
                {selectedMarket && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <motion.button
                            onClick={handleLoadBot}
                            disabled={isLoadingBot || !selectedMarket}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className='w-full py-3 px-4 rounded-lg font-semibold bg-gradient-to-r from-green-500 to-yellow-500 text-gray-950 hover:from-green-400 hover:to-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2'
                        >
                            {isLoadingBot ? (
                                <>
                                    <motion.div
                                        className='w-4 h-4 border-2 border-gray-950/30 border-t-gray-950 rounded-full'
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    />
                                    Loading FROSTY Dominator...
                                </>
                            ) : (
                                <>🤖 Load FROSTY Dominator Bot</>
                            )}
                        </motion.button>
                        <p className='text-xs text-gray-400 text-center mt-2'>
                            This will load the FROSTY Dominator bot with your configured market and parameters
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Info Box */}
            <motion.div
                className='p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg space-y-2'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <p className='text-sm font-semibold text-blue-400'>ℹ️ How It Works</p>
                <ul className='text-xs text-gray-400 space-y-1'>
                    <li>1️⃣ Click &quot;Scan All Markets&quot; to find tradeable Over/Under markets</li>
                    <li>2️⃣ Select the market with the best entry point</li>
                    <li>3️⃣ Configure your stake, stop loss, take profit, and martingale settings</li>
                    <li>4️⃣ Click &quot;Load Bot&quot; to inject the FROSTY Dominator with your parameters</li>
                    <li>5️⃣ The bot will auto-detect market changes and adjust accordingly</li>
                </ul>
            </motion.div>
        </motion.div>
    );
};

export default EnhancedStrategyGenerator;
