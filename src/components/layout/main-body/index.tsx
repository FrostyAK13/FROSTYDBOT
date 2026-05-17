import { useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { useDevice } from '@deriv-com/ui';
import './main-body.scss';

type TMainBodyProps = {
    children: React.ReactNode;
};

const MainBody: React.FC<TMainBodyProps> = ({ children }) => {
    const current_theme = localStorage.getItem('theme') ?? 'slate';
    const { ui } = useStore() ?? {
        ui: {
            setDevice: () => {},
        },
    };
    const { setDevice } = ui;
    const { isDesktop, isMobile, isTablet } = useDevice();

    useEffect(() => {
        const body = document.querySelector('body');
        if (!body) return;

        // Remove all existing theme classes
        body.classList.remove('theme--light', 'theme--dark', 'theme--slate');

        if (current_theme === 'light') {
            body.classList.add('theme--light');
        } else if (current_theme === 'dark') {
            body.classList.add('theme--dark');
        } else {
            // Default to slate theme
            body.classList.add('theme--slate');
        }
    }, [current_theme]);

    useEffect(() => {
        if (isMobile) {
            setDevice('mobile');
        } else if (isTablet) {
            setDevice('tablet');
        } else {
            setDevice('desktop');
        }
    }, [isDesktop, isMobile, isTablet, setDevice]);

    return <div className='main-body'>{children}</div>;
};

export default MainBody;
