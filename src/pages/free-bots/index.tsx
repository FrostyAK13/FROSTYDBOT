import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { load, save_types } from '@/external/bot-skeleton';
import './free-bots.scss';

interface Bot {
    id: string;
    name: string;
    description: string;
    fileName: string;
}

const BOTS: Bot[] = [
    {
        id: '1',
        name: 'FROSTY Entry Loop',
        description: 'Advanced entry loop strategy with optimized timing for consistent trade entries.',
        fileName: 'FROSTY_ENTRY_LOOP.xml',
    },
    {
        id: '2',
        name: 'Multi Over Under Bot',
        description: 'Multi-strategy over/under bot with dynamic prediction algorithms.',
        fileName: 'FROSTY_MULTI_OVER_UNDER.xml',
    },
    {
        id: '3',
        name: 'FROSTY Digit Match V1',
        description: 'Precision digit matching bot with intelligent pattern recognition.',
        fileName: 'FROSTY_DIGIT_MATCH_V1.xml',
    },
    {
        id: '4',
        name: 'FROSTY Entry Point V2',
        description: 'Enhanced entry point detection with improved accuracy and timing.',
        fileName: 'FROSTY_ENTRY_POINT_V2.xml',
    },
    {
        id: '5',
        name: 'FROSTY Even Odd Engine',
        description: 'Powerful even/odd prediction engine with advanced market analysis.',
        fileName: 'FROSTY_EVEN_ODD_ENGINE.xml',
    },
    {
        id: '6',
        name: 'FROSTY Under 7 V1',
        description: 'Specialized under 7 strategy with optimized risk management.',
        fileName: 'FROSTY_UNDER_7_V1.xml',
    },
    {
        id: '7',
        name: 'FROSTY Version',
        description: 'Premium FROSTY bot with comprehensive trading features.',
        fileName: 'FROSTY_VERSION.xml',
    },
    {
        id: '8',
        name: 'FROSTY Under Strike',
        description: 'Lightning-fast under strike bot with precise execution.',
        fileName: 'FROSTY_UNDER_STRIKE.xml',
    },
    {
        id: '9',
        name: 'FROSTY Dominator',
        description: 'Dominant market analysis bot with multi-indicator strategy.',
        fileName: 'FROSTY_DOMINATOR.xml',
    },
    {
        id: '10',
        name: 'FROSTY Over 2 V1',
        description: 'Optimized over 2 strategy with smart stake management.',
        fileName: 'FROSTY_OVER_2_V1.xml',
    },
];

const FreeBots = observer(() => {
    const { dashboard } = useStore();
    const [loadingBotId, setLoadingBotId] = useState<string | null>(null);

    const loadBot = async (bot: Bot) => {
        try {
            setLoadingBotId(bot.id);
            
            const response = await fetch(`/bots/${bot.fileName}`);
            if (!response.ok) {
                throw new Error('Failed to fetch bot file');
            }
            
            const xmlContent = await response.text();
            
            await load({
                block_string: xmlContent,
                file_name: bot.name,
                workspace: (window as any).Blockly?.derivWorkspace,
                from: save_types.LOCAL,
                drop_event: null,
                strategy_id: null,
                showIncompatibleStrategyDialog: null,
            });

            dashboard.setActiveTab(1);
            window.location.hash = 'bot_builder';
            
        } catch (error) {
            console.error('Error loading bot:', error);
        } finally {
            setLoadingBotId(null);
        }
    };

    return (
        <div className='free-bots free-bots--frosty'>
            <div className='free-bots__header'>
                <div className='free-bots__logo'>
                    <span className='free-bots__logo-icon'>&#10052;</span>
                </div>
                <h1 className='free-bots__title'>FROSTY Trading Bots</h1>
                <p className='free-bots__subtitle'>
                    Premium collection of FROSTY trading bots. Click on any bot to load it into the Bot Builder.
                </p>
            </div>

            <div className='free-bots__grid'>
                {BOTS.map(bot => (
                    <div key={bot.id} className='free-bots__card'>
                        <div className='free-bots__card-header'>
                            <span className='free-bots__card-icon'>&#10052;</span>
                            <span className='free-bots__card-badge'>FROSTY</span>
                        </div>
                        <h3 className='free-bots__card-title'>{bot.name}</h3>
                        <p className='free-bots__card-description'>{bot.description}</p>
                        <button
                            className='free-bots__card-btn'
                            onClick={() => loadBot(bot)}
                            disabled={loadingBotId === bot.id}
                        >
                            {loadingBotId === bot.id ? (
                                <span className='free-bots__card-btn-loading'>Loading...</span>
                            ) : (
                                <>
                                    <span>Load Bot</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7"/>
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            <div className='free-bots__footer'>
                <p>All bots are provided for educational purposes. Always test with demo accounts first.</p>
            </div>
        </div>
    );
});

export default FreeBots;
