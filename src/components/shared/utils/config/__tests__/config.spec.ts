jest.mock('@deriv-com/utils', () => ({
    LocalStorageConstants: { configServerURL: 'config.server_url' },
    LocalStorageUtils: { getValue: jest.fn().mockReturnValue(undefined) },
    URLUtils: {
        getOauthURL: jest.fn().mockReturnValue('https://oauth.deriv.com/oauth2/authorize?app_id=65555&l=en&brand=bot'),
    },
}));

import {
    generateOAuthURL,
    getCallbackUrl,
    getFrostyTradersCanonicalUrl,
    getPostLogoutRedirectUri,
    shouldRedirectToFrostyTradersCanonical,
} from '../config';

describe('config helpers', () => {
    const originalLocation = window.location;

    beforeAll(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).location;
    });

    afterAll(() => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: originalLocation,
        });
    });

    it('should use oauth.deriv.com for frostydbot.site instead of oauth.site', () => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: new URL('https://frostydbot.site/'),
        });

        const result = generateOAuthURL();

        expect(result).toContain('https://oauth.deriv.com/');
        expect(result).not.toContain('oauth.site');
    });

    it('should redirect frostydbot.site to canonical www host', () => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: new URL('https://frostydbot.site/test?foo=bar'),
        });

        expect(shouldRedirectToFrostyTradersCanonical()).toBe(true);
        expect(getFrostyTradersCanonicalUrl()).toBe('https://www.frostydbot.site/test?foo=bar');
    });

    it('should build callback URL on the canonical www origin for frostydbot.site', () => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: new URL('https://frostydbot.site/login'),
        });

        expect(getCallbackUrl()).toBe('https://www.frostydbot.site/callback');
        expect(getPostLogoutRedirectUri()).toBe('https://www.frostydbot.site');
    });
});
