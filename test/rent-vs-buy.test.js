import { test } from 'node:test';
import assert from 'node:assert';
import { RentVsBuyCalculator } from '../src/calculators/rent-vs-buy.js';

test('RentVsBuyCalculator - Basic Rent vs Buy Analysis', () => {
  const calc = new RentVsBuyCalculator();
  const result = calc.calculate({
    home_details: {
      home_price: 400000,
      down_payment_percent: 20,
      interest_rate: 6.5,
      property_tax_rate: 1.2,
      home_insurance_annual: 1200,
      loan_term_years: 30
    },
    rental_details: {
      monthly_rent: 2500,
      renters_insurance_annual: 200,
      security_deposit: 2500
    },
    lifestyle_factors: {
      expected_years_in_home: 7
    }
  });

  // Test structure
  assert(result.comparison_summary, 'Should have comparison summary');
  assert(result.buying_analysis, 'Should have buying analysis');
  assert(result.renting_analysis, 'Should have renting analysis');
  assert(result.comparison, 'Should have comparison');
  assert(result.recommendations, 'Should have recommendations');

  // Test comparison summary
  const summary = result.comparison_summary;
  assert(['Buy', 'Rent', 'Neutral'].includes(summary.decision), 'Should have valid decision');
  assert(['High', 'Medium', 'Low'].includes(summary.confidence_level), 'Should have valid confidence level');
  assert(typeof summary.net_benefit_buy === 'number', 'Should calculate net benefit for buying');
  assert(summary.time_horizon === 7, 'Should preserve time horizon');

  // Test buying analysis
  const buying = result.buying_analysis;
  assert(buying.upfront_costs.down_payment === 80000, 'Should calculate 20% down payment');
  assert(buying.upfront_costs.closing_costs > 0, 'Should calculate closing costs');
  assert(buying.monthly_costs.total_monthly > 2000, 'Should calculate total monthly payment');
  assert(buying.long_term_analysis.equity_buildup > 0, 'Should calculate equity buildup');
  assert(buying.long_term_analysis.future_home_value > 400000, 'Should appreciate home value');

  // Test renting analysis
  const renting = result.renting_analysis;
  assert(renting.upfront_costs.security_deposit === 2500, 'Should preserve security deposit');
  assert(renting.monthly_costs.base_rent === 2500, 'Should preserve base rent');
  assert(renting.long_term_analysis.total_rent_paid > 0, 'Should calculate total rent paid');
  assert(renting.long_term_analysis.rent_progression.length === 7, 'Should have 7 years of rent progression');
});

test('RentVsBuyCalculator - High Down Payment Scenario', () => {
  const calc = new RentVsBuyCalculator();
  const result = calc.calculate({
    home_details: {
      home_price: 500000,
      down_payment_percent: 40,
      interest_rate: 6.0,
      property_tax_rate: 1.5
    },
    rental_details: {
      monthly_rent: 3000
    },
    lifestyle_factors: {
      expected_years_in_home: 10
    }
  });

  const buying = result.buying_analysis;
  assert(buying.upfront_costs.down_payment === 200000, 'Should calculate 40% down payment');
  assert(buying.monthly_costs.pmi === 0, 'Should have no PMI with 40% down');
  assert(buying.financing_details.loan_amount === 300000, 'Should calculate correct loan amount');
});

test('RentVsBuyCalculator - Low Down Payment with PMI', () => {
  const calc = new RentVsBuyCalculator();
  const result = calc.calculate({
    home_details: {
      home_price: 350000,
      down_payment_percent: 5,
      interest_rate: 7.0,
      pmi_rate: 0.75
    },
    rental_details: {
      monthly_rent: 2200
    },
    lifestyle_factors: {
      expected_years_in_home: 5
    }
  });

  const buying = result.buying_analysis;
  assert(buying.upfront_costs.down_payment === 17500, 'Should calculate 5% down payment');
  assert(buying.monthly_costs.pmi > 0, 'Should calculate PMI for low down payment');
  assert(buying.financing_details.loan_amount === 332500, 'Should calculate correct loan amount');
  
  const expected_pmi = (332500 * 0.0075) / 12;
  assert(Math.abs(buying.monthly_costs.pmi - expected_pmi) < 1, 'Should calculate correct PMI amount');
});

