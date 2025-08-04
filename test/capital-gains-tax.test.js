import { test } from 'node:test';
import assert from 'node:assert';
import { CapitalGainsTaxCalculator } from '../src/calculators/capital-gains-tax.js';

test('CapitalGainsTaxCalculator - Basic Long-Term Capital Gain', () => {
  const calc = new CapitalGainsTaxCalculator();
  const result = calc.calculate({
    property_details: {
      sale_price: 500000,
      original_purchase_price: 300000,
      purchase_date: '2020-01-01',
      sale_date: '2024-01-01',
      property_type: 'investment_property'
    },
    taxpayer_profile: {
      filing_status: 'single',
      annual_income: 80000
    }
  });

  // Test structure
  assert(result.transaction_summary, 'Should have transaction summary');
  assert(result.gain_loss_analysis, 'Should have gain/loss analysis');
  assert(result.tax_calculation, 'Should have tax calculation');

  // Test transaction summary
  const summary = result.transaction_summary;
  assert(summary.sale_price === 500000, 'Should preserve sale price');
  assert(summary.purchase_price === 300000, 'Should preserve purchase price');
  assert(summary.holding_period.years === 4, 'Should calculate 4-year holding period');
  assert(summary.gain_or_loss === 200000, 'Should calculate $200,000 gain');
  assert(summary.gain_type === 'Capital Gain', 'Should identify as capital gain');

  // Test gain/loss analysis
  const gain = result.gain_loss_analysis;
  assert(gain.adjusted_basis === 300000, 'Should calculate adjusted basis');
  assert(gain.net_proceeds === 500000, 'Should calculate net proceeds');
  assert(gain.gross_capital_gain === 200000, 'Should calculate gross gain');
  assert(gain.is_long_term === true, 'Should identify as long-term gain');
  assert(gain.depreciation_recapture === 0, 'Should have no depreciation recapture');

  // Test tax calculation
  const tax = result.tax_calculation;
  assert(tax.federal_tax_liability > 0, 'Should calculate federal tax liability');
  assert(tax.effective_tax_rate > 0, 'Should calculate effective tax rate');
  assert(tax.marginal_rates.ltcg_rate !== undefined, 'Should provide LTCG rate');
});

test('CapitalGainsTaxCalculator - Investment Property with Depreciation', () => {
  const calc = new CapitalGainsTaxCalculator();
  const result = calc.calculate({
    property_details: {
      sale_price: 400000,
      original_purchase_price: 250000,
      purchase_date: '2018-06-01',
      sale_date: '2024-06-01',
      property_type: 'investment_property'
    },
    property_improvements: {
      capital_improvements: 25000,
      selling_expenses: 24000,
      buying_expenses: 6000
    },
    depreciation_details: {
      total_depreciation_taken: 36000,
      years_as_rental: 6,
      annual_depreciation: 6000
    },
    taxpayer_profile: {
      filing_status: 'married_filing_jointly',
      annual_income: 150000
    }
  });

  const gain = result.gain_loss_analysis;
  
  // Adjusted basis = 250k + 25k (improvements) + 6k (buying costs) - 36k (depreciation) = 245k
  assert(gain.adjusted_basis === 245000, 'Should calculate adjusted basis with improvements and depreciation');
  
  // Net proceeds = 400k - 24k (selling expenses) = 376k
  assert(gain.net_proceeds === 376000, 'Should calculate net proceeds after selling expenses');
  
  // Gross gain = 376k - 245k = 131k
  assert(gain.gross_capital_gain === 131000, 'Should calculate gross capital gain');
  
  // Depreciation recapture should be 36k (all depreciation taken)
  assert(gain.depreciation_recapture === 36000, 'Should calculate depreciation recapture');
  
  // Capital gain after recapture = 131k - 36k = 95k
  assert(gain.capital_gain_after_recapture === 95000, 'Should calculate capital gain after recapture');

  const tax = result.tax_calculation;
  assert(tax.tax_breakdown.depreciation_recapture_tax > 0, 'Should calculate depreciation recapture tax');
  assert(tax.tax_breakdown.capital_gains_tax > 0, 'Should calculate capital gains tax');
});

