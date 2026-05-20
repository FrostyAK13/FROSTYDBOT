import ReactDOM from 'react-dom/client';
import {
    getFrostyTradersCanonicalUrl,
    shouldRedirectToFrostyTradersCanonical,
} from '@/components/shared/utils/config/config';
import { AuthWrapper } from './app/AuthWrapper';
import { AnalyticsInitializer } from './utils/analytics';
import { registerPWA } from './utils/pwa-utils';
import './styles/index.scss';

if (shouldRedirectToFrostyTradersCanonical()) {
    window.location.replace(getFrostyTradersCanonicalUrl());
} else {
    AnalyticsInitializer();
    registerPWA()
        .then(registration => {
            if (registration) {
                console.log('PWA service worker registered successfully for Chrome');
            } else {
                console.log('PWA service worker disabled for non-Chrome browser');
            }
        })
        .catch(error => {
            console.error('PWA service worker registration failed:', error);
        });

    const root = ReactDOM.createRoot(document.getElementById('root')!);
    root.render(<AuthWrapper />);

    // Remove the inline preloader added in index.html once React has mounted
    // Use requestAnimationFrame to ensure the first paint has occurred
    requestAnimationFrame(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.transition = 'opacity 400ms ease';
            preloader.style.opacity = '0';
            setTimeout(() => preloader.remove(), 450);
        }
    });
}
