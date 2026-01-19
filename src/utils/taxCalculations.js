/**
 * Tax utility helpers
 * Handles profit/loss balancing for STCG and LTCG
 */

// Helper to get the difference between profit and loss
export const getNetGain = (profits, losses) => {
  return profits - losses;
};

// Sums up STCG and LTCG to get the total realized number
export const getTotalTaxableAmount = (stcgNet, ltcgNet) => {
  return stcgNet + ltcgNet;
};

// This is the core logic for the "What If" scenario
// We deep clone to keep things immutable and avoid side effects
export const projectHarvestingImpact = (baseGains, selectedCoins) => {
  const result = JSON.parse(JSON.stringify(baseGains));

  selectedCoins.forEach(coin => {
    // Short Term updates
    if (coin.stcg) {
      if (coin.stcg.gain > 0) {
        result.stcg.profits += coin.stcg.gain;
      } else {
        result.stcg.losses += Math.abs(coin.stcg.gain);
      }
    }

    // Long Term updates
    if (coin.ltcg) {
      if (coin.ltcg.gain > 0) {
        result.ltcg.profits += coin.ltcg.gain;
      } else {
        result.ltcg.losses += Math.abs(coin.ltcg.gain);
      }
    }
  });

  return result;
};
