import React from 'react';
import { motion } from 'framer-motion';

export interface StrategyParameters {
    stake: number;
    stopLoss: number;
    takeProfit: number;
    martingaleEnabled: boolean;
    martingaleMultiplier: number;
    martingaleLimit: number;
}

interface StrategyParametersEditorProps {
    parameters: StrategyParameters;
    onParametersChange: (params: StrategyParameters) => void;
}

const StrategyParametersEditor: React.FC<StrategyParametersEditorProps> = ({ parameters, onParametersChange }) => {
    const handleChange = (key: keyof StrategyParameters, value: number | boolean) => {
        onParametersChange({
            ...parameters,
            [key]: value,
        });
    };

    return (
        <motion.div className='space-y-4' initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Stake */}
            <div className='space-y-2'>
                <label className='block text-sm font-semibold text-green-400'>💰 Base Stake ($)</label>
                <div className='flex items-center gap-3'>
                    <input
                        type='range'
                        min='1'
                        max='1000'
                        step='5'
                        value={parameters.stake}
                        onChange={e => handleChange('stake', parseFloat(e.target.value))}
                        className='flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500'
                    />
                    <span className='text-sm font-semibold text-green-400 w-16 text-right'>
                        ${parameters.stake.toFixed(2)}
                    </span>
                </div>
                <p className='text-xs text-gray-400'>Recommended: $10 - $100</p>
            </div>

            {/* Stop Loss */}
            <div className='space-y-2'>
                <label className='block text-sm font-semibold text-red-400'>🛑 Stop Loss ($)</label>
                <div className='flex items-center gap-3'>
                    <input
                        type='range'
                        min='10'
                        max='5000'
                        step='10'
                        value={parameters.stopLoss}
                        onChange={e => handleChange('stopLoss', parseFloat(e.target.value))}
                        className='flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500'
                    />
                    <span className='text-sm font-semibold text-red-400 w-16 text-right'>
                        ${parameters.stopLoss.toFixed(2)}
                    </span>
                </div>
                <p className='text-xs text-gray-400'>Stop trading when loss reaches this amount</p>
            </div>

            {/* Take Profit */}
            <div className='space-y-2'>
                <label className='block text-sm font-semibold text-green-400'>📈 Take Profit ($)</label>
                <div className='flex items-center gap-3'>
                    <input
                        type='range'
                        min='10'
                        max='5000'
                        step='10'
                        value={parameters.takeProfit}
                        onChange={e => handleChange('takeProfit', parseFloat(e.target.value))}
                        className='flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500'
                    />
                    <span className='text-sm font-semibold text-green-400 w-16 text-right'>
                        ${parameters.takeProfit.toFixed(2)}
                    </span>
                </div>
                <p className='text-xs text-gray-400'>Stop trading when profit reaches this amount</p>
            </div>

            {/* Martingale Toggle */}
            <div className='space-y-3'>
                <div className='flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg'>
                    <input
                        type='checkbox'
                        id='martingale-toggle'
                        checked={parameters.martingaleEnabled}
                        onChange={e => handleChange('martingaleEnabled', e.target.checked)}
                        className='w-5 h-5 accent-yellow-500 cursor-pointer'
                    />
                    <label
                        htmlFor='martingale-toggle'
                        className='flex-1 text-sm font-semibold text-yellow-400 cursor-pointer'
                    >
                        🔄 Enable Martingale Progression
                    </label>
                </div>

                {parameters.martingaleEnabled && (
                    <motion.div
                        className='space-y-3 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg'
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {/* Martingale Multiplier */}
                        <div className='space-y-2'>
                            <label className='block text-xs font-semibold text-yellow-400'>📊 Multiplier</label>
                            <div className='flex items-center gap-3'>
                                <input
                                    type='range'
                                    min='1'
                                    max='3'
                                    step='0.1'
                                    value={parameters.martingaleMultiplier}
                                    onChange={e => handleChange('martingaleMultiplier', parseFloat(e.target.value))}
                                    className='flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500'
                                />
                                <span className='text-xs font-semibold text-yellow-400 w-12 text-right'>
                                    {parameters.martingaleMultiplier.toFixed(1)}x
                                </span>
                            </div>
                            <p className='text-xs text-gray-400'>2.0x = Double the stake after loss (recommended)</p>
                        </div>

                        {/* Martingale Limit */}
                        <div className='space-y-2'>
                            <label className='block text-xs font-semibold text-yellow-400'>
                                🚫 Max Consecutive Doublings
                            </label>
                            <div className='flex items-center gap-3'>
                                <input
                                    type='range'
                                    min='2'
                                    max='10'
                                    step='1'
                                    value={parameters.martingaleLimit}
                                    onChange={e => handleChange('martingaleLimit', parseFloat(e.target.value))}
                                    className='flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500'
                                />
                                <span className='text-xs font-semibold text-yellow-400 w-12 text-right'>
                                    {parameters.martingaleLimit}
                                </span>
                            </div>
                            <p className='text-xs text-gray-400'>Reset after this many consecutive losses</p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Risk Summary */}
            <motion.div
                className='p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg space-y-2'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <p className='text-xs font-semibold text-yellow-400'>⚠️ Risk Summary</p>
                <div className='space-y-1 text-xs text-gray-400'>
                    <p>• Max Loss Per Trade: ${parameters.stake}</p>
                    <p>• Daily Stop Loss: ${parameters.stopLoss}</p>
                    <p>• Daily Profit Target: ${parameters.takeProfit}</p>
                    {parameters.martingaleEnabled && (
                        <>
                            <p>• Martingale Multiplier: {parameters.martingaleMultiplier}x</p>
                            <p>
                                • Max Risk Per Sequence: $
                                {(
                                    parameters.stake *
                                    Math.pow(parameters.martingaleMultiplier, parameters.martingaleLimit)
                                ).toFixed(2)}
                            </p>
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default StrategyParametersEditor;
