import { ComponentProps, ReactNode, useMemo } from 'react';
import Livechat from '@/components/chat/Livechat';
import useIsLiveChatWidgetAvailable from '@/components/chat/useIsLiveChatWidgetAvailable';
import useRemoteConfig from '@/hooks/growthbook/useRemoteConfig';
import { useIsIntercomAvailable } from '@/hooks/useIntercom';
import useTMB from '@/hooks/useTMB';
import RootStore from '@/stores/root-store';
import { LegacyReportsIcon, LegacyWhatsappIcon } from '@deriv/quill-icons/Legacy';
import { useTranslations } from '@deriv-com/translations';

export type TSubmenuSection = 'accountSettings' | 'cashier' | 'reports';

const TelegramMenuIcon = () => (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
        <path d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 14.26l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.299z' />
    </svg>
);

//IconTypes
type TMenuConfig = {
    LeftComponent: React.ElementType;
    RightComponent?: ReactNode;
    as: 'a' | 'button';
    href?: string;
    label: ReactNode;
    onClick?: () => void;
    removeBorderBottom?: boolean;
    submenu?: TSubmenuSection;
    target?: ComponentProps<'a'>['target'];
    isActive?: boolean;
}[];

const useMobileMenuConfig = (client?: RootStore['client']) => {
    const { localize } = useTranslations();
    useRemoteConfig(true);

    const { is_livechat_available } = useIsLiveChatWidgetAvailable();
    const icAvailable = useIsIntercomAvailable();

    const is_virtual = client?.is_virtual;
    const currency = client?.getCurrency?.();
    const is_logged_in = client?.is_logged_in;
    const client_residence = client?.residence;
    const { isTmbEnabled } = useTMB();
    const is_tmb_enabled = window.is_tmb_enabled || isTmbEnabled();

    const menuConfig = useMemo(
        (): TMenuConfig[] => [
            [
                client?.is_logged_in && {
                    as: 'button',
                    label: localize('Reports'),
                    LeftComponent: LegacyReportsIcon,
                    submenu: 'reports',
                    onClick: () => {},
                },
            ].filter(Boolean) as TMenuConfig,
            [
                {
                    as: 'a',
                    href: 'https://wa.me/254115335502',
                    label: localize('WhatsApp'),
                    LeftComponent: LegacyWhatsappIcon,
                    target: '_blank',
                },
                {
                    as: 'a',
                    href: 'https://t.me/frostytraders_signals',
                    label: localize('Telegram'),
                    LeftComponent: TelegramMenuIcon,
                    target: '_blank',
                },
                is_livechat_available || icAvailable
                    ? {
                          as: 'button',
                          label: localize('Live chat'),
                          LeftComponent: Livechat,
                          onClick: () => {
                              icAvailable ? window.Intercom('show') : window.LiveChatWidget?.call('maximize');
                          },
                      }
                    : null,
            ].filter(Boolean) as TMenuConfig,
            [],
        ],
        [is_virtual, currency, is_logged_in, client_residence, is_tmb_enabled]
    );

    return {
        config: menuConfig,
    };
};

export default useMobileMenuConfig;
