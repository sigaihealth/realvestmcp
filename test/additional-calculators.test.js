import { test } from 'node:test';
import assert from 'node:assert';
import { NPVCalculator } from '../src/calculators/npv.js';
import { COCRCalculator } from '../src/calculators/cocr.js';
import { DSCRCalculator } from '../src/calculators/dscr.js';
import { BreakevenCalculator } from '../src/calculators/breakeven.js';

// ========== NPV CALCULATOR TESTS ==========

test('NPVCalculator - Basic Calculation', () => {
  const calc = new NPVCalculator();
  const result = calc.calculate({
    initial_investment: -100000,
    cash_flows: [
      { period: 1, amount: 20000 },
      { period: 2, amount: 25000 },
      { period: 3, amount: 30000 },
      { period: 4, amount: 35000 },
      { period: 5, amount: 40000 }
    ],
    discount_rate: 10
  });

  // Test structure
  assert(result.npv_analysis, 'Should have NPV analysis');
  assert(result.investment_metrics, 'Should have investment metrics');
  assert(result.payback_analysis, 'Should have payback analysis');
  assert(result.decision_criteria, 'Should have decision criteria');
  assert(result.sensitivity_analysis, 'Should have sensitivity analysis');
  assert(result.cash_flow_schedule, 'Should have cash flow schedule');
  assert(result.recommendations, 'Should have recommendations');

  // Test calculations
  assert(result.npv_analysis.nominal_npv !== 0, 'Should calculate NPV');
  assert(result.investment_metrics.total_cash_inflows === 150000, 'Should sum cash inflows correctly');
  assert(result.payback_analysis.simple_payback_period > 0, 'Should calculate payback period');
  assert(result.cash_flow_schedule.length === 6, 'Should have 6 entries (initial + 5 periods)');
});

test('NPVCalculator - Terminal Value', () => {
  const calc = new NPVCalculator();
  const result = calc.calculate({
    initial_investment: -200000,
    cash_flows: [
      { period: 1, amount: 15000 },
      { period: 2, amount: 18000 },
      { period: 3, amount: 22000 }
    ],
    discount_rate: 12,
    terminal_value: 250000,
    terminal_period: 3
  });

  // Terminal value should be added to period 3
  const period3 = result.cash_flow_schedule.find(cf => cf.period === 3);
  assert(period3.cash_flow === 272000, 'Should include terminal value in period 3');
  assert(result.npv_analysis.nominal_npv > 0, 'Should have positive NPV with terminal value');
});

test('NPVCalculator - Inflation Adjustment', () => {
  const calc = new NPVCalculator();
  const result = calc.calculate({
    initial_investment: -50000,
    cash_flows: [
      { period: 1, amount: 15000 },
      { period: 2, amount: 15000 },
      { period: 3, amount: 15000 }
    ],
    discount_rate: 10,
    inflation_rate: 3
  });

  assert(result.npv_analysis.real_npv !== null, 'Should calculate real NPV');
  assert(result.npv_analysis.real_discount_rate !== null, 'Should calculate real discount rate');
  assert(result.npv_analysis.real_npv > result.npv_analysis.nominal_npv, 
    'Real NPV should be greater than nominal NPV when inflation is positive');
});

test('NPVCalculator - Sensitivity Analysis', () => {
  const calc = new NPVCalculator();
  const result = calc.calculate({
    initial_investment: -75000,
    cash_flows: [
      { period: 1, amount: 25000 },
      { period: 2, amount: 30000 },
      { period: 3, amount: 35000 }
    ],
    discount_rate: 8
  });

  const sensitivity = result.sensitivity_analysis;
  assert(sensitivity.scenarios.length >= 10, 'Should have multiple scenarios');
  assert(sensitivity.break_even_discount_rate > 0, 'Should find break-even rate');
  assert(sensitivity.most_sensitive_to, 'Should identify most sensitive variable');
  
  // Check that different discount rates produce different NPVs
  const discountScenarios = sensitivity.scenarios.filter(s => s.variable === 'Discount Rate');
  const npvs = discountScenarios.map(s => s.npv);
  assert(new Set(npvs).size === npvs.length, 'Different rates should produce different NPVs');
});

test('NPVCalculator - Schema Validation', () => {
  const calc = new NPVCalculator();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.initial_investment, 'Should have initial_investment');
  assert(schema.properties.cash_flows, 'Should have cash_flows array');
  assert(schema.properties.discount_rate, 'Should have discount_rate');
  assert(schema.required.includes('initial_investment'), 'initial_investment should be required');
  assert(schema.required.includes('cash_flows'), 'cash_flows should be required');
});

