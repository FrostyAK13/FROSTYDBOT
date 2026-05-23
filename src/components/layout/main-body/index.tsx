import { useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { useDevice } from '@deriv-com/ui';
import './main-body.scss';

type TMainBodyProps = {
    children: React.ReactNode;
};

const MainBody: React.FC<TMainBodyProps> = ({ children }) => {
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

        const current_theme = localStorage.getItem('theme') ?? 'light';

        // Remove all existing theme classes and apply stored theme or default to light
        body.classList.remove('theme--light', 'theme--dark', 'theme--slate');
        body.classList.add(current_theme === 'dark' ? 'theme--dark' : 'theme--light');
    }, []);

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
