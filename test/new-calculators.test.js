import { test } from 'node:test';
import assert from 'node:assert';
import { IRRCalculator } from '../src/calculators/irr.js';
import { FixFlipCalculator } from '../src/calculators/fix-flip.js';
import { LoanComparisonTool } from '../src/calculators/loan-comparison.js';

// ========== IRR CALCULATOR TESTS ==========

test('IRRCalculator - Basic Calculation', () => {
  const calc = new IRRCalculator();
  const result = calc.calculate({
    initial_investment: 100000,
    annual_cash_flows: [12000, 12000, 12000, 12000, 12000],
    projected_sale_price: 150000,
    selling_costs_percent: 7,
    loan_balance_at_sale: 0
  });

  // Test structure
  assert(result.irr_analysis, 'Should have IRR analysis');
  assert(result.cash_flow_summary, 'Should have cash flow summary');
  assert(result.cash_flow_schedule, 'Should have cash flow schedule');
  assert(result.npv_analysis, 'Should have NPV analysis');
  assert(result.sale_analysis, 'Should have sale analysis');
  assert(result.performance_rating, 'Should have performance rating');
  assert(result.sensitivity_analysis, 'Should have sensitivity analysis');
  assert(result.recommendations, 'Should have recommendations');

  // Test calculations
  assert(result.irr_analysis.irr_percentage > 0, 'Should calculate positive IRR');
  assert(result.cash_flow_summary.total_profit > 0, 'Should show profit');
  assert(result.cash_flow_schedule.length === 6, 'Should have 6 entries (initial + 5 years)');
  
  // Verify IRR is reasonable (between 10-20% for this scenario)
  assert(result.irr_analysis.irr_percentage >= 10 && result.irr_analysis.irr_percentage <= 20, 
    'IRR should be in reasonable range');
});

test('IRRCalculator - Negative Cash Flow Scenario', () => {
  const calc = new IRRCalculator();
  const result = calc.calculate({
    initial_investment: 200000,
    annual_cash_flows: [-5000, -3000, 2000, 5000, 8000], // Negative early years
    projected_sale_price: 220000,
    selling_costs_percent: 7,
    loan_balance_at_sale: 150000
  });

  // Should still calculate despite negative cash flows
  assert(typeof result.irr_analysis.irr_percentage === 'number', 'Should calculate IRR');
  assert(result.performance_rating.rating, 'Should provide rating even with poor performance');
  assert(result.recommendations.length > 0, 'Should provide recommendations');
});

test('IRRCalculator - High Return Scenario', () => {
  const calc = new IRRCalculator();
  const result = calc.calculate({
    initial_investment: 50000,
    annual_cash_flows: [15000, 18000, 22000],
    projected_sale_price: 120000,
    selling_costs_percent: 7,
    loan_balance_at_sale: 0,
    target_irr: 25
  });

  assert(result.irr_analysis.irr_percentage > 30, 'Should show high IRR');
  assert(result.irr_analysis.meets_target === true, 'Should meet target');
  assert(result.performance_rating.rating === 'Exceptional', 'Should rate as exceptional');
  
  // Should warn about high returns
  const dueDiligenceRec = result.recommendations.find(r => r.type === 'Due Diligence');
  assert(dueDiligenceRec, 'Should recommend double-checking assumptions');
});

test('IRRCalculator - Sensitivity Analysis', () => {
  const calc = new IRRCalculator();
  const result = calc.calculate({
    initial_investment: 100000,
    annual_cash_flows: [10000, 10000, 10000, 10000],
    projected_sale_price: 140000,
    selling_costs_percent: 7
  });

  const sensitivity = result.sensitivity_analysis;
  assert(sensitivity.scenarios.length >= 3, 'Should have multiple scenarios');
  assert(sensitivity.most_sensitive_factor, 'Should identify most sensitive factor');
  
  // All scenarios should have different IRRs
  const irrs = sensitivity.scenarios.map(s => s.irr);
  const uniqueIRRs = [...new Set(irrs)];
  assert(uniqueIRRs.length === irrs.length, 'Each scenario should have different IRR');
});