// ========== COCR CALCULATOR TESTS ==========

test('COCRCalculator - Basic Calculation', () => {
  const calc = new COCRCalculator();
  const result = calc.calculate({
    purchase_price: 300000,
    down_payment: 60000,
    closing_costs: 5000,
    annual_rental_income: 36000,
    annual_expenses: {
      property_tax: 3600,
      insurance: 1200,
      maintenance: 1800
    },
    loan_details: {
      interest_rate: 6.5,
      loan_term_years: 30
    }
  });

  // Test structure
  assert(result.investment_summary, 'Should have investment summary');
  assert(result.income_analysis, 'Should have income analysis');
  assert(result.expense_analysis, 'Should have expense analysis');
  assert(result.cash_flow_analysis, 'Should have cash flow analysis');
  assert(result.return_metrics, 'Should have return metrics');
  assert(result.performance_rating, 'Should have performance rating');
  assert(result.monthly_breakdown, 'Should have monthly breakdown');
  assert(result.scenario_analysis, 'Should have scenario analysis');
  assert(result.five_year_projection, 'Should have 5-year projection');
  assert(result.recommendations, 'Should have recommendations');

  // Test calculations
  assert(result.investment_summary.total_cash_invested === 65000, 'Should calculate total cash correctly');
  assert(result.return_metrics.cash_on_cash_return > 0, 'Should calculate positive COCR');
  assert(result.five_year_projection.length === 5, 'Should have 5-year projection');
});

test('COCRCalculator - Vacancy Impact', () => {
  const calc = new COCRCalculator();
  const result = calc.calculate({
    purchase_price: 200000,
    down_payment: 40000,
    annual_rental_income: 24000,
    vacancy_rate: 10, // 10% vacancy
    loan_details: {
      interest_rate: 7.0,
      loan_term_years: 30
    }
  });

  // Check vacancy impact
  assert(result.income_analysis.vacancy_loss === 2400, 'Should calculate 10% vacancy loss');
  assert(result.income_analysis.effective_annual_income === 21600, 'Should reduce income by vacancy');
});

test('COCRCalculator - Cash Purchase', () => {
  const calc = new COCRCalculator();
  const result = calc.calculate({
    purchase_price: 150000,
    down_payment: 150000, // Full cash purchase
    annual_rental_income: 18000,
    annual_expenses: {
      property_tax: 2000,
      insurance: 800
    }
  });

  // No loan details provided = cash purchase
  assert(result.cash_flow_analysis.annual_debt_service === 0, 'Should have no debt service');
  assert(result.return_metrics.debt_coverage_ratio === null, 'Should have no DSCR for cash purchase');
});

test('COCRCalculator - Performance Rating', () => {
  const calc = new COCRCalculator();
  
  // Excellent performance scenario
  const excellentResult = calc.calculate({
    purchase_price: 100000,
    down_payment: 20000,
    annual_rental_income: 18000,
    annual_expenses: {
      property_tax: 1200,
      insurance: 600
    },
    loan_details: {
      interest_rate: 5.5,
      loan_term_years: 30
    }
  });

  assert(excellentResult.performance_rating.overall_rating.includes('Excellent') || 
         excellentResult.performance_rating.overall_rating.includes('Good'), 
         'Should rate high-return property positively');

  // Poor performance scenario
  const poorResult = calc.calculate({
    purchase_price: 400000,
    down_payment: 80000,
    annual_rental_income: 24000,
    annual_expenses: {
      property_tax: 6000,
      insurance: 2400,
      hoa_fees: 3600
    },
    loan_details: {
      interest_rate: 7.5,
      loan_term_years: 30
    }
  });

  assert(poorResult.return_metrics.cash_on_cash_return < 5, 'Should have low COCR');
});

test('COCRCalculator - Schema Validation', () => {
  const calc = new COCRCalculator();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.purchase_price, 'Should have purchase_price');
  assert(schema.properties.annual_rental_income, 'Should have annual_rental_income');
  assert(schema.properties.annual_expenses, 'Should have annual_expenses object');
  assert(schema.required.includes('purchase_price'), 'purchase_price should be required');
  assert(schema.required.includes('down_payment'), 'down_payment should be required');
});

// ========== DSCR CALCULATOR TESTS ==========