test('RentVsBuyCalculator - Short Time Horizon Analysis', () => {
  const calc = new RentVsBuyCalculator();
  const result = calc.calculate({
    home_details: {
      home_price: 300000,
      down_payment_percent: 20,
      interest_rate: 6.5
    },
    rental_details: {
      monthly_rent: 2000
    },
    lifestyle_factors: {
      expected_years_in_home: 2
    }
  });

  // Short time horizon typically favors renting
  const recommendations = result.recommendations.recommendations;
  const timeHorizonRec = recommendations.find(r => r.category === 'Time Horizon');
  assert(timeHorizonRec, 'Should include time horizon recommendation');
  assert(timeHorizonRec.recommendation.includes('Short time horizon'), 'Should identify short time horizon');
});

test('RentVsBuyCalculator - Long Time Horizon Analysis', () => {
  const calc = new RentVsBuyCalculator();
  const result = calc.calculate({
    home_details: {
      home_price: 450000,
      down_payment_percent: 25,
      interest_rate: 6.0
    },
    rental_details: {
      monthly_rent: 2800
    },
    lifestyle_factors: {
      expected_years_in_home: 15
    }
  });

  // Long time horizon typically favors buying
  const buying = result.buying_analysis;
  assert(buying.long_term_analysis.equity_buildup > 50000, 'Should build significant equity over 15 years');
  assert(buying.long_term_analysis.appreciation_gain > 0, 'Should have appreciation gains');
});

test('RentVsBuyCalculator - Market Assumptions Impact', () => {
  const calc = new RentVsBuyCalculator();
  
  // High appreciation scenario
  const highAppreciationResult = calc.calculate({
    home_details: {
      home_price: 400000,
      down_payment_percent: 20,
      interest_rate: 6.5
    },
    rental_details: {
      monthly_rent: 2500
    },
    market_assumptions: {
      home_appreciation_rate: 5.0,
      rent_increase_rate: 2.0
    },
    lifestyle_factors: {
      expected_years_in_home: 7
    }
  });
  
  // Low appreciation scenario
  const lowAppreciationResult = calc.calculate({
    home_details: {
      home_price: 400000,
      down_payment_percent: 20,
      interest_rate: 6.5
    },
    rental_details: {
      monthly_rent: 2500
    },
    market_assumptions: {
      home_appreciation_rate: 1.0,
      rent_increase_rate: 4.0
    },
    lifestyle_factors: {
      expected_years_in_home: 7
    }
  });

  const highAppBuying = highAppreciationResult.buying_analysis;
  const lowAppBuying = lowAppreciationResult.buying_analysis;
  
  assert(highAppBuying.long_term_analysis.future_home_value > 
         lowAppBuying.long_term_analysis.future_home_value, 
         'High appreciation should result in higher future home value');
});

test('RentVsBuyCalculator - Lifestyle Factor Analysis', () => {
  const calc = new RentVsBuyCalculator();
  const result = calc.calculate({
    home_details: {
      home_price: 375000,
      down_payment_percent: 20,
      interest_rate: 6.5
    },
    rental_details: {
      monthly_rent: 2400
    },
    lifestyle_factors: {
      expected_years_in_home: 6,
      mobility_importance: 'high',
      stability_importance: 'low',
      maintenance_preference: 'minimal'
    }
  });

  const lifestyle = result.comparison.lifestyle_analysis;
  assert(lifestyle.mobility_factor === 'high', 'Should preserve mobility importance');
  assert(lifestyle.stability_preference === 'low', 'Should preserve stability preference');
  assert(lifestyle.maintenance_comfort === 'minimal', 'Should preserve maintenance preference');
  
  // High mobility and minimal maintenance typically favor renting
  assert(lifestyle.lifestyle_score < 50, 'Should score lower for buy-oriented factors');
});

