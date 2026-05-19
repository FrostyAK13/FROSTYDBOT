import { LegacyWhatsappIcon } from '@deriv/quill-icons/Legacy';
import { useTranslations } from '@deriv-com/translations';
import './social-widget.scss';

const TelegramIcon = () => (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
        <path d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 14.26l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.299z' />
    </svg>
);

const SocialWidget = () => {
    const { localize } = useTranslations();

    return (
        <div className='social-widget'>
            <a
                className='social-widget__btn social-widget__btn--whatsapp'
                href='https://wa.me/254115335502'
                target='_blank'
                rel='noopener noreferrer'
                title={localize('WhatsApp')}
            >
                <LegacyWhatsappIcon iconSize='xs' />
                <span className='social-widget__label'>WhatsApp</span>
            </a>
            <div className='social-widget__divider' />
            <a
                className='social-widget__btn social-widget__btn--telegram'
                href='https://t.me/frostytraders_signals'
                target='_blank'
                rel='noopener noreferrer'
                title={localize('Telegram')}
            >
                <TelegramIcon />
                <span className='social-widget__label'>Telegram</span>
            </a>
        </div>
    );
};

export default SocialWidget;
