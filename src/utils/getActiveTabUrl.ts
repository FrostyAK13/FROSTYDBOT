export const getActiveTabUrl = () => {
    const current_tab_number = localStorage.getItem('active_tab');
    const TAB_NAMES = [
        'dashboard',
        'bot_builder',
        'chart',
        'tutorial',
        'free_bots',
        'analysis_tool',
        'trade_pulse',
        'market_analyzer',
    ] as const;
    const getTabName = (index: number) => TAB_NAMES[index];
    const current_tab_name = getTabName(Number(current_tab_number));

    const current_url = window.location.href.split('#')[0];
    const active_tab_url = `${current_url}#${current_tab_name}`;
    return active_tab_url;
};
