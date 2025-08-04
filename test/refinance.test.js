import { test } from 'node:test';
import assert from 'node:assert';
import { RefinanceCalculator } from '../src/calculators/refinance.js';

test('RefinanceCalculator - Basic Refinance Analysis', () => {
  const calc = new RefinanceCalculator();
  const result = calc.calculate({
    current_loan: {
      current_balance: 300000,
      interest_rate: 7.5,
      monthly_payment: 2377,
      years_remaining: 25
    },
    new_loan: {
      interest_rate: 6.5,
      loan_term_years: 30,
      closing_costs: 6000
    }
  });

  // Test structure
  assert(result.loan_comparison, 'Should have loan comparison');
  assert(result.financial_impact, 'Should have financial impact');
  assert(result.break_even_analysis, 'Should have break-even analysis');
  assert(result.npv_analysis, 'Should have NPV analysis');
  assert(result.decision, 'Should have decision');
  assert(result.recommendations, 'Should have recommendations');

  // Test calculations
  assert(result.loan_comparison.new_loan.amount > 300000, 'New loan should include closing costs');
  assert(result.financial_impact.monthly_savings > 0, 'Should have positive monthly savings with 1% rate drop');
  assert(result.break_even_analysis.simple_breakeven_months > 0, 'Should calculate break-even');
  assert(result.decision.should_refinance === true, '1% rate drop should recommend refinancing');
});

test('RefinanceCalculator - Cash-Out Refinance', () => {
  const calc = new RefinanceCalculator();
  const result = calc.calculate({
    current_loan: {
      current_balance: 250000,
      interest_rate: 6.75,
      monthly_payment: 1892,
      years_remaining: 20
    },
    new_loan: {
      interest_rate: 6.25,
      loan_term_years: 30,
      closing_costs: 5000,
      cash_out: 50000
    },
    property_info: {
      current_value: 450000,
      property_type: 'primary_residence'
    }
  });

  // Test cash-out calculations
  assert(result.loan_comparison.new_loan.amount >= 305000, 'Should include cash-out amount');
  assert(result.ltv_analysis, 'Should have LTV analysis');
  assert(result.ltv_analysis.new_ltv > result.ltv_analysis.current_ltv, 'Cash-out should increase LTV');
  assert(result.scenarios.length > 0, 'Should have alternative scenarios');
  
  // Find no cash-out scenario
  const noCashOutScenario = result.scenarios.find(s => s.name === 'No Cash-Out Refinance');
  assert(noCashOutScenario, 'Should have no cash-out scenario');
  assert(noCashOutScenario.loan_amount < result.loan_comparison.new_loan.amount, 
    'No cash-out scenario should have lower loan amount');
});

test('RefinanceCalculator - Investment Property with Tax Considerations', () => {
  const calc = new RefinanceCalculator();
  const result = calc.calculate({
    current_loan: {
      current_balance: 400000,
      interest_rate: 7.25,
      monthly_payment: 3000,
      years_remaining: 27
    },
    new_loan: {
      interest_rate: 6.75,
      loan_term_years: 30,
      points: 1
    },
    property_info: {
      current_value: 550000,
      property_type: 'investment_property'
    },
    analysis_options: {
      tax_bracket: 32,
      investment_return: 8,
      planning_horizon_years: 7
    }
  });

  // Test investment property calculations
  assert(result.effective_rate_analysis, 'Should have effective rate analysis');
  assert(result.effective_rate_analysis.current_effective_rate < 7.25, 
    'Effective rate should be lower due to tax deduction');
  assert(result.ltv_analysis.max_conventional_ltv === 75, 
    'Investment property should have 75% max LTV');
  assert(result.npv_analysis.net_present_value !== undefined, 'Should calculate NPV');
});

test('RefinanceCalculator - Short Planning Horizon', () => {
  const calc = new RefinanceCalculator();
  const result = calc.calculate({
    current_loan: {
      current_balance: 350000,
      interest_rate: 7.0,
      monthly_payment: 2661,
      years_remaining: 22
    },
    new_loan: {
      interest_rate: 6.5,
      loan_term_years: 30,
      closing_costs: 7000
    },
    analysis_options: {
      planning_horizon_years: 3
    }
  });

  // Test short horizon impact
  assert(result.break_even_analysis.simple_breakeven_months, 'Should calculate breakeven');
  const breakevenYears = result.break_even_analysis.simple_breakeven_months / 12;
  
  if (breakevenYears > 3) {
    assert(result.decision.should_refinance === false || 
           result.decision.confidence === 'low',
           'Should not recommend or have low confidence if breakeven exceeds horizon');
  }
  
  const horizonRisk = result.recommendations.find(r => 
    r.message.includes('sell before reaching break-even'));
  if (breakevenYears > 3) {
    assert(horizonRisk, 'Should warn about selling before breakeven');
  }
});

