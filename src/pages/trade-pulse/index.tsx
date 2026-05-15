import React, { ChangeEvent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { generateDerivApiInstance } from '@/external/bot-skeleton/services/api/appId';
import { Localize } from '@deriv-com/translations';
import './trade-pulse.scss';

type AccountMode = 'demo' | 'real';

const STORAGE_KEYS = {
    OWN_TOKEN: 'trade_pulse_own_token',
    OWN_LOGIN_ID: 'trade_pulse_own_loginid',
    COPY_TOKEN: 'trade_pulse_copy_token',
    ACCOUNT_MODE: 'trade_pulse_account_mode',
    AUTH_TOKEN: 'authToken',
    ACTIVE_LOGIN_ID: 'active_loginid',
    ACCOUNTS_LIST: 'accountsList',
};

const getStoredValue = (key: string) => window.localStorage.getItem(key) ?? '';

const TradePulse = observer(() => {
    const [ownToken, setOwnToken] = useState('');
    const [ownLoginId, setOwnLoginId] = useState('');
    const [copyTraderToken, setCopyTraderToken] = useState('');
    const [accountMode, setAccountMode] = useState<AccountMode>('demo');
    const [statusMessage, setStatusMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        setOwnToken(getStoredValue(STORAGE_KEYS.OWN_TOKEN));
        setOwnLoginId(getStoredValue(STORAGE_KEYS.OWN_LOGIN_ID));
        setCopyTraderToken(getStoredValue(STORAGE_KEYS.COPY_TOKEN));
        setAccountMode((getStoredValue(STORAGE_KEYS.ACCOUNT_MODE) as AccountMode) || 'demo');
    }, []);

    const persistSettings = () => {
        localStorage.setItem(STORAGE_KEYS.OWN_TOKEN, ownToken);
        localStorage.setItem(STORAGE_KEYS.OWN_LOGIN_ID, ownLoginId);
        localStorage.setItem(STORAGE_KEYS.COPY_TOKEN, copyTraderToken);
        localStorage.setItem(STORAGE_KEYS.ACCOUNT_MODE, accountMode);
    };

    const validateToken = async (token: string) => {
        const api = generateDerivApiInstance();
        try {
            const result = await api.authorize(token.trim());
            if (result?.error) {
                throw new Error(result.error.message || result.error.code || 'Invalid token');
            }
            return result.authorize;
        } finally {
            if (typeof api.disconnect === 'function') {
                api.disconnect();
            }
        }
    };

    const saveOwnCredentials = async () => {
        if (!ownToken.trim() || !ownLoginId.trim()) {
            setStatusMessage('Enter your Deriv API token and matching login ID before saving.');
            return;
        }

        setIsProcessing(true);
        setStatusMessage('Validating your own credentials...');

        try {
            await validateToken(ownToken);
            const accountList = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS_LIST) ?? '{}');
            accountList[ownLoginId.trim()] = ownToken.trim();
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, ownToken.trim());
            localStorage.setItem(STORAGE_KEYS.ACTIVE_LOGIN_ID, ownLoginId.trim());
            localStorage.setItem(STORAGE_KEYS.ACCOUNTS_LIST, JSON.stringify(accountList));
            persistSettings();
            setStatusMessage(
                `Your own token is valid. Trades will execute using your credentials as ${accountMode.toUpperCase()} account.`
            );
        } catch (error) {
            setStatusMessage(`Unable to validate own token: ${String(error)}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const validateCopyToken = async () => {
        if (!copyTraderToken.trim()) {
            setStatusMessage('Enter the other trader’s API token before validating it.');
            return;
        }

        setIsProcessing(true);
        setStatusMessage('Validating copied trader token...');

        try {
            const authorize = await validateToken(copyTraderToken);
            const copyAccounts = authorize?.account_list ? Object.keys(authorize.account_list).length : 0;
            persistSettings();
            setStatusMessage(`Copy token is valid and belongs to ${copyAccounts} account(s).`);
        } catch (error) {
            setStatusMessage(`Unable to validate copy token: ${String(error)}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const confirmAndExecuteCopy = async () => {
        if (!ownToken.trim() || !copyTraderToken.trim()) {
            setStatusMessage('Both your own token and the trader copy token are required to execute a trade copy.');
            return;
        }

        const confirmed = window.confirm(
            'Confirm that your trades will run with your own credentials while copying the other trader’s actions. Do not proceed unless you trust both tokens.'
        );
        if (!confirmed) {
            setStatusMessage('Copy trade execution cancelled.');
            return;
        }

        setIsProcessing(true);
        setStatusMessage('Confirming permissions for both tokens...');

        try {
            await validateToken(ownToken);
            await validateToken(copyTraderToken);
            persistSettings();
            setStatusMessage(
                `Copy trade confirmed. Your actions will execute on your ${accountMode.toUpperCase()} account while respecting the copied trader token permissions.`
            );
        } catch (error) {
            setStatusMessage(`Copy trade failed: ${String(error)}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAccountModeChange = (event: ChangeEvent<HTMLInputElement>) => {
        const nextMode = event.target.value as AccountMode;
        setAccountMode(nextMode);
        localStorage.setItem(STORAGE_KEYS.ACCOUNT_MODE, nextMode);
    };

    return (
        <main className='trade-pulse-page'>
            <section className='trade-pulse-page__hero'>
                <h1>
                    <Localize i18n_default_text='Trade Pulse' />
                </h1>
                <p>
                    <Localize i18n_default_text='Securely manage your Deriv API token, switch between demo or real accounts, and validate a second trader’s API token before copying their actions.' />
                </p>
            </section>

            <section className='trade-pulse-page__grid'>
                <div className='trade-pulse-page__card'>
                    <h2>
                        <Localize i18n_default_text='Your Deriv API credentials' />
                    </h2>
                    <label>
                        <Localize i18n_default_text='Deriv API token' />
                        <input
                            type='password'
                            value={ownToken}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => setOwnToken(event.target.value)}
                            placeholder='Enter your API token'
                        />
                    </label>
                    <label>
                        <Localize i18n_default_text='Login ID' />
                        <input
                            type='text'
                            value={ownLoginId}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => setOwnLoginId(event.target.value)}
                            placeholder='e.g. CR1234567'
                        />
                    </label>
                    <fieldset className='trade-pulse-page__account-mode'>
                        <legend>
                            <Localize i18n_default_text='Account mode' />
                        </legend>
                        <label>
                            <input
                                type='radio'
                                name='trade_pulse_account_mode'
                                value='demo'
                                checked={accountMode === 'demo'}
                                onChange={handleAccountModeChange}
                            />
                            <Localize i18n_default_text='Demo account' />
                        </label>
                        <label>
                            <input
                                type='radio'
                                name='trade_pulse_account_mode'
                                value='real'
                                checked={accountMode === 'real'}
                                onChange={handleAccountModeChange}
                            />
                            <Localize i18n_default_text='Real account' />
                        </label>
                    </fieldset>
                    <button className='trade-pulse-page__button' disabled={isProcessing} onClick={saveOwnCredentials}>
                        <Localize i18n_default_text='Save own credentials' />
                    </button>
                </div>

                <div className='trade-pulse-page__card'>
                    <h2>
                        <Localize i18n_default_text='Copy trader configuration' />
                    </h2>
                    <label>
                        <Localize i18n_default_text='Copy trader API token' />
                        <input
                            type='password'
                            value={copyTraderToken}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => setCopyTraderToken(event.target.value)}
                            placeholder='Enter other trader token'
                        />
                    </label>
                    <button className='trade-pulse-page__button' disabled={isProcessing} onClick={validateCopyToken}>
                        <Localize i18n_default_text='Validate copy token' />
                    </button>
                    <button
                        className='trade-pulse-page__button trade-pulse-page__button--secondary'
                        disabled={isProcessing}
                        onClick={confirmAndExecuteCopy}
                    >
                        <Localize i18n_default_text='Confirm copy trade' />
                    </button>
                </div>
            </section>

            <section className='trade-pulse-page__status'>
                <div className='trade-pulse-page__status-label'>
                    <Localize i18n_default_text='Status' />
                </div>
                <div className='trade-pulse-page__status-message'>
                    {statusMessage || 'Ready to validate and run copy trading.'}
                </div>
            </section>

            <section className='trade-pulse-page__note'>
                <p>
                    <Localize i18n_default_text='Your own trades always use your own credentials. The copied trader token is used only for permission validation and simulation of shared actions. For production deployments, move token storage to a secure server-side vault instead of browser localStorage.' />
                </p>
            </section>
        </main>
    );
});

export default TradePulse;