test('DSCRCalculator - Basic Calculation', () => {
  const calc = new DSCRCalculator();
  const result = calc.calculate({
    property_income: {
      monthly_rent: 3000,
      vacancy_rate: 5
    },
    property_expenses: {
      property_tax: 300,
      insurance: 150,
      maintenance_reserve: 200
    },
    loan_details: {
      loan_amount: 250000,
      interest_rate: 6.75,
      loan_term_years: 30
    }
  });

  // Test structure
  assert(result.income_analysis, 'Should have income analysis');
  assert(result.expense_analysis, 'Should have expense analysis');
  assert(result.noi_analysis, 'Should have NOI analysis');
  assert(result.debt_service, 'Should have debt service');
  assert(result.dscr_analysis, 'Should have DSCR analysis');
  assert(result.qualification_analysis, 'Should have qualification analysis');
  assert(result.maximum_loan_analysis, 'Should have maximum loan analysis');
  assert(result.stress_test_results, 'Should have stress test results');
  assert(result.break_even_analysis, 'Should have break-even analysis');
  assert(result.recommendations, 'Should have recommendations');

  // Test calculations
  assert(result.dscr_analysis.dscr_ratio > 0, 'Should calculate DSCR');
  assert(result.noi_analysis.annual_noi > 0, 'Should calculate positive NOI');
  assert(result.debt_service.annual_debt_service > 0, 'Should calculate debt service');
});

test('DSCRCalculator - Loan Qualification', () => {
  const calc = new DSCRCalculator();
  
  // Good DSCR scenario
  const goodResult = calc.calculate({
    property_income: {
      monthly_rent: 4000,
      vacancy_rate: 5
    },
    property_expenses: {
      property_tax: 400,
      insurance: 200
    },
    loan_details: {
      loan_amount: 300000,
      interest_rate: 6.5,
      loan_type: 'dscr'
    }
  });

  assert(goodResult.qualification_analysis.qualifies === true, 'Should qualify with good DSCR');
  
  // Poor DSCR scenario
  const poorResult = calc.calculate({
    property_income: {
      monthly_rent: 2000,
      vacancy_rate: 10
    },
    property_expenses: {
      property_tax: 400,
      insurance: 200,
      hoa: 300
    },
    loan_details: {
      loan_amount: 300000,
      interest_rate: 7.5,
      loan_type: 'conventional'
    }
  });

  assert(poorResult.dscr_analysis.dscr_ratio < 1.25, 'Should have low DSCR');
  assert(poorResult.qualification_analysis.qualifies === false, 'Should not qualify with poor DSCR');
});

test('DSCRCalculator - Stress Testing', () => {
  const calc = new DSCRCalculator();
  const result = calc.calculate({
    property_income: {
      monthly_rent: 3500,
      vacancy_rate: 5
    },
    property_expenses: {
      property_tax: 350,
      insurance: 175,
      maintenance_reserve: 150
    },
    loan_details: {
      loan_amount: 280000,
      interest_rate: 6.85
    }
  });

  const stressTests = result.stress_test_results;
  assert(stressTests.scenarios.length > 0, 'Should have stress test scenarios');
  assert(stressTests.worst_case, 'Should identify worst case scenario');
  assert(stressTests.resilience_score, 'Should calculate resilience score');
  
  // Verify different scenarios produce different DSCRs
  const dscrs = stressTests.scenarios.map(s => s.dscr);
  assert(new Set(dscrs).size > 1, 'Different scenarios should produce different DSCRs');
});

test('DSCRCalculator - Maximum Loan Calculation', () => {
  const calc = new DSCRCalculator();
  const result = calc.calculate({
    property_income: {
      monthly_rent: 3000,
      vacancy_rate: 5
    },
    property_expenses: {
      property_tax: 250,
      insurance: 125
    },
    loan_details: {
      loan_amount: 200000,
      interest_rate: 6.5,
      loan_type: 'dscr'
    }
  });

  const maxLoan = result.maximum_loan_analysis;
  assert(maxLoan.maximum_loan_amount > 0, 'Should calculate maximum loan amount');
  assert(maxLoan.required_dscr >= 1.0, 'Should show required DSCR');
  assert(maxLoan.max_monthly_payment > 0, 'Should calculate max payment');
});