test('CapitalGainsTaxCalculator - Primary Residence Exclusion', () => {
  const calc = new CapitalGainsTaxCalculator();
  const result = calc.calculate({
    property_details: {
      sale_price: 800000,
      original_purchase_price: 400000,
      purchase_date: '2019-01-01',
      sale_date: '2024-01-01',
      property_type: 'primary_residence'
    },
    taxpayer_profile: {
      filing_status: 'married_filing_jointly',
      annual_income: 120000,
      years_in_primary_residence: 5
    }
  });

  const primary = result.primary_residence_analysis;
  assert(primary, 'Should include primary residence analysis');
  assert(primary.qualifies_for_exclusion === true, 'Should qualify for exclusion with 5 years residence');
  assert(primary.max_exclusion_allowed === 500000, 'Should allow $500k exclusion for married filing jointly');
  assert(primary.excluded_gain === 400000, 'Should exclude $400k of the gain');
  assert(primary.taxable_gain_after_exclusion === 0, 'Should have no taxable gain after exclusion');

  const tax = result.tax_calculation;
  assert(tax.federal_tax_liability === 0, 'Should have no federal tax with full exclusion');
});

test('CapitalGainsTaxCalculator - Primary Residence Partial Exclusion', () => {
  const calc = new CapitalGainsTaxCalculator();
  const result = calc.calculate({
    property_details: {
      sale_price: 1000000,
      original_purchase_price: 300000,
      purchase_date: '2021-01-01',
      sale_date: '2024-01-01',
      property_type: 'primary_residence'
    },
    taxpayer_profile: {
      filing_status: 'single',
      annual_income: 200000,
      years_in_primary_residence: 3
    }
  });

  const primary = result.primary_residence_analysis;
  assert(primary.qualifies_for_exclusion === true, 'Should qualify with 3 years residence');
  assert(primary.max_exclusion_allowed === 250000, 'Should allow $250k exclusion for single filer');
  assert(primary.excluded_gain === 250000, 'Should exclude maximum $250k');
  assert(primary.taxable_gain_after_exclusion === 450000, 'Should have $450k taxable gain remaining');
});

test('CapitalGainsTaxCalculator - High Income NIIT Analysis', () => {
  const calc = new CapitalGainsTaxCalculator();
  const result = calc.calculate({
    property_details: {
      sale_price: 600000,
      original_purchase_price: 400000,
      purchase_date: '2022-01-01',
      sale_date: '2024-01-01',
      property_type: 'investment_property'
    },
    taxpayer_profile: {
      filing_status: 'single',
      annual_income: 300000 // Above NIIT threshold
    }
  });

  const tax = result.tax_calculation;
  assert(tax.tax_breakdown.net_investment_income_tax > 0, 'Should calculate NIIT for high earners');
  
  // NIIT should be 3.8% of the gain
  const expected_niit = 200000 * 0.038;
  assert(Math.abs(tax.tax_breakdown.net_investment_income_tax - expected_niit) < 100, 
    'Should calculate NIIT at 3.8% rate');
});

test('CapitalGainsTaxCalculator - Capital Loss Scenario', () => {
  const calc = new CapitalGainsTaxCalculator();
  const result = calc.calculate({
    property_details: {
      sale_price: 250000,
      original_purchase_price: 350000,
      purchase_date: '2020-01-01',
      sale_date: '2024-01-01',
      property_type: 'investment_property'
    },
    property_improvements: {
      selling_expenses: 15000
    },
    taxpayer_profile: {
      filing_status: 'single',
      annual_income: 100000
    }
  });

  const summary = result.transaction_summary;
  assert(summary.gain_type === 'Capital Loss', 'Should identify as capital loss');
  assert(summary.gain_or_loss < 0, 'Should have negative gain (loss)');

  const tax = result.tax_calculation;
  assert(tax.federal_tax_liability === 0, 'Should have no tax liability on loss');
  assert(tax.net_capital_position < 0, 'Should have negative capital position');
});