test('RentVsBuyCalculator - Breakeven Analysis', () => {
  const calc = new RentVsBuyCalculator();
  const result = calc.calculate({
    home_details: {
      home_price: 350000,
      down_payment_percent: 20,
      interest_rate: 6.5
    },
    rental_details: {
      monthly_rent: 2200
    },
    analysis_options: {
      breakeven_analysis: true
    }
  });

  const breakeven = result.breakeven_analysis;
  assert(breakeven, 'Should include breakeven analysis when requested');
  assert(Array.isArray(breakeven.scenarios), 'Should provide breakeven scenarios');
  assert(breakeven.scenarios.length === 15, 'Should test 15 different time horizons');
  
  breakeven.scenarios.forEach(scenario => {
    assert(scenario.years >= 1 && scenario.years <= 15, 'Should have valid year range');
    assert(typeof scenario.buying_total_cost === 'number', 'Should calculate buying cost');
    assert(typeof scenario.renting_total_cost === 'number', 'Should calculate renting cost');
    assert(['Buy', 'Rent'].includes(scenario.better_choice), 'Should identify better choice');
  });
});

test('RentVsBuyCalculator - Sensitivity Analysis', () => {
  const calc = new RentVsBuyCalculator();
  const result = calc.calculate({
    home_details: {
      home_price: 400000,
      down_payment_percent: 20,
      interest_rate: 6.5
    },
    rental_details: {
      monthly_rent: 2500
    },
    analysis_options: {
      sensitivity_analysis: true
    }
  });

  const sensitivity = result.sensitivity_analysis;
  assert(sensitivity, 'Should include sensitivity analysis when requested');
  assert(Array.isArray(sensitivity.sensitivity_results), 'Should provide sensitivity results');
  assert(sensitivity.sensitivity_results.length >= 3, 'Should test multiple sensitivity factors');
  assert(sensitivity.most_sensitive_factor, 'Should identify most sensitive factor');
  
  sensitivity.sensitivity_results.forEach(factor => {
    assert(factor.factor, 'Should have factor name');
    assert(Array.isArray(factor.scenarios), 'Should have scenarios for each factor');
    assert(factor.scenarios.length === 5, 'Should test 5 different adjustments');
  });
});

test('RentVsBuyCalculator - Cash Flow Analysis', () => {
  const calc = new RentVsBuyCalculator();
  const result = calc.calculate({
    home_details: {
      home_price: 380000,
      down_payment_percent: 20,
      interest_rate: 6.0
    },
    rental_details: {
      monthly_rent: 2300
    },
    lifestyle_factors: {
      expected_years_in_home: 8
    },
    analysis_options: {
      cash_flow_analysis: true
    }
  });

  const cashFlow = result.cash_flow_analysis;
  assert(cashFlow, 'Should include cash flow analysis when requested');
  assert(Array.isArray(cashFlow.cash_flow_comparison), 'Should provide cash flow comparison');
  assert(cashFlow.cash_flow_comparison.length === 8, 'Should have 8 years of cash flow data');
  
  const summary = cashFlow.summary;
  assert(typeof summary.average_monthly_difference === 'number', 'Should calculate average monthly difference');
  assert(typeof summary.upfront_difference === 'number', 'Should calculate upfront difference');
  
  cashFlow.cash_flow_comparison.forEach((year, index) => {
    assert(year.year === index + 1, 'Should have correct year number');
    assert(typeof year.annual_buy_cost === 'number', 'Should calculate annual buy cost');
    assert(typeof year.annual_rent_cost === 'number', 'Should calculate annual rent cost');
    assert(typeof year.cumulative_buy_cost === 'number', 'Should calculate cumulative buy cost');
    assert(typeof year.cumulative_rent_cost === 'number', 'Should calculate cumulative rent cost');
  });
});

