type TTabsTitle = {
    [key: string]: string | number;
};

type TDashboardTabIndex = {
    [key: string]: number;
};

export const tabs_title: TTabsTitle = Object.freeze({
    WORKSPACE: 'Workspace',
    CHART: 'Chart',
});

export const DBOT_TABS: TDashboardTabIndex = Object.freeze({
    DASHBOARD: 0,
    BOT_BUILDER: 1,
    FREE_BOTS: 2,
    DCIRCLES: 3,
    ANALYSIS_TOOL: 4,
    MARKET_ANALYZER: 5,
    CHART: 6,
    TUTORIAL: 7,
    TRADE_PULSE: 8,
});

export const MAX_STRATEGIES = 9;

export const TAB_IDS = [
    'id-dbot-dashboard',
    'id-bot-builder',
    'id-free-bots',
    'id-dcircles',
    'id-analysis-tool',
    'id-market-analyzer',
    'id-charts',
    'id-tutorials',
    'id-trade-pulse',
];

export const DEBOUNCE_INTERVAL_TIME = 500;