test('IRRCalculator - Schema Validation', () => {
  const calc = new IRRCalculator();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.initial_investment, 'Should have initial_investment');
  assert(schema.properties.annual_cash_flows, 'Should have annual_cash_flows');
  assert(schema.properties.projected_sale_price, 'Should have projected_sale_price');
  assert(schema.required.includes('initial_investment'), 'initial_investment should be required');
  assert(schema.required.includes('annual_cash_flows'), 'annual_cash_flows should be required');
});

// ========== FIX & FLIP CALCULATOR TESTS ==========

test('FixFlipCalculator - Basic Calculation', () => {
  const calc = new FixFlipCalculator();
  const result = calc.calculate({
    purchase_price: 150000,
    rehab_budget: 50000,
    after_repair_value: 280000,
    holding_period_months: 6,
    financing_type: 'hard_money',
    interest_rate: 12,
    monthly_holding_costs: 800
  });

  // Test structure
  assert(result.deal_summary, 'Should have deal summary');
  assert(result.financing, 'Should have financing details');
  assert(result.cost_breakdown, 'Should have cost breakdown');
  assert(result.profit_analysis, 'Should have profit analysis');
  assert(result.investment_requirements, 'Should have investment requirements');
  assert(result.mao_analysis, 'Should have MAO analysis');
  assert(result.break_even_analysis, 'Should have break-even analysis');
  assert(result.risk_assessment, 'Should have risk assessment');
  assert(result.project_timeline, 'Should have project timeline');
  assert(result.recommendations, 'Should have recommendations');

  // Test calculations
  assert(result.profit_analysis.net_profit > 0, 'Should show profit');
  assert(result.profit_analysis.roi_percentage > 0, 'Should calculate ROI');
  assert(result.mao_analysis.mao_70_rule > 0, 'Should calculate 70% rule MAO');
  assert(result.project_timeline.length === 7, 'Timeline should have 7 entries (0-6 months)');
});

test('FixFlipCalculator - Cash Purchase', () => {
  const calc = new FixFlipCalculator();
  const result = calc.calculate({
    purchase_price: 100000,
    rehab_budget: 30000,
    after_repair_value: 180000,
    financing_type: 'cash',
    holding_period_months: 4,
    monthly_holding_costs: 500
  });

  assert(result.financing.loan_amount === 0, 'Cash purchase should have no loan');
  assert(result.financing.total_interest === 0, 'Cash purchase should have no interest');
  assert(result.financing.monthly_payment === 0, 'Cash purchase should have no monthly payment');
  assert(result.investment_requirements.total_cash_needed >= 130000, 'Should require full cash');
});

test('FixFlipCalculator - High Risk Scenario', () => {
  const calc = new FixFlipCalculator();
  const result = calc.calculate({
    purchase_price: 200000,
    rehab_budget: 100000, // 33% of ARV - high rehab
    after_repair_value: 300000, // Purchase at 67% of ARV
    holding_period_months: 8,
    financing_type: 'hard_money',
    interest_rate: 15,
    monthly_holding_costs: 1200
  });

  assert(result.risk_assessment.overall_risk === 'High Risk', 'Should identify as high risk');
  assert(result.risk_assessment.risk_factors.length > 0, 'Should identify risk factors');
  assert(result.profit_analysis.profit_margin < 15, 'Should have thin margins');
  
  // Should provide warnings
  const cautionRecs = result.recommendations.filter(r => r.type === 'Caution' || r.type === 'Warning');
  assert(cautionRecs.length > 0, 'Should provide caution/warning recommendations');
});

test('FixFlipCalculator - Break-Even Analysis', () => {
  const calc = new FixFlipCalculator();
  const result = calc.calculate({
    purchase_price: 120000,
    rehab_budget: 40000,
    after_repair_value: 200000,
    selling_costs_percent: 8
  });

  const breakEven = result.break_even_analysis;
  assert(breakEven.break_even_price > 0, 'Should calculate break-even price');
  assert(breakEven.safety_cushion > 0, 'Should have positive safety cushion');
  assert(breakEven.cushion_percentage > 0, 'Should calculate cushion percentage');
  assert(breakEven.break_even_price < result.deal_summary.after_repair_value, 
    'Break-even should be less than ARV');
});