test('CapitalGainsTaxCalculator - Short-Term Capital Gain', () => {
  const calc = new CapitalGainsTaxCalculator();
  const result = calc.calculate({
    property_details: {
      sale_price: 450000,
      original_purchase_price: 400000,
      purchase_date: '2023-06-01',
      sale_date: '2024-01-01', // Less than 1 year
      property_type: 'investment_property'
    },
    taxpayer_profile: {
      filing_status: 'single',
      annual_income: 80000
    }
  });

  const gain = result.gain_loss_analysis;
  assert(gain.is_long_term === false, 'Should identify as short-term gain');
  assert(gain.holding_period.total_days < 365, 'Should have holding period less than 365 days');

  const tax = result.tax_calculation;
  assert(tax.marginal_rates.ltcg_rate === null, 'Should not have LTCG rate for short-term gain');
  // Short-term gains taxed as ordinary income
  assert(tax.marginal_rates.ordinary_rate > 0, 'Should use ordinary tax rate');
});

test('CapitalGainsTaxCalculator - State Tax Analysis', () => {
  const calc = new CapitalGainsTaxCalculator();
  const result = calc.calculate({
    property_details: {
      sale_price: 500000,
      original_purchase_price: 350000,
      purchase_date: '2020-01-01',
      sale_date: '2024-01-01',
      property_type: 'investment_property'
    },
    taxpayer_profile: {
      filing_status: 'single',
      annual_income: 120000,
      state_of_residence: 'CA'
    },
    analysis_options: {
      state_tax_analysis: true
    }
  });

  const state = result.state_tax_analysis;
  assert(state, 'Should include state tax analysis when requested');
  assert(state.state === 'California', 'Should identify California');
  assert(state.state_tax_rate > 0, 'Should have positive state tax rate for CA');
  assert(state.state_tax_liability > 0, 'Should calculate state tax liability');
  assert(state.no_state_tax === false, 'Should indicate CA has state tax');
});

test('CapitalGainsTaxCalculator - No State Tax Analysis', () => {
  const calc = new CapitalGainsTaxCalculator();
  const result = calc.calculate({
    property_details: {
      sale_price: 500000,
      original_purchase_price: 350000,
      purchase_date: '2020-01-01',
      sale_date: '2024-01-01',
      property_type: 'investment_property'
    },
    taxpayer_profile: {
      filing_status: 'single',
      annual_income: 120000,
      state_of_residence: 'TX'
    },
    analysis_options: {
      state_tax_analysis: true
    }
  });

  const state = result.state_tax_analysis;
  assert(state.state === 'Texas', 'Should identify Texas');
  assert(state.state_tax_rate === 0, 'Should have zero state tax rate for TX');
  assert(state.state_tax_liability === 0, 'Should have no state tax liability');
  assert(state.no_state_tax === true, 'Should indicate TX has no state tax');
});

