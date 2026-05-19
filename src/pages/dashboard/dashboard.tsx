import React, { useCallback } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import Text from '@/components/shared_ui/text';
import { DBOT_TABS } from '@/constants/bot-contents';
import { useStore } from '@/hooks/useStore';
import { localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import OnboardTourHandler from '../tutorials/dbot-tours/onboarding-tour';
import Announcements from './announcements';
import Cards from './cards';
import InfoPanel from './info-panel';

type TMobileIconGuide = {
    handleTabChange: (active_number: number) => void;
};

const DashboardComponent = observer(({ handleTabChange }: TMobileIconGuide) => {
    const { load_modal, dashboard, client } = useStore();
    const { dashboard_strategies } = load_modal;
    const { active_tab, active_tour } = dashboard;
    const has_dashboard_strategies = !!dashboard_strategies?.length;
    const { isDesktop, isTablet } = useDevice();

    // Try to open the in-page AI assistant when available; otherwise open Analysis Tool.
    const openAIAssistant = useCallback(() => {
        const global_window = window as Window & {
            aiAssistant?: { open: () => void; scan: () => void };
        };

        if (global_window.aiAssistant?.open) {
            global_window.aiAssistant.open();
            return;
        }

        setTimeout(() => {
            if (global_window.aiAssistant?.open) {
                global_window.aiAssistant.open();
            } else {
                handleTabChange(DBOT_TABS.ANALYSIS_TOOL);
            }
        }, 50);
    }, [handleTabChange]);

    const quick_links = [
        {
            id: 'free-bots-link',
            title: localize('Free Bots'),
            description: localize('Jump into ready-made bot templates and start trading instantly.'),
            onClick: () => handleTabChange(DBOT_TABS.FREE_BOTS),
            modifier: 'free-bots',
        },
        {
            id: 'static-ft-tool-link',
            title: localize('Static FT Tool'),
            description: localize('Open the Static-FT-Tool for advanced strategy analysis.'),
            onClick: () => handleTabChange(DBOT_TABS.MARKET_ANALYZER),
            modifier: 'static-ft-tool',
        },
        {
            id: 'ai-assistant-link',
            title: localize('AI Assistant'),
            description: localize('Open the AI assistant for smart suggestions and instant commands.'),
            onClick: openAIAssistant,
            modifier: 'ai-assistant',
        },
    ];

    return (
        <React.Fragment>
            <div
                className={classNames('tab__dashboard', {
                    'tab__dashboard--tour-active': active_tour,
                })}
            >
                <div className='tab__dashboard__content'>
                    {client.is_logged_in && (
                        <Announcements is_mobile={!isDesktop} is_tablet={isTablet} handleTabChange={handleTabChange} />
                    )}
                    <div className='quick-panel'>
                        <div
                            className={classNames('tab__dashboard__header', {
                                'tab__dashboard__header--listed': isDesktop && has_dashboard_strategies,
                            })}
                        >
                            {!has_dashboard_strategies && (
                                <Text
                                    className='title'
                                    as='h2'
                                    color='prominent'
                                    size={isDesktop ? 'sm' : 's'}
                                    lineHeight='xxl'
                                    weight='bold'
                                >
                                    {localize('Load or build your bot')}
                                </Text>
                            )}
                            <Text
                                as='p'
                                color='prominent'
                                lineHeight='s'
                                size={isDesktop ? 's' : 'xxs'}
                                className={classNames('subtitle', { 'subtitle__has-list': has_dashboard_strategies })}
                            >
                                {localize(
                                    'Import a bot from your computer or Google Drive, build it from scratch, or start with a quick strategy.'
                                )}
                            </Text>
                            <div className='tab__dashboard__quick-links'>
                                {quick_links.map(link => (
                                    <button
                                        key={link.id}
                                        type='button'
                                        className={classNames(
                                            'tab__dashboard__quick-link',
                                            `tab__dashboard__quick-link--${link.modifier}`
                                        )}
                                        onClick={link.onClick}
                                        aria-label={link.title}
                                    >
                                        <Text
                                            as='p'
                                            color='prominent'
                                            weight='bold'
                                            className='tab__dashboard__quick-link__title'
                                        >
                                            {link.title}
                                        </Text>
                                        <Text
                                            as='p'
                                            color='prominent'
                                            className='tab__dashboard__quick-link__description'
                                        >
                                            {link.description}
                                        </Text>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Cards has_dashboard_strategies={has_dashboard_strategies} is_mobile={!isDesktop} />
                    </div>
                </div>
            </div>
            <InfoPanel />
            {active_tab === 0 && <OnboardTourHandler is_mobile={!isDesktop} />}
        </React.Fragment>
    );
});

export default DashboardComponent;
