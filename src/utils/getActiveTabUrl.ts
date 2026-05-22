export const getActiveTabUrl = () => {
    const current_tab_number = Number(localStorage.getItem('active_tab'));
    const TAB_NAMES = [
        'dashboard',
        'bot_builder',
        'free_bots',
        'analysis_tool',
        'market_analyzer',
        'chart',
        'trading_view',
        'tutorial',
        'trade_pulse',
    ] as const;
    const current_tab_name = TAB_NAMES[current_tab_number] ?? TAB_NAMES[0];

    const current_url = window.location.href.split('#')[0];
    const active_tab_url = `${current_url}#${current_tab_name}`;
    return active_tab_url;
};