test('CapitalGainsTaxCalculator - Strategy Analysis', () => {
  const calc = new CapitalGainsTaxCalculator();
  const result = calc.calculate({
    property_details: {
      sale_price: 800000,
      original_purchase_price: 500000,
      purchase_date: '2020-01-01',
      sale_date: '2024-01-01',
      property_type: 'investment_property'
    },
    taxpayer_profile: {
      filing_status: 'married_filing_jointly',
      annual_income: 250000
    },
    tax_strategies: {
      consider_1031_exchange: true,
      installment_sale_option: true,
      opportunity_zone_investment: true,
      harvest_losses: true
    },
    analysis_options: {
      strategy_comparison: true
    }
  });

  const strategies = result.strategy_analysis;
  assert(strategies, 'Should include strategy analysis when requested');
  assert(Array.isArray(strategies.available_strategies), 'Should provide available strategies');
  assert(strategies.available_strategies.length > 0, 'Should have multiple strategies');

  const strategy_names = strategies.available_strategies.map(s => s.strategy);
  assert(strategy_names.includes('1031 Like-Kind Exchange'), 'Should include 1031 exchange');
  assert(strategy_names.includes('Installment Sale'), 'Should include installment sale');
  assert(strategy_names.includes('Opportunity Zone Investment'), 'Should include opportunity zones');

  if (strategies.best_strategy) {
    assert(strategies.best_strategy.tax_savings > 0, 'Best strategy should show tax savings');
    assert(Array.isArray(strategies.best_strategy.requirements), 'Should list strategy requirements');
  }
});

test('CapitalGainsTaxCalculator - Timing Optimization', () => {
  const calc = new CapitalGainsTaxCalculator();
  const result = calc.calculate({
    property_details: {
      sale_price: 600000,
      original_purchase_price: 400000,
      purchase_date: '2020-01-01',
      sale_date: '2024-01-01',
      property_type: 'investment_property'
    },
    taxpayer_profile: {
      filing_status: 'single',
      annual_income: 150000
    },
    analysis_options: {
      timing_optimization: true
    }
  });

  const timing = result.timing_analysis;
  assert(timing, 'Should include timing analysis when requested');
  assert(Array.isArray(timing.timing_scenarios), 'Should provide timing scenarios');
  assert(timing.timing_scenarios.length >= 2, 'Should have multiple timing scenarios');

  const scenarios = timing.timing_scenarios;
  assert(scenarios.find(s => s.scenario === 'Sell This Year'), 'Should include current year scenario');
  assert(scenarios.find(s => s.scenario === 'Sell Next Year'), 'Should include next year scenario');

  if (timing.optimal_timing) {
    assert(timing.optimal_timing.tax_liability >= 0, 'Should show tax liability for optimal timing');
  }

  assert(Array.isArray(timing.timing_factors), 'Should list timing factors');
});

test('CapitalGainsTaxCalculator - Year Comparison', () => {
  const calc = new CapitalGainsTaxCalculator();
  const result = calc.calculate({
    property_details: {
      sale_price: 500000,
      original_purchase_price: 350000,
      purchase_date: '2020-01-01',
      sale_date: '2024-01-01',
      property_type: 'investment_property'
    },
    taxpayer_profile: {
      filing_status: 'single',
      annual_income: 100000
    },
    analysis_options: {
      compare_tax_years: true
    }
  });

  const years = result.year_comparison;
  assert(years, 'Should include year comparison when requested');
  assert(Array.isArray(years.year_comparisons), 'Should provide year comparisons');
  assert(years.year_comparisons.length >= 2, 'Should compare multiple years');

  years.year_comparisons.forEach(year => {
    assert(year.tax_year >= 2024, 'Should include current and future years');
    assert(year.federal_tax >= 0, 'Should calculate federal tax for each year');
    assert(year.effective_rate >= 0, 'Should calculate effective rate for each year');
  });

  assert(Array.isArray(years.tax_planning_notes), 'Should provide tax planning notes');
});

test('CapitalGainsTaxCalculator - Recommendations Generation', () => {
  const calc = new CapitalGainsTaxCalculator();
  const result = calc.calculate({
    property_details: {
      sale_price: 750000,
      original_purchase_price: 400000,
      purchase_date: '2020-01-01',
      sale_date: '2024-01-01',
      property_type: 'investment_property'
    },
    taxpayer_profile: {
      filing_status: 'married_filing_jointly',
      annual_income: 180000
    }
  });

  const recommendations = result.recommendations;
  assert(recommendations, 'Should provide recommendations');
  assert(Array.isArray(recommendations.recommendations), 'Should have recommendations array');
  assert(recommendations.recommendations.length > 0, 'Should have multiple recommendations');
  assert(recommendations.overall_assessment, 'Should provide overall assessment');

  const categories = recommendations.recommendations.map(r => r.category);
  assert(categories.length > 0, 'Should categorize recommendations');

  assert(Array.isArray(recommendations.key_action_items), 'Should provide action items');
  assert(recommendations.key_action_items.length > 0, 'Should have action items');
});

