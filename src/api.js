
const API_KEY ='d2e3ab92213daaaaaad0ca303bf5c6477ed574f7a43bfe4c2541c0de73ff01ee';
export const loadTicker = (tickerName) =>
    fetch(
    `https://min-api.cryptocompare.com/data/price?fsym=${tickerName}&tsyms=USD&api_key=${API_KEY}`
).then(r => r.json());