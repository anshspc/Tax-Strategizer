// Mocking the backend for now until we have real endpoints
// Data structure is based on the Notion spec provided

const ASSET_HOLDINGS = [
  {
    "coin": "USDC",
    "coinName": "USDC",
    "logo": "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
    "currentPrice": 85.41,
    "totalHolding": 0.0015339999999994802,
    "averageBuyPrice": 1.5863185433764244,
    "stcg": { "balance": 0.0015339999999994802, "gain": 0.12858552735441697 },
    "ltcg": { "balance": 0, "gain": 0 }
  },
  {
    "coin": "WETH",
    "coinName": "Polygon PoS Bridged WETH (Polygon POS)",
    "logo": "https://coin-images.coingecko.com/coins/images/2518/large/weth.png?1696503332",
    "currentPrice": 211756,
    "totalHolding": 0.00023999998390319965,
    "averageBuyPrice": 3599.856066001555,
    "stcg": { "balance": 0.00023999998390319965, "gain": 49.957471193511736 },
    "ltcg": { "balance": 0, "gain": 0 }
  },
  {
    "coin": "WPOL",
    "coinName": "Wrapped POL",
    "logo": "https://koinx-statics.s3.ap-south-1.amazonaws.com/currencies/DefaultCoin.svg",
    "currentPrice": 22.08,
    "totalHolding": 2.3172764293128694,
    "averageBuyPrice": 0.5227311370876341,
    "stcg": { "balance": 1.3172764293128694, "gain": 49.954151016387065 },
    "ltcg": { "balance": 1, "gain": 20 }
  },
  {
    "coin": "MATIC",
    "coinName": "Polygon",
    "logo": "https://coin-images.coingecko.com/coins/images/4713/large/matic.png?1696505286",
    "currentPrice": 45.12,
    "totalHolding": 1500.5,
    "averageBuyPrice": 52.30,
    "stcg": { "balance": 500, "gain": -1200 },
    "ltcg": { "balance": 1000.5, "gain": -2500 }
  },
  {
    "coin": "USDT",
    "coinName": "Tether",
    "logo": "https://coin-images.coingecko.com/coins/images/325/large/tether.png?1696501628",
    "currentPrice": 83.50,
    "totalHolding": 5000,
    "averageBuyPrice": 83.45,
    "stcg": { "balance": 5000, "gain": 250 },
    "ltcg": { "balance": 0, "gain": 0 }
  }
];

const TAX_SUMMARY_DATA = {
  "capitalGains": {
    "stcg": {
      "profits": 70200.88,
      "losses": 1548.53
    },
    "ltcg": {
      "profits": 5020,
      "losses": 3050
    }
  }
};

// Simulate a realistic API delay
const getPortfolio = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...ASSET_HOLDINGS]), 500);
  });
};

const getTaxDetails = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ ...TAX_SUMMARY_DATA }), 500);
  });
};

export { getPortfolio, getTaxDetails };
