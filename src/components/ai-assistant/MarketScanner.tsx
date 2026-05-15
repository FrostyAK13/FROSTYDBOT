import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface MarketScanResult {
    symbol: string;
    market: string;
    displayName: string;
    tradeTypes: string[];
    entryPoint: string;
    volatility: 'Low' | 'Medium' | 'High';
    timestamp: number;
}

interface MarketScannerProps {
    onScanComplete: (results: MarketScanResult[]) => void;
    isScanning?: boolean;
}

// Mock market data - in production, this would come from Deriv API
const AVAILABLE_MARKETS = [
    { symbol: 'EURUSD', displayName: 'EUR/USD', volatility: 'Medium' as const },
    { symbol: 'GBPUSD', displayName: 'GBP/USD', volatility: 'High' as const },
    { symbol: 'USDJPY', displayName: 'USD/JPY', volatility: 'Low' as const },
    { symbol: 'AUDUSD', displayName: 'AUD/USD', volatility: 'Medium' as const },
    { symbol: 'NZDUSD', displayName: 'NZD/USD', volatility: 'Low' as const },
    { symbol: 'USDCAD', displayName: 'USD/CAD', volatility: 'Medium' as const },
    { symbol: 'GOLD', displayName: 'Gold/USD', volatility: 'High' as const },
    { symbol: 'OIL', displayName: 'Crude Oil', volatility: 'High' as const },
    { symbol: 'BTC', displayName: 'Bitcoin', volatility: 'High' as const },
    { symbol: 'ETH', displayName: 'Ethereum', volatility: 'High' as const },
    { symbol: 'SPX500', displayName: 'S&P 500', volatility: 'Medium' as const },
    { symbol: 'DAX', displayName: 'DAX 40', volatility: 'Medium' as const },
];

const ENTRY_POINT_PATTERNS = ['Golden Cross', 'Support Bounce', 'Breakout', 'Resistance Break', 'Mean Reversion'];

export const MarketScanner: React.FC<MarketScannerProps> = ({ onScanComplete, isScanning = false }) => {
    const [isScanning_local, setIsScanning] = useState(isScanning);
    const [scanProgress, setScanProgress] = useState(0);

    const handleScan = async () => {
        setIsScanning(true);
        setScanProgress(0);

        // Simulate market scanning
        const scanInterval = setInterval(() => {
            setScanProgress(prev => Math.min(prev + 10, 90));
        }, 300);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        clearInterval(scanInterval);

        // Generate mock results - identify markets suitable for Over/Under trades
        const results: MarketScanResult[] = AVAILABLE_MARKETS.map((market, index) => ({
            symbol: market.symbol,
            market: market.displayName,
            displayName: market.displayName,
            tradeTypes: ['Over 1', 'Under 8'], // Most markets can trade these
            entryPoint: ENTRY_POINT_PATTERNS[index % ENTRY_POINT_PATTERNS.length],
            volatility: market.volatility,
            timestamp: Date.now(),
        })).filter((_, index) => index < 6); // Return top 6 markets for trading

        setScanProgress(100);
        onScanComplete(results);
        setIsScanning(false);
    };

    return (
        <div className='space-y-4'>
            <motion.button
                onClick={handleScan}
                disabled={isScanning_local}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='w-full py-3 px-4 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-gray-950 hover:from-blue-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2'
            >
                {isScanning_local ? (
                    <>
                        <motion.div
                            className='w-4 h-4 border-2 border-gray-950/30 border-t-gray-950 rounded-full'
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                        Scanning Markets...
                    </>
                ) : (
                    <>🔍 Scan All Markets</>
                )}
            </motion.button>

            {isScanning_local && (
                <motion.div className='space-y-2' initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className='h-2 bg-gray-700/50 rounded-full overflow-hidden'>
                        <motion.div
                            className='h-full bg-gradient-to-r from-blue-500 to-cyan-500'
                            initial={{ width: 0 }}
                            animate={{ width: `${scanProgress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <p className='text-xs text-gray-400 text-center'>Analyzing {scanProgress}% of markets...</p>
                </motion.div>
            )}
        </div>
    );
};

export default MarketScanner;