test('FixFlipCalculator - Schema Validation', () => {
  const calc = new FixFlipCalculator();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.purchase_price, 'Should have purchase_price');
  assert(schema.properties.rehab_budget, 'Should have rehab_budget');
  assert(schema.properties.after_repair_value, 'Should have after_repair_value');
  assert(schema.properties.financing_type.enum.includes('hard_money'), 'Should include hard money option');
  assert(schema.required.includes('purchase_price'), 'purchase_price should be required');
});

// ========== LOAN COMPARISON TOOL TESTS ==========

test('LoanComparisonTool - Basic Two Loan Comparison', () => {
  const calc = new LoanComparisonTool();
  const result = calc.calculate({
    home_price: 400000,
    loans: [
      {
        loan_name: '30-Year Fixed',
        down_payment_percent: 20,
        interest_rate: 6.5,
        loan_term_years: 30
      },
      {
        loan_name: '15-Year Fixed',
        down_payment_percent: 20,
        interest_rate: 5.8,
        loan_term_years: 15
      }
    ],
    property_tax_annual: 4800,
    home_insurance_annual: 1200,
    comparison_period_years: 5
  });

  // Test structure
  assert(result.loan_details.length === 2, 'Should have 2 loan details');
  assert(result.comparison_summary, 'Should have comparison summary');
  assert(result.best_options, 'Should have best options');
  assert(result.side_by_side, 'Should have side-by-side comparison');
  assert(result.recommendations, 'Should have recommendations');

  // Test calculations
  const loan30 = result.loan_details.find(l => l.loan_name === '30-Year Fixed');
  const loan15 = result.loan_details.find(l => l.loan_name === '15-Year Fixed');
  
  assert(loan30.total_monthly_payment < loan15.total_monthly_payment, 
    '30-year should have lower monthly payment');
  assert(loan30.lifetime_costs.total_interest > loan15.lifetime_costs.total_interest, 
    '30-year should have higher lifetime interest');
});

test('LoanComparisonTool - PMI Comparison', () => {
  const calc = new LoanComparisonTool();
  const result = calc.calculate({
    home_price: 300000,
    loans: [
      {
        loan_name: '5% Down Conventional',
        down_payment_percent: 5,
        interest_rate: 6.85,
        loan_term_years: 30,
        loan_type: 'conventional'
      },
      {
        loan_name: '20% Down Conventional',
        down_payment_percent: 20,
        interest_rate: 6.5,
        loan_term_years: 30,
        loan_type: 'conventional'
      },
      {
        loan_name: 'FHA 3.5% Down',
        down_payment_percent: 3.5,
        interest_rate: 6.75,
        loan_term_years: 30,
        loan_type: 'fha'
      }
    ]
  });

  const loan5Down = result.loan_details.find(l => l.down_payment_percent === 5);
  const loan20Down = result.loan_details.find(l => l.down_payment_percent === 20);
  const fhaLoan = result.loan_details.find(l => l.loan_type === 'fha');

  assert(loan5Down.pmi_details.has_pmi === true, '5% down should have PMI');
  assert(loan20Down.pmi_details.has_pmi === false, '20% down should not have PMI');
  assert(fhaLoan.pmi_details.has_pmi === true, 'FHA should have PMI');
  assert(fhaLoan.pmi_details.monthly_pmi > 0, 'FHA should calculate MIP');
});

