import React from 'react';
import './fullscreen-logo-loader.scss';

type Props = {
    message?: string;
};

const FullscreenLogoLoader: React.FC<Props> = ({ message = 'Frosty Traders — Preparing your workspace...' }) => {
    return (
        <div className='fullscreen-logo-loader' data-testid='fullscreen-logo-loader'>
            <div className='loader__gold-overlay' aria-hidden />
            <div className='loader__wrap'>
                <div className='loader__title' aria-hidden>
                    frostytraders
                </div>
                <div className='loader__message'>{message}</div>
            </div>
        </div>
    );
};

export default FullscreenLogoLoader;
