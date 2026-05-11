import { observer } from 'mobx-react-lite';
import './market-analyzer.scss';

const MarketAnalyzer = observer(() => {
    return (
        <div className='market-analyzer'>
            <div className='market-analyzer__header'>
                <div className='market-analyzer__logo'>
                    <span className='market-analyzer__logo-icon'>&#10052;</span>
                </div>
                <h1 className='market-analyzer__title'>FROSTY Market Analyzer</h1>
                <p className='market-analyzer__subtitle'>
                    Advanced market analysis tools for professional traders
                </p>
            </div>

            <div className='market-analyzer__content'>
                <div className='market-analyzer__card'>
                    <div className='market-analyzer__card-icon'>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 3v18h18" />
                            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                        </svg>
                    </div>
                    <h3 className='market-analyzer__card-title'>Real-Time Analysis</h3>
                    <p className='market-analyzer__card-description'>
                        Get real-time market insights, trend analysis, and trading signals powered by advanced algorithms.
                    </p>
                    <a
                        href="https://frostytraders.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className='market-analyzer__card-btn'
                    >
                        <span>Open Market Analyzer</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                    </a>
                </div>
            </div>

            <div className='market-analyzer__footer'>
                <p>Access professional-grade market analysis at frostytraders.vercel.app</p>
            </div>
        </div>
    );
});

export default MarketAnalyzer;
