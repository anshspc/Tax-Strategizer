import { projectHarvestingImpact } from '../src/utils/taxCalculations.js';

const testValidation = () => {
  const initialGains = {
    stcg: { profits: 100, losses: 500 },
    ltcg: { profits: 1200, losses: 100 }
  };

  const selectedAsset = {
    coin: 'TEST',
    stcg: { gain: 500 },
    ltcg: { gain: -1000 }
  };

  const result = projectHarvestingImpact(initialGains, [selectedAsset]);

  console.log('--- TAX HARVESTING VALIDATION ---');
  console.log('Initial:', initialGains);
  console.log('Selected Asset gains:', { stcg: 500, ltcg: -1000 });
  console.log('Result:', result);

  const expected = {
    stcg: { profits: 600, losses: 500 },
    ltcg: { profits: 1200, losses: 1100 }
  };

  const isMatched = JSON.stringify(result) === JSON.stringify(expected);
  
  if (isMatched) {
    console.log('SUCCESS: Logic matches expected result exactly.');
  } else {
    console.log('FAILURE: Logic does not match expected result.');
    console.log('Expected:', expected);
    process.exit(1);
  }
};

testValidation();
