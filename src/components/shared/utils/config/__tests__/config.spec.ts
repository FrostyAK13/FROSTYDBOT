jest.mock('@deriv-com/utils', () => ({
    LocalStorageConstants: { configServerURL: 'config.server_url' },
    LocalStorageUtils: { getValue: jest.fn().mockReturnValue(undefined) },
    URLUtils: {
        getOauthURL: jest.fn().mockReturnValue('https://oauth.deriv.com/oauth2/authorize?app_id=65555&l=en&brand=bot'),
    },
}));

import { generateOAuthURL } from '../config';

describe('generateOAuthURL', () => {
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
});
