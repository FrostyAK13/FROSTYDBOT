import { observer } from 'mobx-react-lite';
import './tutorials.scss';

const DTrader = observer(() => {
    return (
        <div className='dtrader'>
            <div className='dtrader__iframe-container'>
                <iframe
                    src='https://app.deriv.com/dtrader'
                    className='dtrader__iframe'
                    title='D-Trader'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                />
            </div>
        </div>
    );
});

export default DTrader;