test('DSCRCalculator - Schema Validation', () => {
  const calc = new DSCRCalculator();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.property_income, 'Should have property_income');
  assert(schema.properties.property_expenses, 'Should have property_expenses');
  assert(schema.properties.loan_details, 'Should have loan_details');
  assert(schema.required.includes('property_income'), 'property_income should be required');
  assert(schema.required.includes('loan_details'), 'loan_details should be required');
});

// ========== BREAKEVEN CALCULATOR TESTS ==========

test('BreakevenCalculator - Basic Calculation', () => {
  const calc = new BreakevenCalculator();
  const result = calc.calculate({
    property_costs: {
      purchase_price: 250000,
      down_payment: 50000,
      closing_costs: 5000
    },
    fixed_costs: {
      mortgage_payment: 1200,
      property_tax: 300,
      insurance: 150
    },
    revenue_streams: {
      monthly_rent_per_unit: 2000,
      total_units: 1
    }
  });

  // Test structure
  assert(result.initial_investment, 'Should have initial investment');
  assert(result.cost_analysis, 'Should have cost analysis');
  assert(result.breakeven_analysis, 'Should have breakeven analysis');
  assert(result.current_performance, 'Should have current performance');
  assert(result.sensitivity_analysis, 'Should have sensitivity analysis');
  assert(result.multi_year_projection, 'Should have multi-year projection');
  assert(result.risk_assessment, 'Should have risk assessment');
  assert(result.recommendations, 'Should have recommendations');

  // Test calculations
  assert(result.initial_investment.total_cash_required === 55000, 'Should calculate total cash');
  assert(result.breakeven_analysis.occupancy_breakeven.occupancy_rate > 0, 'Should calculate breakeven occupancy');
  assert(result.multi_year_projection.length > 0, 'Should have projection data');
});

test('BreakevenCalculator - Multi-Unit Property', () => {
  const calc = new BreakevenCalculator();
  const result = calc.calculate({
    property_costs: {
      purchase_price: 400000,
      down_payment: 80000
    },
    fixed_costs: {
      mortgage_payment: 2000,
      property_tax: 500,
      insurance: 300
    },
    revenue_streams: {
      monthly_rent_per_unit: 1200,
      total_units: 4
    }
  });

  const breakeven = result.breakeven_analysis.occupancy_breakeven;
  assert(breakeven.total_units === 4, 'Should track 4 units');
  assert(breakeven.occupancy_rate < 100, 'Should have achievable breakeven');
  assert(breakeven.units_needed < 4, 'Should need less than all units to break even');
});

test('BreakevenCalculator - Target Cash Flow Analysis', () => {
  const calc = new BreakevenCalculator();
  const result = calc.calculate({
    property_costs: {
      purchase_price: 200000,
      down_payment: 40000
    },
    fixed_costs: {
      mortgage_payment: 1000,
      property_tax: 250,
      insurance: 125
    },
    revenue_streams: {
      monthly_rent_per_unit: 1800
    },
    analysis_parameters: {
      target_cash_flow: 500
    }
  });

  const target = result.target_analysis;
  assert(target !== null, 'Should have target analysis');
  
  if (!target.target_achieved) {
    assert(target.rent_increase_needed > 0 || target.expense_reduction_needed > 0, 
      'Should show path to target');
  }
});

test('BreakevenCalculator - Sensitivity Analysis', () => {
  const calc = new BreakevenCalculator();
  const result = calc.calculate({
    property_costs: {
      purchase_price: 300000,
      down_payment: 60000
    },
    fixed_costs: {
      mortgage_payment: 1500,
      property_tax: 400
    },
    revenue_streams: {
      monthly_rent_per_unit: 2200
    }
  });

  const sensitivity = result.sensitivity_analysis;
  assert(sensitivity.scenarios.length > 0, 'Should have sensitivity scenarios');
  assert(sensitivity.most_sensitive_to, 'Should identify most sensitive factor');
  assert(sensitivity.rent_elasticity >= 0, 'Should calculate rent elasticity');
  assert(sensitivity.cost_elasticity >= 0, 'Should calculate cost elasticity');
});

test('BreakevenCalculator - Schema Validation', () => {
  const calc = new BreakevenCalculator();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.property_costs, 'Should have property_costs');
  assert(schema.properties.revenue_streams, 'Should have revenue_streams');
  assert(schema.properties.fixed_costs, 'Should have fixed_costs');
  assert(schema.properties.variable_costs, 'Should have variable_costs');
  assert(schema.required.includes('property_costs'), 'property_costs should be required');
  assert(schema.required.includes('revenue_streams'), 'revenue_streams should be required');
});