test('RentVsBuyCalculator - Risk Assessment', () => {
  const calc = new RentVsBuyCalculator();
  const result = calc.calculate({
    home_details: {
      home_price: 600000,
      down_payment_percent: 10, // Low down payment
      interest_rate: 7.5 // High interest rate
    },
    rental_details: {
      monthly_rent: 3500
    },
    market_assumptions: {
      home_appreciation_rate: 1.0 // Low appreciation
    }
  });

  const risk = result.comparison.risk_analysis;
  assert(Array.isArray(risk.identified_risks), 'Should identify specific risks');
  assert(risk.identified_risks.length > 0, 'Should identify multiple risks');
  assert(['High', 'Medium', 'Low'].includes(risk.overall_risk_level), 'Should assign valid risk level');
  assert(Array.isArray(risk.risk_mitigation_strategies), 'Should provide mitigation strategies');
  
  // Should identify market risk due to low appreciation
  const marketRisk = risk.identified_risks.find(r => r.category === 'Market Risk');
  assert(marketRisk, 'Should identify market risk with low appreciation');
});

test('RentVsBuyCalculator - High-Cost Market Analysis', () => {
  const calc = new RentVsBuyCalculator();
  const result = calc.calculate({
    home_details: {
      home_price: 800000,
      down_payment_percent: 20,
      interest_rate: 6.8,
      property_tax_rate: 2.0, // High property taxes
      home_insurance_annual: 2400
    },
    rental_details: {
      monthly_rent: 4500,
      renters_insurance_annual: 300
    },
    lifestyle_factors: {
      expected_years_in_home: 5
    }
  });

  const buying = result.buying_analysis;
  const renting = result.renting_analysis;
  
  assert(buying.upfront_costs.total_upfront > 180000, 'Should have high upfront costs');
  assert(buying.monthly_costs.property_tax > 1000, 'Should have high property taxes');
  assert(renting.monthly_costs.base_rent === 4500, 'Should preserve high rent');
  
  // In high-cost markets with short time horizon, renting often wins
  const comparison = result.comparison;
  assert(typeof comparison.financial_comparison.financial_advantage === 'number', 'Should calculate financial advantage');
});

test('RentVsBuyCalculator - First-Time Buyer Scenario', () => {
  const calc = new RentVsBuyCalculator();
  const result = calc.calculate({
    home_details: {
      home_price: 280000,
      down_payment_percent: 5, // First-time buyer low down
      interest_rate: 7.0,
      pmi_rate: 0.8
    },
    rental_details: {
      monthly_rent: 1800
    },
    financial_profile: {
      emergency_fund_months: 3 // Lower emergency fund
    },
    lifestyle_factors: {
      expected_years_in_home: 6,
      stability_importance: 'high'
    }
  });

  const buying = result.buying_analysis;
  assert(buying.upfront_costs.down_payment === 14000, 'Should calculate 5% down payment');
  assert(buying.monthly_costs.pmi > 0, 'Should have PMI with low down payment');
  
  const recommendations = result.recommendations.recommendations;
  assert(recommendations.length > 0, 'Should provide recommendations');
  
  // Should consider the low emergency fund in risk assessment
  const risk = result.comparison.risk_analysis;
  assert(risk.identified_risks.some(r => r.category.includes('Risk')), 
         'Should identify risks with low down payment');
});

test('RentVsBuyCalculator - Investment Return Consideration', () => {
  const calc = new RentVsBuyCalculator();
  const result = calc.calculate({
    home_details: {
      home_price: 400000,
      down_payment_percent: 20,
      interest_rate: 6.0
    },
    rental_details: {
      monthly_rent: 2400
    },
    market_assumptions: {
      investment_return_rate: 9.0 // High investment returns available
    },
    lifestyle_factors: {
      expected_years_in_home: 6
    }
  });

  const renting = result.renting_analysis;
  const opportunityCost = renting.long_term_analysis.opportunity_cost_analysis;
  
  assert(opportunityCost.potential_investment_value > 80000, 
         'Should calculate potential investment value of down payment');
  assert(opportunityCost.foregone_returns > 0, 'Should calculate foregone returns');
});

