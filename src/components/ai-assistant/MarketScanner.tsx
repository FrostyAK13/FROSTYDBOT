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
    autoScanOnMount?: boolean;
    scanTrigger?: number;
    onScanStart?: () => void;
    showButton?: boolean;
}

// Mock market data - volatility indices only
const AVAILABLE_MARKETS = [
    { symbol: '1HZ100V', displayName: 'Volatility 100 Index', volatility: 'High' as const },
    { symbol: '1HZ50V', displayName: 'Volatility 50 Index', volatility: 'High' as const },
    { symbol: '1HZ25V', displayName: 'Volatility 25 Index', volatility: 'Medium' as const },
    { symbol: '1HZ10V', displayName: 'Volatility 10 Index', volatility: 'Medium' as const },
    { symbol: '1HZ5V', displayName: 'Volatility 5 Index', volatility: 'Low' as const },
    { symbol: '1HZ3V', displayName: 'Volatility 3 Index', volatility: 'Low' as const },
];

const ENTRY_POINT_PATTERNS = ['Support Bounce', 'Breakout', 'Mean Reversion', 'Momentum Shift', 'Range Flip'];

export const MarketScanner: React.FC<MarketScannerProps> = ({
    onScanComplete,
    isScanning = false,
    autoScanOnMount = false,
    scanTrigger,
    onScanStart,
    showButton = true,
}) => {
    const [isScanning_local, setIsScanning] = useState(isScanning);
    const [scanProgress, setScanProgress] = useState(0);
    const previousTriggerRef = React.useRef<number | undefined>(scanTrigger);

    const handleScan = async () => {
        if (isScanning_local) return;
        setIsScanning(true);
        setScanProgress(0);
        onScanStart?.();

        const scanInterval = setInterval(() => {
            setScanProgress(prev => Math.min(prev + 10, 90));
        }, 300);

        await new Promise(resolve => setTimeout(resolve, 2600));
        clearInterval(scanInterval);

        const results: MarketScanResult[] = AVAILABLE_MARKETS.map((market, index) => ({
            symbol: market.symbol,
            market: market.displayName,
            displayName: market.displayName,
            tradeTypes: ['Over 1', 'Under 8'],
            entryPoint: ENTRY_POINT_PATTERNS[index % ENTRY_POINT_PATTERNS.length],
            volatility: market.volatility,
            timestamp: Date.now(),
        }));

        setScanProgress(100);
        onScanComplete(results);
        setIsScanning(false);
    };

    React.useEffect(() => {
        if (autoScanOnMount) {
            handleScan();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoScanOnMount]);

    React.useEffect(() => {
        if (scanTrigger === undefined || scanTrigger === previousTriggerRef.current) return;
        previousTriggerRef.current = scanTrigger;
        handleScan();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scanTrigger]);

    const shouldShowButton = typeof showButton === 'undefined' ? true : showButton;

    return (
        <div className='space-y-4'>
            {shouldShowButton && (
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
                        <>🔍 Scan Volatility Indices</>
                    )}
                </motion.button>
            )}

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
                    <p className='text-xs text-gray-400 text-center'>
                        Analyzing {scanProgress}% of volatility markets...
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default MarketScanner;