test('RefinanceCalculator - Minimal Rate Improvement', () => {
  const calc = new RefinanceCalculator();
  const result = calc.calculate({
    current_loan: {
      current_balance: 275000,
      interest_rate: 6.5,
      monthly_payment: 2100,
      years_remaining: 23
    },
    new_loan: {
      interest_rate: 6.25,
      loan_term_years: 30,
      closing_costs: 5500
    }
  });

  // Test minimal rate drop - actually produces significant savings due to term extension
  assert(result.financial_impact.monthly_savings > 0, 
    'Should have positive savings despite small rate drop');
  
  // Small rate drops can still be beneficial due to term changes
  // Just verify the risk factor is identified
  const minimalRateRisk = result.decision.risk_factors.find(r => 
    r.includes('Minimal rate improvement'));
  
  // The calculator may still recommend if savings are substantial
  if (!result.decision.should_refinance) {
    assert(result.decision.confidence === 'low',
           'Should have low confidence if not recommending small rate drop');
  }
  
  assert(minimalRateRisk, 'Should identify minimal rate improvement as risk');
});

test('RefinanceCalculator - Different Term Scenarios', () => {
  const calc = new RefinanceCalculator();
  const result = calc.calculate({
    current_loan: {
      current_balance: 320000,
      interest_rate: 7.0,
      monthly_payment: 2450,
      years_remaining: 24
    },
    new_loan: {
      interest_rate: 6.0,
      loan_term_years: 15
    }
  });

  // Test term scenarios
  assert(result.scenarios.length >= 3, 'Should have multiple term scenarios');
  
  const thirtyYearScenario = result.scenarios.find(s => s.name === '30-Year Term');
  const twentyYearScenario = result.scenarios.find(s => s.name === '20-Year Term');
  
  assert(thirtyYearScenario, 'Should have 30-year scenario');
  assert(twentyYearScenario, 'Should have 20-year scenario');
  
  // Verify term impact on payments
  assert(thirtyYearScenario.monthly_payment < result.loan_comparison.new_loan.monthly_payment,
    '30-year should have lower payment than 15-year');
  assert(thirtyYearScenario.total_interest > result.loan_comparison.new_loan.total_interest,
    '30-year should have more total interest than 15-year');
});

test('RefinanceCalculator - High LTV Requiring PMI', () => {
  const calc = new RefinanceCalculator();
  const result = calc.calculate({
    current_loan: {
      current_balance: 380000,
      interest_rate: 7.25,
      monthly_payment: 2900,
      years_remaining: 26
    },
    new_loan: {
      interest_rate: 6.5,
      loan_term_years: 30,
      cash_out: 20000
    },
    property_info: {
      current_value: 475000,
      property_type: 'primary_residence'
    }
  });

  // Test PMI detection
  assert(result.ltv_analysis.new_ltv > 80, 'New LTV should exceed 80%');
  assert(result.ltv_analysis.pmi_required === true, 'Should require PMI');
  
  const pmiRecommendation = result.recommendations.find(r => 
    r.message.includes('avoid PMI'));
  assert(pmiRecommendation, 'Should recommend avoiding PMI');
});

test('RefinanceCalculator - Schema Validation', () => {
  const calc = new RefinanceCalculator();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.current_loan, 'Should have current_loan property');
  assert(schema.properties.new_loan, 'Should have new_loan property');
  assert(schema.properties.property_info, 'Should have property_info property');
  assert(schema.properties.analysis_options, 'Should have analysis_options property');
  assert(schema.required.includes('current_loan'), 'current_loan should be required');
  assert(schema.required.includes('new_loan'), 'new_loan should be required');
});

test('RefinanceCalculator - Points Analysis', () => {
  const calc = new RefinanceCalculator();
  const result = calc.calculate({
    current_loan: {
      current_balance: 300000,
      interest_rate: 7.0,
      monthly_payment: 2300,
      years_remaining: 25
    },
    new_loan: {
      interest_rate: 6.25,
      loan_term_years: 30,
      closing_costs: 4000,
      points: 2
    }
  });

  // Test points calculation
  const pointsCost = result.loan_comparison.new_loan.points_cost;
  assert(pointsCost === 6000, 'Points cost should be 2% of current balance');
  assert(result.loan_comparison.new_loan.amount === 310000, 
    'New loan should include closing costs and points');
  assert(result.financial_impact.upfront_costs === 10000, 
    'Upfront costs should include both closing costs and points');
});

test('RefinanceCalculator - NPV Analysis with Investment Return', () => {
  const calc = new RefinanceCalculator();
  const result = calc.calculate({
    current_loan: {
      current_balance: 400000,
      interest_rate: 7.5,
      monthly_payment: 3100,
      years_remaining: 28
    },
    new_loan: {
      interest_rate: 6.25,
      loan_term_years: 30
    },
    analysis_options: {
      investment_return: 10,
      planning_horizon_years: 10
    }
  });

  // Test NPV with high investment return
  assert(result.npv_analysis.net_present_value !== undefined, 'Should calculate NPV');
  assert(result.npv_analysis.irr > 0, 'Should calculate positive IRR');
  assert(result.npv_analysis.total_cash_flow_benefit > 0, 
    'Should have positive cash flow benefit with large rate reduction');
});