test('RentVsBuyCalculator - Recommendations Generation', () => {
  const calc = new RentVsBuyCalculator();
  const result = calc.calculate({
    home_details: {
      home_price: 350000,
      down_payment_percent: 20,
      interest_rate: 6.5
    },
    rental_details: {
      monthly_rent: 2200
    },
    lifestyle_factors: {
      expected_years_in_home: 8,
      mobility_importance: 'low',
      stability_importance: 'high'
    }
  });

  const recommendations = result.recommendations;
  assert(recommendations, 'Should provide recommendations');
  assert(Array.isArray(recommendations.recommendations), 'Should have recommendations array');
  assert(recommendations.recommendations.length > 0, 'Should have multiple recommendations');
  assert(recommendations.overall_assessment, 'Should provide overall assessment');
  
  const categories = recommendations.recommendations.map(r => r.category);
  assert(categories.includes('Primary Decision'), 'Should include primary decision');
  
  assert(Array.isArray(recommendations.key_considerations), 'Should provide key considerations');
  assert(recommendations.key_considerations.length > 0, 'Should have key considerations');
});

test('RentVsBuyCalculator - Neutral Decision Scenario', () => {
  const calc = new RentVsBuyCalculator();
  const result = calc.calculate({
    home_details: {
      home_price: 360000,
      down_payment_percent: 20,
      interest_rate: 6.5
    },
    rental_details: {
      monthly_rent: 2300 // Chosen to create near-neutral scenario
    },
    lifestyle_factors: {
      expected_years_in_home: 6,
      mobility_importance: 'medium',
      stability_importance: 'medium'
    }
  });

  const comparison = result.comparison;
  // Should handle neutral scenarios gracefully
  assert(['Buy', 'Rent', 'Neutral'].includes(comparison.recommended_choice), 
         'Should provide valid recommendation even in neutral scenarios');
  assert(['High', 'Medium', 'Low'].includes(comparison.confidence_level), 
         'Should provide confidence level');
});

test('RentVsBuyCalculator - Schema Validation', () => {
  const calc = new RentVsBuyCalculator();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.home_details, 'Should have home_details property');
  assert(schema.properties.rental_details, 'Should have rental_details property');
  assert(schema.properties.market_assumptions, 'Should have market_assumptions property');
  assert(schema.properties.maintenance_costs, 'Should have maintenance_costs property');
  assert(schema.properties.financial_profile, 'Should have financial_profile property');
  assert(schema.properties.lifestyle_factors, 'Should have lifestyle_factors property');
  assert(schema.properties.analysis_options, 'Should have analysis_options property');
  
  assert(schema.required.includes('home_details'), 'home_details should be required');
  assert(schema.required.includes('rental_details'), 'rental_details should be required');
  
  // Test nested schema structure
  const homeDetails = schema.properties.home_details;
  assert(homeDetails.properties.home_price, 'Should define home_price');
  assert(homeDetails.properties.down_payment_percent, 'Should define down_payment_percent');
  assert(homeDetails.properties.interest_rate, 'Should define interest_rate');
  assert(homeDetails.required.includes('home_price'), 'home_price should be required');
  assert(homeDetails.required.includes('down_payment_percent'), 'down_payment_percent should be required');
  assert(homeDetails.required.includes('interest_rate'), 'interest_rate should be required');
  
  const rentalDetails = schema.properties.rental_details;
  assert(rentalDetails.properties.monthly_rent, 'Should define monthly_rent');
  assert(rentalDetails.required.includes('monthly_rent'), 'monthly_rent should be required');
});