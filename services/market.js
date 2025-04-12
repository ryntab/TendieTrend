async function fetchNasdaqStock(symbol, type) {
    try {
        const url = `https://api.nasdaq.com/api/quote/${symbol}/info?assetclass=${type}`;
        const res = await fetch(url);
        const response = await res.json();
        const data = response.data;

        const isRegular = data.marketStatus === 'REGULAR';
        const source = isRegular ? data.primaryData : data.secondaryData;

        return {
            symbol,
            price: source.lastSalePrice?.replace('$', ''),
            percentageChange: source.percentageChange,
            change: parseFloat(source.netChange),
            direction: source.deltaIndicator?.toLowerCase(), // 'up' or 'down'
            marketStatus: data.marketStatus
        };
    } catch (err) {
        console.error(`❌ Failed to fetch ${symbol}:`, err.message);
        return null;
    }
}

export async function getMarketState() {
    try {
        const [SPY, QQQ, DIA, IWM] = await Promise.all([
            fetchNasdaqStock('SPY', 'etf'),
            fetchNasdaqStock('QQQ', 'etf'),
            fetchNasdaqStock('DIA', 'etf'),
            fetchNasdaqStock('IWM', 'etf'),
        ]);

        const symbols = { SPY, QQQ, DIA, IWM };

        if (Object.values(symbols).some(s => s === null)) {
            throw new Error('Market is not in regular session or data is incomplete');
        }

        function calculateState (symbols) {
            const total = Object.values(symbols).reduce((acc, symbol) => acc + parseFloat(symbol.price), 0);
            const average = total / Object.keys(symbols).length;
            return average > 0 ? {
                color: 'green',
                direction: 'up',
                title: 'Market is Bullish',
                description: 'The market is showing a bullish trend.',
            } : {
                color: 'red',
                direction: 'down',
                title: 'Market is Bearish',
                description: 'The market is showing a bearish trend.',
            };
        }
        const marketState = calculateState(symbols);

        if (!marketState) {
            throw new Error('Market state calculation failed');
        }

        return {
            ...marketState,
            SPY,
            QQQ,
            DIA,
            IWM,
        };
    } catch (err) {
        console.error('⚠️ Market state fetch failed:', err.message);
        return null;
    }
}