test('LoanComparisonTool - Points Analysis', () => {
  const calc = new LoanComparisonTool();
  const result = calc.calculate({
    home_price: 350000,
    loans: [
      {
        loan_name: 'No Points',
        down_payment_percent: 20,
        interest_rate: 6.75,
        loan_term_years: 30,
        points: 0
      },
      {
        loan_name: 'Buy Down with Points',
        down_payment_percent: 20,
        interest_rate: 6.25,
        loan_term_years: 30,
        points: 2
      }
    ]
  });

  assert(result.points_analysis.length > 0, 'Should have points analysis');
  const pointsAnalysis = result.points_analysis[0];
  assert(pointsAnalysis.points_cost > 0, 'Should calculate points cost');
  assert(pointsAnalysis.monthly_savings > 0, 'Should calculate monthly savings');
  assert(pointsAnalysis.break_even_months > 0, 'Should calculate break-even period');
  assert(typeof pointsAnalysis.worth_it === 'boolean', 'Should determine if worth it');
});

test('LoanComparisonTool - ARM Risk Analysis', () => {
  const calc = new LoanComparisonTool();
  const result = calc.calculate({
    home_price: 500000,
    loans: [
      {
        loan_name: '5/1 ARM',
        down_payment_percent: 20,
        interest_rate: 5.5,
        loan_term_years: 30,
        loan_type: 'arm',
        arm_details: {
          fixed_period_years: 5,
          adjustment_cap: 2,
          lifetime_cap: 5
        }
      },
      {
        loan_name: '30-Year Fixed',
        down_payment_percent: 20,
        interest_rate: 6.5,
        loan_term_years: 30,
        loan_type: 'conventional'
      }
    ]
  });

  assert(result.arm_risk_analysis, 'Should have ARM risk analysis');
  assert(result.arm_risk_analysis.length === 1, 'Should analyze one ARM');
  
  const armAnalysis = result.arm_risk_analysis[0];
  assert(armAnalysis.max_possible_rate > armAnalysis.initial_rate, 'Max rate should be higher');
  assert(armAnalysis.max_possible_payment > armAnalysis.current_payment, 'Max payment should be higher');
  assert(armAnalysis.risk_assessment, 'Should provide risk assessment');
});

test('LoanComparisonTool - Best Options Selection', () => {
  const calc = new LoanComparisonTool();
  const result = calc.calculate({
    home_price: 450000,
    loans: [
      {
        loan_name: 'Option A',
        down_payment_percent: 10,
        interest_rate: 6.95,
        loan_term_years: 30
      },
      {
        loan_name: 'Option B',
        down_payment_percent: 15,
        interest_rate: 6.75,
        loan_term_years: 30
      },
      {
        loan_name: 'Option C',
        down_payment_percent: 20,
        interest_rate: 6.5,
        loan_term_years: 30
      }
    ],
    comparison_period_years: 5
  });

  const bestOptions = result.best_options;
  assert(bestOptions.lowest_monthly_payment.loan_name, 'Should identify lowest monthly payment');
  assert(bestOptions.lowest_total_interest.loan_name, 'Should identify lowest interest');
  assert(bestOptions.lowest_upfront_cost.loan_name, 'Should identify lowest upfront cost');
  assert(bestOptions.lowest_overall_cost.loan_name, 'Should identify lowest overall cost');
  
  // Each best option should have savings vs others
  assert(bestOptions.lowest_monthly_payment.savings_vs_others.length === 2, 
    'Should show savings vs other options');
});

test('LoanComparisonTool - Schema Validation', () => {
  const calc = new LoanComparisonTool();
  const schema = calc.getSchema();
  
  assert(schema.type === 'object', 'Schema should be an object');
  assert(schema.properties.home_price, 'Should have home_price');
  assert(schema.properties.loans, 'Should have loans array');
  assert(schema.properties.loans.minItems === 2, 'Should require minimum 2 loans');
  assert(schema.properties.loans.maxItems === 4, 'Should limit to 4 loans');
  
  const loanSchema = schema.properties.loans.items;
  assert(loanSchema.properties.loan_name, 'Loan should have name');
  assert(loanSchema.properties.loan_type.enum.includes('arm'), 'Should support ARM loans');
  assert(loanSchema.required.includes('interest_rate'), 'Interest rate should be required');
});