declare module '@deriv-com/translations' {
    export function initializeI18n(options: Record<string, any>): any;
    export function localize(text: string, values?: Record<string, any>): string;
    export const TranslationProvider: React.ComponentType<{
        defaultLang: string;
        i18nInstance: any;
        children: React.ReactNode;
    }>;
    export const Localize: React.ComponentType<{ i18n_default_text: string }>;
}

declare module '@deriv-com/utils' {
    export const URLUtils: {
        getLoginInfoFromURL: () => { loginInfo: Array<Record<string, any>>; paramsToDelete: string[] };
        filterSearchParams: (params: string[]) => void;
        getDefaultActiveAccount: (accounts: Array<Record<string, any>>) => Record<string, any> | undefined;
        getOauthURL?: (...args: any[]) => any;
        getValue?: (...args: any[]) => any;
    };
    export const AppIDConstants: any;
    export const BrandConstants: any;
    export const BrandUtils: any;
    export const CurrencyConstants: any;
    export const DocumentConstants: any;
    export const FormatUtils: any;
    export const LocalStorageConstants: any;
    export const LocalStorageUtils: any;
    export const MobileDevicesConstants: any;
    export const OSDtectionUtils: any;
    export const ObjectUtils: any;
    export const PromiseUtils: any;
    export const URLConstants: any;
    export const ValidationConstants: any;
    export const WebSocketUtils: any;
}