test('CapitalGainsTaxCalculator - Primary Residence Not Qualifying', () => {
  const calc = new CapitalGainsTaxCalculator();
  const result = calc.calculate({
    property_details: {
      sale_price: 650000,
      original_purchase_price: 400000,
      purchase_date: '2023-01-01',
      sale_date: '2024-01-01',
      property_type: 'primary_residence'
    },
    taxpayer_profile: {
      filing_status: 'single',
      annual_income: 90000,
      years_in_primary_residence: 1 // Less than 2 years required
    }
  });

  const primary = result.primary_residence_analysis;
  assert(primary.qualifies_for_exclusion === false, 'Should not qualify with only 1 year residence');
  assert(primary.excluded_gain === 0, 'Should have no excluded gain');
  assert(primary.taxable_gain_after_exclusion === 250000, 'Should have full gain taxable');

  // Should recommend waiting to qualify
  const recommendations = result.recommendations.recommendations;
  const delayRec = recommendations.find(r => r.recommendation.includes('delaying sale'));
  assert(delayRec, 'Should recommend delaying sale to qualify for exclusion');
});

test('CapitalGainsTaxCalculator - Holding Period Calculation', () => {
  const calc = new CapitalGainsTaxCalculator();
  
  // Test exact 1 year
  const result1 = calc.calculate({
    property_details: {
      sale_price: 400000,
      original_purchase_price: 350000,
      purchase_date: '2023-01-01',
      sale_date: '2024-01-01',
      property_type: 'investment_property'
    },
    taxpayer_profile: {
      filing_status: 'single',
      annual_income: 80000
    }
  });

  assert(result1.gain_loss_analysis.holding_period.years === 1, 'Should calculate 1 year holding period');
  assert(result1.gain_loss_analysis.is_long_term === true, 'Should be long-term at exactly 1 year');

  // Test less than 1 year
  const result2 = calc.calculate({
    property_details: {
      sale_price: 400000,
      original_purchase_price: 350000,
      purchase_date: '2023-06-01',
      sale_date: '2024-01-01',
      property_type: 'investment_property'
    },
    taxpayer_profile: {
      filing_status: 'single',
      annual_income: 80000
    }
  });

  assert(result2.gain_loss_analysis.is_long_term === false, 'Should be short-term for less than 1 year');
});

test('CapitalGainsTaxCalculator - Schema Validation', () => {
  const calc = new CapitalGainsTaxCalculator();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.property_details, 'Should have property_details property');
  assert(schema.properties.taxpayer_profile, 'Should have taxpayer_profile property');
  assert(schema.properties.property_improvements, 'Should have property_improvements property');
  assert(schema.properties.depreciation_details, 'Should have depreciation_details property');
  assert(schema.properties.tax_strategies, 'Should have tax_strategies property');
  assert(schema.properties.analysis_options, 'Should have analysis_options property');
  
  assert(schema.required.includes('property_details'), 'property_details should be required');
  assert(schema.required.includes('taxpayer_profile'), 'taxpayer_profile should be required');
  
  // Test nested schema structure
  const propertyDetails = schema.properties.property_details;
  assert(propertyDetails.properties.sale_price, 'Should define sale_price');
  assert(propertyDetails.properties.original_purchase_price, 'Should define original_purchase_price');
  assert(propertyDetails.properties.property_type, 'Should define property_type');
  assert(propertyDetails.required.includes('sale_price'), 'sale_price should be required');
  assert(propertyDetails.required.includes('original_purchase_price'), 'original_purchase_price should be required');
});