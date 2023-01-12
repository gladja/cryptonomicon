const API_KEY = 'd2e3ab92213daaaaaad0ca303bf5c6477ed574f7a43bfe4c2541c0de73ff01ee';

const tickersHandlers = new Map();
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);

const AGGREGATE_INDEX = '5';

socket.addEventListener('message', e => {
    const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data);
    if (type !== AGGREGATE_INDEX || newPrice === undefined) {
        return;
}
    const handlers = tickersHandlers.get(currency) ?? [];
    handlers.forEach(fn => fn(newPrice));
});

// const loadTickers = () => {
//     if (tickers.size === 0) {
//         return;
//     }
//
//     fetch(
//         `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...tickersHandlers.keys()].join(',')}&tsyms=USD&api_key=${API_KEY}`
//     ).then(r => r.json()).then(rawData => {const updatedPrices = Object.fromEntries(
//         Object.entries(rawData).map(([key, value]) => [key, value.USD])
//     );
//
//       Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
//           const handlers = tickersHandlers.get(currency) ?? [];
//           handlers.forEach(fn => fn(newPrice));
//       })
//     });
// };

function sendToWebSocket(message) {
    const stringifiedMessage = JSON.stringify(message);
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(stringifiedMessage);
        return;
    }
        socket.addEventListener("open", () => {
            socket.send(stringifiedMessage);
        }, {once: true});
}

function subscribeToTickerOnWs (ticker) {
    sendToWebSocket({
        action: 'SubAdd',
        subs: [`5~CCCAGG~${ticker}~USD`]
    });
}

function unsubscribeFromTickerOnWs(ticker) {
    sendToWebSocket({
        action: 'SubRemovef',
        subs: [`5~CCCAGG~${ticker}~USD`]
    });
}

export const subscribeToTicker = (ticker, cb) => {
    const subscribers = tickersHandlers.get(ticker) || [];
    tickersHandlers.set(ticker, [...subscribers, cb]);
    subscribeToTickerOnWs(ticker);

};

export const unsubscribeFromTicker = ticker => {
    tickersHandlers.delete(ticker);
    unsubscribeFromTickerOnWs(ticker);
};

// setInterval(loadTickers, 3000);