import React from 'react';
import './fullscreen-logo-loader.scss';

type Props = {
    message?: string;
};

const FullscreenLogoLoader: React.FC<Props> = ({ message = 'Frosty Traders — Preparing your workspace...' }) => {
    return (
        <div className='fullscreen-logo-loader' data-testid='fullscreen-logo-loader'>
            <div className='loader__wrap'>
                <div className='loader__logo' aria-hidden>
                    {/* Using the app SVG if available, else simple text */}
                    <img src='/deriv-logo.svg' alt='Frosty Traders' className='loader__img' />
                </div>
                <div className='loader__message'>{message}</div>
            </div>
        </div>
    );
};

export default FullscreenLogoLoader;
