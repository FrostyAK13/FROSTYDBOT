import { useDevice } from '@deriv-com/ui';
import './tutorials.scss';

const TutorialsTab = () => {
    const { isDesktop } = useDevice();

    const handleOpenDTrader = () => {
        window.open('https://app.deriv.com/dtrader', '_blank', 'noopener,noreferrer');
    };

    return (
        <div className='tutorials-dtrader'>
            <div className='tutorials-dtrader__content'>
                <div className='tutorials-dtrader__icon'>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17 7H21V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <h2 className='tutorials-dtrader__title'>Trade with DTrader</h2>
                <p className='tutorials-dtrader__description'>
                    Access the full trading experience on Deriv&apos;s DTrader platform. 
                    Trade forex, commodities, cryptocurrencies, and more with advanced charting tools.
                </p>
                <button 
                    className='tutorials-dtrader__button'
                    onClick={handleOpenDTrader}
                >
                    Open DTrader
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default TutorialsTab;
