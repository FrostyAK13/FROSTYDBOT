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
    ANALYSIS_TOOL: 3,
    MARKET_ANALYZER: 4,
    CHART: 5,
    TRADING_VIEW: 6,
    TUTORIAL: 7,
    TRADE_PULSE: 8,
    DCIRCLES: 9,
});

export const MAX_STRATEGIES = 10;

export const TAB_IDS = [
    'id-dbot-dashboard',
    'id-bot-builder',
    'id-free-bots',
    'id-analysis-tool',
    'id-market-analyzer',
    'id-charts',
    'id-trading-view',
    'id-tutorials',
    'id-trade-pulse',
    'id-dcircles',
];

export const DEBOUNCE_INTERVAL_TIME = 500;
